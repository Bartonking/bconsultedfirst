"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getClientAnalytics } from "@/lib/firebase-client";

export async function logAnalyticsEvent(
  name: string,
  params?: Record<string, unknown>
) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  const analytics = await getClientAnalytics();
  if (!analytics) return;

  logEvent(analytics, name, params);
}

export function AnalyticsProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    let cancelled = false;

    (async () => {
      const analytics = await getClientAnalytics();
      if (!analytics || cancelled) return;

      logEvent(analytics, "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
