import * as Sentry from "@sentry/nextjs";
import { PubSub } from "@google-cloud/pubsub";
import type { WorkflowEvent } from "./types";
import { getWorkflowProjectId, getWorkflowTopicName } from "./utils";

let pubsub: PubSub | null = null;

function getPubSub(): PubSub {
  if (!pubsub) {
    pubsub = new PubSub({ projectId: getWorkflowProjectId() });
  }
  return pubsub;
}

export function isPubSubConfigured(): boolean {
  if (process.env.WORKFLOW_DISABLE_PUBSUB === "true") return false;
  return Boolean(getWorkflowProjectId() && process.env.WORKFLOW_EVENTS_TOPIC);
}

export async function publishWorkflowEvent(
  event: Pick<WorkflowEvent, "id" | "type" | "correlationId">
): Promise<string | null> {
  if (!isPubSubConfigured()) return null;

  const topicName = getWorkflowTopicName();
  if (!topicName) return null;

  let messageId: string | null = null;

  await Sentry.startSpan(
    {
      name: `workflow publish ${event.type}`,
      op: "queue.publish",
      attributes: {
        "messaging.system": "pubsub",
        "messaging.destination.name": topicName,
        "workflow.event.id": event.id,
        "workflow.event.type": event.type,
        ...(event.correlationId
          ? { "workflow.correlation_id": event.correlationId }
          : {}),
      },
    },
    async (span) => {
      const sentryTrace = Sentry.spanToTraceHeader(span);
      const baggage = Sentry.spanToBaggageHeader(span);
      const payload = Buffer.from(
        JSON.stringify({
          eventId: event.id,
          eventType: event.type,
          correlationId: event.correlationId ?? null,
          sentryTrace,
          baggage,
        })
      );
      const attributes: Record<string, string> = {
        eventId: event.id,
        eventType: event.type,
      };

      if (event.correlationId) {
        attributes.correlationId = event.correlationId;
      }

      if (sentryTrace) {
        attributes["sentry-trace"] = sentryTrace;
      }

      if (baggage) {
        attributes.baggage = baggage;
      }

      const publishedMessageId = await getPubSub().topic(topicName).publishMessage({
        data: payload,
        attributes,
      });
      messageId = String(publishedMessageId);

      span.setAttribute("messaging.message.id", messageId);
    }
  );

  return messageId;
}
