import {
  IconEye, IconCatalog, IconShield, IconShoppingBag,
  IconWarning, IconTrendingUp,
} from "@/components/icons";

const REVIEW_CATEGORIES = [
  {
    icon: IconEye,
    title: "Storefront clarity",
    description: "We review how clearly your store communicates its value, structure, and customer journey.",
  },
  {
    icon: IconCatalog,
    title: "Navigation and catalog structure",
    description: "We look for signs of disorganized collections, inconsistent product grouping, and catalog friction.",
  },
  {
    icon: IconShield,
    title: "Product page trust and completeness",
    description: "We assess whether your product pages support confidence, clarity, and operational consistency.",
  },
  {
    icon: IconShoppingBag,
    title: "Merchandising consistency",
    description: "We identify patterns that may signal inconsistency across product presentation and customer flow.",
  },
  {
    icon: IconWarning,
    title: "Operational friction signals",
    description: "We surface signs that your store may be carrying workflow inefficiencies, manual dependencies, or scaling strain.",
  },
  {
    icon: IconTrendingUp,
    title: "Improvement opportunities",
    description: "We translate what we find into practical next-step recommendations.",
  },
];

export function WhatWeReview() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            What the Audit Reviews
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What the audit reviews
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Our preliminary Shopify audit is designed to highlight common operational
            and structural issues that often create friction as stores grow.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEW_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.title}
                className="bg-card-bg border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{cat.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{cat.description}</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-8 text-center max-w-2xl mx-auto">
          This is a preliminary AI-powered review based on public storefront signals.
          It does not replace a deeper human-led operational audit.
        </p>
      </div>
    </section>
  );
}
