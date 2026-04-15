export interface Lead {
  id: string;
  email: string;
  siteUrl: string;
  storeName?: string;
  challengeArea?: string;
  consentStatus: boolean;
  createdAt: string;

  marketingStatus?: "subscribed" | "unsubscribed";
  marketingSubscribedAt?: string;
  marketingSource?: string;

  archivedAt?: string;
}

export interface AuditJob {
  id: string;
  leadId: string;
  status: "pending" | "processing" | "complete" | "failed";
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  reportId?: string;
  emailStatus?: "pending" | "sent" | "failed";
}

export interface AuditReport {
  id: string;
  jobId: string;
  storeUrl: string;
  executiveSummary: string;
  overallScore: number;
  categories: AuditCategory[];
  findings: AuditFinding[];
  recommendations: string[];
  reportHtml?: string;
  createdAt: string;
}

export interface AuditCategory {
  name: string;
  score: number;
  maxScore: number;
  summary: string;
}

export interface AuditFinding {
  category: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  severity: "low" | "medium" | "high";
}

export interface Consultation {
  id: string;
  leadId: string;
  consultationStatus:
    | "requested"
    | "paid"
    | "scheduled"
    | "completed"
    | "cancelled";
  bookedAt?: string;
  notes?: string;
  paymentStatus?: "pending" | "paid" | "refunded";
  paymentAmount?: number;
  paymentCurrency?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;

  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;

  source?: "audit_email" | "results_page" | "direct";
  reportId?: string;

  archivedAt?: string;
}

export interface AuditEngagement {
  id: string;
  leadId: string;
  consultationId?: string;
  reportId?: string;

  serviceType: "full_audit";
  status:
    | "proposed"
    | "intake_pending"
    | "intake_received"
    | "meeting_scheduled"
    | "meeting_completed"
    | "in_progress"
    | "draft_ready"
    | "delivered"
    | "closed"
    | "cancelled";

  owner?: string;

  meetingAt?: string;
  meetingUrl?: string;
  meetingNotes?: string;

  intakeResponses?: {
    teamSize?: string;
    fulfillmentSetup?: string;
    systems?: string;
    topProblems?: string[];
    goals?: string;
  };

  internalNotes?: string;
  prioritySummary?: string;
  recommendedNextSteps?: string[];

  finalReportFormat?: "html" | "pdf";
  finalReportHtml?: string;
  finalReportUrl?: string;
  bookingLinkSentAt?: string;
  sourceReportSentAt?: string;
  intakeEmailSentAt?: string;
  meetingConfirmationSentAt?: string;
  finalReportSentAt?: string;

  createdAt: string;
  updatedAt: string;

  archivedAt?: string;
}

export type ServiceIntakeStepId =
  | "teamSize"
  | "fulfillmentSetup"
  | "systems"
  | "bottlenecks"
  | "goals";

export interface ServiceIntakeOption {
  id: string;
  label: string;
  description: string;
  iconKey: string;
  active: boolean;
  source?: "system" | "admin";
  promptLabel?: string;
  placeholder?: string;
}

export interface ServiceIntakeQuestionConfig {
  title: string;
  subtitle: string;
  type: "single" | "multi" | "goal_cards";
  allowCustom?: boolean;
  allowDetail?: boolean;
  detailLabel?: string;
  detailPlaceholder?: string;
  customInputLabel?: string;
  customInputPlaceholder?: string;
  options: ServiceIntakeOption[];
}

export interface ServiceIntakeConfig {
  id: string;
  version: number;
  questions: Record<ServiceIntakeStepId, ServiceIntakeQuestionConfig>;
  updatedAt: string;
  updatedBy?: string;
}

export interface CalendlyWebhookLog {
  id: string;
  createdAt: string;
  eventType: string;
  result:
    | "received"
    | "missing_signature"
    | "missing_signing_key"
    | "invalid_signature"
    | "missing_consultation_id"
    | "consultation_not_found"
    | "engagement_not_found"
    | "synced"
    | "cancelled"
    | "ignored_reschedule_cancel"
    | "error";
  message?: string;
  consultationId?: string | null;
  matchedBy?: "utm_content" | "email_fallback" | "none";
  engagementId?: string | null;
  inviteeEmail?: string | null;
  inviteeName?: string | null;
  calendlyEventUri?: string | null;
  calendlyInviteeUri?: string | null;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  meetingUrl?: string | null;
  tracking?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_content?: string | null;
    utm_term?: string | null;
    salesforce_uuid?: string | null;
  };
  payload?: Record<string, unknown>;
}

export interface CalendlyBucketEvent {
  id: string;
  receivedAt: string;
  method: string;
  url: string;
  userAgent?: string | null;
  signatureHeader?: string | null;
  contentType?: string | null;
  rawBody: string;
  bodySize: number;
  parseStatus: "not_parsed" | "parsed" | "parse_failed";
  eventType?: string | null;
  payloadEmail?: string | null;
  payloadName?: string | null;
  payloadUri?: string | null;
  payloadEventUri?: string | null;
  tracking?: Record<string, unknown> | null;
  payload?: Record<string, unknown> | null;
  parseError?: string | null;
}

export type {
  EventAutomationRun,
  EventDeadLetter,
  WorkflowEvent,
  WorkflowEventActor,
  WorkflowEventSource,
  WorkflowEventStatus,
  WorkflowEventSubject,
} from "@/lib/events/types";
export type { WorkflowEventName } from "@/lib/events/names";

// API request/response types
export interface CreateAuditRequest {
  email: string;
  storeUrl: string;
  challenge?: string;
}

export interface CreateAuditResponse {
  jobId: string;
  status: "queued";
}

export interface AuditStatusResponse {
  jobId: string;
  status: AuditJob["status"];
  reportId?: string;
  summary?: string;
}
