import type { NextRequest } from "next/server";
import { COLLECTIONS, getDb } from "@/lib/firebase";
import { sendMeetingConfirmationEmail } from "@/lib/email";
import type { AuditEngagement, Lead } from "@/lib/types";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/services/[id]/send-meeting-confirmation">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const engagementRef = db.collection(COLLECTIONS.auditEngagements).doc(id);
    const engagementDoc = await engagementRef.get();

    if (!engagementDoc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const engagement = engagementDoc.data() as AuditEngagement;
    const leadDoc = await db
      .collection(COLLECTIONS.leads)
      .doc(engagement.leadId)
      .get();

    if (!leadDoc.exists) {
      return Response.json({ error: "Lead not found" }, { status: 404 });
    }

    const lead = leadDoc.data() as Lead;
    const emailResult = await sendMeetingConfirmationEmail(lead, engagement);

    if (!emailResult.success) {
      const status =
        emailResult.error === "Meeting date/time and meeting URL are required"
          ? 400
          : 500;
      return Response.json(
        {
          error:
            emailResult.error || "Failed to send meeting confirmation email",
        },
        { status }
      );
    }

    const now = new Date().toISOString();
    const patch: Partial<AuditEngagement> = {
      meetingConfirmationSentAt: now,
      updatedAt: now,
    };

    if (
      engagement.status === "proposed" ||
      engagement.status === "intake_pending" ||
      engagement.status === "intake_received"
    ) {
      patch.status = "meeting_scheduled";
    }

    await engagementRef.update(patch);

    return Response.json({
      success: true,
      engagement: {
        ...engagement,
        ...patch,
      },
    });
  } catch (err) {
    console.error(
      "POST /api/admin/services/[id]/send-meeting-confirmation error:",
      err
    );
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
