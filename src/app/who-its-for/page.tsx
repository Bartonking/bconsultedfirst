import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconArrowRight, IconCheck, IconX, IconShoppingBag, IconStorefront, IconClipboard, IconUsers } from "@/components/icons";

const PROFILES = [
  {
    icon: IconShoppingBag,
    title: "Multi-SKU retail brands",
    description: "Complex catalogs, high order volumes, lots of product data to keep clean. You need structure, not more manual fixes.",
  },
  {
    icon: IconStorefront,
    title: "Wholesale & B2B-B2C hybrid merchants",
    description: "Multiple sales channels, different pricing logic, inventory shared across storefronts. Operational clarity is non-negotiable.",
  },
  {
    icon: IconClipboard,
    title: "Admin-heavy product businesses",
    description: "Custom orders, complex fulfillment rules, lots of manual steps that should be automated.",
  },
  {
    icon: IconUsers,
    title: "Growing teams with scaling pains",
    description: "Your team is spending too much time on operational workarounds instead of growth work.",
  },
];

const GOOD_FIT = [
  "Growing Shopify brands doing consistent revenue",
  "Multi-SKU merchants with complex catalogs",
  "Teams managing manual workflows that should be automated",
  "Businesses that want stronger back-office structure",
  "Operators who need better visibility before making bigger changes",
  "Merchants preparing for their next growth phase",
];

const NOT_IDEAL = [
  "Brand new stores still validating product-market fit",
  "Merchants looking only for a visual redesign",
  "Businesses wanting full technical integration without diagnostic first",
];

export default function WhoItsForPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-0 bg-background">
        {/* Hero */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Built for merchants who&apos;ve outgrown duct tape
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              This audit is best for Shopify merchants who know growth is creating more
              complexity and want a clearer picture of where operational friction may be building.
            </p>
          </div>
        </section>

        {/* Profiles */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-10">Who we work with</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {PROFILES.map((profile) => (
                <div key={profile.title} className="bg-card-bg border border-border rounded-xl p-8 flex gap-5 items-start">
                  <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center flex-shrink-0">
                    <profile.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{profile.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{profile.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fit / Not Fit */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-card-bg border border-border rounded-xl p-8">
              <h3 className="text-lg font-bold text-foreground mb-6">This is a strong fit for:</h3>
              <ul className="space-y-4">
                {GOOD_FIT.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
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
                    <IconX className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Sound like your store?</h2>
            <p className="text-white/80 mb-8">Get a free preliminary audit and see where operations can improve.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-pale transition-colors"
            >
              Get My Audit <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
