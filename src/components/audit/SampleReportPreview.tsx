export function SampleReportPreview() {
  return (
    <div className="bg-white rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Report header */}
      <div className="bg-primary px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg" />
          <div>
            <p className="text-white font-bold text-sm">Shopify Operations Audit</p>
            <p className="text-white/70 text-xs">bConsulted First</p>
          </div>
        </div>
      </div>

      {/* Mock report content */}
      <div className="p-6 space-y-4">
        {/* Score */}
        <div className="text-center pb-4 border-b border-border">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Overall Score</p>
          <p className="text-4xl font-bold text-primary">62<span className="text-lg text-muted">/100</span></p>
        </div>

        {/* Category bars */}
        <div className="space-y-3">
          {[
            { name: "Storefront Clarity", score: 78 },
            { name: "Catalog Structure", score: 55 },
            { name: "Product Trust", score: 68 },
            { name: "Operational Signals", score: 45 },
            { name: "Opportunity Level", score: 72 },
          ].map((cat) => (
            <div key={cat.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">{cat.name}</span>
                <span className="font-semibold text-foreground">{cat.score}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.score >= 70 ? "bg-primary" : cat.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Finding preview */}
        <div className="bg-red-50 rounded-lg p-3 border border-red-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">HIGH</span>
            <span className="text-[10px] text-red-600">Catalog Structure</span>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed">
            Collections use inconsistent naming patterns...
          </p>
        </div>

        {/* Blur overlay for teaser */}
        <div className="relative">
          <div className="space-y-2 blur-[2px] select-none">
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <p className="text-xs text-foreground/80">Additional finding details...</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-foreground/80">More recommendations...</p>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md">
              Get your full report
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
