"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { IconArrowRight, IconCheck, IconMail } from "@/components/icons";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      subject: (fd.get("subject") as string) || "",
      message: fd.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-32 pb-20 bg-background">
        <section className="px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Get in touch
              </h1>
              <p className="text-lg text-muted leading-relaxed">
                Have a question or want to learn more? Send us a message and we&apos;ll
                respond within 24 hours.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-border">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Message sent</h3>
                  <p className="text-muted">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-semibold text-foreground mb-1.5">Name</label>
                      <input type="text" id="contact-name" name="name" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="Your name" />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                      <input type="email" id="contact-email" name="email" required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="you@company.com" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-semibold text-foreground mb-1.5">Subject</label>
                    <input type="text" id="contact-subject" name="subject" className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="What is this regarding?" />
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-semibold text-foreground mb-1.5">Message</label>
                    <textarea id="contact-message" name="message" rows={5} required className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none" placeholder="Tell us what you need help with..." />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors disabled:opacity-60">
                    {loading ? "Sending..." : "Send Message"} <IconArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted">
                <IconMail className="w-4 h-4 inline mr-1" />
                You can also email us directly at{" "}
                <a href="mailto:hello@bconsultedfirst.com" className="text-primary hover:text-accent">
                  hello@bconsultedfirst.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
