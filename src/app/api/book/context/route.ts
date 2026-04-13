import { verifyBookingToken } from "@/lib/booking-token";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Lead, AuditReport } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = verifyBookingToken(token);
  if (!payload) {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    const db = getDb();

    const leadDoc = await db
      .collection(COLLECTIONS.leads)
      .doc(payload.leadId)
      .get();

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadDoc.data() as Lead;

    let reportData: { overallScore?: number; executiveSummary?: string } = {};
    if (payload.reportId) {
      const reportDoc = await db
        .collection(COLLECTIONS.auditReports)
        .doc(payload.reportId)
        .get();
      if (reportDoc.exists) {
        const report = reportDoc.data() as AuditReport;
        reportData = {
          overallScore: report.overallScore,
          executiveSummary: report.executiveSummary,
        };
      }
    }

    return Response.json({
      leadId: lead.id,
      reportId: payload.reportId ?? null,
      email: lead.email,
      storeName: lead.storeName ?? null,
      name: lead.storeName ?? null,
      siteUrl: lead.siteUrl,
      challengeArea: lead.challengeArea ?? null,
      source: payload.source,
      ...reportData,
    });
  } catch (err) {
    console.error("GET /api/book/context error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
