import { IconCheck, IconX } from "@/components/icons";

const GOOD_FIT = [
  "Growing Shopify brands",
  "Multi-SKU merchants",
  "Teams managing complex catalogs",
  "Merchants dealing with manual workflows",
  "Businesses that want stronger back-office structure",
  "Operators who need better visibility before making bigger changes",
];

const NOT_IDEAL = [
  "Your store is brand new and still validating the basics",
  "You only want a visual redesign",
  "You need a full technical integration project before a diagnostic review",
];

export function WhoItsFor() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Who It&apos;s For
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who this is for
          </h2>
          <p className="text-base text-muted leading-relaxed">
            This audit is best for Shopify merchants who know growth is creating more
            complexity and want a clearer picture of where operational friction may be building.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card-bg border border-border rounded-xl p-8">
            <h3 className="text-lg font-bold text-foreground mb-6">This is a strong fit for:</h3>
            <ul className="space-y-4">
              {GOOD_FIT.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card-bg border border-border rounded-xl p-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Probably not the right fit if:</h3>
            <ul className="space-y-4">
              {NOT_IDEAL.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconX className="w-3.5 h-3.5 text-muted" />
                  </div>
                  <span className="text-sm text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
