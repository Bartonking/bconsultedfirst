import type { NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { AuditJob, AuditReport, AuditStatusResponse } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/audits/[jobId]">
) {
  try {
    const { jobId } = await ctx.params;
    const db = getDb();

    const jobDoc = await db
      .collection(COLLECTIONS.auditJobs)
      .doc(jobId)
      .get();

    if (!jobDoc.exists) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobDoc.data() as AuditJob;
    const response: AuditStatusResponse = {
      jobId: job.id,
      status: job.status,
      reportId: job.reportId,
    };

    // Include summary if complete
    if (job.status === "complete" && job.reportId) {
      const reportDoc = await db
        .collection(COLLECTIONS.auditReports)
        .doc(job.reportId)
        .get();
      if (reportDoc.exists) {
        const report = reportDoc.data() as AuditReport;
        response.summary = report.executiveSummary;
      }
    }

    return Response.json(response);
  } catch (err) {
    console.error("GET /api/audits/[jobId] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
