import * as Sentry from "@sentry/nextjs";
import type { WorkflowEvent } from "@/lib/events/types";
import { sanitizeForSentry } from "./sanitize";

interface ScopeLike {
  setTag(key: string, value: string): void;
  setContext(name: string, context: Record<string, unknown> | null): void;
}

export interface WorkflowSentryMetadata {
  tags: Record<string, string>;
  contexts: Record<string, Record<string, unknown> | null>;
  breadcrumb: {
    category: string;
    type: string;
    level: "info" | "warning" | "error";
    message: string;
    data: Record<string, unknown>;
  };
}

export function getWorkflowSentryMetadata(
  event: WorkflowEvent,
  options?: {
    action?: string;
    category?: string;
    level?: "info" | "warning" | "error";
  }
): WorkflowSentryMetadata {
  const action = options?.action || event.status;
  const level =
    options?.level || (event.status === "failed" ? "error" : "info");

  return {
    tags: Object.fromEntries(
      Object.entries({
        "workflow.event_type": event.type,
        "workflow.event_id": event.id,
        "workflow.source": event.source,
        "workflow.status": event.status,
        "workflow.correlation_id": event.correlationId,
      }).filter(([, value]) => Boolean(value))
    ) as Record<string, string>,
    contexts: {
      workflow: sanitizeForSentry({
        id: event.id,
        type: event.type,
        source: event.source,
        status: event.status,
        correlationId: event.correlationId,
        idempotencyKey: event.idempotencyKey,
        receivedAt: event.receivedAt,
        occurredAt: event.occurredAt,
        queuedAt: event.queuedAt,
        processedAt: event.processedAt,
        failedAt: event.failedAt,
      }) as Record<string, unknown>,
      workflow_actor: event.actor
        ? (sanitizeForSentry(event.actor) as Record<string, unknown>)
        : null,
      workflow_subject: event.subject
        ? (sanitizeForSentry(event.subject) as Record<string, unknown>)
        : null,
      workflow_payload: event.payload
        ? (sanitizeForSentry(event.payload) as Record<string, unknown>)
        : null,
      workflow_error: event.error
        ? (sanitizeForSentry(event.error) as Record<string, unknown>)
        : null,
    },
    breadcrumb: {
      category: options?.category || "workflow",
      type: "info",
      level,
      message: `${action}: ${event.type}`,
      data: {
        eventId: event.id,
        eventType: event.type,
        source: event.source,
        status: event.status,
        correlationId: event.correlationId,
      },
    },
  };
}

export function applyWorkflowSentryMetadataToScope(
  scope: ScopeLike,
  metadata: WorkflowSentryMetadata
) {
  for (const [key, value] of Object.entries(metadata.tags)) {
    scope.setTag(key, value);
  }

  for (const [key, value] of Object.entries(metadata.contexts)) {
    scope.setContext(key, value);
  }
}

export function addWorkflowBreadcrumb(
  event: WorkflowEvent,
  options?: {
    action?: string;
    category?: string;
    level?: "info" | "warning" | "error";
  }
) {
  Sentry.addBreadcrumb(getWorkflowSentryMetadata(event, options).breadcrumb);
}
