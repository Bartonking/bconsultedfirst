"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconArrowRight, IconCheck, IconShield, IconChat, IconClock } from "@/components/icons";

export default function BookPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 bg-background">
        <section className="px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16">
              <div>
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
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg border border-border">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Request received</h3>
                    <p className="text-muted">We&apos;ll get back to you within 24 hours to schedule your consultation.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label htmlFor="book-name" className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                      <input type="text" id="book-name" name="name" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="book-email" className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                      <input type="email" id="book-email" name="email" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="you@company.com" />
                    </div>
                    <div>
                      <label htmlFor="book-store" className="block text-sm font-semibold text-foreground mb-1.5">Shopify Store URL</label>
                      <input type="url" id="book-store" name="storeUrl" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="yourstore.myshopify.com" />
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
                    <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors">
                      Book My Consultation <IconArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
