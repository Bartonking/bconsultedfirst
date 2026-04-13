"use client";

import { useEffect, useState } from "react";
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

interface ServiceWithContext {
  engagement: AuditEngagement;
  lead: Lead | null;
  consultation: Consultation | null;
  report: AuditReport | null;
}

export default function ServicesPage() {
  const [data, setData] = useState<ServiceWithContext[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((res) => res.json())
      .then((json) => setData(json.services || []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Engagements", value: data.length },
    {
      label: "Intake Pending",
      value: data.filter((d) => d.engagement.status === "intake_pending").length,
    },
    {
      label: "In Progress",
      value: data.filter((d) => d.engagement.status === "in_progress").length,
    },
    {
      label: "Delivered",
      value: data.filter((d) => d.engagement.status === "delivered").length,
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Full Audit Services</h1>
        <p className="text-sm text-muted">
          Track human-led audit engagements after the consultation.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted">
            Loading services...
          </div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-muted mb-2">No full audit engagements yet.</p>
            <p className="text-xs text-muted">
              Phase 2 will add the admin action to start a full audit from a consultation.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Consultation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Meeting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map(({ engagement, lead, consultation, report }) => (
                  <tr
                    key={engagement.id}
                    className="border-b border-border last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">
                        {lead?.email || "-"}
                      </p>
                      <p className="text-xs text-muted">{lead?.siteUrl || "-"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          STATUS_STYLES[engagement.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {engagement.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {consultation?.consultationStatus || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {engagement.meetingAt
                        ? new Date(engagement.meetingAt).toLocaleString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {engagement.finalReportSentAt
                        ? `Sent ${new Date(
                            engagement.finalReportSentAt
                          ).toLocaleDateString()}`
                        : report
                          ? "Source report linked"
                          : "Not sent"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(engagement.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/services/${engagement.id}`}
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
