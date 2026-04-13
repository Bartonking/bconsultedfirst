import { getStripe } from "@/lib/stripe";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { Consultation } from "@/lib/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return Response.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return Response.json(
        { error: "Payment not completed", paid: false },
        { status: 402 }
      );
    }

    const consultationId = session.metadata?.consultationId;
    const name = session.metadata?.name;

    if (!consultationId) {
      return Response.json(
        { error: "Missing consultation metadata" },
        { status: 400 }
      );
    }

    const db = getDb();
    const doc = await db
      .collection(COLLECTIONS.consultations)
      .doc(consultationId)
      .get();

    if (!doc.exists) {
      return Response.json(
        { error: "Consultation not found" },
        { status: 404 }
      );
    }

    const consultation = doc.data() as Consultation;

    return Response.json({
      consultationId,
      name: name ?? "",
      email: session.customer_email ?? "",
      paid: true,
      consultationStatus: consultation.consultationStatus,
    });
  } catch (err) {
    console.error("GET /api/stripe/verify error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
