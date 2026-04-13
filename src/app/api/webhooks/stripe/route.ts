import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getDb, COLLECTIONS } from "@/lib/firebase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return Response.json(
      { error: "Missing signature or webhook secret" },
      { status: 401 }
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const consultationId = session.metadata?.consultationId;

    if (!consultationId) {
      console.error("Stripe webhook: missing consultationId in metadata");
      return Response.json({ error: "Missing metadata" }, { status: 400 });
    }

    try {
      const db = getDb();
      const docRef = db
        .collection(COLLECTIONS.consultations)
        .doc(consultationId);
      const doc = await docRef.get();

      if (!doc.exists) {
        console.error(
          `Stripe webhook: consultation ${consultationId} not found`
        );
        return Response.json(
          { error: "Consultation not found" },
          { status: 404 }
        );
      }

      // Idempotency: skip if already paid
      const data = doc.data();
      if (data?.paymentStatus === "paid") {
        return Response.json({ received: true, status: "already_paid" });
      }

      await docRef.update({
        consultationStatus: "paid",
        paymentStatus: "paid",
        paymentAmount: session.amount_total ?? null,
        paymentCurrency: session.currency ?? null,
        stripeCheckoutSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        paidAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Stripe webhook Firestore update error:", err);
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  }

  return Response.json({ received: true });
}
