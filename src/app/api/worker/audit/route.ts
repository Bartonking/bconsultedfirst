import { getDb, COLLECTIONS } from "@/lib/firebase";
import { processAuditJob } from "@/lib/process-audit-job";

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

    const { report } = await processAuditJob(jobId, { sendEmail: true });
    return Response.json({ success: true, reportId: report.id });
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
