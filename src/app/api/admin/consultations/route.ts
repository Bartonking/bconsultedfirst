import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Lead, Consultation, AuditEngagement } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "active";
    const db = getDb();

    const [consultationsSnap, leadsSnap, engagementsSnap] = await Promise.all([
      db.collection(COLLECTIONS.consultations).limit(100).get(),
      db.collection(COLLECTIONS.leads).limit(100).get(),
      db.collection(COLLECTIONS.auditEngagements).limit(100).get(),
    ]);

    const consultations = consultationsSnap.docs.map(
      (doc) => doc.data() as Consultation
    );
    const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);
    const engagements = engagementsSnap.docs.map(
      (doc) => doc.data() as AuditEngagement
    );

    const leadsById = new Map<string, Lead>();
    for (const lead of leads) {
      leadsById.set(lead.id, lead);
    }
    const engagementByConsultationId = new Map<string, AuditEngagement>();
    for (const engagement of engagements) {
      if (engagement.consultationId) {
        engagementByConsultationId.set(engagement.consultationId, engagement);
      }
    }

    const filteredConsultations = consultations.filter((c) => {
      if (view === "archived") return !!c.archivedAt;
      if (view === "all") return true;
      return !c.archivedAt;
    });

    const consultationsWithLeads = filteredConsultations.map((con) => ({
      consultation: con,
      lead: leadsById.get(con.leadId) || null,
      engagement: engagementByConsultationId.get(con.id) || null,
    }));

    return Response.json({ consultations: consultationsWithLeads });
  } catch (err) {
    console.error("GET /api/admin/consultations error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
