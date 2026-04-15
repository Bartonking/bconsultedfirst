import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendFullAuditIntakeEmail } from "@/lib/email";
import type {
  AuditEngagement,
  Consultation,
  Lead,
} from "@/lib/types";
import { WORKFLOW_EVENTS, type WorkflowEventName } from "./names";
import type { WorkflowEvent } from "./types";
import { runAutomationOnce } from "./automation";
import { emitWorkflowEvent } from "./emit";

type WorkflowEventHandler = (event: WorkflowEvent) => Promise<void>;

function getRecordPayload(event: WorkflowEvent): Record<string, unknown> {
  return event.payload || {};
}

function getCalendlyPayload(event: WorkflowEvent): Record<string, unknown> {
  const payload = getRecordPayload(event);
  return (payload.payload as Record<string, unknown> | undefined) || payload;
}

function getTracking(payload: Record<string, unknown> | null | undefined) {
  const tracking = payload?.tracking as Record<string, unknown> | undefined;

  return {
    utm_source: (tracking?.utm_source as string | undefined) ?? null,
    utm_medium: (tracking?.utm_medium as string | undefined) ?? null,
    utm_campaign: (tracking?.utm_campaign as string | undefined) ?? null,
    utm_content: (tracking?.utm_content as string | undefined) ?? null,
    utm_term: (tracking?.utm_term as string | undefined) ?? null,
    salesforce_uuid: (tracking?.salesforce_uuid as string | undefined) ?? null,
  };
}

function getInviteeEmail(payload: Record<string, unknown> | null | undefined) {
  return (
    (payload?.email as string | undefined) ??
    ((payload?.invitee as Record<string, unknown> | undefined)?.email as
      | string
      | undefined) ??
    null
  );
}

function getConsultationSortDate(consultation: Consultation) {
  return (
    consultation.paidAt ||
    consultation.bookedAt ||
    consultation.scheduledStartAt ||
    ""
  );
}

async function findConsultationByEmail(email: string) {
  const db = getDb();
  const leadsSnap = await db
    .collection(COLLECTIONS.leads)
    .where("email", "==", email)
    .limit(10)
    .get();

  if (leadsSnap.empty) return null;

  const consultationCandidates: Consultation[] = [];
  const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);

  for (const lead of leads) {
    const consultationsSnap = await db
      .collection(COLLECTIONS.consultations)
      .where("leadId", "==", lead.id)
      .limit(20)
      .get();

    const consultations = consultationsSnap.docs
      .map((doc) => doc.data() as Consultation)
      .filter((consultation) =>
        ["paid", "scheduled", "completed", "requested"].includes(
          consultation.consultationStatus
        )
      );

    consultationCandidates.push(...consultations);
  }

  if (consultationCandidates.length === 0) return null;

  consultationCandidates.sort((a, b) =>
    getConsultationSortDate(b).localeCompare(getConsultationSortDate(a))
  );

  return consultationCandidates[0];
}

