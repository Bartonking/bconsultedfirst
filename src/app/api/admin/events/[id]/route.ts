import type { NextRequest } from "next/server";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { EventAutomationRun, WorkflowEvent } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/events/[id]">
) {
  try {
    const { id } = await ctx.params;
    const db = getDb();
    const eventDoc = await db.collection(COLLECTIONS.workflowEvents).doc(id).get();

    if (!eventDoc.exists) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const runsSnap = await db
      .collection(COLLECTIONS.eventAutomationRuns)
      .where("eventId", "==", id)
      .limit(100)
      .get();

    return Response.json({
      event: eventDoc.data() as WorkflowEvent,
      runs: runsSnap.docs.map((doc) => doc.data() as EventAutomationRun),
    });
  } catch (err) {
    console.error("GET /api/admin/events/[id] error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

