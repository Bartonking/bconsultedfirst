import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconCheck, IconArrowRight, IconMail } from "@/components/icons";

export default function ThankYouPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 px-6 bg-background">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <IconCheck className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your audit has been sent
          </h1>
          <p className="text-muted mb-8 leading-relaxed">
            We&apos;ve emailed the full report to your inbox. Check your email for
            detailed findings, category scores, and recommended next steps.
          </p>

          <div className="bg-primary-pale rounded-xl p-6 flex items-center gap-4 mb-10 text-left">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <IconMail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Check your inbox</p>
              <p className="text-xs text-muted">The full report includes all findings, scores, and detailed recommendations.</p>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/book"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors"
            >
              Book a Consultation <IconArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 border-2 border-border text-foreground px-8 py-3.5 rounded-lg text-base font-semibold hover:border-primary hover:text-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
