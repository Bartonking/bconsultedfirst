"use client";

import { useState } from "react";

/* ───────────────────────── ICONS (inline SVG) ───────────────────────── */

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function IconCheck({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconWorkflow({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function IconCatalog({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function IconIntegration({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function IconChart({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconMenu({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconX({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

/* ───────────────────────── LOGO ───────────────────────── */

function Logo({ light = false }: { light?: boolean }) {
  const color = light ? "#ffffff" : "#398860";
  return (
    <a href="#" className="flex items-center gap-3 group" aria-label="bConsulted home">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="14" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="22" cy="14" r="10" stroke={color} strokeWidth="1.5" fill="none" />
        <circle cx="18" cy="21" r="10" stroke={color} strokeWidth="1.5" fill="none" />
      </svg>
      <span className={`text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"}`}>
        bConsulted
      </span>
    </a>
  );
}

/* ───────────────────────── NAV ───────────────────────── */

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Is This You?", href: "#signs" },
];

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
          >
            Get Started <IconArrowRight className="w-4 h-4" />
          </a>
        </div>
        <button
          className="md:hidden p-2 rounded-lg hover:bg-section-alt transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <IconX /> : <IconMenu />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-6 pt-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-3 text-base font-semibold text-muted hover:text-primary transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="mt-3 inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
            onClick={() => setOpen(false)}
          >
            Get Started <IconArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </header>
  );
}

/* ───────────────────────── HERO ───────────────────────── */

function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-4">
          Shopify Operations Consulting
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
          Shopify operations,{" "}
          <span className="text-primary">cleaned up.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mb-8 leading-relaxed">
          We help growing Shopify merchants fix workflow bottlenecks, reduce
          manual work, and build reliable back-office systems their teams can
          actually trust.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors"
          >
            Book a Discovery Call <IconArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#services"
            className="inline-flex items-center justify-center gap-2 border-2 border-border text-foreground px-8 py-3.5 rounded-lg text-base font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            See How We Help
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PROBLEM STATEMENT ───────────────────────── */

function ProblemStatement() {
  return (
    <section className="py-16 md:py-20 px-6 bg-section-alt">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
          Growth gets blocked by messy operations — not bad storefronts.
        </h2>
        <p className="text-base md:text-lg text-muted max-w-3xl mx-auto leading-relaxed">
          Most Shopify merchants spend too much time fixing preventable admin
          problems. Orders need manual checking. Reports don&apos;t match. Your
          accounting software tells a different story than Shopify. The team
          relies on Slack, spreadsheets, and memory to keep things running.
          That&apos;s where we come in.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────── SERVICES ───────────────────────── */

const SERVICES = [
  {
    icon: IconWorkflow,
    title: "Order Workflow Automation",
    description:
      "Eliminate manual order checking, inconsistent exception handling, and unclear fulfillment handoffs. We design workflows that process orders reliably without constant human intervention.",
  },
  {
    icon: IconCatalog,
    title: "Catalog & Inventory Cleanup",
    description:
      "Fix inconsistent tagging, messy collections, unreliable product types, and inaccurate inventory signals. Clean catalog structure means better reporting and fewer downstream errors.",
  },
  {
    icon: IconIntegration,
    title: "System Integration",
    description:
      "Connect Shopify to QuickBooks, ERPs, invoicing systems, and document workflows. We map data flows, build integration logic, and ensure your systems actually talk to each other.",
  },
  {
    icon: IconChart,
    title: "Reporting & Visibility",
    description:
      "Build operational dashboards your team can trust. No more metrics that differ between reports, leadership flying blind, or finding issues too late.",
  },
];

function Services() {
  return (
    <section id="services" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            From order chaos to operational clarity
          </h2>
          <p className="text-base text-muted leading-relaxed">
            We focus on the four problem areas that cost growing Shopify
            merchants the most time, money, and headaches.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-card-bg border border-border rounded-xl p-8 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary-pale rounded-lg flex items-center justify-center mb-5">
                <service.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PROCESS ───────────────────────── */

const STEPS = [
  {
    number: "01",
    title: "Diagnose",
    description:
      "We review your current tools, admin setup, and workflows. We identify business pain, inspect real examples, and define what success looks like.",
  },
  {
    number: "02",
    title: "Map",
    description:
      "We map your current workflows, identify bottlenecks and data problems, define the target process, and separate quick wins from deeper work.",
  },
  {
    number: "03",
    title: "Build",
    description:
      "We configure, automate, integrate, document, and test. Everything is built to run without us — you own the result, not a dependency.",
  },
  {
    number: "04",
    title: "Handoff",
    description:
      "We train your team, deliver SOPs, explain what changed and what to monitor. Then we review performance and propose next steps.",
  },
];

function Process() {
  return (
    <section id="process" className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            A repeatable process, not a guessing game
          </h2>
          <p className="text-base text-muted leading-relaxed">
            Every engagement follows the same proven method — diagnose the
            problem, map the solution, build it, and hand it off cleanly.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <span className="text-5xl font-bold text-primary/15 block mb-3">
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── SIGNS / SOCIAL PROOF ───────────────────────── */

const SIGNS = [
  "Your team checks every order manually before fulfillment",
  "Reports from Shopify don\u2019t match your accounting numbers",
  "Catalog tags and collections are inconsistent or outdated",
  "You rely on spreadsheets to track things Shopify should handle",
  "Customer service has no clear internal process for exceptions",
  "Inventory signals are inaccurate and causing stockout or overstock",
  "Nobody can explain how data flows between your systems",
  "Leadership makes decisions based on numbers they don\u2019t trust",
];

function Signs() {
  return (
    <section id="signs" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="max-w-2xl mb-10">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Is This You?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Signs your Shopify operations need a redesign
          </h2>
          <p className="text-base text-muted leading-relaxed">
            If three or more of these sound familiar, you&apos;re leaving money on
            the table — and probably burning out your team in the process.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {SIGNS.map((sign) => (
            <div
              key={sign}
              className="flex items-start gap-4 bg-card-bg border border-border rounded-lg p-5"
            >
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <IconCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">{sign}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── WHO WE SERVE ───────────────────────── */

function WhoWeServe() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
              Who We Work With
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Built for merchants who&apos;ve outgrown duct tape
            </h2>
            <p className="text-base text-muted leading-relaxed mb-6">
              We work best with Shopify merchants who are already making
              consistent sales but whose back-office processes haven&apos;t kept up
              with growth. Not brand new. Not giant enterprise. The messy
              middle — where the pain is real and the opportunity is biggest.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                title: "Multi-SKU retail brands",
                desc: "Complex catalogs, high order volumes, lots of product data to keep clean.",
              },
              {
                title: "Wholesale & B2B-B2C hybrid merchants",
                desc: "Multiple sales channels, different pricing logic, inventory shared across storefronts.",
              },
              {
                title: "Admin-heavy product businesses",
                desc: "Custom orders, complex fulfillment rules, lots of manual steps that should be automated.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card-bg rounded-xl p-6 border border-border"
              >
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PRICING ───────────────────────── */

const PACKAGES = [
  {
    name: "Ops Audit",
    tagline: "For merchants who need clarity first",
    price: "2,000",
    features: [
      "90-minute discovery session",
      "Workflow & admin assessment",
      "Catalog structure review",
      "Top risks & bottlenecks identified",
      "Prioritized improvement roadmap",
    ],
    cta: "Book an Audit",
    featured: false,
  },
  {
    name: "Workflow Sprint",
    tagline: "For merchants who need one problem fixed fast",
    price: "6,000",
    features: [
      "Focused workflow design & build",
      "Implementation of one solution",
      "Testing & team handoff",
      "SOP documentation",
      "2 weeks post-launch support",
    ],
    cta: "Start a Sprint",
    featured: true,
  },
  {
    name: "Ops Backbone",
    tagline: "For merchants whose back office needs structure",
    price: "12,000",
    features: [
      "Full process mapping",
      "Automation setup",
      "Reporting structure build",
      "Integration planning & execution",
      "Rollout support & documentation",
    ],
    cta: "Build Your Backbone",
    featured: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Pricing
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Clear scope. Fixed price. No surprises.
          </h2>
          <p className="text-base text-muted leading-relaxed">
            We price by outcome, not by hour. You know what you&apos;re getting and
            what it costs before we start.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-xl p-8 flex flex-col ${
                pkg.featured
                  ? "bg-primary text-white ring-2 ring-primary shadow-xl"
                  : "bg-card-bg border border-border"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-1 ${
                  pkg.featured ? "text-white" : "text-foreground"
                }`}
              >
                {pkg.name}
              </h3>
              <p
                className={`text-sm mb-6 ${
                  pkg.featured ? "text-white/80" : "text-muted"
                }`}
              >
                {pkg.tagline}
              </p>
              <div className="mb-6">
                <span
                  className={`text-sm ${
                    pkg.featured ? "text-white/70" : "text-muted"
                  }`}
                >
                  Starting at
                </span>
                <div
                  className={`text-4xl font-bold ${
                    pkg.featured ? "text-white" : "text-foreground"
                  }`}
                >
                  ${pkg.price}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <IconCheck
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        pkg.featured ? "text-primary-light" : "text-primary"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        pkg.featured ? "text-white/90" : "text-muted"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  pkg.featured
                    ? "bg-white text-primary hover:bg-primary-pale"
                    : "bg-primary text-white hover:bg-accent"
                }`}
              >
                {pkg.cta} <IconArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted mt-10">
          Need ongoing support? We offer monthly retainers starting at
          $1,250/mo for continuous optimization, dashboard refinement, and
          workflow tuning.
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────── CONTACT / FORM ───────────────────────── */

function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-20 md:py-28 px-6 bg-primary">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="text-white">
            <p className="text-primary-light font-semibold text-sm tracking-wide uppercase mb-3">
              Let&apos;s Talk
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to clean up your operations?
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-8">
              Tell us what&apos;s going on. We&apos;ll schedule a 30-minute discovery
              call to understand your situation and figure out if we&apos;re the
              right fit.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <IconCheck className="w-5 h-5 text-primary-light" />
                <span className="text-white/90 text-sm">No-pressure conversation</span>
              </div>
              <div className="flex items-center gap-3">
                <IconCheck className="w-5 h-5 text-primary-light" />
                <span className="text-white/90 text-sm">We&apos;ll tell you honestly if we can help</span>
              </div>
              <div className="flex items-center gap-3">
                <IconCheck className="w-5 h-5 text-primary-light" />
                <span className="text-white/90 text-sm">Typical response within 24 hours</span>
              </div>
            </div>
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-white/70 text-sm mb-3">
                Prefer to book a time directly?
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors"
              >
                Schedule on Calendly <IconArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-xl">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconCheck className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Message sent!
                </h3>
                <p className="text-muted">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <label htmlFor="store" className="block text-sm font-semibold text-foreground mb-1.5">
                    Shopify Store URL <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="store"
                    name="store"
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="yourstore.myshopify.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-1.5">
                    What&apos;s going on?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Tell us about your biggest operational pain point..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-sm font-semibold hover:bg-accent transition-colors"
                >
                  Send Message <IconArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── FOOTER ───────────────────────── */

function Footer() {
  return (
    <footer className="py-12 px-6 bg-foreground">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Logo light />
        <p className="text-white/50 text-sm">
          &copy; {new Date().getFullYear()} bConsulted. All rights reserved.
        </p>
        <div className="flex gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/50 text-sm hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <ProblemStatement />
        <Services />
        <Process />
        <Signs />
        <WhoWeServe />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
