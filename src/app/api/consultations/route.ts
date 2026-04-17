import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { captureRouteException } from "@/lib/sentry/server";
import { createConsultationSchema } from "@/lib/validation";
import type { Lead, Consultation } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createConsultationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, storeUrl, teamSize, challenge, context } =
      parsed.data;
    const db = getDb();

    // Check if lead already exists by email
    const existingLeads = await db
      .collection(COLLECTIONS.leads)
      .where("email", "==", email)
      .limit(1)
      .get();

    let leadId: string;
    if (!existingLeads.empty) {
      leadId = existingLeads.docs[0].id;
    } else {
      leadId = `lead-${nanoid(12)}`;
      const lead: Lead = {
        id: leadId,
        email,
        siteUrl: storeUrl,
        storeName: name,
        challengeArea: challenge,
        consentStatus: true,
        createdAt: new Date().toISOString(),
      };
      await db.collection(COLLECTIONS.leads).doc(leadId).set(lead);
    }

    const consultationId = `con-${nanoid(12)}`;
    const consultation: Consultation = {
      id: consultationId,
      leadId,
      consultationStatus: "requested",
      notes: [
        teamSize ? `Team size: ${teamSize}` : "",
        challenge ? `Challenge: ${challenge}` : "",
        context || "",
      ]
        .filter(Boolean)
        .join(". "),
    };

    await db
      .collection(COLLECTIONS.consultations)
      .doc(consultationId)
      .set(consultation);

    return Response.json(
      { consultationId, status: "requested", name, email },
      { status: 201 }
    );
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/consultations",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
