import { IconCogs } from "@/components/icons";

const FRICTION_POINTS = [
  "Too many manual steps",
  "Inconsistent workflows",
  "Catalog and inventory complexity",
  "Weak reporting visibility",
  "Operational bottlenecks that grow over time",
];

export function WhyOpsMatter() {
  return (
    <section className="bg-[#143328] px-6 py-20 text-white md:py-28">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="mb-6 flex items-start gap-3 text-3xl font-bold text-white md:text-4xl">
            <span className="mt-1 inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#f2de7c] text-[#214f3e] md:h-12 md:w-12">
              <IconCogs className="h-6 w-6 md:h-7 md:w-7" />
            </span>
            <span>Why operations matter more than most merchants realize</span>
          </h2>
          <p className="mb-4 text-base leading-relaxed text-white/82">
            Many Shopify businesses focus on storefront design first. But as growth increases,
            the real friction usually shows up behind the scenes.
          </p>
          <p className="mb-4 text-base leading-relaxed text-white/82">
            Manual work starts piling up. Catalog structures become harder to manage. Reporting
            becomes less reliable. Teams compensate with spreadsheets, workarounds, and memory
            instead of clear systems.
          </p>
          <p className="text-base leading-relaxed text-white/82">
            That is where growth starts to slow down. At bConsulted First, we focus on the
            operational side of Shopify — the workflows, process gaps, and structural issues
            that affect how the business actually runs.
          </p>
        </div>
        <div className="space-y-4">
          {FRICTION_POINTS.map((point) => (
            <div
              key={point}
              className="flex items-start gap-4 rounded-lg border border-white/12 bg-white/8 p-5 backdrop-blur-sm"
            >
              <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#f2de7c]" />
              <p className="text-sm leading-relaxed text-white/88">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
