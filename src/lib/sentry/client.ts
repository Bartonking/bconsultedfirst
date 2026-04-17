"use client";

import * as Sentry from "@sentry/nextjs";
import { sanitizeForSentry } from "./sanitize";

type ClientTagValue = string | number | boolean | null | undefined;

export interface CaptureClientHandledErrorOptions {
  route: string;
  action: string;
  surface?: "public" | "admin";
  statusCode?: number;
  tags?: Record<string, ClientTagValue>;
  contexts?: Record<string, Record<string, unknown> | null | undefined>;
}

function normalizeClientError(
  error: unknown,
  fallbackMessage = "Unexpected client error"
): Error {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === "string" && error.trim()) {
    return new Error(error);
  }

  return new Error(fallbackMessage);
}

export function captureClientHandledError(
  error: unknown,
  options: CaptureClientHandledErrorOptions
) {
  const exception = normalizeClientError(error);

  Sentry.withScope((scope) => {
    scope.setTag("app.surface", options.surface || "public");
    scope.setTag("app.route", options.route);
    scope.setTag("app.action", options.action);
    scope.setTag("error.handled", "true");

    if (options.statusCode) {
      scope.setTag("http.status_code", String(options.statusCode));
      scope.setContext("response", { statusCode: options.statusCode });
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

    Sentry.captureException(exception);
  });
}
