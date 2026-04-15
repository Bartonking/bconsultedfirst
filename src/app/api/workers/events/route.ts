import { decodeWorkflowEventMessage } from "@/lib/events/pubsub-message";
import { processWorkflowEvent } from "@/lib/events";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const expectedSecret = process.env.WORKFLOW_WORKER_SECRET;
  if (!expectedSecret) return true;

  const headerSecret = request.headers.get("x-worker-secret");
  const auth = request.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");

  return (
    headerSecret === expectedSecret ||
    bearer === expectedSecret ||
    querySecret === expectedSecret
  );
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const eventId = decodeWorkflowEventMessage(body);

  if (!eventId) {
    return Response.json({ error: "Missing eventId" }, { status: 400 });
  }

  await processWorkflowEvent(eventId);
  return Response.json({ success: true, eventId });
}

