import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FAQSection } from "@/components/sections/FAQSection";
import { IconArrowRight, IconCheck, IconX, IconSearch, IconChart, IconMail } from "@/components/icons";

const WHAT_AI_REVIEWS = [
  "Homepage clarity and value proposition",
  "Navigation and collection structure",
  "Product page completeness and trust signals",
  "Merchandising consistency",
  "Conversion friction indicators",
  "Operational maturity signals from public data",
  "Reporting and workflow pattern indicators",
];

const WHAT_AI_DOES_NOT = [
  "Shopify admin or backend data",
  "Internal workflows or team processes",
  "Financial records or accounting systems",
  "ERP, CRM, or third-party tool data",
  "Customer data or private analytics",
];

const SCORING_CATEGORIES = [
  { name: "Storefront Clarity", description: "How well your homepage and brand communicate value." },
  { name: "Catalog Structure", description: "Organization of collections, product types, and tags." },
  { name: "Product Trust", description: "Completeness of product pages, reviews, and trust signals." },
  { name: "Operational Signals", description: "Indicators of fulfillment, inventory, and process maturity." },
  { name: "Opportunity Level", description: "Overall improvement potential based on findings." },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-0 bg-background">
        {/* Hero */}
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              How the audit works
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              A structured process, not a black box. Here&apos;s exactly what happens when
              you submit your store for review.
            </p>
          </div>
        </section>

        {/* 3-Step Process */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {[
                {
                  step: "01",
                  icon: IconMail,
                  title: "Enter your email and Shopify store URL",
                  desc: "Tell us where to send the audit and which store to review. No Shopify login or admin access required.",
                },
                {
                  step: "02",
                  icon: IconSearch,
                  title: "We generate your preliminary audit",
                  desc: "Our system reviews public storefront signals and uses a structured framework to score your store across key operational and structural categories.",
                },
                {
                  step: "03",
                  icon: IconChart,
                  title: "Get your report and next steps",
                  desc: "You\u2019ll see a summary on screen with scores and findings. The full report is emailed to you with detailed observations and recommendations.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-primary">Step {item.step}</span>
                    <h3 className="text-xl font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What AI Reviews vs Doesn't */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <div className="bg-card-bg border border-border rounded-xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">What the AI reviews</h2>
              <ul className="space-y-3">
                {WHAT_AI_REVIEWS.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconCheck className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-card-bg border border-border rounded-xl p-8">
              <h2 className="text-xl font-bold text-foreground mb-6">What the AI does not access</h2>
              <ul className="space-y-3">
                {WHAT_AI_DOES_NOT.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <IconX className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted mt-6 leading-relaxed">
                For a deeper review that includes admin-level analysis, book a full consultation.
              </p>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="py-20 px-6 bg-section-alt">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-8">How scoring works</h2>
            <p className="text-muted leading-relaxed mb-8">
              Each category receives a score from 0-100 based on observable signals and
              operational best-practice patterns. Scores indicate relative strength, not
              absolute grades.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {SCORING_CATEGORIES.map((cat) => (
                <div key={cat.name} className="bg-card-bg border border-border rounded-lg p-5">
                  <h3 className="font-bold text-foreground text-sm mb-1">{cat.name}</h3>
                  <p className="text-xs text-muted">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Report contents */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6">What your report includes</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                "Executive summary",
                "Category scores with context",
                "3-5 key findings with severity ratings",
                "Why each finding matters",
                "Specific recommendations",
                "Consultation invitation",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <IconCheck className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to see your results?</h2>
            <p className="text-white/80 mb-8">It takes less than a minute to start. No login required.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-pale transition-colors"
            >
              Get My Audit <IconArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
