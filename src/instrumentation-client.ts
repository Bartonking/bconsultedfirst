import * as Sentry from "@sentry/nextjs";
import { getBrowserSentryConfig } from "@/lib/sentry/client-config";

Sentry.init(getBrowserSentryConfig());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
