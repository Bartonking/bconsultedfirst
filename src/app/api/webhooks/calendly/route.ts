import { createHmac, timingSafeEqual } from "crypto";
import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import { sanitizeForFirestore } from "@/lib/events/utils";
import { captureRouteException } from "@/lib/sentry/server";
import type { CalendlyBucketEvent, CalendlyWebhookLog } from "@/lib/types";

export const runtime = "nodejs";

function verifyCalendlySignature(
  payload: string,
  signatureHeader: string,
  signingKey: string
): boolean {
  const parts = signatureHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const signature = v1Part.slice(3);
  const data = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", signingKey).update(data).digest("hex");

  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function getInviteeEmail(payload: Record<string, unknown> | null | undefined) {
  return (
    (payload?.email as string | undefined) ??
    ((payload?.invitee as Record<string, unknown> | undefined)?.email as
      | string
      | undefined) ??
    null
  );
}

function getInviteeName(payload: Record<string, unknown> | null | undefined) {
  return (
    (payload?.name as string | undefined) ??
    ((payload?.invitee as Record<string, unknown> | undefined)?.name as
      | string
      | undefined) ??
    null
  );
}

function getTracking(payload: Record<string, unknown> | null | undefined) {
  const tracking = payload?.tracking as Record<string, unknown> | undefined;

  return {
    utm_source: (tracking?.utm_source as string | undefined) ?? null,
    utm_medium: (tracking?.utm_medium as string | undefined) ?? null,
    utm_campaign: (tracking?.utm_campaign as string | undefined) ?? null,
    utm_content: (tracking?.utm_content as string | undefined) ?? null,
    utm_term: (tracking?.utm_term as string | undefined) ?? null,
    salesforce_uuid: (tracking?.salesforce_uuid as string | undefined) ?? null,
  };
}

function getCalendlySummary(payload: Record<string, unknown> | null | undefined) {
  const scheduledEvent =
    (payload?.scheduled_event as Record<string, unknown> | undefined) ??
    undefined;
  const scheduledStartAt =
    (scheduledEvent?.start_time as string | undefined) ?? null;
  const scheduledEndAt = (scheduledEvent?.end_time as string | undefined) ?? null;
  const meetingUrl =
    ((scheduledEvent?.location as Record<string, unknown> | undefined)
      ?.join_url as string | undefined) ??
    ((payload?.location as Record<string, unknown> | undefined)?.join_url as
      | string
      | undefined) ??
    null;
  const calendlyEventUri =
    (payload?.event as string | undefined) ??
    (scheduledEvent?.uri as string | undefined) ??
    null;
  const calendlyInviteeUri = (payload?.uri as string | undefined) ?? null;

  return {
    inviteeEmail: getInviteeEmail(payload),
    inviteeName: getInviteeName(payload),
    tracking: getTracking(payload),
    scheduledStartAt,
    scheduledEndAt,
    meetingUrl,
    calendlyEventUri,
    calendlyInviteeUri,
  };
}

async function writeCalendlyBucketEvent({
  request,
  body,
}: {
  request: Request;
  body: string;
}): Promise<void> {
  const db = getDb();
  const id = `cal-bucket-${nanoid(12)}`;
  const signatureHeader = request.headers.get("Calendly-Webhook-Signature");

  const rawEvent: CalendlyBucketEvent = {
    id,
    receivedAt: new Date().toISOString(),
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    signatureHeader,
    contentType: request.headers.get("content-type"),
    rawBody: body,
    bodySize: Buffer.byteLength(body, "utf8"),
    parseStatus: "not_parsed",
    eventType: null,
    payloadEmail: null,
    payloadName: null,
    payloadUri: null,
    payloadEventUri: null,
    tracking: null,
    payload: null,
    parseError: null,
  };

  const docRef = db.collection(COLLECTIONS.calndlybucket).doc(id);
  await docRef.set(sanitizeForFirestore(rawEvent) as Record<string, unknown>);

  try {
    const parsed = JSON.parse(body) as Record<string, unknown>;
    const payload =
      (parsed.payload as Record<string, unknown> | undefined) ?? null;
    const summary = getCalendlySummary(payload);

    await docRef.update(
      sanitizeForFirestore({
        parseStatus: "parsed",
        eventType: (parsed.event as string | undefined) ?? null,
        payloadEmail: summary.inviteeEmail,
        payloadName: summary.inviteeName,
        payloadUri: summary.calendlyInviteeUri,
        payloadEventUri: summary.calendlyEventUri,
        tracking: (payload?.tracking as Record<string, unknown> | undefined) ?? null,
        payload,
        parseError: null,
      }) as Record<string, unknown>
    );
  } catch (err) {
    await docRef.update({
      parseStatus: "parse_failed",
      parseError: err instanceof Error ? err.message : "Unknown parse error",
    });
  }
}

async function writeCalendlyCompatibilityLog(
  log: Omit<CalendlyWebhookLog, "id" | "createdAt">
) {
  try {
    const db = getDb();
    const id = `cal-${nanoid(12)}`;
    await db
      .collection(COLLECTIONS.calendlyWebhookLogs)
      .doc(id)
      .set(
        sanitizeForFirestore({
          id,
          createdAt: new Date().toISOString(),
          ...log,
        }) as Record<string, unknown>
      );
  } catch (err) {
    console.error("Failed to write Calendly compatibility log:", err);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  await writeCalendlyBucketEvent({ request, body });

  let parsed: Record<string, unknown> | null = null;
  let eventType = "unknown";
  let payload: Record<string, unknown> | null = null;

  try {
    parsed = JSON.parse(body) as Record<string, unknown>;
    eventType = (parsed.event as string | undefined) || "unknown";
    payload = (parsed.payload as Record<string, unknown> | undefined) || null;
  } catch (err) {
    await captureRouteException(err, {
      surface: "webhook",
      route: "/api/webhooks/calendly",
      request,
      statusCode: 400,
      tags: {
        "webhook.provider": "calendly",
      },
    });

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.CALENDLY_WEBHOOK_RECEIVED,
      source: "calendly",
      publish: false,
      actor: { type: "webhook" },
      payload: {
        parseStatus: "parse_failed",
        parseError: err instanceof Error ? err.message : "Unknown parse error",
      },
    });
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const summary = getCalendlySummary(payload);
  const receivedEvent = await emitWorkflowEvent({
    type: WORKFLOW_EVENTS.CALENDLY_WEBHOOK_RECEIVED,
    source: "calendly",
    publish: false,
    actor: {
      type: "webhook",
      email: summary.inviteeEmail || undefined,
    },
    subject: {
      consultationId: summary.tracking.utm_content || undefined,
      calendlyEventUri: summary.calendlyEventUri || undefined,
      calendlyInviteeUri: summary.calendlyInviteeUri || undefined,
    },
    payload: {
      event: parsed,
      eventType,
      payload,
      tracking: summary.tracking,
    },
  });

  const signature = request.headers.get("Calendly-Webhook-Signature");
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

  if (!signature) {
    await writeCalendlyCompatibilityLog({
      eventType,
      result: "missing_signature",
      message: "Missing Calendly-Webhook-Signature header.",
      matchedBy: "none",
      inviteeEmail: summary.inviteeEmail,
      inviteeName: summary.inviteeName,
      tracking: summary.tracking,
      payload: payload || {},
    });
    return Response.json({ error: "Missing signature" }, { status: 401 });
  }

  if (!signingKey) {
    await captureRouteException(
      new Error("Missing CALENDLY_WEBHOOK_SIGNING_KEY"),
      {
        surface: "webhook",
        route: "/api/webhooks/calendly",
        request,
        statusCode: 500,
        tags: {
          "webhook.provider": "calendly",
          "webhook.event_type": eventType,
        },
      }
    );

    await writeCalendlyCompatibilityLog({
      eventType,
      result: "missing_signing_key",
      message: "Missing CALENDLY_WEBHOOK_SIGNING_KEY.",
      matchedBy: "none",
      inviteeEmail: summary.inviteeEmail,
      inviteeName: summary.inviteeName,
      tracking: summary.tracking,
      payload: payload || {},
    });
    return Response.json({ error: "Missing signing key" }, { status: 500 });
  }

  if (!verifyCalendlySignature(body, signature, signingKey)) {
    await captureRouteException(
      new Error("Calendly webhook signature validation failed"),
      {
        surface: "webhook",
        route: "/api/webhooks/calendly",
        request,
        statusCode: 401,
        tags: {
          "webhook.provider": "calendly",
          "webhook.event_type": eventType,
          "webhook.verification": "failed",
        },
      }
    );

    await writeCalendlyCompatibilityLog({
      eventType,
      result: "invalid_signature",
      message: "Calendly webhook signature validation failed.",
      matchedBy: "none",
      inviteeEmail: summary.inviteeEmail,
      inviteeName: summary.inviteeName,
      tracking: summary.tracking,
      payload: payload || {},
    });
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (eventType === "invitee.created" || eventType === "invitee.canceled") {
    const workflowType =
      eventType === "invitee.created"
        ? WORKFLOW_EVENTS.CALENDLY_INVITEE_CREATED
        : WORKFLOW_EVENTS.CALENDLY_INVITEE_CANCELLED;

    await emitWorkflowEvent({
      type: workflowType,
      source: "calendly",
      correlationId: receivedEvent.id,
      idempotencyKey: `${workflowType}:${
        summary.calendlyInviteeUri || summary.calendlyEventUri || nanoid(8)
      }`,
      actor: {
        type: "webhook",
        email: summary.inviteeEmail || undefined,
      },
      subject: {
        consultationId: summary.tracking.utm_content || undefined,
        calendlyEventUri: summary.calendlyEventUri || undefined,
        calendlyInviteeUri: summary.calendlyInviteeUri || undefined,
      },
      payload: {
        event: parsed,
        payload,
        signatureValid: true,
        tracking: summary.tracking,
      },
    });
  }

  await writeCalendlyCompatibilityLog({
    eventType,
    result: "received",
    message: "Calendly webhook received and queued for workflow processing.",
    consultationId: summary.tracking.utm_content,
    matchedBy: summary.tracking.utm_content ? "utm_content" : "none",
    inviteeEmail: summary.inviteeEmail,
    inviteeName: summary.inviteeName,
    calendlyEventUri: summary.calendlyEventUri,
    calendlyInviteeUri: summary.calendlyInviteeUri,
    scheduledStartAt: summary.scheduledStartAt,
    scheduledEndAt: summary.scheduledEndAt,
    meetingUrl: summary.meetingUrl,
    tracking: summary.tracking,
    payload: payload || {},
  });

  return Response.json({ received: true, queued: true });
}
