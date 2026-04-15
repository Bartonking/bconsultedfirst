import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { EventAutomationRun, WorkflowEvent } from "@/lib/types";

function matchesFilter(
  event: WorkflowEvent,
  filters: {
    type?: string | null;
    source?: string | null;
    status?: string | null;
    leadId?: string | null;
    consultationId?: string | null;
    engagementId?: string | null;
  }
) {
  if (filters.type && event.type !== filters.type) return false;
  if (filters.source && event.source !== filters.source) return false;
  if (filters.status && event.status !== filters.status) return false;
  if (filters.leadId && event.subject?.leadId !== filters.leadId) return false;
  if (
    filters.consultationId &&
    event.subject?.consultationId !== filters.consultationId
  ) {
    return false;
  }
  if (
    filters.engagementId &&
    event.subject?.engagementId !== filters.engagementId
  ) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 200), 500);
    const filters = {
      type: url.searchParams.get("type"),
      source: url.searchParams.get("source"),
      status: url.searchParams.get("status"),
      leadId: url.searchParams.get("leadId"),
      consultationId: url.searchParams.get("consultationId"),
      engagementId: url.searchParams.get("engagementId"),
    };

    const db = getDb();
    const eventsSnap = await db
      .collection(COLLECTIONS.workflowEvents)
      .orderBy("receivedAt", "desc")
      .limit(limit)
      .get();

    const events = eventsSnap.docs
      .map((doc) => doc.data() as WorkflowEvent)
      .filter((event) => matchesFilter(event, filters));

    const runs: EventAutomationRun[] = [];
    for (const event of events.slice(0, 25)) {
      const runsSnap = await db
        .collection(COLLECTIONS.eventAutomationRuns)
        .where("eventId", "==", event.id)
        .limit(20)
        .get();
      runs.push(...runsSnap.docs.map((doc) => doc.data() as EventAutomationRun));
    }

    return Response.json({ events, runs });
  } catch (err) {
    console.error("GET /api/admin/events error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

