import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuditScoreBar } from "@/components/audit/AuditScoreBar";
import { AuditFinding } from "@/components/audit/AuditFinding";
import { IconArrowRight, IconCheck, IconMail } from "@/components/icons";
import { getDb, COLLECTIONS } from "@/lib/firebase";
import type { AuditReport } from "@/lib/types";

async function getReport(id: string): Promise<AuditReport | null> {
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.auditReports).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as AuditReport;
  } catch (err) {
    console.error("Failed to fetch report:", err);
    return null;
  }
}

export default async function AuditResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    notFound();
  }

  const scoreColor =
    report.overallScore >= 70 ? "text-primary" : report.overallScore >= 50 ? "text-amber-500" : "text-red-500";

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary-pale text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              <IconCheck className="w-4 h-4" /> Audit Complete
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Your Shopify Audit Is Ready
            </h1>
            <p className="text-muted">
              We reviewed <span className="font-semibold text-foreground">{report.storeUrl}</span> and
              identified key operational and structural opportunities.
            </p>
          </div>

          {/* Overall Score */}
          <div className="bg-card-bg border border-border rounded-xl p-8 text-center mb-8">
            <p className="text-sm text-muted uppercase tracking-wide mb-2">Overall Score</p>
            <p className={`text-6xl font-bold ${scoreColor} mb-2`}>
              {report.overallScore}<span className="text-2xl text-muted">/100</span>
            </p>
            <p className="text-sm text-muted max-w-md mx-auto">{report.executiveSummary}</p>
          </div>

          {/* Category Scores */}
          <div className="bg-card-bg border border-border rounded-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Category Scores</h2>
            <div className="space-y-6">
              {report.categories.map((cat) => (
                <AuditScoreBar key={cat.name} category={cat} />
              ))}
            </div>
          </div>

          {/* Findings */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Key Findings</h2>
            <div className="space-y-4">
              {report.findings.map((finding, i) => (
                <AuditFinding key={i} finding={finding} />
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-card-bg border border-border rounded-xl p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">Recommended Next Steps</h2>
            <ul className="space-y-3">
              {report.recommendations.map((rec) => (
                <li key={rec} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Report sent confirmation */}
          <div className="bg-primary-pale rounded-xl p-6 flex items-center gap-4 mb-12">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <IconMail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Full report sent to your email</p>
              <p className="text-xs text-muted">Check your inbox for the complete report with all findings and recommendations.</p>
            </div>
          </div>

          {/* Consultation CTA */}
          <div className="bg-primary rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Want a deeper operational review?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8 max-w-xl mx-auto">
              The preliminary audit gives you a starting point. Book a consultation to
              review findings with a specialist and create an improvement plan.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-primary-pale transition-colors"
            >
              Book a Consultation <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted text-center mt-8 max-w-2xl mx-auto">
            This is a preliminary AI-powered review based on publicly visible storefront signals
            and operational best-practice patterns. It does not access your Shopify admin, internal
            data, or private systems.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
