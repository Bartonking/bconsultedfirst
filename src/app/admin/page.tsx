"use client";

import Link from "next/link";
import { MOCK_LEADS, MOCK_JOBS } from "@/lib/mock-data";
import { IconEye, IconRefresh, IconDownload } from "@/components/icons";

const STATUS_STYLES: Record<string, string> = {
  complete: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const totalLeads = MOCK_LEADS.length;
  const completedAudits = MOCK_JOBS.filter((j) => j.status === "complete").length;
  const consultationRate = Math.round((2 / totalLeads) * 100);

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lead Dashboard</h1>
          <p className="text-sm text-muted">Track audit submissions and lead status.</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
          <IconDownload className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Leads", value: totalLeads },
          { label: "Audits Complete", value: completedAudits },
          { label: "Consultations", value: 2 },
          { label: "Conversion Rate", value: `${consultationRate}%` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Lead Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Store URL</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Challenge</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_LEADS.map((lead, i) => {
                const job = MOCK_JOBS[i];
                return (
                  <tr key={lead.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-foreground">{lead.email}</td>
                    <td className="px-6 py-4 text-sm text-muted">{lead.siteUrl}</td>
                    <td className="px-6 py-4 text-sm text-muted capitalize">
                      {lead.challengeArea?.replace("-", " ") || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[job?.status || "pending"]}`}>
                        {job?.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {job?.status === "complete" && (
                          <Link
                            href={`/admin/audit/${job.id}`}
                            className="inline-flex items-center gap-1 text-xs text-primary hover:text-accent font-medium"
                          >
                            <IconEye className="w-3.5 h-3.5" /> View
                          </Link>
                        )}
                        {job?.status === "failed" && (
                          <button className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                            <IconRefresh className="w-3.5 h-3.5" /> Re-run
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
