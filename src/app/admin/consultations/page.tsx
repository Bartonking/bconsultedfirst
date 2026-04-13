"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Lead, Consultation, AuditEngagement } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  paid: "bg-emerald-100 text-emerald-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

interface ConsultationWithLead {
  consultation: Consultation;
  lead: Lead | null;
  engagement: AuditEngagement | null;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const [data, setData] = useState<ConsultationWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/consultations")
      .then((res) => res.json())
      .then((json) => setData(json.consultations || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleOpenOrCreateService(item: ConsultationWithLead) {
    if (item.engagement) {
      router.push(`/admin/services/${item.engagement.id}`);
      return;
    }

    if (!item.lead) {
      setActionError("Lead record is missing for this consultation.");
      return;
    }

    setCreatingId(item.consultation.id);
    setActionError(null);

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: item.lead.id,
          consultationId: item.consultation.id,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create service");
      }

      const json = await res.json();
      const engagement = json.engagement as AuditEngagement;

      setData((current) =>
        current.map((entry) =>
          entry.consultation.id === item.consultation.id
            ? { ...entry, engagement }
            : entry
        )
      );
      router.push(`/admin/services/${engagement.id}`);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create service"
      );
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Consultations</h1>
        <p className="text-sm text-muted">Track consultation requests and bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Requests", value: data.length },
          { label: "Scheduled", value: data.filter((d) => d.consultation.consultationStatus === "scheduled").length },
          { label: "Completed", value: data.filter((d) => d.consultation.consultationStatus === "completed").length },
          { label: "Pending", value: data.filter((d) => d.consultation.consultationStatus === "requested").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {actionError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading consultations...</div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">No consultations yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Lead</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Scheduled</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Notes</th>
                  <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => {
                  const { consultation: con, lead, engagement } = item;
                  return (
                  <tr key={con.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{lead?.email || "-"}</p>
                      <p className="text-xs text-muted">{lead?.siteUrl || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[con.consultationStatus]}`}>
                        {con.consultationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {con.scheduledStartAt ? new Date(con.scheduledStartAt).toLocaleString() : con.bookedAt ? new Date(con.bookedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{con.notes || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleOpenOrCreateService(item)}
                          disabled={creatingId === con.id}
                          className="text-xs font-medium text-primary hover:text-accent disabled:opacity-60"
                        >
                          {engagement
                            ? "Open Full Audit"
                            : creatingId === con.id
                              ? "Starting..."
                              : "Start Full Audit"}
                        </button>
                        {con.consultationStatus === "scheduled" && (
                          <>
                          {con.rescheduleUrl && (
                            <a href={con.rescheduleUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Reschedule</a>
                          )}
                          {con.cancelUrl && (
                            <a href={con.cancelUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 hover:underline">Cancel</a>
                          )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
