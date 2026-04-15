import type { NextRequest } from "next/server";
import { processWorkflowEvent } from "@/lib/events";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/events/[id]/retry">
) {
  try {
    const { id } = await ctx.params;
    await processWorkflowEvent(id);
    return Response.json({ success: true, eventId: id });
  } catch (err) {
    console.error("POST /api/admin/events/[id]/retry error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Retry failed" },
      { status: 500 }
    );
  }
}

