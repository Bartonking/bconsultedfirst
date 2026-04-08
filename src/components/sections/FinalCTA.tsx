import { AuditForm } from "@/components/audit/AuditForm";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Get your Shopify audit
        </h2>
        <p className="text-base text-muted leading-relaxed mb-10 max-w-2xl mx-auto">
          If your store is growing and operations are becoming harder to manage,
          this is a practical place to start. Get a preliminary audit, review the
          findings, and decide whether a deeper consultation makes sense.
        </p>
        <div className="max-w-2xl mx-auto">
          <AuditForm compact />
        </div>
      </div>
    </section>
  );
}
