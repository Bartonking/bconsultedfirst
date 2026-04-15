import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { CalendlyWebhookLog } from "@/lib/types";

export async function GET() {
  try {
    const db = getDb();
    const logsSnap = await db
      .collection(COLLECTIONS.calendlyWebhookLogs)
      .orderBy("createdAt", "desc")
      .limit(100)
      .get();

    const logs = logsSnap.docs.map((doc) => doc.data() as CalendlyWebhookLog);
    return Response.json({ logs });
  } catch (err) {
    console.error("GET /api/admin/calendly-webhooks error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
