import { IconCheck } from "@/components/icons";
import { SampleReportPreview } from "@/components/audit/SampleReportPreview";

const DELIVERABLES = [
  "Executive summary with the biggest opportunities we found",
  "Category scores across key store and operations areas",
  "Top findings with clear explanations",
  "Recommended next steps to improve workflow and reduce friction",
  "Consultation invitation if you want a deeper review",
];

export function WhatYouReceive() {
  return (
    <section className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
              What You&apos;ll Receive
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What you&apos;ll receive
            </h2>
            <p className="text-base text-muted leading-relaxed mb-8">
              Your audit is designed to give you fast, practical insight — not generic AI fluff.
            </p>
            <ul className="space-y-4 mb-8">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <IconCheck className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted leading-relaxed">
              The goal is simple: help you quickly understand where your Shopify operations
              may need attention and what to do next.
            </p>
          </div>
          <div>
            <SampleReportPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
