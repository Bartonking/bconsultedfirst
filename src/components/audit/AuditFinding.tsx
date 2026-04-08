import type { AuditFinding as AuditFindingType } from "@/lib/types";

const SEVERITY_STYLES = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200",
};

const SEVERITY_BADGE = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800",
};

export function AuditFinding({ finding }: { finding: AuditFindingType }) {
  return (
    <div className={`rounded-xl border p-6 ${SEVERITY_STYLES[finding.severity]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${SEVERITY_BADGE[finding.severity]}`}>
          {finding.severity.toUpperCase()}
        </span>
        <span className="text-xs font-medium opacity-70">{finding.category}</span>
      </div>
      <h4 className="font-bold text-foreground text-base mb-2">Observation</h4>
      <p className="text-sm text-foreground/80 mb-4">{finding.observation}</p>
      <h4 className="font-bold text-foreground text-base mb-2">Why It Matters</h4>
      <p className="text-sm text-foreground/80 mb-4">{finding.whyItMatters}</p>
      <h4 className="font-bold text-foreground text-base mb-2">Recommendation</h4>
      <p className="text-sm text-foreground/80">{finding.recommendation}</p>
    </div>
  );
}
