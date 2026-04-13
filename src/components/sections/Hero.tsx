import Image from "next/image";
import { AuditForm } from "@/components/audit/AuditForm";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0f1714] px-6 pt-32 pb-20 text-white md:pt-40 md:pb-28">
      <Image
        src="/images/hero-shopify-audit-ops.svg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="pointer-events-none object-cover object-center opacity-95 select-none"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(106deg,rgba(7,12,10,0.78)_12%,rgba(8,14,11,0.58)_40%,rgba(10,16,13,0.28)_68%,rgba(10,16,13,0.4)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_left_center,rgba(14,28,22,0.24),transparent_58%)]"
      />
      <div className="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-semibold text-primary-pale mb-6 backdrop-blur-sm">
            Free AI-Powered Audit
          </div>
          <h1 className="max-w-xl text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl mb-6">
            See what may be slowing down your{" "}
            <span className="text-[#f2de7c]">Shopify operations</span>
            <span className="text-primary-light">.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-white/80 md:text-xl mb-8">
            Get a free AI-powered preliminary audit of your Shopify store. We review
            public storefront signals to identify workflow friction, structural issues,
            and opportunities to improve how your business runs.
          </p>
          <div className="hidden md:flex flex-col gap-3 text-sm text-white/74">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No Shopify login required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Results in under 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Full report sent to your email
            </div>
          </div>
        </div>
        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 inset-y-6 rounded-[24px] bg-black/30 blur-3xl" />
          <AuditForm />
        </div>
      </div>
    </section>
  );
}