async function handleCalendlyInviteeCreated(event: WorkflowEvent) {
  await runAutomationOnce({
    event,
    handler: "calendly_invitee_created.sync_records",
    idempotencyKey:
      event.idempotencyKey ||
      `calendly_invitee_created:${event.subject?.calendlyInviteeUri || event.id}`,
    fn: async () => {
      const payload = getCalendlyPayload(event);
      const tracking = getTracking(payload);
      const inviteeEmail = getInviteeEmail(payload);
      const scheduledEvent =
        (payload.scheduled_event as Record<string, unknown> | undefined) ??
        undefined;
      const scheduledStartAt =
        (scheduledEvent?.start_time as string | undefined) ?? null;
      const scheduledEndAt =
        (scheduledEvent?.end_time as string | undefined) ?? null;
      const meetingUrl =
        ((scheduledEvent?.location as Record<string, unknown> | undefined)
          ?.join_url as string | undefined) ??
        ((payload.location as Record<string, unknown> | undefined)?.join_url as
          | string
          | undefined) ??
        null;
      const calendlyEventUri =
        (payload.event as string | undefined) ??
        (scheduledEvent?.uri as string | undefined) ??
        null;
      const calendlyInviteeUri = (payload.uri as string | undefined) ?? null;

      let consultationId =
        event.subject?.consultationId || tracking.utm_content || null;

      if (!consultationId && inviteeEmail) {
        const matchedConsultation = await findConsultationByEmail(inviteeEmail);
        consultationId = matchedConsultation?.id || null;
      }

      if (!consultationId) {
        throw new Error(
          "Calendly invitee.created could not be matched to a consultation"
        );
      }

      const db = getDb();
      const consultationRef = db
        .collection(COLLECTIONS.consultations)
        .doc(consultationId);
      const consultationDoc = await consultationRef.get();

      if (!consultationDoc.exists) {
        throw new Error(`Consultation ${consultationId} not found`);
      }

      const consultation = consultationDoc.data() as Consultation;
      await consultationRef.update({
        consultationStatus: "scheduled",
        bookedAt: new Date().toISOString(),
        calendlyEventUri,
        calendlyInviteeUri,
        scheduledStartAt,
        scheduledEndAt,
        cancelUrl: (payload.cancel_url as string | undefined) ?? null,
        rescheduleUrl: (payload.reschedule_url as string | undefined) ?? null,
      });

      const engagementSnap = await db
        .collection(COLLECTIONS.auditEngagements)
        .where("consultationId", "==", consultationId)
        .limit(1)
        .get();

      const engagementDoc = engagementSnap.empty ? null : engagementSnap.docs[0];
      const engagement = engagementDoc?.data() as AuditEngagement | undefined;

      if (engagementDoc && engagement) {
        await engagementDoc.ref.update({
          status:
            engagement.status === "meeting_completed"
              ? engagement.status
              : "meeting_scheduled",
          meetingAt: scheduledStartAt || engagement.meetingAt || null,
          ...(meetingUrl ? { meetingUrl } : {}),
          updatedAt: new Date().toISOString(),
        });
      }

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.MEETING_SCHEDULED,
        source: "automation",
        publish: false,
        actor: event.actor,
        correlationId: event.correlationId || event.id,
        subject: {
          leadId: consultation.leadId,
          consultationId,
          engagementId: engagementDoc?.id,
          calendlyEventUri: calendlyEventUri || undefined,
          calendlyInviteeUri: calendlyInviteeUri || undefined,
        },
        payload: {
          scheduledStartAt,
          scheduledEndAt,
          meetingUrl,
        },
      });

      if (engagementDoc && engagement) {
        await runAutomationOnce({
          event,
          handler: "calendly_invitee_created.send_intake",
          idempotencyKey: `send_intake:${engagement.id}`,
          fn: async () => {
            if (engagement.intakeEmailSentAt) {
              return {
                status: "ignored",
                result: { reason: "intake_email_already_sent" },
              };
            }

            const leadDoc = await db
              .collection(COLLECTIONS.leads)
              .doc(engagement.leadId)
              .get();

            if (!leadDoc.exists) {
              throw new Error(`Lead ${engagement.leadId} not found`);
            }

            const lead = leadDoc.data() as Lead;
            const syncedEngagement: AuditEngagement = {
              ...engagement,
              status:
                engagement.status === "meeting_completed"
                  ? engagement.status
                  : "meeting_scheduled",
              meetingAt: scheduledStartAt || engagement.meetingAt,
              ...(meetingUrl ? { meetingUrl } : {}),
            };
            const emailResult = await sendFullAuditIntakeEmail(
              lead,
              syncedEngagement
            );

            if (!emailResult.success) {
              await emitWorkflowEvent({
                type: WORKFLOW_EVENTS.AUDIT_FORM_REQUEST_FAILED,
                source: "email",
                publish: false,
                correlationId: event.correlationId || event.id,
                subject: {
                  leadId: engagement.leadId,
                  consultationId,
                  engagementId: engagement.id,
                },
                payload: {
                  error: emailResult.error || "Failed to send intake email",
                },
              });
              throw new Error(
                emailResult.error || "Failed to send intake email"
              );
            }

            const now = new Date().toISOString();
            await engagementDoc.ref.update({
              intakeEmailSentAt: now,
              updatedAt: now,
            });

            await emitWorkflowEvent({
              type: WORKFLOW_EVENTS.AUDIT_FORM_REQUEST_SENT,
              source: "email",
              publish: false,
              correlationId: event.correlationId || event.id,
              subject: {
                leadId: engagement.leadId,
                consultationId,
                engagementId: engagement.id,
              },
            });

            return { result: { intakeEmailSentAt: now } };
          },
        });
      }

      return {
        result: {
          consultationId,
          engagementId: engagementDoc?.id || null,
          scheduledStartAt,
          scheduledEndAt,
          meetingUrl,
        },
      };
    },
  });
}

