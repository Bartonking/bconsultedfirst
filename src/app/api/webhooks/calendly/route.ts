import { createHmac, timingSafeEqual } from "crypto";
import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type {
  AuditEngagement,
  CalendlyWebhookLog,
  Consultation,
  Lead,
} from "@/lib/types";

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

function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item));
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, sanitizeForFirestore(entryValue)]);

    return Object.fromEntries(entries);
  }

  return String(value);
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

async function writeCalendlyLog(
  log: Omit<CalendlyWebhookLog, "id" | "createdAt">
): Promise<void> {
  try {
    const db = getDb();
    const id = `cal-${nanoid(12)}`;
    const sanitizedLog = sanitizeForFirestore(log) as Record<string, unknown>;
    await db.collection(COLLECTIONS.calendlyWebhookLogs).doc(id).set({
      id,
      createdAt: new Date().toISOString(),
      ...sanitizedLog,
    });
  } catch (logError) {
    console.error("Failed to write Calendly webhook log:", logError);
  }
}

function getConsultationSortDate(consultation: Consultation) {
  return consultation.paidAt || consultation.bookedAt || consultation.scheduledStartAt || "";
}

async function findConsultationByEmail(email: string) {
  const db = getDb();
  const leadsSnap = await db
    .collection(COLLECTIONS.leads)
    .where("email", "==", email)
    .limit(10)
    .get();

  if (leadsSnap.empty) return null;

  const consultationCandidates: Consultation[] = [];
  const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);

  for (const lead of leads) {
    const consultationsSnap = await db
      .collection(COLLECTIONS.consultations)
      .where("leadId", "==", lead.id)
      .limit(20)
      .get();

    const consultations = consultationsSnap.docs
      .map((doc) => doc.data() as Consultation)
      .filter((consultation) =>
        ["paid", "scheduled", "completed", "requested"].includes(
          consultation.consultationStatus
        )
      );

    consultationCandidates.push(...consultations);
  }

  if (consultationCandidates.length === 0) return null;

  consultationCandidates.sort((a, b) =>
    getConsultationSortDate(b).localeCompare(getConsultationSortDate(a))
  );

  return consultationCandidates[0];
}

