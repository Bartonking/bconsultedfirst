"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type {
  AuditEngagement,
  AuditJob,
  AuditReport,
  Consultation,
  Lead,
} from "@/lib/types";

const CONSULTATION_STATUS_STYLES: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  paid: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const ENGAGEMENT_STATUS_STYLES: Record<string, string> = {
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

interface ArchivedLead {
  lead: Lead;
  job: AuditJob | null;
}

interface ArchivedConsultation {
  consultation: Consultation;
  lead: Lead | null;
  engagement: AuditEngagement | null;
}

interface ArchivedService {
  engagement: AuditEngagement;
  lead: Lead | null;
  consultation: Consultation | null;
  report: AuditReport | null;
}

function formatDate(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export default function ArchivePage() {
  const [leads, setLeads] = useState<ArchivedLead[]>([]);
  const [consultations, setConsultations] = useState<ArchivedConsultation[]>([]);
  const [services, setServices] = useState<ArchivedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/leads?view=archived").then((r) => r.json()),
      fetch("/api/admin/consultations?view=archived").then((r) => r.json()),
      fetch("/api/admin/services?view=archived").then((r) => r.json()),
    ])
      .then(([ld, cons, svc]) => {
        setLeads(ld.leads || []);
        setConsultations(cons.consultations || []);
        setServices(svc.services || []);
      })
      .catch(() => {
        setLeads([]);
        setConsultations([]);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function unarchiveLead(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setLeads((list) => list.filter((l) => l.lead.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unarchive");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteLead(id: string) {
    if (!window.confirm("Permanently delete this lead? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      }
      setLeads((list) => list.filter((l) => l.lead.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  async function unarchiveConsultation(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setConsultations((list) => list.filter((c) => c.consultation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unarchive");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteConsultation(id: string) {
    if (!window.confirm("Permanently delete this consultation? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/consultations/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      }
      setConsultations((list) => list.filter((c) => c.consultation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  async function unarchiveService(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: null }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setServices((list) => list.filter((s) => s.engagement.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unarchive");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteService(id: string) {
    if (!window.confirm("Permanently delete this engagement? This cannot be undone.")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error((await res.json().catch(() => ({}))).error || "Failed");
      }
      setServices((list) => list.filter((s) => s.engagement.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Archive</h1>
        <p className="text-sm text-muted">
          All archived consultations and service engagements. Unarchive to restore, or delete permanently.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted">Loading archive…</p>
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Archived Leads{" "}
              <span className="text-sm font-normal text-muted">
                ({leads.length})
              </span>
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {leads.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted">
                  No archived leads.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Store URL</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Archived</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map(({ lead }) => (
                        <tr
                          key={lead.id}
                          className="border-b border-border last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 text-sm text-foreground">{lead.email}</td>
                          <td className="px-6 py-4 text-sm text-muted">{lead.siteUrl}</td>
                          <td className="px-6 py-4 text-sm text-muted">
                            {formatDate(lead.archivedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => void unarchiveLead(lead.id)}
                                disabled={busyId === lead.id}
                                className="text-xs text-blue-600 hover:underline disabled:opacity-60"
                              >
                                Unarchive
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteLead(lead.id)}
                                disabled={busyId === lead.id}
                                className="text-xs text-red-600 hover:underline disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Archived Consultations{" "}
              <span className="text-sm font-normal text-muted">
                ({consultations.length})
              </span>
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {consultations.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted">
                  No archived consultations.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Archived</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultations.map(({ consultation: con, lead }) => (
                        <tr
                          key={con.id}
                          className="border-b border-border last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-foreground">
                              {lead?.email || "-"}
                            </p>
                            <p className="text-xs text-muted">
                              {lead?.siteUrl || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                CONSULTATION_STATUS_STYLES[con.consultationStatus] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {con.consultationStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted">
                            {formatDate(con.archivedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => void unarchiveConsultation(con.id)}
                                disabled={busyId === con.id}
                                className="text-xs text-blue-600 hover:underline disabled:opacity-60"
                              >
                                Unarchive
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteConsultation(con.id)}
                                disabled={busyId === con.id}
                                className="text-xs text-red-600 hover:underline disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              Archived Services{" "}
              <span className="text-sm font-normal text-muted">
                ({services.length})
              </span>
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {services.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted">
                  No archived service engagements.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Lead</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Archived</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(({ engagement, lead }) => (
                        <tr
                          key={engagement.id}
                          className="border-b border-border last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-foreground">
                              {lead?.email || "-"}
                            </p>
                            <p className="text-xs text-muted">
                              {lead?.siteUrl || "-"}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                ENGAGEMENT_STATUS_STYLES[engagement.status] ||
                                "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {engagement.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted">
                            {formatDate(engagement.archivedAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-3">
                              <Link
                                href={`/admin/services/${engagement.id}`}
                                className="text-xs font-medium text-primary hover:text-accent"
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() => void unarchiveService(engagement.id)}
                                disabled={busyId === engagement.id}
                                className="text-xs text-blue-600 hover:underline disabled:opacity-60"
                              >
                                Unarchive
                              </button>
                              <button
                                type="button"
                                onClick={() => void deleteService(engagement.id)}
                                disabled={busyId === engagement.id}
                                className="text-xs text-red-600 hover:underline disabled:opacity-60"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
