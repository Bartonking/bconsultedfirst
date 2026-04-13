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
  intakeEmailSentAt?: string;
  meetingConfirmationSentAt?: string;
  finalReportSentAt?: string;

  createdAt: string;
  updatedAt: string;
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
