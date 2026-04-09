"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconArrowRight, IconCheck, IconShield, IconChat, IconClock } from "@/components/icons";

interface BookingData {
  consultationId: string;
  name: string;
  email: string;
}

function CalendlyEmbed({ name, email, consultationId }: BookingData) {
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;

  useEffect(() => {
    if (!calendlyUrl) return;

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [calendlyUrl]);

  if (!calendlyUrl) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Calendar scheduling is not yet configured.</p>
      </div>
    );
  }

  const fullUrl = `${calendlyUrl}?hide_gdpr_banner=1&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&utm_content=${encodeURIComponent(consultationId)}`;

  return (
    <div
      className="calendly-inline-widget"
      data-url={fullUrl}
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}

function BookContent() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  const prefillName = searchParams.get("name") || "";
  const prefillEmail = searchParams.get("email") || "";
  const prefillStoreUrl = searchParams.get("storeUrl") || "";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const payload = {
      name,
      email,
      storeUrl: (fd.get("storeUrl") as string) || "",
      teamSize: (fd.get("teamSize") as string) || undefined,
      challenge: (fd.get("challenge") as string) || undefined,
      context: (fd.get("context") as string) || undefined,
    };

    try {
      const res = await fetch("/api/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit. Please try again.");

      const data = await res.json();
      setBookingData({
        consultationId: data.consultationId,
        name: data.name,
        email: data.email,
      });
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 pt-32 pb-20 bg-background">
      <section className="px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Left Column */}
            <div>
              {step === 1 ? (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Book a consultation
                  </h1>
                  <p className="text-lg text-muted leading-relaxed mb-8">
                    Tell us about your situation. We&apos;ll schedule a 30-minute discovery
                    call to understand your operations and figure out if we&apos;re the right fit.
                  </p>

                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconShield className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">No-pressure conversation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconChat className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">We&apos;ll tell you honestly if we can help</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconClock className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">Typical response within 24 hours</span>
                    </div>
                  </div>

                  <div className="bg-section-alt rounded-xl p-6">
                    <p className="text-sm text-muted mb-2">Haven&apos;t done the audit yet?</p>
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-accent transition-colors"
                    >
                      Get your free audit first <IconArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                    Pick a time
                  </h1>
                  <p className="text-lg text-muted leading-relaxed mb-8">
                    Choose a 30-minute slot that works for you. After scheduling,
                    you&apos;ll receive a calendar invite with a Google Meet link.
                  </p>

                  {bookingData && (
                    <div className="bg-section-alt rounded-xl p-6 mb-6">
                      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Your Details</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-foreground"><span className="text-muted">Name:</span> {bookingData.name}</p>
                        <p className="text-foreground"><span className="text-muted">Email:</span> {bookingData.email}</p>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-primary hover:text-accent transition-colors"
                  >
                    &larr; Back to form
                  </button>
                </>
              )}
            </div>

            {/* Right Column */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-border">
              {step === 1 ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">1</div>
                      <span className="text-xs font-semibold text-foreground">Your info</span>
                    </div>
                    <div className="flex-1 h-px bg-border" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-border text-muted text-xs font-bold flex items-center justify-center">2</div>
                      <span className="text-xs text-muted">Schedule</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="book-name" className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                    <input type="text" id="book-name" name="name" required defaultValue={prefillName} className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Your name" />
                  </div>
                  <div>
                    <label htmlFor="book-email" className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                    <input type="email" id="book-email" name="email" required defaultValue={prefillEmail} className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="you@company.com" />
                  </div>
                  <div>
                    <label htmlFor="book-store" className="block text-sm font-semibold text-foreground mb-1.5">Shopify Store URL</label>
                    <input type="url" id="book-store" name="storeUrl" defaultValue={prefillStoreUrl} className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="yourstore.myshopify.com" />
                  </div>
                  <div>
                    <label htmlFor="book-team" className="block text-sm font-semibold text-foreground mb-1.5">Team Size</label>
                    <select id="book-team" name="teamSize" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 people</option>
                      <option value="6-15">6-15 people</option>
                      <option value="16-50">16-50 people</option>
                      <option value="50+">50+ people</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="book-challenge" className="block text-sm font-semibold text-foreground mb-1.5">Main Challenge</label>
                    <select id="book-challenge" name="challenge" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white">
                      <option value="">Select main challenge</option>
                      <option value="order-operations">Order operations</option>
                      <option value="catalog">Inventory / catalog</option>
                      <option value="reporting">Reporting / visibility</option>
                      <option value="integrations">Systems / integrations</option>
                      <option value="general">General operations</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="book-context" className="block text-sm font-semibold text-foreground mb-1.5">Additional Context</label>
                    <textarea id="book-context" name="context" rows={3} className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" placeholder="Tell us more about your situation..." />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors disabled:opacity-60">
                    {loading ? "Submitting..." : "Continue to Scheduling"} <IconArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : bookingData ? (
                <>
                  {/* Step indicator */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        <IconCheck className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-muted">Your info</span>
                    </div>
                    <div className="flex-1 h-px bg-primary" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">2</div>
                      <span className="text-xs font-semibold text-foreground">Schedule</span>
                    </div>
                  </div>

                  <CalendlyEmbed
                    consultationId={bookingData.consultationId}
                    name={bookingData.name}
                    email={bookingData.email}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BookPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <main className="flex-1 pt-32 pb-20 bg-background">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-muted">Loading...</p>
          </div>
        </main>
      }>
        <BookContent />
      </Suspense>
      <Footer />
    </>
  );
}
