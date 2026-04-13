import { nanoid } from "nanoid";
import { verifyBookingToken } from "@/lib/booking-token";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import { subscribeSchema } from "@/lib/validation";
import type { Lead } from "@/lib/types";

function normalizeStoreUrl(storeUrl?: string): string {
  if (!storeUrl) return "";
  return storeUrl.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const { token, email, name, storeUrl } = parsed.data;

    if (token) {
      const payload = verifyBookingToken(token);
      if (!payload) {
        return Response.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      const leadRef = db.collection(COLLECTIONS.leads).doc(payload.leadId);
      const leadDoc = await leadRef.get();

      if (!leadDoc.exists) {
        return Response.json({ error: "Lead not found" }, { status: 404 });
      }

      await leadRef.update({
        marketingStatus: "subscribed",
        marketingSubscribedAt: new Date().toISOString(),
        marketingSource: payload.source,
      });

      return Response.json({ success: true, source: payload.source });
    }

    const normalizedStoreUrl = normalizeStoreUrl(storeUrl);

    const existingLeads = await db
      .collection(COLLECTIONS.leads)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!existingLeads.empty) {
      const leadRef = existingLeads.docs[0].ref;
      const existingLead = existingLeads.docs[0].data() as Lead;

      await leadRef.update({
        storeName: name || existingLead.storeName || null,
        siteUrl: normalizedStoreUrl || existingLead.siteUrl || "",
        marketingStatus: "subscribed",
        marketingSubscribedAt: new Date().toISOString(),
        marketingSource: "direct",
      });
    } else {
      const leadId = `lead-${nanoid(12)}`;
      const lead: Lead = {
        id: leadId,
        email: email!,
        siteUrl: normalizedStoreUrl,
        storeName: name || undefined,
        consentStatus: true,
        createdAt: new Date().toISOString(),
        marketingStatus: "subscribed",
        marketingSubscribedAt: new Date().toISOString(),
        marketingSource: "direct",
      };

      await db.collection(COLLECTIONS.leads).doc(leadId).set(lead);
    }

    return Response.json({ success: true, source: "direct" });
  } catch (err) {
    console.error("POST /api/book/subscribe error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
