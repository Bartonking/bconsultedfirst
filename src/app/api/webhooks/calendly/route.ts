import { createHmac, timingSafeEqual } from "crypto";
import { getDb, COLLECTIONS } from "@/lib/firebase";

function verifyCalendlySignature(
  payload: string,
  signatureHeader: string,
  signingKey: string
): boolean {
  const parts = signatureHeader.split(",");
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const signature = v1Part.slice(3);

  const data = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", signingKey).update(data).digest("hex");

  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("Calendly-Webhook-Signature");
    const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

    if (!signature || !signingKey) {
      return Response.json({ error: "Missing signature or key" }, { status: 401 });
    }

    if (!verifyCalendlySignature(body, signature, signingKey)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);
    const eventType: string = event.event;
    const payload = event.payload;

    const consultationId = payload?.tracking?.utm_content;
    if (!consultationId) {
      return Response.json({ error: "No tracking ID" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.consultations).doc(consultationId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return Response.json({ error: "Consultation not found" }, { status: 404 });
    }

    if (eventType === "invitee.created") {
      await docRef.update({
        consultationStatus: "scheduled",
        bookedAt: new Date().toISOString(),
        calendlyEventUri: payload.event ?? null,
        calendlyInviteeUri: payload.uri ?? null,
        scheduledStartAt: payload.scheduled_event?.start_time ?? null,
        scheduledEndAt: payload.scheduled_event?.end_time ?? null,
        cancelUrl: payload.cancel_url ?? null,
        rescheduleUrl: payload.reschedule_url ?? null,
      });
    } else if (eventType === "invitee.canceled") {
      await docRef.update({
        consultationStatus: "cancelled",
      });
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error("Calendly webhook error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
