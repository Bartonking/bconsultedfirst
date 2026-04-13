import type { NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type {
  AuditReport,
  AuditJob,
  Lead,
  Consultation,
  AuditEngagement,
} from "@/lib/types";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/audit/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();

    // id could be a reportId or jobId — try report first
    let report: AuditReport | null = null;
    let job: AuditJob | null = null;
    let lead: Lead | null = null;
    let consultation: Consultation | null = null;
    let engagement: AuditEngagement | null = null;

    // Try as reportId
    const reportDoc = await db
      .collection(COLLECTIONS.auditReports)
      .doc(id)
      .get();

    if (reportDoc.exists) {
      report = reportDoc.data() as AuditReport;
      // Exclude HTML from response
      const { reportHtml, ...reportData } = report;
      void reportHtml;
      report = reportData as AuditReport;

      // Get the job
      const jobDoc = await db
        .collection(COLLECTIONS.auditJobs)
        .doc(report.jobId)
        .get();
      if (jobDoc.exists) {
        job = jobDoc.data() as AuditJob;
      }
    } else {
      // Try as jobId
      const jobDoc = await db
        .collection(COLLECTIONS.auditJobs)
        .doc(id)
        .get();
      if (jobDoc.exists) {
        job = jobDoc.data() as AuditJob;
        if (job.reportId) {
          const rDoc = await db
            .collection(COLLECTIONS.auditReports)
            .doc(job.reportId)
            .get();
          if (rDoc.exists) {
            const rData = rDoc.data() as AuditReport;
            const { reportHtml, ...rest } = rData;
            void reportHtml;
            report = rest as AuditReport;
          }
        }
      }
    }

    if (!report && !job) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    // Get lead
    if (job?.leadId) {
      const leadDoc = await db
        .collection(COLLECTIONS.leads)
        .doc(job.leadId)
        .get();
      if (leadDoc.exists) {
        lead = leadDoc.data() as Lead;
      }
    }

    // Get consultation for this lead
    if (lead) {
      const conSnap = await db
        .collection(COLLECTIONS.consultations)
        .where("leadId", "==", lead.id)
        .limit(1)
        .get();
      if (!conSnap.empty) {
        consultation = conSnap.docs[0].data() as Consultation;
      }

      if (consultation) {
        const engagementSnap = await db
          .collection(COLLECTIONS.auditEngagements)
          .where("consultationId", "==", consultation.id)
          .limit(1)
          .get();
        if (!engagementSnap.empty) {
          engagement = engagementSnap.docs[0].data() as AuditEngagement;
        }
      }

      if (!engagement && report) {
        const reportEngagementSnap = await db
          .collection(COLLECTIONS.auditEngagements)
          .where("reportId", "==", report.id)
          .limit(1)
          .get();
        if (!reportEngagementSnap.empty) {
          engagement = reportEngagementSnap.docs[0].data() as AuditEngagement;
        }
      }
    }

    return Response.json({ report, job, lead, consultation, engagement });
  } catch (err) {
    console.error("GET /api/admin/audit/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
