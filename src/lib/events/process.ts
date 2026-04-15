import { COLLECTIONS, getDb } from "@/lib/firebase";
import type { EventDeadLetter, WorkflowEvent } from "./types";
import { getHandlersForEvent } from "./handlers";
import { sanitizeForFirestore } from "./utils";

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

  await eventRef.update({
    status: "processing",
  });

  const handlers = getHandlersForEvent(event.type);

  if (handlers.length === 0) {
    await eventRef.update({
      status: "ignored",
      processedAt: new Date().toISOString(),
    });
    return;
  }

  try {
    for (const handler of handlers) {
      await handler(event);
    }

    await eventRef.update({
      status: "processed",
      processedAt: new Date().toISOString(),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Workflow event processing failed";
    const failedAt = new Date().toISOString();
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

    throw err;
  }
}

