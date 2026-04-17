import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "./sanitize";

function getTraceSampleRate(): number {
  return process.env.NODE_ENV === "development" ? 1.0 : 0.2;
}

function getServerDsn(): string | undefined {
  return process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function getServerSentryConfig(
  runtime: "nodejs" | "edge"
): Parameters<typeof Sentry.init>[0] {
  const dsn = getServerDsn();

  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    tracesSampleRate: getTraceSampleRate(),
    sendDefaultPii: runtime === "nodejs",
    beforeSend: (event) => sanitizeSentryEvent(event),
    beforeBreadcrumb: (breadcrumb) => sanitizeSentryBreadcrumb(breadcrumb),
    initialScope: {
      tags: {
        runtime,
      },
    },
  };
}
