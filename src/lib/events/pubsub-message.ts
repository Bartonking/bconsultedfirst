export function decodeWorkflowEventMessage(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  if (typeof record.eventId === "string") return record.eventId;

  const message = record.message as Record<string, unknown> | undefined;
  const data = message?.data;

  if (typeof data !== "string") return null;

  try {
    const decoded = JSON.parse(Buffer.from(data, "base64").toString("utf8"));
    return typeof decoded.eventId === "string" ? decoded.eventId : null;
  } catch {
    return null;
  }
}

