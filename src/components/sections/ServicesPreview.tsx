import Link from "next/link";
import { IconArrowRight } from "@/components/icons";

const SERVICES = [
  {
    title: "Shopify Ops Audit",
    description: "A deeper human-led review of workflows, bottlenecks, and operational risks.",
  },
  {
    title: "Workflow Sprint",
    description: "A focused engagement to improve one operational area quickly and clearly.",
  },
  {
    title: "Ops Backbone Setup",
    description: "Structured support for businesses that need stronger reporting, systems, and process foundations.",
  },
  {
    title: "Ongoing Support",
    description: "Continued guidance and improvement for merchants who want operational consistency over time.",
  },
];

export function ServicesPreview() {
  return (
    <section className="py-20 md:py-28 px-6 bg-section-alt">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Services
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How we help beyond the audit
          </h2>
          <p className="text-base text-muted leading-relaxed">
            The audit is the starting point. Our consulting work helps merchants turn
            findings into stronger operational systems.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.title}
              className="bg-card-bg border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <h3 className="text-base font-bold text-foreground mb-3">{service.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors"
          >
            Explore Services <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
