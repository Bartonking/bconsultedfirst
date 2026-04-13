"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  IconArrowRight,
  IconCheck,
  IconMail,
  IconCalendar,
  IconShield,
  IconGlobe,
  IconClock,
} from "@/components/icons";

interface BookingContext {
  leadId: string;
  reportId: string | null;
  email: string;
  storeName: string | null;
  siteUrl: string;
  challengeArea: string | null;
  source: string;
  overallScore?: number;
}

function BookContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const cancelled = searchParams.get("cancelled");

  const [ctx, setCtx] = useState<BookingContext | null>(null);
  const [ctxLoading, setCtxLoading] = useState(!!token);
  const [ctxError, setCtxError] = useState(false);

  // Subscribe state
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeName, setSubscribeName] = useState("");
  const [subscribeStoreUrl, setSubscribeStoreUrl] = useState("");

  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Form fields for direct access (no token)
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStoreUrl, setFormStoreUrl] = useState("");
  const [formChallenge] = useState("");
  const [formContext] = useState("");

  // Load context from token
  useEffect(() => {
    if (!token) return;
    fetch(`/api/book/context?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Invalid token");
        return res.json();
      })
      .then((data) => {
        setCtx(data);
        setCtxLoading(false);
      })
      .catch(() => {
        setCtxError(true);
        setCtxLoading(false);
      });
  }, [token]);

  async function handleSubscribe() {
    setSubscribing(true);
    setSubscribeError(null);

    const payload = token
      ? { token }
      : {
          email: subscribeEmail,
          name: subscribeName || undefined,
          storeUrl: subscribeStoreUrl || undefined,
        };

    try {
      const res = await fetch("/api/book/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to subscribe");
      }
      setSubscribed(true);
    } catch (err) {
      setSubscribeError(
        err instanceof Error ? err.message : "Failed to subscribe"
      );
    } finally {
      setSubscribing(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);

    const name = ctx?.storeName || formName;
    const email = ctx?.email || formEmail;

    if (!name || !email) {
      setCheckoutError("Name and email are required.");
      setCheckoutLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          name,
          email,
          storeUrl: ctx?.siteUrl || formStoreUrl || undefined,
          challenge: ctx?.challengeArea || formChallenge || undefined,
          context: formContext || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create checkout session");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Something went wrong."
      );
      setCheckoutLoading(false);
    }
  }

  if (ctxLoading) {
    return (
      <main className="flex-1 pt-32 pb-20 bg-background">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-border rounded w-80 mx-auto mb-4" />
            <div className="h-4 bg-border rounded w-60 mx-auto" />
          </div>
        </div>
      </main>
    );
  }

  const hasContext = !!ctx;
  const needsName = hasContext && !ctx?.storeName;

  return (
    <main className="flex-1 pt-32 pb-20 bg-background">
      <section className="px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose your next step
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              {hasContext
                ? "Your audit is complete. Here's what you can do next."
                : "Get personalized guidance for your Shopify operations."}
            </p>
          </div>

          {/* Cancelled notice */}
          {cancelled && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-center">
              <p className="text-sm text-amber-800">
                Payment was cancelled. You can try again when you&apos;re ready.
              </p>
            </div>
          )}

          {/* Token error notice */}
          {ctxError && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-center">
              <p className="text-sm text-amber-800">
                Your booking link has expired or is invalid. You can still book below by entering your details.
              </p>
            </div>
          )}

          {/* Context summary card */}
          {hasContext && (
            <div className="bg-section-alt rounded-xl p-6 mb-10 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconGlobe className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">
                  Your audit summary
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted">Store:</span>{" "}
                  <span className="text-foreground font-medium">
                    {ctx.siteUrl}
                  </span>
                </div>
                <div>
                  <span className="text-muted">Email:</span>{" "}
                  <span className="text-foreground font-medium">
                    {ctx.email}
                  </span>
                </div>
                {ctx.challengeArea && (
                  <div>
                    <span className="text-muted">Challenge:</span>{" "}
                    <span className="text-foreground font-medium capitalize">
                      {ctx.challengeArea.replace(/-/g, " ")}
                    </span>
                  </div>
                )}
                {ctx.overallScore !== undefined && (
                  <div>
                    <span className="text-muted">Score:</span>{" "}
                    <span className="text-foreground font-bold">
                      {ctx.overallScore}/100
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Two option cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Option A: Subscribe */}
            <div className="bg-white rounded-xl border border-border p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconMail className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Stay in the loop
                </h2>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                Get operational insights, Shopify tips, and practical guidance
                delivered to your inbox. No spam, unsubscribe anytime.
              </p>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <IconCheck className="w-4 h-4 text-primary" />
                  <span>Weekly operational tips</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <IconCheck className="w-4 h-4 text-primary" />
                  <span>Shopify best practices</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <IconCheck className="w-4 h-4 text-primary" />
                  <span>Industry insights</span>
                </div>
              </div>

              {subscribed ? (
                <div className="bg-primary/5 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
                    <IconCheck className="w-4 h-4" />
                    You&apos;re subscribed!
                  </div>
                </div>
              ) : (
                <>
                  {!token && (
                    <div className="space-y-3 mb-4">
                      <input
                        type="text"
                        value={subscribeName}
                        onChange={(e) => setSubscribeName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="email"
                        value={subscribeEmail}
                        onChange={(e) => setSubscribeEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={subscribeStoreUrl}
                        onChange={(e) => setSubscribeStoreUrl(e.target.value)}
                        placeholder="yourstore.myshopify.com (optional)"
                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  )}

                  {subscribeError && (
                    <p className="mb-3 text-sm text-red-600">{subscribeError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={subscribing}
                    className="w-full border-2 border-primary text-primary px-6 py-3 rounded-lg text-base font-semibold hover:bg-primary/5 transition-colors disabled:opacity-60"
                  >
                    {subscribing ? "Subscribing..." : "Subscribe to Email List"}
                  </button>
                </>
              )}

              <p className="text-xs text-muted text-center mt-3">Free</p>
            </div>

            {/* Option B: Book Consultation */}
            <div className="bg-white rounded-xl border-2 border-primary p-8 flex flex-col relative">
              <div className="absolute -top-3 left-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                Recommended
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <IconCalendar className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Book a consultation
                </h2>
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6 flex-1">
                30-minute session with a bConsulted operations specialist. Review
                your audit findings and create an actionable improvement plan.
              </p>
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex items-center gap-2 text-muted">
                  <IconShield className="w-4 h-4 text-primary" />
                  <span>1-on-1 with a specialist</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <IconClock className="w-4 h-4 text-primary" />
                  <span>30 minutes, focused on your store</span>
                </div>
                <div className="flex items-center gap-2 text-muted">
                  <IconCheck className="w-4 h-4 text-primary" />
                  <span>Actionable next steps</span>
                </div>
              </div>

              {/* Form fields for direct access or missing token-backed name */}
              {(!hasContext || needsName) && (
                <div className="space-y-3 mb-4">
                  {needsName && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                      Add your name to continue to payment and scheduling.
                    </div>
                  )}

                  {(!hasContext || needsName) && (
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Your name"
                      className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  )}

                  {!hasContext && (
                    <>
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={formStoreUrl}
                        onChange={(e) => setFormStoreUrl(e.target.value)}
                        placeholder="yourstore.myshopify.com (optional)"
                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </>
                  )}
                </div>
              )}

              {checkoutError && (
                <p className="text-sm text-red-600 mb-3">{checkoutError}</p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors disabled:opacity-60"
              >
                {checkoutLoading ? (
                  "Redirecting to payment..."
                ) : (
                  <>
                    Book Consultation &mdash; $50
                    <IconArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-muted text-center mt-3">
                Secure payment via Stripe. Schedule after payment.
              </p>
            </div>
          </div>

          {/* FAQ / trust section */}
          <div className="mt-16 max-w-2xl mx-auto text-center">
            <h3 className="text-lg font-bold text-foreground mb-4">
              What to expect
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 text-sm text-muted">
              <div>
                <p className="font-semibold text-foreground mb-1">
                  No surprises
                </p>
                <p>One-time $50 payment. No subscription or hidden fees.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Honest advice
                </p>
                <p>We&apos;ll tell you what to focus on and what can wait.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">
                  Your schedule
                </p>
                <p>Pick a time that works. Reschedule if plans change.</p>
              </div>
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
      <Suspense
        fallback={
          <main className="flex-1 pt-32 pb-20 bg-background">
            <div className="max-w-6xl mx-auto px-6 text-center">
              <p className="text-muted">Loading...</p>
            </div>
          </main>
        }
      >
        <BookContent />
      </Suspense>
      <Footer />
    </>
  );
}
