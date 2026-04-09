import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { generateMockReport } from "@/lib/audit-generator";
import { renderReportHtml } from "@/lib/report-html";
import { sendReportEmail } from "@/lib/email";
import type { AuditJob, AuditReport, Lead } from "@/lib/types";

export async function POST(request: Request) {
  // Validate worker secret
  const secret = request.headers.get("X-Worker-Secret");
  const expectedSecret =
    process.env.WORKER_SECRET || "dev-secret-change-in-prod";
  if (secret !== expectedSecret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let jobId: string | undefined;

  try {
    const body = await request.json();
    jobId = body.jobId;

    if (!jobId) {
      return Response.json({ error: "Missing jobId" }, { status: 400 });
    }

    const db = getDb();

    // Read the job
    const jobRef = db.collection(COLLECTIONS.auditJobs).doc(jobId);
    const jobDoc = await jobRef.get();
    if (!jobDoc.exists) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobDoc.data() as AuditJob;

    // Read the lead
    const leadDoc = await db
      .collection(COLLECTIONS.leads)
      .doc(job.leadId)
      .get();
    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadDoc.data() as Lead;

    // Update job to processing
    await jobRef.update({
      status: "processing",
      startedAt: new Date().toISOString(),
    });

    // Generate the report (Phase 1: mock generator)
    const reportData = generateMockReport(lead.siteUrl, lead.challengeArea);
    const reportId = `rpt-${nanoid(12)}`;

    const report: AuditReport = {
      id: reportId,
      jobId: job.id,
      ...reportData,
      createdAt: new Date().toISOString(),
    };

    // Render HTML
    const html = renderReportHtml(report, { email: lead.email, name: lead.storeName });
    report.reportHtml = html;

    // Store report in Firestore
    await db.collection(COLLECTIONS.auditReports).doc(reportId).set(report);

    // Update job to complete
    await jobRef.update({
      status: "complete",
      completedAt: new Date().toISOString(),
      reportId,
    });

    // Send email (non-blocking for job status)
    const emailResult = await sendReportEmail(lead.email, report, html);
    await jobRef.update({
      emailStatus: emailResult.success ? "sent" : "failed",
    });

    return Response.json({ success: true, reportId });
  } catch (err) {
    console.error("Worker audit error:", err);

    // Mark job as failed if we have a jobId
    if (jobId) {
      try {
        const db = getDb();
        await db
          .collection(COLLECTIONS.auditJobs)
          .doc(jobId)
          .update({
            status: "failed",
            errorMessage:
              err instanceof Error ? err.message : "Unknown worker error",
          });
      } catch (updateErr) {
        console.error("Failed to update job status:", updateErr);
      }
    }

    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
}
