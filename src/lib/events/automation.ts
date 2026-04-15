import { nanoid } from "nanoid";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import type {
  EventAutomationRun,
  WorkflowEvent,
  WorkflowEventName,
} from "./types";
import { sanitizeForFirestore } from "./utils";

export interface AutomationResult {
  status?: "processed" | "ignored";
  result?: Record<string, unknown>;
}

export async function runAutomationOnce({
  event,
  handler,
  idempotencyKey,
  fn,
}: {
  event: WorkflowEvent;
  handler: string;
  idempotencyKey: string;
  fn: () => Promise<AutomationResult | void>;
}): Promise<EventAutomationRun> {
  const db = getDb();
  const existing = await db
    .collection(COLLECTIONS.eventAutomationRuns)
    .where("idempotencyKey", "==", idempotencyKey)
    .limit(10)
    .get();

  const completed = existing.docs
    .map((doc) => doc.data() as EventAutomationRun)
    .find((run) => run.status === "processed" || run.status === "ignored");

  if (completed) {
    return completed;
  }

  const id = `run-${nanoid(12)}`;
  const startedAt = new Date().toISOString();
  const runRef = db.collection(COLLECTIONS.eventAutomationRuns).doc(id);
  const run: EventAutomationRun = {
    id,
    eventId: event.id,
    eventType: event.type as WorkflowEventName,
    handler,
    status: "processing",
    idempotencyKey,
    startedAt,
  };

  await runRef.set(sanitizeForFirestore(run) as Record<string, unknown>);

  try {
    const result = await fn();
    const status = result?.status || "processed";
    const completedAt = new Date().toISOString();
    const patch: Partial<EventAutomationRun> = {
      status,
      completedAt,
      result: result?.result,
    };

    await runRef.update(sanitizeForFirestore(patch) as Record<string, unknown>);
    return { ...run, ...patch };
  } catch (err) {
    const completedAt = new Date().toISOString();
    const error = err instanceof Error ? err.message : "Automation failed";
    await runRef.update({
      status: "failed",
      completedAt,
      error,
    });
    throw err;
  }
}
