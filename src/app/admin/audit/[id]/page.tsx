"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuditScoreBar } from "@/components/audit/AuditScoreBar";
import { AuditFinding } from "@/components/audit/AuditFinding";
import { IconArrowRight } from "@/components/icons";
import { captureClientHandledError } from "@/lib/sentry/client";
import type {
  AuditReport,
  Lead,
  AuditJob,
  Consultation,
  AuditEngagement,
} from "@/lib/types";

interface AdminAuditData {
  report: AuditReport | null;
  lead: Lead | null;
  job: AuditJob | null;
  consultation: Consultation | null;
  engagement: AuditEngagement | null;
}

export default function AdminAuditReview() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AdminAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingService, setCreatingService] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

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

  const { report, lead, consultation, engagement } = data;

  async function handleOpenOrCreateService() {
    if (engagement) {
      router.push(`/admin/services/${engagement.id}`);
      return;
    }

    if (!lead) {
      setServiceError("Lead data is missing for this audit.");
      return;
    }

    setCreatingService(true);
    setServiceError(null);
    let statusCode: number | undefined;

    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          consultationId: consultation?.id,
          reportId: report.id,
        }),
      });
      statusCode = res.status;

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create service");
      }

      const json = await res.json();
      const nextEngagement = json.engagement as AuditEngagement;
      setData((current) =>
        current ? { ...current, engagement: nextEngagement } : current
      );
      router.push(`/admin/services/${nextEngagement.id}`);
    } catch (err) {
      captureClientHandledError(err, {
        route: "/admin/audit/[id]",
        action: "create_service_from_audit",
        surface: "admin",
        statusCode,
        contexts: {
          admin_audit: {
            reportId: report.id,
            leadId: lead?.id,
            consultationId: consultation?.id,
          },
        },
      });
      setServiceError(
        err instanceof Error ? err.message : "Failed to create service"
      );
    } finally {
      setCreatingService(false);
    }
  }

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
              <button
                type="button"
                onClick={() => void handleOpenOrCreateService()}
                disabled={creatingService}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium bg-primary text-white hover:bg-accent transition-colors flex items-center justify-between disabled:opacity-60"
              >
                {engagement
                  ? "Open Full Audit Service"
                  : creatingService
                    ? "Starting Full Audit..."
                    : "Start Full Audit Service"}
                <IconArrowRight className="w-4 h-4" />
              </button>
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
            {serviceError && (
              <p className="mt-3 text-sm text-red-600">{serviceError}</p>
            )}
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

          {engagement && (
            <div className="bg-white border border-border rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-3">Full Audit Service</h3>
              <p className="text-sm text-muted mb-3">
                Status:{" "}
                <span className="font-medium text-foreground">
                  {engagement.status.replace(/_/g, " ")}
                </span>
              </p>
              <Link
                href={`/admin/services/${engagement.id}`}
                className="text-xs font-medium text-primary hover:text-accent"
              >
                Open service engagement
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
