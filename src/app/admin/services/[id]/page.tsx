"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuditScoreBar } from "@/components/audit/AuditScoreBar";
import { AuditFinding } from "@/components/audit/AuditFinding";
import { createCalendlySchedulingUrl } from "@/lib/calendly";
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

const TAB_ORDER = ["overview", "shop-review", "meeting", "delivery"] as const;
type AdminTab = (typeof TAB_ORDER)[number];
type ServiceActionRoute =
  | "send-intake"
  | "send-meeting-confirmation"
  | "send-report"
  | "send-booking-link"
  | "resend-source-report"
  | "rerun-source-report";

const TAB_LABELS: Record<AdminTab, string> = {
  overview: "Overview",
  "shop-review": "Shop Review",
  meeting: "Meeting",
  delivery: "Delivery",
};

interface AdminServiceData {
  engagement: AuditEngagement | null;
  lead: Lead | null;
  consultation: Consultation | null;
  report: AuditReport | null;
}

function formatDateTime(value?: string | null, fallback = "Not set"): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString();
}

function toDatetimeLocal(value?: string | null): string {
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

function getMeetingDisplay(
  engagement: AuditEngagement,
  consultation: Consultation | null
): string {
  const meetingAt = engagement.meetingAt || consultation?.scheduledStartAt;

  if (meetingAt) {
    return formatDateTime(meetingAt, "Not scheduled");
  }

  if (consultation?.consultationStatus === "paid") {
    return "Calendly booking pending";
  }

  if (consultation?.consultationStatus === "scheduled") {
    return "Calendly booked, sync pending";
  }

  if (consultation?.consultationStatus === "cancelled") {
    return "Cancelled";
  }

  return "Not scheduled";
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

export default function AdminServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const serviceId = params.id;

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [data, setData] = useState<AdminServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ServiceActionRoute | null>(
    null
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [status, setStatus] = useState<AuditEngagement["status"]>(
    "intake_pending"
  );
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

  async function loadServiceData(options?: { silent?: boolean }) {
    if (!serviceId) return;

    if (!options?.silent) {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/admin/services/${serviceId}`);
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      if (!options?.silent) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadServiceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    if (!data?.engagement) return;

    setStatus(data.engagement.status);
    setOwner(data.engagement.owner || "");
    setMeetingAt(
      toDatetimeLocal(
        data.engagement.meetingAt || data.consultation?.scheduledStartAt
      )
    );
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

  const engagement = data?.engagement || null;
  const lead = data?.lead || null;
  const consultation = data?.consultation || null;
  const report = data?.report || null;

  const bookingUrl = useMemo(() => {
    if (!consultation || !lead) return null;
    if (consultation.paymentStatus !== "paid") return null;

    return createCalendlySchedulingUrl({
      consultationId: consultation.id,
      name: lead.storeName || lead.email,
      email: lead.email,
    });
  }, [consultation, lead]);

  async function saveEngagement(options?: {
    silent?: boolean;
  }): Promise<AuditEngagement> {
    if (!engagement) {
      throw new Error("Missing engagement");
    }

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
      // surfaced by state
    }
  }

  async function handleServiceAction(
    route: ServiceActionRoute,
    successMessage: string,
    options?: { saveFirst?: boolean; nextTab?: AdminTab }
  ) {
    if (!engagement) return;

    setActionLoading(route);
    setActionMessage(null);
    setActionError(null);

    try {
      if (options?.saveFirst) {
        await saveEngagement({ silent: true });
      }

      const res = await fetch(`/api/admin/services/${engagement.id}/${route}`, {
        method: "POST",
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || "Action failed");
      }

      await loadServiceData({ silent: true });
      setActionMessage(successMessage);

      if (options?.nextTab) {
        setActiveTab(options.nextTab);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleArchiveToggle(archive: boolean) {
    if (!engagement) return;

    setArchiveBusy(true);
    setArchiveError(null);

    try {
      const res = await fetch(`/api/admin/services/${engagement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archivedAt: archive ? new Date().toISOString() : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to update archive state");
      }

      const json = await res.json();
      const updated = json.engagement as AuditEngagement;
      setData((current) =>
        current ? { ...current, engagement: updated } : current
      );
    } catch (err) {
      setArchiveError(
        err instanceof Error ? err.message : "Failed to update archive state"
      );
    } finally {
      setArchiveBusy(false);
    }
  }

  async function handleHardDelete() {
    if (!engagement) return;
    if (
      !window.confirm("Permanently delete this engagement? This cannot be undone.")
    ) {
      return;
    }

    setArchiveBusy(true);
    setArchiveError(null);

    try {
      const res = await fetch(`/api/admin/services/${engagement.id}`, {
        method: "DELETE",
      });

      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to delete");
      }

      router.push("/admin/services");
    } catch (err) {
      setArchiveError(err instanceof Error ? err.message : "Failed to delete");
      setArchiveBusy(false);
    }
  }

  async function handleCopyBookingLink() {
    if (!bookingUrl) {
      setActionError("No direct Calendly scheduling link is available.");
      setActionMessage(null);
      return;
    }

    try {
      await navigator.clipboard.writeText(bookingUrl);
      setActionError(null);
      setActionMessage("Calendly booking link copied.");
    } catch {
      setActionError("Failed to copy the Calendly booking link.");
      setActionMessage(null);
    }
  }

  async function handleRerunSourceReport() {
    if (
      !window.confirm(
        "Re-run the storefront review and replace the active source report for this service?"
      )
    ) {
      return;
    }

    await handleServiceAction(
      "rerun-source-report",
      "Storefront review rerun completed. The new report is now linked to this service.",
      { nextTab: "shop-review" }
    );
  }

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-sm text-muted">Loading service...</p>
      </div>
    );
  }

  if (!engagement) {
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

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <Link
          href="/admin/services"
          className="text-sm text-primary hover:text-accent"
        >
          &larr; Back to Services
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              Full Audit Engagement
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                STATUS_STYLES[engagement.status] || "bg-gray-100 text-gray-800"
              }`}
            >
              {engagement.status.replace(/_/g, " ")}
            </span>
            {engagement.archivedAt && (
              <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                Archived
              </span>
            )}
          </div>
          <p className="text-sm text-muted">{engagement.id}</p>
          <p className="mt-2 text-sm text-foreground">
            {lead?.email || "No lead email"}{" "}
            {lead?.siteUrl ? `• ${lead.siteUrl}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {engagement.archivedAt ? (
            <>
              <button
                type="button"
                onClick={() => void handleArchiveToggle(false)}
                disabled={archiveBusy}
                className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50 disabled:opacity-60"
              >
                Unarchive
              </button>
              <button
                type="button"
                onClick={() => void handleHardDelete()}
                disabled={archiveBusy}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => void handleArchiveToggle(true)}
              disabled={archiveBusy}
              className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted hover:bg-gray-50 disabled:opacity-60"
            >
              Archive
            </button>
          )}

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {(archiveError || saveMessage || saveError || actionMessage || actionError) && (
        <div className="mb-6 space-y-2">
          {archiveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {archiveError}
            </div>
          )}
          {saveMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {saveMessage}
            </div>
          )}
          {saveError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}
          {actionMessage && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {actionMessage}
            </div>
          )}
          {actionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </div>
      )}

      <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3">
        {TAB_ORDER.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-white"
                : "text-muted hover:bg-gray-100 hover:text-foreground"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Engagement Snapshot
                </h2>
                <dl className="grid gap-4 text-sm sm:grid-cols-2">
                  <DetailRow
                    label="Service Type"
                    value={engagement.serviceType.replace(/_/g, " ")}
                  />
                  <DetailRow label="Owner" value={engagement.owner || "Unassigned"} />
                  <DetailRow
                    label="Created"
                    value={formatDateTime(engagement.createdAt)}
                  />
                  <DetailRow
                    label="Updated"
                    value={formatDateTime(engagement.updatedAt)}
                  />
                  <DetailRow
                    label="Meeting"
                    value={getMeetingDisplay(engagement, consultation)}
                  />
                  <DetailRow
                    label="Source Report"
                    value={
                      report
                        ? `${report.overallScore}/100 • ${formatDateTime(
                            report.createdAt
                          )}`
                        : "Not linked"
                    }
                  />
                  <DetailRow
                    label="Source Report Email"
                    value={formatDateTime(
                      engagement.sourceReportSentAt,
                      "Not sent"
                    )}
                  />
                  <DetailRow
                    label="Booking Link Email"
                    value={formatDateTime(
                      engagement.bookingLinkSentAt,
                      "Not sent"
                    )}
                  />
                  <DetailRow
                    label="Intake Email"
                    value={formatDateTime(
                      engagement.intakeEmailSentAt,
                      "Not sent"
                    )}
                  />
                  <DetailRow
                    label="Meeting Confirmation"
                    value={formatDateTime(
                      engagement.meetingConfirmationSentAt,
                      "Not sent"
                    )}
                  />
                  <DetailRow
                    label="Final Report"
                    value={formatDateTime(
                      engagement.finalReportSentAt,
                      "Not sent"
                    )}
                  />
                  <DetailRow
                    label="Priority Summary"
                    value={engagement.prioritySummary?.trim() || "Not set"}
                  />
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Manage Engagement
                </h2>
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
                      Internal Notes
                    </label>
                    <textarea
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      rows={5}
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
                </div>
              </div>
            </>
          )}

          {activeTab === "shop-review" && (
            <>
              <div className="rounded-xl border border-border bg-white p-6">
                <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      Storefront Review
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      View the automated shop review, rerun it, or re-send it to
                      the merchant.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {report && (
                      <Link
                        href={`/admin/audit/${report.id}`}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        Open full audit view
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => void handleRerunSourceReport()}
                      disabled={actionLoading !== null}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      {actionLoading === "rerun-source-report"
                        ? "Re-running..."
                        : "Re-run site review"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleServiceAction(
                          "resend-source-report",
                          "Source report email sent to the merchant."
                        )
                      }
                      disabled={actionLoading !== null || !report}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {actionLoading === "resend-source-report"
                        ? "Sending..."
                        : "Re-send report"}
                    </button>
                  </div>
                </div>

                {!report ? (
                  <p className="text-sm text-muted">
                    No source report is linked yet.
                  </p>
                ) : (
                  <div className="space-y-6">
                    <div className="rounded-xl bg-gray-50 p-6 text-center">
                      <p className="text-sm text-muted">Overall Score</p>
                      <p className="mt-2 text-5xl font-bold text-primary">
                        {report.overallScore}
                        <span className="text-xl text-muted">/100</span>
                      </p>
                      <p className="mt-4 text-sm text-muted">
                        {report.storeUrl} • {formatDateTime(report.createdAt)}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-4 font-bold text-foreground">
                        Category Scores
                      </h3>
                      <div className="space-y-5">
                        {report.categories.map((category) => (
                          <AuditScoreBar key={category.name} category={category} />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-gray-50 p-6">
                      <h3 className="mb-3 font-bold text-foreground">
                        Executive Summary
                      </h3>
                      <p className="text-sm leading-relaxed text-muted">
                        {report.executiveSummary}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-4 font-bold text-foreground">Findings</h3>
                      <div className="space-y-4">
                        {report.findings.map((finding, index) => (
                          <AuditFinding key={`${finding.category}-${index}`} finding={finding} />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-white p-6">
                      <h3 className="mb-4 font-bold text-foreground">
                        Recommendations
                      </h3>
                      {report.recommendations.length > 0 ? (
                        <ul className="space-y-2 text-sm text-muted">
                          {report.recommendations.map((item, index) => (
                            <li key={`${item}-${index}`}>- {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted">
                          No recommendations saved.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "meeting" && (
            <>
              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Calendly Scheduling
                </h2>
                {consultation ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-border bg-section-alt p-4 text-sm">
                      <p className="font-semibold text-foreground">
                        Consultation status: {consultation.consultationStatus}
                      </p>
                      <p className="mt-1 text-muted">
                        Payment: {consultation.paymentStatus || "Not set"}{" "}
                        {consultation.paymentStatus === "paid"
                          ? "• this consultation is already paid."
                          : ""}
                      </p>
                      <p className="mt-1 text-muted">
                        Meeting time:{" "}
                        {formatDateTime(
                          consultation.scheduledStartAt || engagement.meetingAt,
                          "Not scheduled"
                        )}
                      </p>
                      <p className="mt-1 text-muted">
                        Meeting URL: {engagement.meetingUrl || "Not captured yet"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleCopyBookingLink()}
                        disabled={!bookingUrl}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        Copy booking link
                      </button>

                      {bookingUrl && (
                        <a
                          href={bookingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          Open Calendly
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          void handleServiceAction(
                            "send-booking-link",
                            "Scheduling email sent. The user can now complete Calendly without paying again."
                          )
                        }
                        disabled={
                          actionLoading !== null ||
                          !consultation ||
                          consultation.paymentStatus !== "paid"
                        }
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
                      >
                        {actionLoading === "send-booking-link"
                          ? "Sending..."
                          : "Send booking email"}
                      </button>

                      {consultation.rescheduleUrl && (
                        <a
                          href={consultation.rescheduleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          Open reschedule
                        </a>
                      )}

                      {consultation.cancelUrl && (
                        <a
                          href={consultation.cancelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
                        >
                          Open cancel
                        </a>
                      )}

                      <Link
                        href="/admin/calendly-webhooks"
                        className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        View webhook logs
                      </Link>
                    </div>

                    <dl className="grid gap-4 text-sm sm:grid-cols-2">
                      <DetailRow
                        label="Calendly Event URI"
                        value={consultation.calendlyEventUri || "Not set"}
                      />
                      <DetailRow
                        label="Calendly Invitee URI"
                        value={consultation.calendlyInviteeUri || "Not set"}
                      />
                      <DetailRow
                        label="Scheduled Start"
                        value={formatDateTime(
                          consultation.scheduledStartAt,
                          "Not scheduled"
                        )}
                      />
                      <DetailRow
                        label="Scheduled End"
                        value={formatDateTime(
                          consultation.scheduledEndAt,
                          "Not scheduled"
                        )}
                      />
                    </dl>
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    No consultation is linked to this engagement.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Meeting Controls
                </h2>
                <div className="grid gap-4">
                  <div>
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

                  <div>
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

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-foreground">
                      Meeting Notes
                    </label>
                    <textarea
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      rows={6}
                      placeholder="Capture discussion notes, blockers, and decisions..."
                      className="w-full resize-none rounded-lg border border-border px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      Save meeting changes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleServiceAction(
                          "send-meeting-confirmation",
                          "Meeting confirmation sent to the merchant.",
                          { saveFirst: true }
                        )
                      }
                      disabled={actionLoading !== null}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {actionLoading === "send-meeting-confirmation"
                        ? "Sending..."
                        : "Send meeting confirmation"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "delivery" && (
            <>
              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Intake Responses
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
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

                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      Save intake changes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        void handleServiceAction(
                          "send-intake",
                          "Intake email sent to the merchant.",
                          { saveFirst: true }
                        )
                      }
                      disabled={actionLoading !== null}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      {actionLoading === "send-intake"
                        ? "Sending..."
                        : "Send intake email"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Final Delivery
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
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

                  <div className="md:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleSave()}
                      disabled={saving}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                    >
                      Save delivery changes
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleServiceAction(
                          "send-report",
                          "Final report email sent to the merchant.",
                          { saveFirst: true }
                        )
                      }
                      disabled={actionLoading !== null}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
                    >
                      {actionLoading === "send-report"
                        ? "Sending..."
                        : "Send final report"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  Current Saved Content
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
                      {engagement.intakeResponses?.fulfillmentSetup ||
                        "No intake yet."}
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
                        {engagement.intakeResponses.topProblems.map(
                          (problem, index) => (
                            <li key={`${problem}-${index}`}>- {problem}</li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="text-muted">No intake yet.</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-foreground">Goals</p>
                    <p className="whitespace-pre-wrap text-muted">
                      {engagement.intakeResponses?.goals || "No goals saved."}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-foreground">
                      Final Report URL
                    </p>
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
                      <p className="text-muted">No final report link yet.</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 font-semibold text-foreground">
                      HTML Content
                    </p>
                    <p className="text-muted">
                      {engagement.finalReportHtml?.trim()
                        ? "HTML report content is saved."
                        : "No HTML report content yet."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="space-y-6">
          {lead && (
            <div className="rounded-xl border border-border bg-white p-6">
              <h3 className="mb-4 font-bold text-foreground">Lead</h3>
              <dl className="space-y-3 text-sm">
                <DetailRow label="Email" value={lead.email} />
                <DetailRow label="Store" value={lead.siteUrl} />
                <DetailRow
                  label="Store Name"
                  value={lead.storeName || "Not set"}
                />
                <DetailRow
                  label="Challenge"
                  value={
                    lead.challengeArea
                      ? lead.challengeArea.replace(/-/g, " ")
                      : "Not set"
                  }
                />
                <DetailRow
                  label="Submitted"
                  value={formatDateTime(lead.createdAt)}
                />
              </dl>
            </div>
          )}

          <div className="rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 font-bold text-foreground">Consultation</h3>
            {consultation ? (
              <dl className="space-y-3 text-sm">
                <DetailRow
                  label="Status"
                  value={consultation.consultationStatus}
                />
                <DetailRow
                  label="Payment"
                  value={consultation.paymentStatus || "Not set"}
                />
                <DetailRow
                  label="Booked"
                  value={formatDateTime(consultation.bookedAt, "Not booked")}
                />
                <DetailRow
                  label="Meeting"
                  value={formatDateTime(
                    consultation.scheduledStartAt,
                    "Not scheduled"
                  )}
                />
              </dl>
            ) : (
              <p className="text-sm text-muted">No linked consultation.</p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-6">
            <h3 className="mb-4 font-bold text-foreground">Quick Links</h3>
            <div className="space-y-3 text-sm">
              {report ? (
                <Link
                  href={`/admin/audit/${report.id}`}
                  className="block text-primary hover:text-accent"
                >
                  Open source audit report
                </Link>
              ) : (
                <p className="text-muted">No source report linked yet.</p>
              )}

              <Link
                href="/admin/calendly-webhooks"
                className="block text-primary hover:text-accent"
              >
                Open Calendly webhook logs
              </Link>

              {bookingUrl ? (
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-primary hover:text-accent"
                >
                  Open direct Calendly booking
                </a>
              ) : (
                <p className="text-muted">
                  No direct Calendly booking link available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
