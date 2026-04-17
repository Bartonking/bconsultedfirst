import * as Sentry from "@sentry/nextjs";
import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { generateMockReport } from "@/lib/audit-generator";
import { renderReportHtml } from "@/lib/report-html";
import { sendReportEmail } from "@/lib/email";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import { getBookingSiteConfig } from "@/lib/site-config";
import type { AuditJob, AuditReport, Lead } from "@/lib/types";

export async function processAuditJob(
  jobId: string,
  options?: { sendEmail?: boolean }
): Promise<{ report: AuditReport; lead: Lead; job: AuditJob }> {
  return Sentry.startSpan(
    {
      name: `audit job ${jobId}`,
      op: "audit.process",
      forceTransaction: !Sentry.getActiveSpan(),
      attributes: {
        "audit.job.id": jobId,
      },
    },
    async () => {
      const sendEmail = options?.sendEmail ?? true;
      const db = getDb();
      const jobRef = db.collection(COLLECTIONS.auditJobs).doc(jobId);
      const jobDoc = await jobRef.get();

      if (!jobDoc.exists) {
        throw new Error("Job not found");
      }

      const job = jobDoc.data() as AuditJob;
      const leadDoc = await db.collection(COLLECTIONS.leads).doc(job.leadId).get();

      if (!leadDoc.exists) {
        throw new Error("Lead not found");
      }

      const lead = leadDoc.data() as Lead;
      const startedAt = new Date().toISOString();

      await jobRef.update({
        status: "processing",
        startedAt,
      });

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.AUDIT_JOB_PROCESSING,
        source: "worker",
        publish: false,
        actor: { type: "system" },
        subject: { leadId: lead.id, jobId: job.id },
      });

      const reportData = generateMockReport(lead.siteUrl, lead.challengeArea);
      const reportId = `rpt-${nanoid(12)}`;
      const report: AuditReport = {
        id: reportId,
        jobId: job.id,
        ...reportData,
        createdAt: new Date().toISOString(),
      };

      const bookingConfig = await getBookingSiteConfig();
      const html = renderReportHtml(
        report,
        {
          email: lead.email,
          name: lead.storeName,
          leadId: lead.id,
        },
        bookingConfig
      );
      report.reportHtml = html;

      await db.collection(COLLECTIONS.auditReports).doc(reportId).set(report);

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.AUDIT_REPORT_GENERATED,
        source: "worker",
        publish: false,
        actor: { type: "system" },
        subject: { leadId: lead.id, jobId: job.id, reportId },
        payload: {
          storeUrl: report.storeUrl,
          overallScore: report.overallScore,
        },
      });

      const completedAt = new Date().toISOString();
      const completedJob: AuditJob = {
        ...job,
        status: "complete",
        startedAt,
        completedAt,
        reportId,
        emailStatus: "pending",
      };

      await jobRef.update({
        status: "complete",
        completedAt,
        reportId,
        emailStatus: "pending",
      });

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.AUDIT_JOB_COMPLETED,
        source: "worker",
        publish: false,
        actor: { type: "system" },
        subject: { leadId: lead.id, jobId: job.id, reportId },
      });

      if (!sendEmail) {
        return { report, lead, job: completedJob };
      }

      const emailResult = await sendReportEmail(lead.email, report, html);
      await jobRef.update({
        emailStatus: emailResult.success ? "sent" : "failed",
      });

      await emitWorkflowEvent({
        type: WORKFLOW_EVENTS.AUDIT_REPORT_EMAIL_SENT,
        source: "email",
        publish: false,
        actor: { type: "system" },
        subject: { leadId: lead.id, jobId: job.id, reportId },
        payload: {
          success: emailResult.success,
          error: emailResult.error || null,
        },
      });

      return {
        report,
        lead,
        job: {
          ...completedJob,
          emailStatus: emailResult.success ? "sent" : "failed",
        },
      };
    }
  );
}
