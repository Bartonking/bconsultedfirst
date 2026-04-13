import { verifyServiceIntakeToken } from "@/lib/service-intake-token";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import type { AuditEngagement, Lead } from "@/lib/types";
import { getServiceIntakeConfig } from "@/lib/service-intake-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  const payload = verifyServiceIntakeToken(token);
  if (!payload) {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  try {
    const db = getDb();

    const [engagementDoc, leadDoc, config] = await Promise.all([
      db
        .collection(COLLECTIONS.auditEngagements)
        .doc(payload.engagementId)
        .get(),
      db.collection(COLLECTIONS.leads).doc(payload.leadId).get(),
      getServiceIntakeConfig(),
    ]);

    if (!engagementDoc.exists) {
      return Response.json({ error: "Engagement not found" }, { status: 404 });
    }

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const engagement = engagementDoc.data() as AuditEngagement;
    const lead = leadDoc.data() as Lead;

    if (engagement.leadId !== lead.id || engagement.id !== payload.engagementId) {
      return Response.json({ error: "Invalid token context" }, { status: 401 });
    }

    return Response.json({
      engagementId: engagement.id,
      status: engagement.status,
      email: lead.email,
      storeName: lead.storeName ?? null,
      siteUrl: lead.siteUrl,
      meetingAt: engagement.meetingAt ?? null,
      meetingUrl: engagement.meetingUrl ?? null,
      prioritySummary: engagement.prioritySummary ?? null,
      intakeResponses: engagement.intakeResponses ?? null,
      config,
    });
  } catch (err) {
    console.error("GET /api/service-intake/context error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
