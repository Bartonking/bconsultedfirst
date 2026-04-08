"use client";

import { MOCK_CONSULTATIONS, MOCK_LEADS } from "@/lib/mock-data";

const STATUS_STYLES: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function ConsultationsPage() {
  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Consultations</h1>
        <p className="text-sm text-muted">Track consultation requests and bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Requests", value: MOCK_CONSULTATIONS.length },
          { label: "Scheduled", value: MOCK_CONSULTATIONS.filter((c) => c.consultationStatus === "scheduled").length },
          { label: "Completed", value: MOCK_CONSULTATIONS.filter((c) => c.consultationStatus === "completed").length },
          { label: "Pending", value: MOCK_CONSULTATIONS.filter((c) => c.consultationStatus === "requested").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-border rounded-xl p-5">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Lead</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Booked At</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-6 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONSULTATIONS.map((con) => {
                const lead = MOCK_LEADS.find((l) => l.id === con.leadId);
                return (
                  <tr key={con.id} className="border-b border-border last:border-b-0 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-foreground">{lead?.email}</p>
                      <p className="text-xs text-muted">{lead?.siteUrl}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[con.consultationStatus]}`}>
                        {con.consultationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {con.bookedAt ? new Date(con.bookedAt).toLocaleString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">{con.notes || "-"}</td>
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
