import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { createAuditSchema } from "@/lib/validation";
import { enqueueAuditJob } from "@/lib/cloud-tasks";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import { captureRouteException } from "@/lib/sentry/server";
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

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.AUDIT_FORM_SUBMITTED,
      source: "server",
      publish: false,
      actor: { type: "anonymous", email },
      payload: { email, storeUrl, challenge: challenge || null },
    });

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

    await Promise.all([
      emitWorkflowEvent({
        type: WORKFLOW_EVENTS.LEAD_CREATED,
        source: "server",
        publish: false,
        actor: { type: "lead", id: leadId, email },
        subject: { leadId },
        payload: { siteUrl: storeUrl, challenge: challenge || null },
      }),
      emitWorkflowEvent({
        type: WORKFLOW_EVENTS.AUDIT_JOB_CREATED,
        source: "server",
        publish: false,
        actor: { type: "lead", id: leadId, email },
        subject: { leadId, jobId },
      }),
    ]);

    await enqueueAuditJob(jobId);

    return Response.json({ jobId, status: "queued" as const }, { status: 201 });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/audits",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
