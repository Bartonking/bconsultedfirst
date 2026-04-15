"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { EventAutomationRun, WorkflowEvent } from "@/lib/types";

interface EventDetailData {
  event: WorkflowEvent | null;
  runs: EventAutomationRun[];
}

export default function AdminEventDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    fetch(`/api/admin/events/${params.id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (params.id) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function retry() {
    setRetrying(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/events/${params.id}/retry`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Retry failed");
      setMessage("Retry completed.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Retry failed");
    } finally {
      setRetrying(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Loading event...</p>
      </div>
    );
  }

  if (!data?.event) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Event not found.</p>
        <Link href="/admin/events" className="mt-4 inline-block text-sm text-primary">
          &larr; Back to Events
        </Link>
      </div>
    );
  }

  const { event, runs } = data;

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <Link href="/admin/events" className="text-sm text-primary hover:text-accent">
          &larr; Back to Events
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{event.type}</h1>
          <p className="mt-1 text-sm text-muted">{event.id}</p>
        </div>
        <button
          type="button"
          onClick={() => void retry()}
          disabled={retrying}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-accent disabled:opacity-60"
        >
          {retrying ? "Retrying..." : "Retry event"}
        </button>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Event</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">Status</dt>
              <dd className="font-medium text-foreground">{event.status}</dd>
            </div>
            <div>
              <dt className="text-muted">Source</dt>
              <dd className="font-medium text-foreground">{event.source}</dd>
            </div>
            <div>
              <dt className="text-muted">Received</dt>
              <dd className="font-medium text-foreground">
                {new Date(event.receivedAt).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Correlation</dt>
              <dd className="font-medium text-foreground">
                {event.correlationId || "-"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-foreground">Subject</h2>
          <pre className="overflow-x-auto rounded-lg bg-gray-50 p-4 text-xs text-muted">
            {JSON.stringify(event.subject || {}, null, 2)}
          </pre>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-foreground">Automation Runs</h2>
          {runs.length === 0 ? (
            <p className="text-sm text-muted">No automation runs recorded.</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div key={run.id} className="rounded-lg border border-border p-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-foreground">{run.handler}</p>
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800">
                      {run.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{run.idempotencyKey}</p>
                  {run.error && <p className="mt-2 text-sm text-red-600">{run.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-white p-6 lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-foreground">Payload</h2>
          <pre className="max-h-[560px] overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-muted">
            {JSON.stringify(event.payload || {}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}

