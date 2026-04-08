"use client";

import Link from "next/link";
import { MOCK_AUDIT_REPORT, MOCK_LEADS } from "@/lib/mock-data";
import { AuditScoreBar } from "@/components/audit/AuditScoreBar";
import { AuditFinding } from "@/components/audit/AuditFinding";
import { IconArrowRight } from "@/components/icons";

export default function AdminAuditReview() {
  const report = MOCK_AUDIT_REPORT;
  const lead = MOCK_LEADS[0];

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

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold text-foreground mb-3">Consultation Status</h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">
              Scheduled
            </span>
            <p className="text-sm text-muted mt-3">April 10, 2026 at 2:00 PM</p>
            <p className="text-sm text-muted mt-1">Interested in catalog restructuring</p>
          </div>
        </div>
      </div>
    </div>
  );
}