export async function POST(request: Request) {
  let eventType = "unknown";
  let payload: Record<string, unknown> | null = null;

  try {
    const body = await request.text();
    const signature = request.headers.get("Calendly-Webhook-Signature");
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

    if (!signature) {
      await writeCalendlyLog({
        eventType,
        result: "missing_signature",
        message: "Missing Calendly-Webhook-Signature header.",
        matchedBy: "none",
      });
      return Response.json({ error: "Missing signature" }, { status: 401 });
    }

    if (!signingKey) {
      await writeCalendlyLog({
        eventType,
        result: "missing_signing_key",
        message: "Missing CALENDLY_WEBHOOK_SIGNING_KEY.",
        matchedBy: "none",
      });
      return Response.json({ error: "Missing signing key" }, { status: 500 });
    }

    if (!verifyCalendlySignature(body, signature, signingKey)) {
      await writeCalendlyLog({
        eventType,
        result: "invalid_signature",
        message: "Calendly webhook signature validation failed.",
        matchedBy: "none",
      });
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    eventType = event.event;
    payload = (event.payload ?? null) as Record<string, unknown> | null;
    const tracking = getTracking(payload);
    const inviteeEmail = getInviteeEmail(payload);
    const inviteeName = getInviteeName(payload);
    const scheduledEvent = (payload?.scheduled_event as Record<string, unknown> | undefined) ?? undefined;
    const scheduledStartAt = (scheduledEvent?.start_time as string | undefined) ?? null;
    const scheduledEndAt = (scheduledEvent?.end_time as string | undefined) ?? null;
    const meetingUrl =
      ((scheduledEvent?.location as Record<string, unknown> | undefined)?.join_url as
        | string
        | undefined) ??
      ((payload?.location as Record<string, unknown> | undefined)?.join_url as
        | string
        | undefined) ??
      null;

    await writeCalendlyLog({
      eventType,
      result: "received",
      message: "Calendly webhook received.",
      matchedBy: "none",
      inviteeEmail,
      inviteeName,
      calendlyEventUri:
        (payload?.event as string | undefined) ??
        (scheduledEvent?.uri as string | undefined) ??
        null,
      calendlyInviteeUri: (payload?.uri as string | undefined) ?? null,
      scheduledStartAt,
      scheduledEndAt,
      meetingUrl,
      tracking,
      payload: payload ?? {},
    });

    let consultationId = tracking.utm_content;
    let matchedBy: CalendlyWebhookLog["matchedBy"] = consultationId
      ? "utm_content"
      : "none";

    if (!consultationId && inviteeEmail) {
      const matchedConsultation = await findConsultationByEmail(inviteeEmail);
      if (matchedConsultation) {
        consultationId = matchedConsultation.id;
        matchedBy = "email_fallback";
      }
    }

    if (!consultationId) {
      await writeCalendlyLog({
        eventType,
        result: "missing_consultation_id",
        message:
          "Webhook did not include utm_content and no consultation matched the invitee email.",
        consultationId: null,
        matchedBy,
        inviteeEmail,
        inviteeName,
        calendlyEventUri:
          (payload?.event as string | undefined) ??
          (scheduledEvent?.uri as string | undefined) ??
          null,
        calendlyInviteeUri: (payload?.uri as string | undefined) ?? null,
        scheduledStartAt,
        scheduledEndAt,
        meetingUrl,
        tracking,
        payload: payload ?? {},
      });
      return Response.json({ error: "No consultation identifier" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.consultations).doc(consultationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      await writeCalendlyLog({
        eventType,
        result: "consultation_not_found",
        message: "Webhook consultation ID did not match an existing consultation.",
        consultationId,
        matchedBy,
        inviteeEmail,
        inviteeName,
        calendlyEventUri:
          (payload?.event as string | undefined) ??
          (scheduledEvent?.uri as string | undefined) ??
          null,
        calendlyInviteeUri: (payload?.uri as string | undefined) ?? null,
        scheduledStartAt,
        scheduledEndAt,
        meetingUrl,
        tracking,
        payload: payload ?? {},
      });
      return Response.json({ error: "Consultation not found" }, { status: 404 });
    }

    const engagementSnap = await db
      .collection(COLLECTIONS.auditEngagements)
      .where("consultationId", "==", consultationId)
      .limit(1)
      .get();

    const engagementDoc = engagementSnap.empty ? null : engagementSnap.docs[0];
    const engagement = engagementDoc?.data() as AuditEngagement | undefined;
    const calendlyEventUri =
      (payload?.event as string | undefined) ??
      (scheduledEvent?.uri as string | undefined) ??
      null;
    const calendlyInviteeUri = (payload?.uri as string | undefined) ?? null;

    if (eventType === "invitee.created") {
      await docRef.update({
        consultationStatus: "scheduled",
        bookedAt: new Date().toISOString(),
        calendlyEventUri,
        calendlyInviteeUri,
        scheduledStartAt,
        scheduledEndAt,
        cancelUrl: (payload?.cancel_url as string | undefined) ?? null,
        rescheduleUrl: (payload?.reschedule_url as string | undefined) ?? null,
      });

      if (engagementDoc && engagement) {
        await engagementDoc.ref.update({
          status:
            engagement.status === "meeting_completed"
              ? engagement.status
              : "meeting_scheduled",
          meetingAt: scheduledStartAt || engagement.meetingAt || null,
          ...(meetingUrl ? { meetingUrl } : {}),
          updatedAt: new Date().toISOString(),
        });
      }

      await writeCalendlyLog({
        eventType,
        result: engagementDoc ? "synced" : "engagement_not_found",
        message: engagementDoc
          ? "Calendly booking synced to consultation and engagement."
          : "Calendly booking synced to consultation, but no linked engagement was found.",
        consultationId,
        engagementId: engagementDoc?.id ?? null,
        matchedBy,
        inviteeEmail,
        inviteeName,
        calendlyEventUri,
        calendlyInviteeUri,
        scheduledStartAt,
        scheduledEndAt,
        meetingUrl,
        tracking,
        payload: payload ?? {},
      });
    } else if (eventType === "invitee.canceled") {
      const wasRescheduled = Boolean(payload?.rescheduled);

      await docRef.update({
        consultationStatus: wasRescheduled ? "scheduled" : "cancelled",
      });

      if (engagementDoc && engagement && !wasRescheduled) {
        await engagementDoc.ref.update({
          status:
            engagement.status === "meeting_completed"
              ? engagement.status
              : "intake_received",
          meetingAt: null,
          updatedAt: new Date().toISOString(),
        });
      }

      await writeCalendlyLog({
        eventType,
        result: wasRescheduled ? "ignored_reschedule_cancel" : "cancelled",
        message: wasRescheduled
          ? "Calendly cancellation was part of a reschedule flow."
          : "Calendly cancellation synced to consultation and engagement state.",
        consultationId,
        engagementId: engagementDoc?.id ?? null,
        matchedBy,
        inviteeEmail,
        inviteeName,
        calendlyEventUri,
        calendlyInviteeUri,
        scheduledStartAt,
        scheduledEndAt,
        meetingUrl,
        tracking,
        payload: payload ?? {},
      });
    } else {
      await writeCalendlyLog({
        eventType,
        result: "received",
        message: "Webhook event type received but not mapped to a sync action.",
        consultationId,
        engagementId: engagementDoc?.id ?? null,
        matchedBy,
        inviteeEmail,
        inviteeName,
        calendlyEventUri,
        calendlyInviteeUri,
        scheduledStartAt,
        scheduledEndAt,
        meetingUrl,
        tracking,
        payload: payload ?? {},
      });
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Calendly webhook error:", err);
    await writeCalendlyLog({
      eventType,
      result: "error",
      message: err instanceof Error ? err.message : "Unknown Calendly webhook error.",
      matchedBy: "none",
      inviteeEmail: getInviteeEmail(payload),
      inviteeName: getInviteeName(payload),
      tracking: getTracking(payload),
      payload: payload ?? {},
    });
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
