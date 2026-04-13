export { logAnalyticsEvent } from "@/components/analytics/AnalyticsProvider";

export const EVENTS = {
  AUDIT_FORM_SUBMITTED: "audit_form_submitted",
  BOOKING_CHECKOUT_INITIATED: "booking_checkout_initiated",
  INTAKE_FORM_SUBMITTED: "intake_form_submitted",
  CONTACT_FORM_SUBMITTED: "contact_form_submitted",
  CTA_CLICKED: "cta_clicked",
} as const;

export type AnalyticsEventName = (typeof EVENTS)[keyof typeof EVENTS];
