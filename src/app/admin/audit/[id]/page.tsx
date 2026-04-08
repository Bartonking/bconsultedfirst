"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuditScoreBar } from "@/components/audit/AuditScoreBar";
import { AuditFinding } from "@/components/audit/AuditFinding";
import { IconArrowRight } from "@/components/icons";
import type { AuditReport, Lead, AuditJob, Consultation } from "@/lib/types";

interface AdminAuditData {
  report: AuditReport | null;
  lead: Lead | null;
  job: AuditJob | null;
  consultation: Consultation | null;
}

export default function AdminAuditReview() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<AdminAuditData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/audit/${params.id}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted text-sm">Loading audit...</p>
      </div>
    );
  }

  if (!data?.report) {
    return (
      <div className="p-6 md:p-10">
        <p className="text-muted text-sm">Audit not found.</p>
        <Link href="/admin" className="text-sm text-primary hover:text-accent mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const { report, lead, consultation } = data;

  return (
    <div className="p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-sm text-primary hover:text-accent">
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-xl p-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Audit Report</h1>
            <p className="text-sm text-muted mb-6">{report.storeUrl}</p>

            <div className="text-center py-6 mb-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted mb-1">Overall Score</p>
              <p className="text-5xl font-bold text-primary">{report.overallScore}<span className="text-xl text-muted">/100</span></p>
            </div>

            <h2 className="font-bold text-foreground mb-4">Category Scores</h2>
            <div className="space-y-5">
              {report.categories.map((cat) => (
                <AuditScoreBar key={cat.name} category={cat} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-4">Findings</h2>
            <div className="space-y-4">
              {report.findings.map((finding, i) => (
                <AuditFinding key={i} finding={finding} />
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-bold text-foreground mb-3">Executive Summary</h2>
            <p className="text-sm text-muted leading-relaxed">{report.executiveSummary}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {lead && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-4">Lead Information</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="text-foreground font-medium">{lead.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Store URL</dt>
                  <dd className="text-foreground font-medium">{lead.siteUrl}</dd>
                </div>
                {lead.storeName && (
                  <div>
                    <dt className="text-muted">Store Name</dt>
                    <dd className="text-foreground font-medium">{lead.storeName}</dd>
                  </div>
                )}
                {lead.challengeArea && (
                  <div>
                    <dt className="text-muted">Challenge</dt>
                    <dd className="text-foreground font-medium capitalize">{lead.challengeArea.replace("-", " ")}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted">Submitted</dt>
                  <dd className="text-foreground font-medium">{new Date(lead.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          )}

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-accent transition-colors flex items-center justify-between">
                Mark as Contacted <IconArrowRight className="w-4 h-4" />
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-gray-50 transition-colors">
                Re-send Report Email
              </button>
              <button className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-gray-50 transition-colors">
                Re-run Audit
              </button>
            </div>
          </div>

          {consultation && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-3">Consultation Status</h3>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                consultation.consultationStatus === "scheduled"
                  ? "bg-green-100 text-green-800"
                  : consultation.consultationStatus === "requested"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
              }`}>
                {consultation.consultationStatus}
              </span>
              {consultation.bookedAt && (
                <p className="text-sm text-muted mt-3">{new Date(consultation.bookedAt).toLocaleString()}</p>
              )}
              {consultation.notes && (
                <p className="text-sm text-muted mt-1">{consultation.notes}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
