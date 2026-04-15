"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { EventAutomationRun, WorkflowEvent } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  received: "bg-gray-100 text-gray-800",
  queued: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  processed: "bg-green-100 text-green-800",
  ignored: "bg-slate-100 text-slate-800",
  failed: "bg-red-100 text-red-800",
  dead_lettered: "bg-red-200 text-red-900",
};

function AdminEventsContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [runs, setRuns] = useState<EventAutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [engagementId, setEngagementId] = useState(
    searchParams.get("engagementId") || ""
  );

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (source) params.set("source", source);
    if (status) params.set("status", status);
    if (engagementId) params.set("engagementId", engagementId);
    return params.toString();
  }, [type, source, status, engagementId]);

  useEffect(() => {
    fetch(`/api/admin/events${query ? `?${query}` : ""}`)
      .then((res) => res.json())
      .then((json) => {
        setEvents(json.events || []);
        setRuns(json.runs || []);
      })
      .catch(() => {
        setEvents([]);
        setRuns([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  function runCount(eventId: string) {
    return runs.filter((run) => run.eventId === eventId).length;
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Workflow Events</h1>
        <p className="text-sm text-muted">
          Inspect server-side workflow events, processing status, and automation runs.
        </p>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <input
          type="text"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Filter by type"
          className="rounded-lg border border-border px-4 py-2 text-sm"
        />
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Filter by source"
          className="rounded-lg border border-border px-4 py-2 text-sm"
        />
        <input
          type="text"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Filter by status"
          className="rounded-lg border border-border px-4 py-2 text-sm"
        />
        <input
          type="text"
          value={engagementId}
          onChange={(e) => setEngagementId(e.target.value)}
          placeholder="Filter by engagement id"
          className="rounded-lg border border-border px-4 py-2 text-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-white">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">No events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Runs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {event.type}
                      </p>
                      <span
                        className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLES[event.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {event.source}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">
                      <p>Lead: {event.subject?.leadId || "-"}</p>
                      <p>Consultation: {event.subject?.consultationId || "-"}</p>
                      <p>Engagement: {event.subject?.engagementId || "-"}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {runCount(event.id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(event.receivedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="text-xs font-medium text-primary hover:text-accent"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-muted md:p-10">Loading events...</div>
      }
    >
      <AdminEventsContent />
    </Suspense>
  );
}
