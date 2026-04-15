export const WORKFLOW_EVENTS = {
  AUDIT_FORM_SUBMITTED: "audit_form_submitted",
  LEAD_CREATED: "lead_created",
  AUDIT_JOB_CREATED: "audit_job_created",
  AUDIT_JOB_PROCESSING: "audit_job_processing",
  AUDIT_JOB_COMPLETED: "audit_job_completed",
  AUDIT_REPORT_GENERATED: "audit_report_generated",
  AUDIT_REPORT_EMAIL_SENT: "audit_report_email_sent",
  BOOKING_CHECKOUT_INITIATED: "booking_checkout_initiated",
  STRIPE_WEBHOOK_RECEIVED: "stripe_webhook_received",
  STRIPE_CHECKOUT_COMPLETED: "stripe_checkout_completed",
  CONSULTATION_PAID: "consultation_paid",
  CALENDLY_WEBHOOK_RECEIVED: "calendly_webhook_received",
  CALENDLY_INVITEE_CREATED: "calendly_invitee_created",
  CALENDLY_INVITEE_CANCELLED: "calendly_invitee_cancelled",
  MEETING_SCHEDULED: "meeting_scheduled",
  MEETING_CANCELLED: "meeting_cancelled",
  AUDIT_FORM_REQUEST_SENT: "audit_form_request_sent",
  AUDIT_FORM_REQUEST_FAILED: "audit_form_request_failed",
  PRE_MEETING_FORM_OPENED: "pre_meeting_form_opened",
  PRE_MEETING_FORM_DRAFT_SAVED: "pre_meeting_form_draft_saved",
  PRE_MEETING_FORM_SUBMITTED: "pre_meeting_form_submitted",
  ADMIN_SERVICE_UPDATED: "admin_service_updated",
  ADMIN_BOOKING_EMAIL_SENT: "admin_booking_email_sent",
  ADMIN_SOURCE_REPORT_RESENT: "admin_source_report_resent",
  ADMIN_SOURCE_REPORT_RERUN: "admin_source_report_rerun",
  ADMIN_FINAL_REPORT_SENT: "admin_final_report_sent",
  FINAL_REPORT_SENT: "final_report_sent",
} as const;

export type WorkflowEventName =
  (typeof WORKFLOW_EVENTS)[keyof typeof WORKFLOW_EVENTS];

