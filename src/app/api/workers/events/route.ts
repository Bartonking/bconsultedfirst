import * as Sentry from "@sentry/nextjs";
import { decodeWorkflowEventMessage } from "@/lib/events/pubsub-message";
import { processWorkflowEvent } from "@/lib/events";
import { captureRouteException } from "@/lib/sentry/server";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const expectedSecret = process.env.WORKFLOW_WORKER_SECRET;
  if (!expectedSecret) return true;

  const headerSecret = request.headers.get("x-worker-secret");
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  return (
    headerSecret === expectedSecret ||
    bearer === expectedSecret ||
    querySecret === expectedSecret
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = decodeWorkflowEventMessage(body);

  if (!message?.eventId) {
    return Response.json({ error: "Missing eventId" }, { status: 400 });
  }

  const consume = async () =>
    Sentry.startSpan(
      {
        name: message.eventType
          ? `workflow consume ${message.eventType}`
          : `workflow consume ${message.eventId}`,
        op: "queue.process",
        forceTransaction: true,
        attributes: {
          "messaging.system": "pubsub",
          "messaging.destination.name":
            process.env.WORKFLOW_EVENTS_TOPIC || "workflow-events",
          "workflow.event.id": message.eventId,
          ...(message.eventType
            ? { "workflow.event.type": message.eventType }
            : {}),
          ...(message.correlationId
            ? { "workflow.correlation_id": message.correlationId }
            : {}),
        },
      },
      async () => {
        await processWorkflowEvent(message.eventId);
      }
    );

  try {
    if (message.sentryTrace) {
      await Sentry.continueTrace(
        {
          sentryTrace: message.sentryTrace,
          baggage: message.baggage,
        },
        consume
      );
    } else {
      await consume();
    }
  } catch (err) {
    await captureRouteException(err, {
      surface: "worker",
      route: "/api/workers/events",
      request,
      statusCode: 500,
      tags: {
        "workflow.event_id": message.eventId,
        "workflow.event_type": message.eventType,
        "workflow.correlation_id": message.correlationId,
      },
    });

    return Response.json({ error: "Worker failed" }, { status: 500 });
  }

  return Response.json({ success: true, eventId: message.eventId });
}
