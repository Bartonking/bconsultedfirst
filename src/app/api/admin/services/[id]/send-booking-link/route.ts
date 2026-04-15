import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendConsultationSchedulingEmail } from "@/lib/email";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import type { AuditEngagement, Consultation, Lead } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/send-booking-link">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const engagementRef = db.collection(COLLECTIONS.auditEngagements).doc(id);
    const engagementDoc = await engagementRef.get();

    if (!engagementDoc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const engagement = engagementDoc.data() as AuditEngagement;

    if (!engagement.consultationId) {
      return Response.json(
        { error: "This engagement has no linked consultation" },
        { status: 400 }
      );
    }

    const [leadDoc, consultationDoc] = await Promise.all([
      db.collection(COLLECTIONS.leads).doc(engagement.leadId).get(),
      db
        .collection(COLLECTIONS.consultations)
        .doc(engagement.consultationId)
        .get(),
    ]);

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!consultationDoc.exists) {
      return Response.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    const lead = leadDoc.data() as Lead;
    const consultation = consultationDoc.data() as Consultation;

    if (consultation.paymentStatus !== "paid") {
      return Response.json(
        { error: "Consultation must be paid before sending scheduling" },
        { status: 409 }
      );
    }

    const emailResult = await sendConsultationSchedulingEmail({
      lead,
      consultationId: consultation.id,
    });

    if (!emailResult.success) {
      const status =
        emailResult.error === "Calendly scheduling URL is not configured"
          ? 500
          : 500;
      return Response.json(
        { error: emailResult.error || "Failed to send scheduling email" },
        { status }
      );
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      bookingLinkSentAt: now,
      updatedAt: now,
    };

    await engagementRef.update(patch);

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.ADMIN_BOOKING_EMAIL_SENT,
      source: "admin",
      publish: false,
      actor: { type: "admin" },
      subject: {
        leadId: lead.id,
        consultationId: consultation.id,
        engagementId: engagement.id,
        reportId: engagement.reportId,
      },
      payload: { sentAt: now },
    });

    return Response.json({
      success: true,
      engagement: {
        ...engagement,
        ...patch,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/services/[id]/send-booking-link error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
