import { COLLECTIONS, getDb } from "@/lib/firebase";
import { verifyServiceIntakeToken } from "@/lib/service-intake-token";
import { saveServiceIntakeDraftSchema } from "@/lib/validation";
import type { AuditEngagement } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveServiceIntakeDraftSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = verifyServiceIntakeToken(parsed.data.token);
    if (!payload) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const db = getDb();
    const engagementRef = db
      .collection(COLLECTIONS.auditEngagements)
      .doc(payload.engagementId);
    const engagementDoc = await engagementRef.get();

    if (!engagementDoc.exists) {
      return Response.json({ error: "Engagement not found" }, { status: 404 });
    }

    const current = engagementDoc.data() as AuditEngagement;
    if (current.leadId !== payload.leadId) {
      return Response.json({ error: "Invalid token context" }, { status: 401 });
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      intakeResponses: {
        ...current.intakeResponses,
        ...(parsed.data.teamSize !== undefined
          ? { teamSize: parsed.data.teamSize.trim() }
          : {}),
        ...(parsed.data.fulfillmentSetup !== undefined
          ? { fulfillmentSetup: parsed.data.fulfillmentSetup.trim() }
          : {}),
        ...(parsed.data.systems !== undefined
          ? { systems: parsed.data.systems.trim() }
          : {}),
        ...(parsed.data.topProblems !== undefined
          ? {
              topProblems: parsed.data.topProblems.map((item) => item.trim()),
            }
          : {}),
        ...(parsed.data.goals !== undefined
          ? { goals: parsed.data.goals.trim() }
          : {}),
      },
      updatedAt: now,
    };

    await engagementRef.update(patch);

    return Response.json({
      success: true,
      engagement: {
        ...current,
        ...patch,
      },
    });
  } catch (err) {
    console.error("POST /api/service-intake/save-step error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
