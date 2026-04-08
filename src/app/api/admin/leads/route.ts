import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Lead, AuditJob } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();

    const [leadsSnap, jobsSnap] = await Promise.all([
      db
        .collection(COLLECTIONS.leads)
        .orderBy("createdAt", "desc")
        .limit(100)
        .get(),
      db.collection(COLLECTIONS.auditJobs).limit(100).get(),
    ]);

    const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);
    const jobs = jobsSnap.docs.map((doc) => doc.data() as AuditJob);

    // Create a map of leadId -> job for quick lookup
    const jobsByLeadId = new Map<string, AuditJob>();
    for (const job of jobs) {
      jobsByLeadId.set(job.leadId, job);
    }

    const leadsWithJobs = leads.map((lead) => ({
      lead,
      job: jobsByLeadId.get(lead.id) || null,
    }));

    return Response.json({ leads: leadsWithJobs });
  } catch (err) {
    console.error("GET /api/admin/leads error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
