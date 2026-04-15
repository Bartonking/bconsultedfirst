import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { generateMockReport } from "@/lib/audit-generator";
import { renderReportHtml } from "@/lib/report-html";
import { sendReportEmail } from "@/lib/email";
import type { AuditJob, AuditReport, Lead } from "@/lib/types";

export async function processAuditJob(
  jobId: string,
  options?: { sendEmail?: boolean }
): Promise<{ report: AuditReport; lead: Lead; job: AuditJob }> {
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

  const reportData = generateMockReport(lead.siteUrl, lead.challengeArea);
  const reportId = `rpt-${nanoid(12)}`;
  const report: AuditReport = {
    id: reportId,
    jobId: job.id,
    ...reportData,
    createdAt: new Date().toISOString(),
  };

  const html = renderReportHtml(report, {
    email: lead.email,
    name: lead.storeName,
    leadId: lead.id,
  });
  report.reportHtml = html;

  await db.collection(COLLECTIONS.auditReports).doc(reportId).set(report);

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

  if (!sendEmail) {
    return { report, lead, job: completedJob };
  }

  const emailResult = await sendReportEmail(lead.email, report, html);
  await jobRef.update({
    emailStatus: emailResult.success ? "sent" : "failed",
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
