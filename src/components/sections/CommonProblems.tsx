import { IconWorkflow, IconCatalog, IconShield, IconChart, IconWarning, IconSearch } from "@/components/icons";

const PROBLEMS = [
  {
    icon: IconWorkflow,
    title: "Manual order handling",
    description: "Teams rely on workarounds because processes are not clearly structured.",
  },
  {
    icon: IconCatalog,
    title: "Catalog disorder",
    description: "Collections, product types, tags, and product organization create friction for customers and staff.",
  },
  {
    icon: IconShield,
    title: "Weak product trust signals",
    description: "Incomplete or inconsistent product presentation can affect both conversion and operational consistency.",
  },
  {
    icon: IconChart,
    title: "Reporting gaps",
    description: "Teams lack confidence in what the numbers are actually saying.",
  },
  {
    icon: IconWarning,
    title: "Hidden operational strain",
    description: "The store functions, but only because the team is compensating behind the scenes.",
  },
  {
    icon: IconSearch,
    title: "Unclear next steps",
    description: "Merchants know something feels inefficient but do not know where to begin.",
  },
];

export function CommonProblems() {
  return (
    <section className="py-20 md:py-28 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <p className="text-primary font-semibold text-sm tracking-wide uppercase mb-3">
            Common Issues
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Common problems we identify
          </h2>
          <p className="text-base text-muted leading-relaxed">
            While every store is different, there are patterns that show up again
            and again in growing Shopify businesses.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="bg-card-bg border border-border rounded-xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="w-11 h-11 bg-primary-pale rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{problem.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
