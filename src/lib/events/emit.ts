import { nanoid } from "nanoid";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import type { EmitWorkflowEventInput, WorkflowEvent } from "./types";
import { publishWorkflowEvent } from "./publisher";
import { sanitizeForFirestore } from "./utils";

export async function emitWorkflowEvent(
  input: EmitWorkflowEventInput
): Promise<WorkflowEvent> {
  const now = new Date().toISOString();
  const id = `evt-${nanoid(12)}`;
  const event: WorkflowEvent = {
    id,
    type: input.type,
    source: input.source,
    status: "received",
    receivedAt: now,
    occurredAt: input.occurredAt,
    correlationId: input.correlationId,
    idempotencyKey: input.idempotencyKey,
    actor: input.actor,
    subject: input.subject,
    payload: input.payload,
  };

  const db = getDb();
  const eventRef = db.collection(COLLECTIONS.workflowEvents).doc(id);
  await eventRef.set(sanitizeForFirestore(event) as Record<string, unknown>);

  if (input.publish === false) {
    return event;
  }

  try {
    const messageId = await publishWorkflowEvent(id);
    if (messageId) {
      const queuedAt = new Date().toISOString();
      await eventRef.update({
        status: "queued",
        queuedAt,
        "payload.pubsubMessageId": messageId,
      });
      return { ...event, status: "queued", queuedAt };
    }

    if (input.processInlineIfUnpublished !== false) {
      const { processWorkflowEvent } = await import("./process");
      await processWorkflowEvent(id);
    }

    return event;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to publish workflow event";
    await eventRef.update({
      status: "failed",
      failedAt: new Date().toISOString(),
      error: {
        message,
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
    throw err;
  }
}

