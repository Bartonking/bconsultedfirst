import type { NextRequest } from "next/server";
import { processWorkflowEvent } from "@/lib/events";
import { captureRouteException } from "@/lib/sentry/server";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/events/[id]/retry">
) {
  try {
    const { id } = await ctx.params;
    await processWorkflowEvent(id);
    return Response.json({ success: true, eventId: id });
  } catch (err) {
    await captureRouteException(err, {
      surface: "api",
      route: "/api/admin/events/[id]/retry",
      request,
      statusCode: 500,
    });
    return Response.json(
      { error: err instanceof Error ? err.message : "Retry failed" },
      { status: 500 }
    );
  }
}
