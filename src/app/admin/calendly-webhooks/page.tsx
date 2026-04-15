"use client";

import { useEffect, useState } from "react";
import type { CalendlyWebhookLog } from "@/lib/types";

const RESULT_STYLES: Record<CalendlyWebhookLog["result"], string> = {
  received: "bg-gray-100 text-gray-800",
  missing_signature: "bg-red-100 text-red-700",
  missing_signing_key: "bg-red-100 text-red-700",
  invalid_signature: "bg-red-100 text-red-700",
  missing_consultation_id: "bg-amber-100 text-amber-800",
  consultation_not_found: "bg-orange-100 text-orange-800",
  engagement_not_found: "bg-yellow-100 text-yellow-800",
  synced: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-100 text-slate-800",
  ignored_reschedule_cancel: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-700",
};

export default function CalendlyWebhookLogsPage() {
  const [logs, setLogs] = useState<CalendlyWebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/calendly-webhooks")
      .then((res) => res.json())
      .then((json) => setLogs(json.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Calendly Webhook Logs</h1>
        <p className="text-sm text-muted">
          Review webhook deliveries, match strategy, and sync failures for consultation bookings.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted">Loading webhook logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No Calendly webhook logs yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => (
              <details key={log.id} className="group">
                <summary className="list-none cursor-pointer px-6 py-4 hover:bg-gray-50">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            RESULT_STYLES[log.result]
                          }`}
                        >
                          {log.result.replace(/_/g, " ")}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {log.eventType || "unknown event"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                        <span>Consultation: {log.consultationId || "-"}</span>
                        <span>Engagement: {log.engagementId || "-"}</span>
                        <span>Match: {log.matchedBy || "none"}</span>
                        <span>Email: {log.inviteeEmail || "-"}</span>
                      </div>
                      {log.message ? (
                        <p className="text-sm text-foreground/80">{log.message}</p>
                      ) : null}
                    </div>
                    <div className="text-xs text-primary font-medium group-open:text-accent">
                      View details
                    </div>
                  </div>
                </summary>

                <div className="border-t border-border bg-gray-50 px-6 py-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 text-sm">
                      <p className="text-muted">Invitee</p>
                      <p className="text-foreground">{log.inviteeName || "-"}</p>
                      <p className="text-foreground">{log.inviteeEmail || "-"}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted">Scheduled</p>
                      <p className="text-foreground">
                        {log.scheduledStartAt
                          ? new Date(log.scheduledStartAt).toLocaleString()
                          : "-"}
                      </p>
                      <p className="text-foreground">
                        {log.scheduledEndAt
                          ? new Date(log.scheduledEndAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Tracking</p>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-white p-3 text-xs text-muted">
                        {JSON.stringify(log.tracking || {}, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Payload</p>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-white p-3 text-xs text-muted">
                        {JSON.stringify(log.payload || {}, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