async function handleCalendlyInviteeCancelled(event: WorkflowEvent) {
  await runAutomationOnce({
    event,
    handler: "calendly_invitee_cancelled.sync_records",
    idempotencyKey:
      event.idempotencyKey ||
      `calendly_invitee_cancelled:${event.subject?.calendlyInviteeUri || event.id}`,
    fn: async () => {
      const payload = getCalendlyPayload(event);
      const tracking = getTracking(payload);
      let consultationId =
        event.subject?.consultationId || tracking.utm_content || null;
      const inviteeEmail = getInviteeEmail(payload);

      if (!consultationId && inviteeEmail) {
        const matchedConsultation = await findConsultationByEmail(inviteeEmail);
        consultationId = matchedConsultation?.id || null;
      }

      if (!consultationId) {
        throw new Error(
          "Calendly invitee.canceled could not be matched to a consultation"
        );
      }

      const db = getDb();
      const wasRescheduled = Boolean(payload.rescheduled);
      const consultationRef = db
        .collection(COLLECTIONS.consultations)
        .doc(consultationId);
      const consultationDoc = await consultationRef.get();

      if (!consultationDoc.exists) {
        throw new Error(`Consultation ${consultationId} not found`);
      }

      const consultation = consultationDoc.data() as Consultation;
      await consultationRef.update({
        consultationStatus: wasRescheduled ? "scheduled" : "cancelled",
      });

      const engagementSnap = await db
        .collection(COLLECTIONS.auditEngagements)
        .where("consultationId", "==", consultationId)
        .limit(1)
        .get();

      const engagementDoc = engagementSnap.empty ? null : engagementSnap.docs[0];
      const engagement = engagementDoc?.data() as AuditEngagement | undefined;

      if (engagementDoc && engagement && !wasRescheduled) {
        await engagementDoc.ref.update({
          status:
            engagement.status === "meeting_completed"
              ? engagement.status
              : "intake_received",
          meetingAt: null,
          updatedAt: new Date().toISOString(),
        });
      }

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.MEETING_CANCELLED,
        source: "automation",
        publish: false,
        actor: event.actor,
        correlationId: event.correlationId || event.id,
        subject: {
          leadId: consultation.leadId,
          consultationId,
          engagementId: engagementDoc?.id,
        },
        payload: { rescheduled: wasRescheduled },
      });

      return {
        result: {
          consultationId,
          engagementId: engagementDoc?.id || null,
          rescheduled: wasRescheduled,
        },
      };
    },
  });
}

async function handleStripeCheckoutCompleted(event: WorkflowEvent) {
  await runAutomationOnce({
    event,
    handler: "stripe_checkout_completed.mark_paid",
    idempotencyKey:
      event.idempotencyKey ||
      `stripe_checkout_completed:${event.subject?.stripeSessionId || event.id}`,
    fn: async () => {
      const payload = getRecordPayload(event);
      const consultationId =
        event.subject?.consultationId ||
        (payload.consultationId as string | undefined);

      if (!consultationId) {
        throw new Error("Stripe checkout event missing consultationId");
      }

      const db = getDb();
      const consultationRef = db
        .collection(COLLECTIONS.consultations)
        .doc(consultationId);
      const consultationDoc = await consultationRef.get();

      if (!consultationDoc.exists) {
        throw new Error(`Consultation ${consultationId} not found`);
      }

      const consultation = consultationDoc.data() as Consultation;
      if (consultation.paymentStatus === "paid") {
        return { status: "ignored", result: { reason: "already_paid" } };
      }

      await consultationRef.update({
        consultationStatus: "paid",
        paymentStatus: "paid",
        paymentAmount: (payload.amountTotal as number | null) ?? null,
        paymentCurrency: (payload.currency as string | null) ?? null,
        stripeCheckoutSessionId:
          event.subject?.stripeSessionId ||
          (payload.stripeSessionId as string | undefined) ||
          null,
        stripePaymentIntentId:
          (payload.stripePaymentIntentId as string | undefined) || null,
        paidAt: new Date().toISOString(),
      });

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.CONSULTATION_PAID,
        source: "automation",
        publish: false,
        correlationId: event.correlationId || event.id,
        subject: {
          leadId: consultation.leadId,
          consultationId,
          reportId: consultation.reportId,
          stripeSessionId: event.subject?.stripeSessionId,
        },
      });

      return { result: { consultationId } };
    },
  });
}

async function handlePreMeetingFormSubmitted(event: WorkflowEvent) {
  await runAutomationOnce({
    event,
    handler: "pre_meeting_form_submitted.mark_intake_received",
    idempotencyKey: `pre_meeting_form_submitted:${event.subject?.engagementId || event.id}`,
    fn: async () => {
      const engagementId = event.subject?.engagementId;
      if (!engagementId) {
        throw new Error("Pre-meeting form event missing engagementId");
      }

      const db = getDb();
      const engagementRef = db
        .collection(COLLECTIONS.auditEngagements)
        .doc(engagementId);
      const engagementDoc = await engagementRef.get();

      if (!engagementDoc.exists) {
        throw new Error(`Engagement ${engagementId} not found`);
      }

      const engagement = engagementDoc.data() as AuditEngagement;
      if (
        engagement.status === "proposed" ||
        engagement.status === "intake_pending"
      ) {
        await engagementRef.update({
          status: "intake_received",
          updatedAt: new Date().toISOString(),
        });
      }

      return { result: { engagementId } };
    },
  });
}

const HANDLERS: Partial<Record<WorkflowEventName, WorkflowEventHandler[]>> = {
  [WORKFLOW_EVENTS.CALENDLY_INVITEE_CREATED]: [handleCalendlyInviteeCreated],
  [WORKFLOW_EVENTS.CALENDLY_INVITEE_CANCELLED]: [handleCalendlyInviteeCancelled],
  [WORKFLOW_EVENTS.STRIPE_CHECKOUT_COMPLETED]: [handleStripeCheckoutCompleted],
  [WORKFLOW_EVENTS.PRE_MEETING_FORM_SUBMITTED]: [handlePreMeetingFormSubmitted],
};

export function getHandlersForEvent(
  eventType: WorkflowEventName
): WorkflowEventHandler[] {
  return HANDLERS[eventType] || [];
}

