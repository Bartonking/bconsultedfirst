import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendFinalAuditReportEmail } from "@/lib/email";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import type { AuditEngagement, Lead } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/send-report">
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
    const emailResult = await sendFinalAuditReportEmail(lead, engagement);

    if (!emailResult.success) {
      const status =
        emailResult.error === "Missing final report content or final report URL"
          ? 400
          : 500;
      return Response.json(
        { error: emailResult.error || "Failed to send final report email" },
        { status }
      );
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      finalReportSentAt: now,
      updatedAt: now,
    };

    if (engagement.status !== "closed" && engagement.status !== "cancelled") {
      patch.status = "delivered";
    }

    await engagementRef.update(patch);

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.ADMIN_FINAL_REPORT_SENT,
      source: "admin",
      publish: false,
      actor: { type: "admin" },
      subject: {
        leadId: engagement.leadId,
        consultationId: engagement.consultationId,
        engagementId: engagement.id,
        reportId: engagement.reportId,
      },
      payload: { sentAt: now },
    });

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.FINAL_REPORT_SENT,
      source: "email",
      publish: false,
      actor: { type: "system" },
      subject: {
        leadId: engagement.leadId,
        consultationId: engagement.consultationId,
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
    console.error("POST /api/admin/services/[id]/send-report error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
