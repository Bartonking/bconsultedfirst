import { nanoid } from "nanoid";
import { verifyBookingToken } from "@/lib/booking-token";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { getStripe, CONSULTATION_PRICE_CENTS, CONSULTATION_CURRENCY } from "@/lib/stripe";
import { checkoutSessionSchema } from "@/lib/validation";
import type { Lead, Consultation } from "@/lib/types";

function normalizeStoreUrl(storeUrl?: string): string {
  if (!storeUrl) return "";
  return storeUrl.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSessionSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, name, email, storeUrl, teamSize, challenge, context } =
      parsed.data;

    const db = getDb();
    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);
    let leadId: string;
    let reportId: string | undefined;
    let source: "audit_email" | "results_page" | "direct" = "direct";

    if (token) {
      const payload = verifyBookingToken(token);
      if (!payload) {
        return Response.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
      leadId = payload.leadId;
      reportId = payload.reportId;
      source = payload.source;

      const leadRef = db.collection(COLLECTIONS.leads).doc(leadId);
      const leadDoc = await leadRef.get();

      if (!leadDoc.exists) {
        return Response.json({ error: "Lead not found" }, { status: 404 });
      }

      const lead = leadDoc.data() as Lead;
      const leadPatch: Partial<Lead> = {};

      if (name && name !== lead.storeName) {
        leadPatch.storeName = name;
      }

      if (normalizedStoreUrl && normalizedStoreUrl !== lead.siteUrl) {
        leadPatch.siteUrl = normalizedStoreUrl;
      }

      if (challenge && challenge !== lead.challengeArea) {
        leadPatch.challengeArea = challenge;
      }

      if (Object.keys(leadPatch).length > 0) {
        await leadRef.update(leadPatch);
      }
    } else {
      // Find or create lead by email
      const existingLeads = await db
        .collection(COLLECTIONS.leads)
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!existingLeads.empty) {
        leadId = existingLeads.docs[0].id;
        const leadRef = existingLeads.docs[0].ref;
        const existingLead = existingLeads.docs[0].data() as Lead;
        const leadPatch: Partial<Lead> = {};

        if (name && name !== existingLead.storeName) {
          leadPatch.storeName = name;
        }

        if (normalizedStoreUrl && normalizedStoreUrl !== existingLead.siteUrl) {
          leadPatch.siteUrl = normalizedStoreUrl;
        }

        if (challenge && challenge !== existingLead.challengeArea) {
          leadPatch.challengeArea = challenge;
        }

        if (Object.keys(leadPatch).length > 0) {
          await leadRef.update(leadPatch);
        }
      } else {
        leadId = `lead-${nanoid(12)}`;
        const lead: Lead = {
          id: leadId,
          email,
          siteUrl: normalizedStoreUrl,
          storeName: name,
          challengeArea: challenge,
          consentStatus: true,
          createdAt: new Date().toISOString(),
        };
        await db.collection(COLLECTIONS.leads).doc(leadId).set(lead);
      }
    }

    // Create consultation
    const consultationId = `con-${nanoid(12)}`;
    const consultation: Consultation = {
      id: consultationId,
      leadId,
      consultationStatus: "requested",
      paymentStatus: "pending",
      paymentAmount: CONSULTATION_PRICE_CENTS,
      paymentCurrency: CONSULTATION_CURRENCY,
      source,
      reportId,
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

    // Create Stripe Checkout session
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3750";
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: CONSULTATION_CURRENCY,
            unit_amount: CONSULTATION_PRICE_CENTS,
            product_data: {
              name: "bConsulted First — Shopify Operations Consultation",
              description: "30-minute review with a specialist",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        consultationId,
        leadId,
        reportId: reportId ?? "",
        name,
      },
      success_url: `${baseUrl}/book/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: token
        ? `${baseUrl}/book?token=${encodeURIComponent(token)}&cancelled=true`
        : `${baseUrl}/book?cancelled=true`,
    });

    return Response.json({ url: session.url }, { status: 201 });
  } catch (err) {
    console.error("POST /api/stripe/checkout-session error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
