import type { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { updateAuditEngagementSchema } from "@/lib/validation";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import type {
  AuditEngagement,
  AuditReport,
  Consultation,
  Lead,
} from "@/lib/types";

function normalizeIntakeResponses(
  intake?: AuditEngagement["intakeResponses"]
): AuditEngagement["intakeResponses"] {
  if (!intake) return {};

  const teamSize = intake.teamSize?.trim();
  const fulfillmentSetup = intake.fulfillmentSetup?.trim();
  const systems = intake.systems?.trim();
  const topProblems =
    intake.topProblems
      ?.map((item) => item.trim())
      .filter(Boolean) || [];
  const goals = intake.goals?.trim();

  return {
    ...(teamSize ? { teamSize } : {}),
    ...(fulfillmentSetup ? { fulfillmentSetup } : {}),
    ...(systems ? { systems } : {}),
    ...(topProblems.length > 0 ? { topProblems } : {}),
    ...(goals ? { goals } : {}),
  };
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();

    const engagementDoc = await db
      .collection(COLLECTIONS.auditEngagements)
      .doc(id)
      .get();

    if (!engagementDoc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const engagement = engagementDoc.data() as AuditEngagement;

    const [leadDoc, consultationDoc, initialReportDoc] = await Promise.all([
      db.collection(COLLECTIONS.leads).doc(engagement.leadId).get(),
      engagement.consultationId
        ? db
            .collection(COLLECTIONS.consultations)
            .doc(engagement.consultationId)
            .get()
        : Promise.resolve(null),
      engagement.reportId
        ? db.collection(COLLECTIONS.auditReports).doc(engagement.reportId).get()
        : Promise.resolve(null),
    ]);

    let reportDoc = initialReportDoc;
    if (
      !engagement.reportId &&
      consultationDoc &&
      consultationDoc.exists
    ) {
      const consultationData = consultationDoc.data() as Consultation;
      if (consultationData.reportId) {
        reportDoc = await db
          .collection(COLLECTIONS.auditReports)
          .doc(consultationData.reportId)
          .get();
        if (reportDoc.exists) {
          engagement.reportId = consultationData.reportId;
          await engagementDoc.ref.update({
            reportId: consultationData.reportId,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    const lead = leadDoc.exists ? (leadDoc.data() as Lead) : null;
    const consultation =
      consultationDoc && consultationDoc.exists
        ? (consultationDoc.data() as Consultation)
        : null;
    let report =
      reportDoc && reportDoc.exists ? (reportDoc.data() as AuditReport) : null;

    if (report) {
      const { reportHtml, ...reportData } = report;
      void reportHtml;
      report = reportData as AuditReport;
    }

    return Response.json({ engagement, lead, consultation, report });
  } catch (err) {
    console.error("GET /api/admin/services/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = updateAuditEngagementSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.auditEngagements).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const current = doc.data() as AuditEngagement;
    const data = parsed.data;
    const patch: Partial<AuditEngagement> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.status !== undefined) patch.status = data.status;
    if (data.owner !== undefined) patch.owner = data.owner.trim() || undefined;
    if (data.meetingAt !== undefined) patch.meetingAt = data.meetingAt || undefined;
    if (data.meetingUrl !== undefined) {
      patch.meetingUrl = data.meetingUrl.trim() || undefined;
    }
    if (data.meetingNotes !== undefined) patch.meetingNotes = data.meetingNotes;
    if (data.intakeResponses !== undefined) {
      patch.intakeResponses = normalizeIntakeResponses(data.intakeResponses);
    }
    if (data.internalNotes !== undefined) patch.internalNotes = data.internalNotes;
    if (data.prioritySummary !== undefined) {
      patch.prioritySummary = data.prioritySummary;
    }
    if (data.finalReportFormat !== undefined) {
      patch.finalReportFormat = data.finalReportFormat;
    }
    if (data.finalReportHtml !== undefined) {
      patch.finalReportHtml = data.finalReportHtml;
    }
    if (data.finalReportUrl !== undefined) {
      patch.finalReportUrl = data.finalReportUrl.trim() || undefined;
    }
    const updatePayload: Record<string, unknown> = { ...patch };
    if (data.archivedAt !== undefined) {
      if (data.archivedAt === null || data.archivedAt === "") {
        updatePayload.archivedAt = FieldValue.delete();
        patch.archivedAt = undefined;
      } else {
        updatePayload.archivedAt = data.archivedAt;
        patch.archivedAt = data.archivedAt;
      }
    }

    await docRef.update(updatePayload);

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.ADMIN_SERVICE_UPDATED,
      source: "admin",
      publish: false,
      actor: { type: "admin" },
      subject: {
        leadId: current.leadId,
        consultationId: current.consultationId,
        engagementId: current.id,
        reportId: current.reportId,
      },
      payload: {
        updatedFields: Object.keys(updatePayload),
      },
    });

    return Response.json({
      engagement: {
        ...current,
        ...patch,
      },
    });
  } catch (err) {
    console.error("PATCH /api/admin/services/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const docRef = db.collection(COLLECTIONS.auditEngagements).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const current = doc.data() as AuditEngagement;
    if (!current.archivedAt) {
      return Response.json(
        { error: "Engagement must be archived before it can be deleted" },
        { status: 409 }
      );
    }

    await docRef.delete();
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("DELETE /api/admin/services/[id] error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
