import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Lead, Consultation } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();

    const [consultationsSnap, leadsSnap] = await Promise.all([
      db.collection(COLLECTIONS.consultations).limit(100).get(),
      db.collection(COLLECTIONS.leads).limit(100).get(),
    ]);

    const consultations = consultationsSnap.docs.map(
      (doc) => doc.data() as Consultation
    );
    const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);

    const leadsById = new Map<string, Lead>();
    for (const lead of leads) {
      leadsById.set(lead.id, lead);
    }

    const consultationsWithLeads = consultations.map((con) => ({
      consultation: con,
      lead: leadsById.get(con.leadId) || null,
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
