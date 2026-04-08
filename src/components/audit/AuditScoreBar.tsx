import type { AuditCategory } from "@/lib/types";

export function AuditScoreBar({ category }: { category: AuditCategory }) {
  const percentage = Math.round((category.score / category.maxScore) * 100);
  const color =
    percentage >= 70 ? "bg-primary" : percentage >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-foreground">{category.name}</span>
        <span className="text-sm font-bold text-foreground">{category.score}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted">{category.summary}</p>
    </div>
  );
}
