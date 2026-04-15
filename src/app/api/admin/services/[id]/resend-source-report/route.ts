import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendReportEmail } from "@/lib/email";
import { renderReportHtml } from "@/lib/report-html";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import type { AuditEngagement, AuditJob, AuditReport, Lead } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/resend-source-report">
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
    if (!engagement.reportId) {
      return Response.json(
        { error: "This engagement has no linked source report" },
        { status: 400 }
      );
    }

    const [leadDoc, reportDoc] = await Promise.all([
      db.collection(COLLECTIONS.leads).doc(engagement.leadId).get(),
      db.collection(COLLECTIONS.auditReports).doc(engagement.reportId).get(),
    ]);

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (!reportDoc.exists) {
      return Response.json(
        { error: "Source report not found" },
        { status: 404 }
      );
    }

    const lead = leadDoc.data() as Lead;
    const report = reportDoc.data() as AuditReport;
    const html =
      report.reportHtml ||
      renderReportHtml(report, {
        email: lead.email,
        name: lead.storeName,
        leadId: lead.id,
      });

    const emailResult = await sendReportEmail(lead.email, report, html);

    if (report.jobId) {
      const jobRef = db.collection(COLLECTIONS.auditJobs).doc(report.jobId);
      const jobDoc = await jobRef.get();

      if (jobDoc.exists) {
        const job = jobDoc.data() as AuditJob;
        await jobRef.update({
          emailStatus: emailResult.success ? "sent" : "failed",
          ...(job.completedAt ? {} : { completedAt: new Date().toISOString() }),
        });
      }
    }

    if (!emailResult.success) {
      return Response.json(
        { error: emailResult.error || "Failed to send source report" },
        { status: 500 }
      );
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      sourceReportSentAt: now,
      updatedAt: now,
    };

    await engagementRef.update(patch);

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.ADMIN_SOURCE_REPORT_RESENT,
      source: "admin",
      publish: false,
      actor: { type: "admin" },
      subject: {
        leadId: lead.id,
        consultationId: engagement.consultationId,
        engagementId: engagement.id,
        reportId: report.id,
        jobId: report.jobId,
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
    console.error(
      "POST /api/admin/services/[id]/resend-source-report error:",
      err
    );
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
