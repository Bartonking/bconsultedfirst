import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { WORKFLOW_EVENTS, emitWorkflowEvent } from "@/lib/events";
import { captureRouteException } from "@/lib/sentry/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  await emitWorkflowEvent({
    type: WORKFLOW_EVENTS.STRIPE_WEBHOOK_RECEIVED,
    source: "stripe",
    publish: false,
    actor: { type: "webhook" },
    payload: {
      hasSignature: Boolean(signature),
      bodySize: Buffer.byteLength(body, "utf8"),
    },
  });

  if (!signature) {
    return Response.json(
      { error: "Missing signature or webhook secret" },
      { status: 401 }
    );
  }

  if (!webhookSecret) {
    await captureRouteException(new Error("Missing STRIPE_WEBHOOK_SECRET"), {
      surface: "webhook",
      route: "/api/webhooks/stripe",
      request,
      statusCode: 401,
      tags: {
        "webhook.provider": "stripe",
      },
    });

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
    await captureRouteException(err, {
      surface: "webhook",
      route: "/api/webhooks/stripe",
      request,
      statusCode: 401,
      tags: {
        "webhook.provider": "stripe",
        "webhook.verification": "failed",
      },
    });
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const consultationId = session.metadata?.consultationId;

    if (!consultationId) {
      await captureRouteException(
        new Error("Stripe webhook missing consultationId metadata"),
        {
          surface: "webhook",
          route: "/api/webhooks/stripe",
          request,
          statusCode: 400,
          tags: {
            "webhook.provider": "stripe",
            "webhook.event_type": event.type,
          },
        }
      );
      return Response.json({ error: "Missing metadata" }, { status: 400 });
    }

    await emitWorkflowEvent({
      type: WORKFLOW_EVENTS.STRIPE_CHECKOUT_COMPLETED,
      source: "stripe",
      idempotencyKey: `stripe_checkout_completed:${session.id}`,
      actor: {
        type: "webhook",
        email: session.customer_email || undefined,
      },
      subject: {
        consultationId,
        leadId: session.metadata?.leadId || undefined,
        reportId: session.metadata?.reportId || undefined,
        stripeSessionId: session.id,
      },
      payload: {
        stripeSessionId: session.id,
        consultationId,
        leadId: session.metadata?.leadId || null,
        reportId: session.metadata?.reportId || null,
        name: session.metadata?.name || null,
        customerEmail: session.customer_email,
        amountTotal: session.amount_total,
        currency: session.currency,
        stripePaymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
      },
    });
  }

  return Response.json({ received: true });
}
