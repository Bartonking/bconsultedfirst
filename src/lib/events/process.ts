import * as Sentry from "@sentry/nextjs";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { markErrorAsCaptured } from "@/lib/sentry/server";
import {
  addWorkflowBreadcrumb,
  applyWorkflowSentryMetadataToScope,
  getWorkflowSentryMetadata,
} from "@/lib/sentry/workflow";
import type { EventDeadLetter, WorkflowEvent } from "./types";
import { sanitizeForFirestore } from "./utils";
import { getHandlersForEvent } from "./handlers";

export async function processWorkflowEvent(eventId: string): Promise<void> {
  const db = getDb();
  const eventRef = db.collection(COLLECTIONS.workflowEvents).doc(eventId);
  const eventDoc = await eventRef.get();

  if (!eventDoc.exists) {
    throw new Error(`Workflow event ${eventId} not found`);
  }

  const event = eventDoc.data() as WorkflowEvent;
  if (event.status === "processed" || event.status === "ignored") {
    return;
  }

  return Sentry.startSpan(
    {
      name: `workflow process ${event.type}`,
      op: "workflow.process",
      forceTransaction: !Sentry.getActiveSpan(),
      attributes: {
        "messaging.system": "pubsub",
        "workflow.event.id": event.id,
        "workflow.event.type": event.type,
        "workflow.source": event.source,
        ...(event.correlationId
          ? { "workflow.correlation_id": event.correlationId }
          : {}),
      },
    },
    async () => {
      await eventRef.update({
        status: "processing",
      });
      addWorkflowBreadcrumb(
        {
          ...event,
          status: "processing",
        },
        { action: "processing" }
      );

      const handlers = getHandlersForEvent(event.type);

      if (handlers.length === 0) {
        const processedAt = new Date().toISOString();
        await eventRef.update({
          status: "ignored",
          processedAt,
        });
        addWorkflowBreadcrumb(
          {
            ...event,
            status: "ignored",
            processedAt,
          },
          { action: "ignored", level: "warning" }
        );
        return;
      }

      try {
        for (const [index, handler] of handlers.entries()) {
          await Sentry.startSpan(
            {
              name:
                handler.name && handler.name !== "WorkflowEventHandler"
                  ? `workflow handler ${handler.name}`
                  : `workflow handler ${event.type}#${index + 1}`,
              op: "workflow.handler",
              attributes: {
                "workflow.event.id": event.id,
                "workflow.event.type": event.type,
                "workflow.handler_index": index + 1,
              },
            },
            async () => {
              await handler(event);
            }
          );
        }

        const processedAt = new Date().toISOString();
        await eventRef.update({
          status: "processed",
          processedAt,
        });
        addWorkflowBreadcrumb(
          {
            ...event,
            status: "processed",
            processedAt,
          },
          { action: "processed" }
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Workflow event processing failed";
        const failedAt = new Date().toISOString();
        const failedEvent: WorkflowEvent = {
          ...event,
          status: "failed",
          failedAt,
          error: {
            message,
            stack: err instanceof Error ? err.stack : undefined,
          },
        };

        await eventRef.update({
          status: "failed",
          failedAt,
          error: {
            message,
            stack: err instanceof Error ? err.stack : undefined,
          },
        });

        const deadLetter: EventDeadLetter = {
          id: `dead-${event.id}`,
          eventId: event.id,
          eventType: event.type,
          source: event.source,
          failedAt,
          error: message,
          payload: event.payload,
        };

        await db
          .collection(COLLECTIONS.eventDeadLetters)
          .doc(deadLetter.id)
          .set(sanitizeForFirestore(deadLetter) as Record<string, unknown>);

        Sentry.withScope((scope) => {
          applyWorkflowSentryMetadataToScope(
            scope,
            getWorkflowSentryMetadata(failedEvent, {
              action: "failed",
              level: "error",
            })
          );
          scope.setContext(
            "workflow_dead_letter",
            sanitizeForFirestore(deadLetter) as Record<string, unknown>
          );
          Sentry.captureException(err);
        });

        addWorkflowBreadcrumb(failedEvent, {
          action: "failed",
          level: "error",
        });
        markErrorAsCaptured(err);
        throw err;
      }
    }
  );
}
