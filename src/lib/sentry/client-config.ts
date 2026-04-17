import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent } from "./sanitize";

function getBrowserDsn(): string | undefined {
  return process.env.NEXT_PUBLIC_SENTRY_DSN;
}

function getTraceSampleRate(): number {
  return process.env.NODE_ENV === "development" ? 1.0 : 0.2;
}

function getTracePropagationTargets(): Array<string | RegExp> {
  const targets: Array<string | RegExp> = ["localhost", /^\//];

  if (process.env.NEXT_PUBLIC_BASE_URL) {
    targets.push(process.env.NEXT_PUBLIC_BASE_URL);
  }

  return targets;
}

export function getBrowserSentryConfig(): Parameters<typeof Sentry.init>[0] {
  const dsn = getBrowserDsn();

  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.NODE_ENV,
    tracesSampleRate: getTraceSampleRate(),
    sendDefaultPii: false,
    integrations: [Sentry.browserTracingIntegration()],
    tracePropagationTargets: getTracePropagationTargets(),
    beforeSend: (event) => sanitizeSentryEvent(event),
    beforeBreadcrumb: (breadcrumb) => sanitizeSentryBreadcrumb(breadcrumb),
    initialScope: {
      tags: {
        runtime: "browser",
      },
    },
  };
}
