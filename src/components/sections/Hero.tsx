import { AuditForm } from "@/components/audit/AuditForm";

export function Hero() {
  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary-pale text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Free AI-Powered Audit
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
            See what may be slowing down your Shopify operations<span className="text-primary">.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-xl mb-8 leading-relaxed">
            Get a free AI-powered preliminary audit of your Shopify store. We review
            public storefront signals to identify workflow friction, structural issues,
            and opportunities to improve how your business runs.
          </p>
          <div className="hidden md:flex flex-col gap-3 text-sm text-muted">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No Shopify login required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Results in under 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Full report sent to your email
            </div>
          </div>
        </div>
        <div>
          <AuditForm />
        </div>
      </div>
    </section>
  );
}
