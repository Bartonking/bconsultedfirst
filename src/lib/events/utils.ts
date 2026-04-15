export function sanitizeForFirestore(value: unknown): unknown {
  if (value === undefined) return null;
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item));
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, sanitizeForFirestore(entryValue)]);
    return Object.fromEntries(entries);
  }

  return String(value);
}

export function getWorkflowProjectId(): string | undefined {
  return process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
}

export function getWorkflowTopicName(): string | undefined {
  return process.env.WORKFLOW_EVENTS_TOPIC || "workflow-events";
}

