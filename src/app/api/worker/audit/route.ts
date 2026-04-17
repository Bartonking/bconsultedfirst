import * as Sentry from "@sentry/nextjs";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { processAuditJob } from "@/lib/process-audit-job";
import { captureRouteException } from "@/lib/sentry/server";

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

    const confirmedJobId = jobId;
    const { report } = await Sentry.startSpan(
      {
        name: `audit worker ${confirmedJobId}`,
        op: "queue.process",
        forceTransaction: true,
        attributes: {
          "messaging.system": process.env.CLOUD_TASKS_QUEUE
            ? "cloud_tasks"
            : "http",
          "audit.job.id": confirmedJobId,
        },
      },
      async () => processAuditJob(confirmedJobId, { sendEmail: true })
    );
    return Response.json({ success: true, reportId: report.id });
  } catch (err) {
    await captureRouteException(err, {
      surface: "worker",
      route: "/api/worker/audit",
      request,
      statusCode: 500,
      tags: {
        "audit.job.id": jobId,
      },
      contexts: {
        audit_worker: {
          jobId,
        },
      },
    });

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
        await captureRouteException(updateErr, {
          surface: "worker",
          route: "/api/worker/audit",
          request,
          statusCode: 500,
          tags: {
            "audit.job.id": jobId,
            "audit.update": "failed_status_patch",
          },
        });
      }
    }

    return Response.json({ error: "Worker failed" }, { status: 500 });
  }
}
