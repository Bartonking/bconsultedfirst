import { IconWarning } from "@/components/icons";

const FRICTION_POINTS = [
  "Too many manual steps",
  "Inconsistent workflows",
  "Catalog and inventory complexity",
  "Weak reporting visibility",
  "Operational bottlenecks that grow over time",
];

export function WhyOpsMatter() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-6">
            <IconWarning className="w-7 h-7 text-amber-600" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Why operations matter more than most merchants realize
          </h2>
          <p className="text-base text-muted leading-relaxed mb-4">
            Many Shopify businesses focus on storefront design first. But as growth increases,
            the real friction usually shows up behind the scenes.
          </p>
          <p className="text-base text-muted leading-relaxed mb-4">
            Manual work starts piling up. Catalog structures become harder to manage. Reporting
            becomes less reliable. Teams compensate with spreadsheets, workarounds, and memory
            instead of clear systems.
          </p>
          <p className="text-base text-muted leading-relaxed">
            That is where growth starts to slow down. At bConsulted First, we focus on the
            operational side of Shopify — the workflows, process gaps, and structural issues
            that affect how the business actually runs.
          </p>
        </div>
        <div className="space-y-4">
          {FRICTION_POINTS.map((point) => (
            <div key={point} className="flex items-start gap-4 bg-card-bg border border-border rounded-lg p-5">
              <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2" />
              <p className="text-sm text-foreground leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
