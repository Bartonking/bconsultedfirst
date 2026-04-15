import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendFullAuditIntakeEmail } from "@/lib/email";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import type { AuditEngagement, Lead } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/send-intake">
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
    const leadDoc = await db
      .collection(COLLECTIONS.leads)
      .doc(engagement.leadId)
      .get();

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadDoc.data() as Lead;
    const emailResult = await sendFullAuditIntakeEmail(lead, engagement);

    if (!emailResult.success) {
      return Response.json(
        { error: emailResult.error || "Failed to send intake email" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      intakeEmailSentAt: now,
      updatedAt: now,
    };

    if (engagement.status === "proposed") {
      patch.status = "intake_pending";
    }

    await engagementRef.update(patch);

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.AUDIT_FORM_REQUEST_SENT,
      source: "admin",
      publish: false,
      actor: { type: "admin" },
      subject: {
        leadId: engagement.leadId,
        consultationId: engagement.consultationId,
        engagementId: engagement.id,
        reportId: engagement.reportId,
      },
      payload: { sentAt: now, manual: true },
    });

    return Response.json({
      success: true,
      engagement: {
        ...engagement,
        ...patch,
      },
    });
  } catch (err) {
    console.error("POST /api/admin/services/[id]/send-intake error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
