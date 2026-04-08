import { IconMail, IconSearch, IconChart } from "@/components/icons";

const STEPS = [
  {
    number: "01",
    icon: IconMail,
    title: "Enter your email and Shopify store URL",
    description: "Tell us where to send the audit and which store to review.",
  },
  {
    number: "02",
    icon: IconSearch,
    title: "We generate your preliminary audit",
    description: "Our system reviews public storefront signals and uses a structured framework to identify likely issues and opportunities.",
  },
  {
    number: "03",
    icon: IconChart,
    title: "Get your report and next steps",
    description: "You\u2019ll receive a summary on screen and the full report by email, along with the option to book a deeper consultation.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How it works
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="relative">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <step.icon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-4xl font-bold text-primary/15 block mb-2">
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
