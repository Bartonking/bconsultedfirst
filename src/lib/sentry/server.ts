import * as Sentry from "@sentry/nextjs";
import type { WorkflowEvent } from "@/lib/events/types";
import {
  sanitizeForSentry,
  sanitizeHeadersForSentry,
  sanitizeUrlForSentry,
} from "./sanitize";
import {
  applyWorkflowSentryMetadataToScope,
  getWorkflowSentryMetadata,
} from "./workflow";

const CAPTURED_SYMBOL = Symbol.for("bconsulted.sentry.captured");

type RouteTagValue = string | number | boolean | null | undefined;

interface ScopeLike {
  setTag(key: string, value: string): void;
  setContext(name: string, context: Record<string, unknown> | null): void;
}

export interface CaptureRouteExceptionOptions {
  surface: "api" | "webhook" | "worker" | "server";
  route: string;
  request?: Request;
  statusCode?: number;
  tags?: Record<string, RouteTagValue>;
  contexts?: Record<string, Record<string, unknown> | null | undefined>;
  workflowEvent?: WorkflowEvent;
  workflowAction?: string;
  flushTimeoutMs?: number;
}

export function normalizeError(
  error: unknown,
  fallbackMessage = "Unexpected application error"
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
}

export function markErrorAsCaptured(error: unknown) {
  if (!error || typeof error !== "object") return;

  try {
    (error as Record<symbol, boolean>)[CAPTURED_SYMBOL] = true;
  } catch {
    // Ignore objects that can't be extended.
  }
}

export function wasErrorCaptured(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  return Boolean((error as Record<symbol, boolean>)[CAPTURED_SYMBOL]);
}

function applyRequestSummary(scope: ScopeLike, request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(
    Array.from(url.searchParams.entries()).map(([key, value]) => [
      key,
      sanitizeForSentry(value, 0, key),
    ])
  );

  scope.setContext("request_summary", {
    method: request.method,
    pathname: url.pathname,
    url: sanitizeUrlForSentry(request.url),
    query,
    headers: sanitizeHeadersForSentry(request.headers),
  });
}

export async function captureRouteException(
  error: unknown,
  options: CaptureRouteExceptionOptions
) {
  if (wasErrorCaptured(error)) {
    return;
  }

  const exception = normalizeError(error);

  Sentry.withScope((scope) => {
    scope.setTag("app.surface", options.surface);
    scope.setTag("http.route", options.route);
    scope.setTag("runtime", process.env.NEXT_RUNTIME || "nodejs");
    scope.setTag("error.handled", "true");

    if (options.statusCode) {
      scope.setTag("http.status_code", String(options.statusCode));
      scope.setContext("response", { statusCode: options.statusCode });
    }

    if (options.request) {
      applyRequestSummary(scope, options.request);
    }

    if (options.tags) {
      for (const [key, value] of Object.entries(options.tags)) {
        if (value !== null && value !== undefined) {
          scope.setTag(key, String(value));
        }
      }
    }

    if (options.contexts) {
      for (const [key, value] of Object.entries(options.contexts)) {
        scope.setContext(
          key,
          value ? (sanitizeForSentry(value) as Record<string, unknown>) : null
        );
      }
    }

    if (options.workflowEvent) {
      applyWorkflowSentryMetadataToScope(
        scope,
        getWorkflowSentryMetadata(options.workflowEvent, {
          action: options.workflowAction || "error",
        })
      );
    }

    Sentry.captureException(exception);
  });

  markErrorAsCaptured(error);
  markErrorAsCaptured(exception);
  await Sentry.flush(options.flushTimeoutMs ?? 2000);
}
