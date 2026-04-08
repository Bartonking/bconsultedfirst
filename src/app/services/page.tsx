import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconCheck, IconArrowRight } from "@/components/icons";
import { SERVICES_DATA } from "@/lib/constants";

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-0 bg-background">
        {/* Hero */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Shopify operations consulting
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              We help Shopify merchants fix workflow bottlenecks, reduce manual work, and
              build stronger operational systems. The audit is step one. Here&apos;s the rest
              of the journey.
            </p>
          </div>
        </section>

        {/* Services grid */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {SERVICES_DATA.map((service) => (
                <div
                  key={service.title}
                  className={`rounded-xl p-8 flex flex-col ${
                    service.featured
                      ? "bg-primary text-white ring-2 ring-primary shadow-xl"
                      : "bg-card-bg border border-border"
                  }`}
                >
                  {service.featured && (
                    <span className="text-xs font-bold text-primary-light uppercase tracking-wide mb-2">
                      Most Popular
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-1 ${service.featured ? "text-white" : "text-foreground"}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm mb-2 ${service.featured ? "text-white/70" : "text-muted"}`}>
                    {service.tagline}
                  </p>
                  <div className="mb-4">
                    <span className={`text-3xl font-bold ${service.featured ? "text-white" : "text-foreground"}`}>
                      {service.price}
                    </span>
                  </div>
                  <p className={`text-sm mb-6 leading-relaxed ${service.featured ? "text-white/80" : "text-muted"}`}>
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <IconCheck className={`w-4 h-4 flex-shrink-0 mt-0.5 ${service.featured ? "text-primary-light" : "text-primary"}`} />
                        <span className={`text-sm ${service.featured ? "text-white/90" : "text-muted"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/book"
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      service.featured
                        ? "bg-white text-primary hover:bg-primary-pale"
                        : "bg-primary text-white hover:bg-accent"
                    }`}
                  >
                    Get Started <IconArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value messaging */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">How we approach consulting</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-foreground mb-2">Diagnose before we build</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  Every engagement starts with understanding your current state. We don&apos;t
                  prescribe solutions before we understand the problem.
                </p>
                <h3 className="font-bold text-foreground mb-2">You own the result</h3>
                <p className="text-sm text-muted leading-relaxed">
                  We build systems you can run without us. No vendor lock-in, no dependency
                  on our continued involvement.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Fixed scope, clear delivery</h3>
                <p className="text-sm text-muted leading-relaxed mb-6">
                  We price by outcome, not by hour. You know what you&apos;re getting and what
                  it costs before we start.
                </p>
                <h3 className="font-bold text-foreground mb-2">Operations, not aesthetics</h3>
                <p className="text-sm text-muted leading-relaxed">
                  We focus on workflows, systems, and reliability — the things that affect
                  how your business actually runs, not how it looks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Start with a free audit</h2>
            <p className="text-white/80 mb-8">See where your operations stand before committing to a service.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-pale transition-colors"
              >
                Get My Audit <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
