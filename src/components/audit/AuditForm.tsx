"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconArrowRight } from "@/components/icons";
import { CHALLENGE_OPTIONS } from "@/lib/constants";

export function AuditForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate navigation to processing page
    setTimeout(() => {
      router.push("/audit/processing");
    }, 500);
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <input
          type="url"
          name="storeUrl"
          required
          placeholder="yourstore.myshopify.com"
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-60"
        >
          {loading ? "Starting..." : "Get My Audit"} <IconArrowRight className="w-4 h-4" />
        </button>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-xl border border-border">
      <h3 className="text-lg font-bold text-foreground mb-1">Get Your Free Audit</h3>
      <p className="text-sm text-muted mb-6">No login required. Based on public storefront review.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="audit-email" className="block text-sm font-semibold text-foreground mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            id="audit-email"
            name="email"
            required
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="you@company.com"
          />
        </div>
        <div>
          <label htmlFor="audit-store" className="block text-sm font-semibold text-foreground mb-1.5">
            Shopify Store URL
          </label>
          <input
            type="url"
            id="audit-store"
            name="storeUrl"
            required
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="yourstore.myshopify.com"
          />
        </div>
        <div>
          <label htmlFor="audit-challenge" className="block text-sm font-semibold text-foreground mb-1.5">
            Biggest Challenge
          </label>
          <select
            id="audit-challenge"
            name="challenge"
            className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            {CHALLENGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3.5 rounded-lg text-base font-semibold hover:bg-accent transition-colors disabled:opacity-60"
        >
          {loading ? "Starting Audit..." : "Get My Audit"} <IconArrowRight className="w-4 h-4" />
        </button>
        <p className="text-xs text-muted text-center">
          Your report will be generated using public store review and sent to your email.
        </p>
      </form>
    </div>
  );
}
