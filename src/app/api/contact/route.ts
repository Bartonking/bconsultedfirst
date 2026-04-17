import { nanoid } from "nanoid";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { captureRouteException } from "@/lib/sentry/server";
import { createContactSchema } from "@/lib/validation";
import { sendContactNotification } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createContactSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;
    const db = getDb();

    const messageId = `msg-${nanoid(12)}`;
    await db.collection(COLLECTIONS.contactMessages).doc(messageId).set({
      id: messageId,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    });

    // Send notification email (best-effort)
    await sendContactNotification(name, email, subject, message).catch(
      (err) => {
        void captureRouteException(err, {
          surface: "api",
          route: "/api/contact",
          request,
          tags: {
            "contact.notification": "failed",
          },
        });
      }
    );

    return Response.json({ messageId, status: "received" }, { status: 201 });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/contact",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
