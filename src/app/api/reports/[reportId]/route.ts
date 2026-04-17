import type { NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { captureRouteException } from "@/lib/sentry/server";
import type { AuditReport } from "@/lib/types";

export async function GET(
  req: NextRequest,
  ctx: RouteContext<"/api/reports/[reportId]">
) {
  try {
    const { reportId } = await ctx.params;
    const db = getDb();

    const reportDoc = await db
      .collection(COLLECTIONS.auditReports)
      .doc(reportId)
      .get();

    if (!reportDoc.exists) {
      return Response.json({ error: "Report not found" }, { status: 404 });
    }

    const report = reportDoc.data() as AuditReport;
    // Exclude reportHtml from API response to reduce payload
    const { reportHtml, ...reportData } = report;
    void reportHtml;

    return Response.json(reportData);
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/reports/[reportId]",
      request: req,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
