export interface DecodedWorkflowEventMessage {
  eventId: string;
  eventType?: string;
  correlationId?: string;
  sentryTrace?: string;
  baggage?: string;
}

function decodeMessageRecord(
  record: Record<string, unknown>
): DecodedWorkflowEventMessage | null {
  if (typeof record.eventId !== "string") {
    return null;
  }

  return {
    eventId: record.eventId,
    eventType:
      typeof record.eventType === "string" ? record.eventType : undefined,
    correlationId:
      typeof record.correlationId === "string"
        ? record.correlationId
        : undefined,
    sentryTrace:
      typeof record.sentryTrace === "string" ? record.sentryTrace : undefined,
    baggage: typeof record.baggage === "string" ? record.baggage : undefined,
  };
}

export function decodeWorkflowEventMessage(
  body: unknown
): DecodedWorkflowEventMessage | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const topLevel = decodeMessageRecord(record);
  if (topLevel) return topLevel;

  const message = record.message as Record<string, unknown> | undefined;
  const data = message?.data;
  const attributes =
    (message?.attributes as Record<string, unknown> | undefined) || {};

  let decodedRecord: DecodedWorkflowEventMessage | null = null;
  if (typeof data === "string") {
    try {
      decodedRecord = decodeMessageRecord(
        JSON.parse(Buffer.from(data, "base64").toString("utf8")) as Record<
          string,
          unknown
        >
      );
    } catch {
      decodedRecord = null;
    }
  }

  const eventId =
    decodedRecord?.eventId ||
    (typeof attributes.eventId === "string" ? attributes.eventId : null);

  if (!eventId) {
    return null;
  }

  return {
    eventId,
    eventType:
      decodedRecord?.eventType ||
      (typeof attributes.eventType === "string"
        ? attributes.eventType
        : undefined),
    correlationId:
      decodedRecord?.correlationId ||
      (typeof attributes.correlationId === "string"
        ? attributes.correlationId
        : undefined),
    sentryTrace:
      decodedRecord?.sentryTrace ||
      (typeof attributes["sentry-trace"] === "string"
        ? attributes["sentry-trace"]
        : undefined),
    baggage:
      decodedRecord?.baggage ||
      (typeof attributes.baggage === "string"
        ? attributes.baggage
        : undefined),
  };
}
