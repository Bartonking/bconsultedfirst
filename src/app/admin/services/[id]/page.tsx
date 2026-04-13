"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type {
  AuditEngagement,
  AuditReport,
  Consultation,
  Lead,
} from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  proposed: "bg-gray-100 text-gray-800",
  intake_pending: "bg-amber-100 text-amber-800",
  intake_received: "bg-yellow-100 text-yellow-800",
  meeting_scheduled: "bg-blue-100 text-blue-800",
  meeting_completed: "bg-sky-100 text-sky-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  draft_ready: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  closed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

interface AdminServiceData {
  engagement: AuditEngagement | null;
  lead: Lead | null;
  consultation: Consultation | null;
  report: AuditReport | null;
}

export default function AdminServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [status, setStatus] = useState<AuditEngagement["status"]>("intake_pending");
  const [owner, setOwner] = useState("");
  const [meetingAt, setMeetingAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [meetingNotes, setMeetingNotes] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [fulfillmentSetup, setFulfillmentSetup] = useState("");
  const [systems, setSystems] = useState("");
  const [topProblems, setTopProblems] = useState("");
  const [goals, setGoals] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [prioritySummary, setPrioritySummary] = useState("");
  const [finalReportFormat, setFinalReportFormat] =
    useState<AuditEngagement["finalReportFormat"]>("html");
  const [finalReportUrl, setFinalReportUrl] = useState("");
  const [finalReportHtml, setFinalReportHtml] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function toDatetimeLocal(value?: string): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function parseProblemLines(value: string): string[] {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/services/${params.id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!data?.engagement) return;
    setStatus(data.engagement.status);
    setOwner(data.engagement.owner || "");
    setMeetingAt(toDatetimeLocal(data.engagement.meetingAt));
    setMeetingUrl(data.engagement.meetingUrl || "");
    setMeetingNotes(data.engagement.meetingNotes || "");
    setTeamSize(data.engagement.intakeResponses?.teamSize || "");
    setFulfillmentSetup(data.engagement.intakeResponses?.fulfillmentSetup || "");
    setSystems(data.engagement.intakeResponses?.systems || "");
    setTopProblems((data.engagement.intakeResponses?.topProblems || []).join("\n"));
    setGoals(data.engagement.intakeResponses?.goals || "");
    setInternalNotes(data.engagement.internalNotes || "");
    setPrioritySummary(data.engagement.prioritySummary || "");
    setFinalReportFormat(data.engagement.finalReportFormat || "html");
    setFinalReportUrl(data.engagement.finalReportUrl || "");
    setFinalReportHtml(data.engagement.finalReportHtml || "");
  }, [data]);

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Loading service...</p>
      </div>
    );
  }

  if (!data?.engagement) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Service engagement not found.</p>
        <Link
          href="/admin/services"
          className="mt-4 inline-block text-sm text-primary hover:text-accent"
        >
          &larr; Back to Services
        </Link>
      </div>
    );
  }

  const { engagement, lead, consultation, report } = data;

  async function saveEngagement(
    options?: { silent?: boolean }
  ): Promise<AuditEngagement> {
    setSaving(true);
    if (!options?.silent) {
      setSaveMessage(null);
      setSaveError(null);
    }

    try {
      const res = await fetch(`/api/admin/services/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          owner,
          meetingAt: meetingAt ? new Date(meetingAt).toISOString() : "",
          meetingUrl,
          meetingNotes,
          intakeResponses: {
            teamSize,
            fulfillmentSetup,
            systems,
            topProblems: parseProblemLines(topProblems),
            goals,
          },
          internalNotes,
          prioritySummary,
          finalReportFormat,
          finalReportUrl,
          finalReportHtml,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save service");
      }

      const json = await res.json();
      const updatedEngagement = json.engagement as AuditEngagement;

      setData((current) =>
        current
          ? {
              ...current,
              engagement: updatedEngagement,
            }
          : current
      );
      if (!options?.silent) {
        setSaveMessage("Service details updated.");
      }
      return updatedEngagement;
    } catch (err) {
      if (!options?.silent) {
        setSaveError(
          err instanceof Error ? err.message : "Failed to save service"
        );
      }
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    try {
      await saveEngagement();
    } catch {
      // Errors are surfaced through saveError state.
    }
  }

  async function handleEmailAction(
    route: "send-intake" | "send-meeting-confirmation" | "send-report",
    successMessage: string
  ) {
    setActionLoading(route);
    setActionMessage(null);
    setActionError(null);

    try {
      await saveEngagement({ silent: true });
      const res = await fetch(`/api/admin/services/${engagement.id}/${route}`, {
        method: "POST",
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to send email");
      }

      const updatedEngagement = body.engagement as AuditEngagement;
      setData((current) =>
        current
          ? {
              ...current,
              engagement: updatedEngagement,
            }
          : current
      );
      setActionMessage(successMessage);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/services"
          className="text-sm text-primary hover:text-accent"
        >
          &larr; Back to Services
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Full Audit Engagement
                </h1>
                <p className="mt-1 text-sm text-muted">{engagement.id}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLES[engagement.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {engagement.status.replace(/_/g, " ")}
              </span>
            </div>

            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Service Type</dt>
                <dd className="font-medium text-foreground">
                  {engagement.serviceType.replace(/_/g, " ")}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Owner</dt>
                <dd className="font-medium text-foreground">
                  {engagement.owner || "Unassigned"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Created</dt>
                <dd className="font-medium text-foreground">
                  {new Date(engagement.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Updated</dt>
                <dd className="font-medium text-foreground">
                  {new Date(engagement.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Meeting</dt>
                <dd className="font-medium text-foreground">
                  {engagement.meetingAt
                    ? new Date(engagement.meetingAt).toLocaleString()
                    : "Not scheduled"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Final Report</dt>
                <dd className="font-medium text-foreground">
                  {engagement.finalReportSentAt
                    ? `Sent ${new Date(
                        engagement.finalReportSentAt
                      ).toLocaleString()}`
                    : "Not sent"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Intake Email</dt>
                <dd className="font-medium text-foreground">
                  {engagement.intakeEmailSentAt
                    ? `Sent ${new Date(
                        engagement.intakeEmailSentAt
                      ).toLocaleString()}`
                    : "Not sent"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Meeting Confirmation</dt>
                <dd className="font-medium text-foreground">
                  {engagement.meetingConfirmationSentAt
                    ? `Sent ${new Date(
                        engagement.meetingConfirmationSentAt
                      ).toLocaleString()}`
                    : "Not sent"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-foreground">
                Manage Engagement
              </h2>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as AuditEngagement["status"])
                  }
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {[
                    "proposed",
                    "intake_pending",
                    "intake_received",
                    "meeting_scheduled",
                    "meeting_completed",
                    "in_progress",
                    "draft_ready",
                    "delivered",
                    "closed",
                    "cancelled",
                  ].map((value) => (
                    <option key={value} value={value}>
                      {value.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Owner
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Assign an owner"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Meeting Date and Time
                </label>
                <input
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(e) => setMeetingAt(e.target.value)}
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Meeting URL
                </label>
                <input
                  type="text"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Meeting Notes
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  rows={5}
                  placeholder="Capture discussion notes, blockers, and decisions..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <p className="mb-1.5 block text-sm font-semibold text-foreground">
                  Intake Responses
                </p>
                <p className="text-xs text-muted">
                  Saved from the merchant intake form or updated here manually.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Team Size and Roles
                </label>
                <input
                  type="text"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  placeholder="Ops headcount and who owns what"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Goals
                </label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="Key goal for the next 90 days"
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Fulfillment Setup
                </label>
                <textarea
                  value={fulfillmentSetup}
                  onChange={(e) => setFulfillmentSetup(e.target.value)}
                  rows={4}
                  placeholder="Warehouse, 3PL, and manual fulfillment steps..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Systems
                </label>
                <textarea
                  value={systems}
                  onChange={(e) => setSystems(e.target.value)}
                  rows={4}
                  placeholder="Shopify apps, ERPs, reporting tools, spreadsheets..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Top Problems
                </label>
                <textarea
                  value={topProblems}
                  onChange={(e) => setTopProblems(e.target.value)}
                  rows={5}
                  placeholder="One issue per line..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Internal Notes
                </label>
                <textarea
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={4}
                  placeholder="Internal delivery notes, dependencies, follow-ups..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Priority Summary
                </label>
                <textarea
                  value={prioritySummary}
                  onChange={(e) => setPrioritySummary(e.target.value)}
                  rows={4}
                  placeholder="Top priorities and framing for the final report..."
                  className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Final Report Format
                </label>
                <select
                  value={finalReportFormat || "html"}
                  onChange={(e) =>
                    setFinalReportFormat(
                      e.target.value as AuditEngagement["finalReportFormat"]
                    )
                  }
                  className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="html">HTML email</option>
                  <option value="pdf">PDF link</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Final Report URL
                </label>
                <input
                  type="text"
                  value={finalReportUrl}
                  onChange={(e) => setFinalReportUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                  Final Report HTML
                </label>
                <textarea
                  value={finalReportHtml}
                  onChange={(e) => setFinalReportHtml(e.target.value)}
                  rows={12}
                  placeholder="Paste the HTML body or report section you want to email to the merchant..."
                  className="w-full resize-y rounded-lg border border-border px-4 py-3 font-mono text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {(saveMessage || saveError) && (
              <div className="mt-4">
                {saveMessage && (
                  <p className="text-sm text-green-700">{saveMessage}</p>
                )}
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Delivery Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  void handleEmailAction(
                    "send-intake",
                    "Intake email sent to the merchant."
                  )
                }
                disabled={Boolean(actionLoading)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "send-intake"
                  ? "Sending Intake..."
                  : "Send Intake Email"}
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleEmailAction(
                    "send-meeting-confirmation",
                    "Meeting confirmation sent to the merchant."
                  )
                }
                disabled={Boolean(actionLoading)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "send-meeting-confirmation"
                  ? "Sending Confirmation..."
                  : "Send Meeting Confirmation"}
              </button>
              <button
                type="button"
                onClick={() =>
                  void handleEmailAction(
                    "send-report",
                    "Final report email sent to the merchant."
                  )
                }
                disabled={Boolean(actionLoading)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionLoading === "send-report"
                  ? "Sending Report..."
                  : "Send Final Report"}
              </button>
            </div>

            {(actionMessage || actionError) && (
              <div className="mt-4">
                {actionMessage && (
                  <p className="text-sm text-green-700">{actionMessage}</p>
                )}
                {actionError && (
                  <p className="text-sm text-red-600">{actionError}</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Intake and Meeting Notes
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Team Size and Roles
                </p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.intakeResponses?.teamSize || "No intake yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Fulfillment Setup
                </p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.intakeResponses?.fulfillmentSetup || "No intake yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Systems</p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.intakeResponses?.systems || "No intake yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">
                  Top Problems
                </p>
                {engagement.intakeResponses?.topProblems?.length ? (
                  <ul className="space-y-1 text-muted">
                    {engagement.intakeResponses.topProblems.map((problem, index) => (
                      <li key={`${problem}-${index}`}>- {problem}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No intake yet.</p>
                )}
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Goals</p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.intakeResponses?.goals || "No intake yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Meeting URL</p>
                <p className="text-muted">{engagement.meetingUrl || "Not set"}</p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Meeting Notes</p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.meetingNotes || "No notes captured yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Internal Notes</p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.internalNotes || "No internal notes yet."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-foreground">
              Report Delivery
            </h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-1 font-semibold text-foreground">Format</p>
                <p className="text-muted">
                  {engagement.finalReportFormat || "Not selected"}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Final Report URL</p>
                {engagement.finalReportUrl ? (
                  <a
                    href={engagement.finalReportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-primary hover:text-accent"
                  >
                    {engagement.finalReportUrl}
                  </a>
                ) : (
                  <p className="break-all text-muted">
                    No final report link yet.
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">HTML Content</p>
                <p className="text-muted">
                  {engagement.finalReportHtml?.trim()
                    ? "HTML report content is saved."
                    : "No HTML report content yet."}
                </p>
              </div>
              <div>
                <p className="mb-1 font-semibold text-foreground">Priority Summary</p>
                <p className="whitespace-pre-wrap text-muted">
                  {engagement.prioritySummary || "No priority summary yet."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {lead && (
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-4 font-bold text-foreground">Lead</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="font-medium text-foreground">{lead.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Store</dt>
                  <dd className="font-medium text-foreground">{lead.siteUrl}</dd>
                </div>
                {lead.storeName && (
                  <div>
                    <dt className="text-muted">Name</dt>
                    <dd className="font-medium text-foreground">
                      {lead.storeName}
                    </dd>
                  </div>
                )}
                {lead.challengeArea && (
                  <div>
                    <dt className="text-muted">Challenge</dt>
                    <dd className="font-medium capitalize text-foreground">
                      {lead.challengeArea.replace(/-/g, " ")}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 font-bold text-foreground">Consultation</h3>
            {consultation ? (
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Status</dt>
                  <dd className="font-medium text-foreground">
                    {consultation.consultationStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Booked</dt>
                  <dd className="font-medium text-foreground">
                    {consultation.bookedAt
                      ? new Date(consultation.bookedAt).toLocaleString()
                      : "Not booked"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Payment</dt>
                  <dd className="font-medium text-foreground">
                    {consultation.paymentStatus || "No payment state"}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted">No linked consultation.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 font-bold text-foreground">Source Audit Report</h3>
            {report ? (
              <div className="space-y-3 text-sm">
                <p className="text-foreground">
                  <span className="text-muted">Store:</span> {report.storeUrl}
                </p>
                <p className="text-foreground">
                  <span className="text-muted">Score:</span> {report.overallScore}
                  /100
                </p>
                <Link
                  href={`/admin/audit/${report.id}`}
                  className="inline-block text-xs font-medium text-primary hover:text-accent"
                >
                  Open source report
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted">No linked source report.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
