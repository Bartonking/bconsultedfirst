import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FAQSection } from "@/components/sections/FAQSection";
import { IconArrowRight } from "@/components/icons";

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-0 bg-background">
        <section className="pb-10 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Frequently asked questions
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about the audit, the process, and what happens next.
            </p>
          </div>
        </section>

        <FAQSection />

        <section className="py-20 px-6 bg-primary">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Still have questions?</h2>
            <p className="text-white/80 mb-8">Start with the free audit, or reach out directly.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-lg font-semibold hover:bg-primary-pale transition-colors"
              >
                Get My Audit <IconArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
