import { nanoid } from "nanoid";
import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { processAuditJob } from "@/lib/process-audit-job";
import type { AuditEngagement, AuditJob } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/rerun-source-report">
) {
  let jobId: string | null = null;
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const engagementRef = db.collection(COLLECTIONS.auditEngagements).doc(id);
    const engagementDoc = await engagementRef.get();

    if (!engagementDoc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const engagement = engagementDoc.data() as AuditEngagement;
    jobId = `job-${nanoid(12)}`;
    const job: AuditJob = {
      id: jobId,
      leadId: engagement.leadId,
      status: "pending",
      emailStatus: "pending",
    };

    await db.collection(COLLECTIONS.auditJobs).doc(jobId).set(job);
    const { report, job: completedJob } = await processAuditJob(jobId, {
      sendEmail: false,
    });

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      reportId: report.id,
      updatedAt: now,
    };

    await engagementRef.update(patch);

    if (engagement.consultationId) {
      const consultationRef = db
        .collection(COLLECTIONS.consultations)
        .doc(engagement.consultationId);
      const consultationDoc = await consultationRef.get();
      if (consultationDoc.exists) {
        await consultationRef.update({
          reportId: report.id,
        });
      }
    }

    const { reportHtml, ...reportData } = report;
    void reportHtml;

    return Response.json({
      success: true,
      job: completedJob,
      report: reportData,
      engagement: {
        ...engagement,
        ...patch,
      },
    });
  } catch (err) {
    if (jobId) {
      try {
        const db = getDb();
        await db.collection(COLLECTIONS.auditJobs).doc(jobId).update({
          status: "failed",
          errorMessage:
            err instanceof Error ? err.message : "Unknown rerun error",
        });
      } catch (updateErr) {
        console.error("Failed to update rerun audit job status:", updateErr);
      }
    }
    console.error(
      "POST /api/admin/services/[id]/rerun-source-report error:",
      err
    );
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
