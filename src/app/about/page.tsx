import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconArrowRight } from "@/components/icons";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-0 bg-background">
        {/* Hero */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              We focus on the systems behind the storefront
            </h1>
            <p className="text-lg text-muted max-w-2xl leading-relaxed">
              Most Shopify agencies optimize what customers see. We fix what they don&apos;t.
            </p>
          </div>
        </section>

        {/* Our perspective */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Our perspective</h2>
            <div className="space-y-6 text-base text-muted leading-relaxed">
              <p>
                The Shopify ecosystem is full of agencies that focus on themes, conversion
                rate optimization, and paid media. That work matters. But it only works
                well when the business behind the storefront can keep up.
              </p>
              <p>
                As stores grow, real friction usually shows up in operations: inconsistent
                order workflows, catalog structures that no one fully understands, reporting
                that teams don&apos;t trust, and integrations that are held together with
                manual processes and good intentions.
              </p>
              <p>
                bConsulted First exists to fix that. We help growing Shopify merchants
                reduce manual work, improve workflow reliability, and build stronger
                back-office systems. Not by redesigning storefronts — by redesigning how
                the business actually runs.
              </p>
            </div>
          </div>
        </section>

        {/* Our approach */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">Our approach</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "Diagnose",
                  desc: "We start by understanding what&apos;s actually happening — not what should be happening. We review real workflows, inspect real data, and listen to what the team is actually dealing with.",
                },
                {
                  title: "Simplify",
                  desc: "We strip away unnecessary complexity. Not every process needs automation. Sometimes the fix is removing steps, clarifying ownership, or reorganizing data.",
                },
                {
                  title: "Improve",
                  desc: "We build the systems, workflows, and structures that make operations reliable. Everything is designed to run without us.",
                },
                {
                  title: "Scale",
                  desc: "Once the foundation is solid, we help merchants prepare for the next phase of growth — with reporting, integration, and process maturity they can trust.",
                },
              ].map((item) => (
                <div key={item.title} className="bg-card-bg border border-border rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why operations */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Why most Shopify agencies don&apos;t do this
            </h2>
            <div className="space-y-4 text-base text-muted leading-relaxed">
              <p>
                Operational work is harder to sell than design work. It&apos;s harder to
                screenshot. The results show up in fewer errors, faster processes, and
                better data — not prettier pages.
              </p>
              <p>
                But merchants who&apos;ve grown past a certain point know: the bottleneck
                is almost never the storefront. It&apos;s the systems behind it. That&apos;s
                where we focus, and that&apos;s what makes us different.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">See where your operations stand</h2>
            <p className="text-white/80 mb-8">Start with a free preliminary audit of your Shopify store.</p>
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
