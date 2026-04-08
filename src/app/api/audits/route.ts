import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { createAuditSchema } from "@/lib/validation";
import { enqueueAuditJob } from "@/lib/cloud-tasks";
import type { Lead, AuditJob } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAuditSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, storeUrl, challenge } = parsed.data;
    const db = getDb();

    const leadId = `lead-${nanoid(12)}`;
    const jobId = `job-${nanoid(12)}`;

    const lead: Lead = {
      id: leadId,
      email,
      siteUrl: storeUrl,
      challengeArea: challenge,
      consentStatus: true,
      createdAt: new Date().toISOString(),
    };

    const job: AuditJob = {
      id: jobId,
      leadId,
      status: "pending",
    };

    const batch = db.batch();
    batch.set(db.collection(COLLECTIONS.leads).doc(leadId), lead);
    batch.set(db.collection(COLLECTIONS.auditJobs).doc(jobId), job);
    await batch.commit();

    await enqueueAuditJob(jobId);

    return Response.json({ jobId, status: "queued" as const }, { status: 201 });
  } catch (err) {
    console.error("POST /api/audits error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
