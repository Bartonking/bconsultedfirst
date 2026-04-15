import { PubSub } from "@google-cloud/pubsub";
import { getWorkflowProjectId, getWorkflowTopicName } from "./utils";

let pubsub: PubSub | null = null;

function getPubSub(): PubSub {
  if (!pubsub) {
    pubsub = new PubSub({ projectId: getWorkflowProjectId() });
  }
  return pubsub;
}

export function isPubSubConfigured(): boolean {
  if (process.env.WORKFLOW_DISABLE_PUBSUB === "true") return false;
  return Boolean(getWorkflowProjectId() && process.env.WORKFLOW_EVENTS_TOPIC);
}

export async function publishWorkflowEvent(eventId: string): Promise<string | null> {
  if (!isPubSubConfigured()) return null;

  const topicName = getWorkflowTopicName();
  if (!topicName) return null;

  const payload = Buffer.from(JSON.stringify({ eventId }));
  return getPubSub().topic(topicName).publishMessage({
    data: payload,
    attributes: { eventId },
  });
}
