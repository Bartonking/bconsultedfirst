import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { captureRouteException } from "@/lib/sentry/server";
import { createAuditEngagementSchema } from "@/lib/validation";
import type {
  AuditEngagement,
  AuditReport,
  Consultation,
  Lead,
} from "@/lib/types";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "active";
    const db = getDb();

    const [engagementsSnap, leadsSnap, consultationsSnap, reportsSnap] =
      await Promise.all([
        db.collection(COLLECTIONS.auditEngagements).limit(100).get(),
        db.collection(COLLECTIONS.leads).limit(200).get(),
        db.collection(COLLECTIONS.consultations).limit(200).get(),
        db.collection(COLLECTIONS.auditReports).limit(200).get(),
      ]);

    const engagements = engagementsSnap.docs.map(
      (doc) => doc.data() as AuditEngagement
    );
    const leads = leadsSnap.docs.map((doc) => doc.data() as Lead);
    const consultations = consultationsSnap.docs.map(
      (doc) => doc.data() as Consultation
    );
    const reports = reportsSnap.docs.map((doc) => doc.data() as AuditReport);

    const leadsById = new Map(leads.map((lead) => [lead.id, lead]));
    const consultationsById = new Map(
      consultations.map((consultation) => [consultation.id, consultation])
    );
    const reportsById = new Map(reports.map((report) => [report.id, report]));

    const filteredEngagements = engagements.filter((e) => {
      if (view === "archived") return !!e.archivedAt;
      if (view === "all") return true;
      return !e.archivedAt;
    });

    const services = filteredEngagements.map((engagement) => ({
      engagement,
      lead: leadsById.get(engagement.leadId) || null,
      consultation:
        (engagement.consultationId &&
          consultationsById.get(engagement.consultationId)) ||
        null,
      report:
        (engagement.reportId && reportsById.get(engagement.reportId)) || null,
    }));

    return Response.json({ services });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/admin/services",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAuditEngagementSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { leadId, consultationId } = parsed.data;
    let { reportId } = parsed.data;
    const db = getDb();

    const leadDoc = await db.collection(COLLECTIONS.leads).doc(leadId).get();
    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    if (consultationId) {
      const existingByConsultation = await db
        .collection(COLLECTIONS.auditEngagements)
        .where("consultationId", "==", consultationId)
        .limit(1)
        .get();

      if (!existingByConsultation.empty) {
        return Response.json(
          {
            engagement:
              existingByConsultation.docs[0].data() as AuditEngagement,
            created: false,
          },
          { status: 200 }
        );
      }

      if (!reportId) {
        const consultationDoc = await db
          .collection(COLLECTIONS.consultations)
          .doc(consultationId)
          .get();
        if (consultationDoc.exists) {
          const consultation = consultationDoc.data() as Consultation;
          if (consultation.reportId) reportId = consultation.reportId;
        }
      }
    }

    if (reportId) {
      const existingByReport = await db
        .collection(COLLECTIONS.auditEngagements)
        .where("reportId", "==", reportId)
        .limit(1)
        .get();

      if (!existingByReport.empty) {
        return Response.json(
          { engagement: existingByReport.docs[0].data() as AuditEngagement, created: false },
          { status: 200 }
        );
      }
    }

    const now = new Date().toISOString();
    const engagementId = `svc-${nanoid(12)}`;
    const engagement: AuditEngagement = {
      id: engagementId,
      leadId,
      ...(consultationId ? { consultationId } : {}),
      ...(reportId ? { reportId } : {}),
      serviceType: "full_audit",
      status: "intake_pending",
      createdAt: now,
      updatedAt: now,
    };

    await db
      .collection(COLLECTIONS.auditEngagements)
      .doc(engagementId)
      .set(engagement);

    return Response.json({ engagement, created: true }, { status: 201 });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/admin/services",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
