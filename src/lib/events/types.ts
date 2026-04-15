import type { WorkflowEventName } from "./names";

export type { WorkflowEventName } from "./names";

export type WorkflowEventStatus =
  | "received"
  | "queued"
  | "processing"
  | "processed"
  | "failed"
  | "ignored"
  | "dead_lettered";

export type WorkflowEventSource =
  | "frontend"
  | "server"
  | "admin"
  | "stripe"
  | "calendly"
  | "email"
  | "worker"
  | "automation";

export interface WorkflowEventActor {
  type: "anonymous" | "lead" | "admin" | "system" | "webhook";
  id?: string;
  email?: string;
}

export interface WorkflowEventSubject {
  leadId?: string;
  consultationId?: string;
  engagementId?: string;
  reportId?: string;
  jobId?: string;
  stripeSessionId?: string;
  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
}

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventName;
  source: WorkflowEventSource;
  status: WorkflowEventStatus;
  receivedAt: string;
  occurredAt?: string;
  queuedAt?: string;
  processedAt?: string;
  failedAt?: string;
  correlationId?: string;
  idempotencyKey?: string;
  actor?: WorkflowEventActor;
  subject?: WorkflowEventSubject;
  payload?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
  };
}

export interface EventAutomationRun {
  id: string;
  eventId: string;
  eventType: WorkflowEventName;
  handler: string;
  status: "processing" | "processed" | "failed" | "ignored";
  idempotencyKey: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  result?: Record<string, unknown>;
}

export interface EventDeadLetter {
  id: string;
  eventId: string;
  eventType: WorkflowEventName;
  source: WorkflowEventSource;
  failedAt: string;
  error: string;
  payload?: Record<string, unknown>;
}

export interface EmitWorkflowEventInput {
  type: WorkflowEventName;
  source: WorkflowEventSource;
  occurredAt?: string;
  correlationId?: string;
  idempotencyKey?: string;
  actor?: WorkflowEventActor;
  subject?: WorkflowEventSubject;
  payload?: Record<string, unknown>;
  publish?: boolean;
  processInlineIfUnpublished?: boolean;
}
