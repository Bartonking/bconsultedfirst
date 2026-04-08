import type { AuditReport, AuditCategory, AuditFinding } from "./types";

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickSeverity(score: number): "low" | "medium" | "high" {
  if (score < 50) return "high";
  if (score < 70) return "medium";
  return "low";
}

const CATEGORY_TEMPLATES: Array<{
  name: string;
  baseScore: [number, number];
  summaryGood: string;
  summaryBad: string;
  finding: Omit<AuditFinding, "severity">;
}> = [
  {
    name: "Storefront Clarity",
    baseScore: [60, 90],
    summaryGood:
      "Homepage communicates value proposition clearly with strong brand identity and messaging.",
    summaryBad:
      "Homepage messaging is generic and does not clearly differentiate the brand or target customer.",
    finding: {
      category: "Storefront Clarity",
      observation:
        "Homepage hero section communicates brand identity but lacks a clear operational or service differentiator.",
      whyItMatters:
        "Visitors may not understand what makes your brand stand out. This matters for repeat customers who value reliability.",
      recommendation:
        "Add a value bar below the hero highlighting delivery speed, return policy, and customer service responsiveness.",
    },
  },
  {
    name: "Catalog Structure",
    baseScore: [40, 75],
    summaryGood:
      "Collection hierarchy is well-organized with clear category paths and consistent product assignments.",
    summaryBad:
      "Collection hierarchy is flat with overlapping categories. Product tagging is inconsistent across collections.",
    finding: {
      category: "Catalog Structure",
      observation:
        "Collections use inconsistent naming patterns and overlapping product assignments. Some products appear in multiple collections without clear hierarchy.",
      whyItMatters:
        "Catalog disorder creates downstream reporting errors, makes inventory management harder, and confuses the browse experience.",
      recommendation:
        "Audit and restructure collection taxonomy. Define a clear hierarchy: department > category > subcategory.",
    },
  },
  {
    name: "Product Trust",
    baseScore: [50, 85],
    summaryGood:
      "Product pages have strong imagery, detailed descriptions, and visible social proof.",
    summaryBad:
      "Product pages are missing trust badges, structured specifications, and have sparse reviews.",
    finding: {
      category: "Product Trust",
      observation:
        "Product pages are missing trust badges, warranty information, and structured specifications. Review coverage is limited.",
      whyItMatters:
        "Incomplete product pages reduce conversion rates and increase return rates. Missing social proof makes purchase decisions harder.",
      recommendation:
        "Add structured specifications, trust badges, and warranty info to product page template. Enable review collection for all products.",
    },
  },
  {
    name: "Operational Signals",
    baseScore: [35, 70],
    summaryGood:
      "Clear shipping tiers, accessible return policy, and structured fulfillment indicators.",
    summaryBad:
      "Shipping information is vague. Return policy is hard to find. Inventory signals suggest manual stock management.",
    finding: {
      category: "Operational Signals",
      observation:
        "Shipping timelines are listed as 'varies' with no structured delivery estimates. Order tracking appears to be manual.",
      whyItMatters:
        "Vague fulfillment signals indicate potential manual processes. This creates customer service load and reduces repeat purchase confidence.",
      recommendation:
        "Implement structured shipping tiers with clear delivery windows. Automate tracking notifications through your fulfillment workflow.",
    },
  },
  {
    name: "Opportunity Level",
    baseScore: [55, 85],
    summaryGood:
      "Strong brand foundation with clear growth paths and good operational maturity.",
    summaryBad:
      "Strong brand foundation but significant improvement paths exist in operations and catalog organization.",
    finding: {
      category: "Conversion Friction",
      observation:
        "Cart page has no urgency signals, no cross-sell recommendations, and the path to checkout requires extra clicks.",
      whyItMatters:
        "Extra clicks in the purchase flow increase abandonment. Missing cart recommendations leave revenue on the table.",
      recommendation:
        "Streamline the path to checkout. Add contextual cross-sells on the cart page. Consider implementing a slide-out cart.",
    },
  },
];

// Weight certain categories higher when a challenge area is selected
const CHALLENGE_WEIGHTS: Record<string, Record<string, number>> = {
  "inventory-catalog": { "Catalog Structure": -15, "Operational Signals": -10 },
  "order-operations": { "Operational Signals": -20 },
  reporting: { "Operational Signals": -10, "Catalog Structure": -10 },
  "systems-integrations": { "Operational Signals": -15 },
  "general-operations": {},
};

export function generateMockReport(
  storeUrl: string,
  challengeArea?: string
): Omit<AuditReport, "id" | "jobId" | "createdAt"> {
  const weights = CHALLENGE_WEIGHTS[challengeArea || ""] || {};

  const categories: AuditCategory[] = CATEGORY_TEMPLATES.map((tpl) => {
    const adjustment = weights[tpl.name] || 0;
    const score = Math.max(
      20,
      Math.min(95, rand(tpl.baseScore[0], tpl.baseScore[1]) + adjustment)
    );
    return {
      name: tpl.name,
      score,
      maxScore: 100,
      summary: score >= 65 ? tpl.summaryGood : tpl.summaryBad,
    };
  });

  const overallScore = Math.round(
    categories.reduce((sum, c) => sum + c.score, 0) / categories.length
  );

  const findings: AuditFinding[] = CATEGORY_TEMPLATES.map((tpl, i) => ({
    ...tpl.finding,
    severity: pickSeverity(categories[i].score),
  }));

  // Sort findings by severity: high first
  const severityOrder = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const recommendations = [
    "Restructure catalog taxonomy to create clear collection hierarchy",
    "Implement automated shipping notifications and structured delivery estimates",
    "Add trust badges, specifications, and review prompts to all product pages",
    "Simplify the path from product page to checkout",
    "Book a consultation for a deeper operational review of fulfillment workflows",
  ];

  const executiveSummary =
    overallScore >= 70
      ? `Your store shows strong operational fundamentals with a few targeted areas for improvement. The storefront communicates value effectively, and catalog organization is solid. Focus on refining fulfillment visibility and product page trust signals to move from good to great.`
      : overallScore >= 50
        ? `Your store shows solid product presentation but has significant opportunities in catalog organization and operational visibility. Navigation structure could be simplified, and several trust signals are missing from product pages. Operational maturity indicators suggest manual processes may be creating unnecessary friction.`
        : `Your store has foundational elements in place but needs attention across several operational areas. Catalog structure, fulfillment visibility, and product page completeness all show room for improvement. Addressing these systematically will reduce customer friction and support scalable growth.`;

  return {
    storeUrl,
    executiveSummary,
    overallScore,
    categories,
    findings,
    recommendations,
  };
}
