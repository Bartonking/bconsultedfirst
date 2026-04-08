import type { AuditReport, Lead, AuditJob, Consultation } from "./types";

export const MOCK_AUDIT_REPORT: AuditReport = {
  id: "rpt-001",
  jobId: "job-001",
  storeUrl: "example-brand.myshopify.com",
  executiveSummary:
    "Your store shows strong product presentation but has significant opportunities in catalog organization and operational visibility. Navigation structure could be simplified, and several trust signals are missing from product pages. Operational maturity indicators suggest manual processes may be creating unnecessary friction.",
  overallScore: 62,
  categories: [
    {
      name: "Storefront Clarity",
      score: 78,
      maxScore: 100,
      summary: "Homepage communicates value proposition clearly. Hero messaging is strong but could be more specific about target customer.",
    },
    {
      name: "Catalog Structure",
      score: 55,
      maxScore: 100,
      summary: "Collection hierarchy is flat with overlapping categories. Product tagging is inconsistent across collections.",
    },
    {
      name: "Product Trust",
      score: 68,
      maxScore: 100,
      summary: "Product imagery is good but descriptions lack detail. Reviews are present but sparse. Missing trust badges on key pages.",
    },
    {
      name: "Operational Signals",
      score: 45,
      maxScore: 100,
      summary: "Shipping information is vague. Return policy is hard to find. Inventory signals suggest manual stock management.",
    },
    {
      name: "Opportunity Level",
      score: 72,
      maxScore: 100,
      summary: "Strong brand foundation with clear improvement paths in operations and catalog organization.",
    },
  ],
  findings: [
    {
      category: "Catalog Structure",
      observation: "Collections use inconsistent naming patterns and overlapping product assignments. Some products appear in 4+ collections without clear hierarchy.",
      whyItMatters: "Catalog disorder creates downstream reporting errors, makes inventory management harder, and confuses the browse experience for customers.",
      recommendation: "Audit and restructure collection taxonomy. Define a clear hierarchy: department > category > subcategory. Remove duplicate product assignments.",
      severity: "high",
    },
    {
      category: "Operational Signals",
      observation: "Shipping timelines are listed as 'varies' with no structured delivery estimates. Order tracking appears to be manual based on the tracking page structure.",
      whyItMatters: "Vague fulfillment signals indicate potential manual processes. This creates customer service load and reduces repeat purchase confidence.",
      recommendation: "Implement structured shipping tiers with clear delivery windows. Consider automating tracking notifications through your fulfillment workflow.",
      severity: "high",
    },
    {
      category: "Product Trust",
      observation: "Product pages are missing trust badges, warranty information, and structured specifications. Only 40% of products have reviews visible.",
      whyItMatters: "Incomplete product pages reduce conversion rates and increase return rates. Missing social proof makes purchase decisions harder.",
      recommendation: "Add structured specifications, trust badges, and warranty info to product page template. Enable review collection for all products.",
      severity: "medium",
    },
    {
      category: "Storefront Clarity",
      observation: "Homepage hero section effectively communicates brand identity but lacks a clear operational or service differentiator.",
      whyItMatters: "Visitors may not understand what makes your brand operationally strong. This matters for B2B buyers and repeat customers who value reliability.",
      recommendation: "Add a value bar below the hero highlighting delivery speed, return policy, and customer service responsiveness.",
      severity: "low",
    },
    {
      category: "Conversion Friction",
      observation: "Cart page has no urgency signals, no cross-sell recommendations, and requires 4 clicks to reach checkout from a product page.",
      whyItMatters: "Extra clicks in the purchase flow increase abandonment. Missing cart recommendations leave revenue on the table.",
      recommendation: "Streamline the path to checkout. Add contextual cross-sells on the cart page. Consider implementing a slide-out cart.",
      severity: "medium",
    },
  ],
  recommendations: [
    "Restructure catalog taxonomy to create clear collection hierarchy",
    "Implement automated shipping notifications and structured delivery estimates",
    "Add trust badges, specifications, and review prompts to all product pages",
    "Simplify the path from product page to checkout",
    "Book a consultation for a deeper operational review of fulfillment workflows",
  ],
  createdAt: "2026-04-07T10:30:00Z",
};

export const MOCK_LEADS: Lead[] = [
  {
    id: "lead-001",
    email: "jennifer@example-brand.com",
    siteUrl: "example-brand.myshopify.com",
    storeName: "Example Brand Co",
    challengeArea: "inventory-catalog",
    consentStatus: true,
    createdAt: "2026-04-07T10:00:00Z",
  },
  {
    id: "lead-002",
    email: "marcus@outdoor-gear.com",
    siteUrl: "outdoor-gear-supply.myshopify.com",
    storeName: "Outdoor Gear Supply",
    challengeArea: "order-operations",
    consentStatus: true,
    createdAt: "2026-04-06T14:22:00Z",
  },
  {
    id: "lead-003",
    email: "sarah@modernhome.co",
    siteUrl: "modernhome.myshopify.com",
    challengeArea: "reporting",
    consentStatus: true,
    createdAt: "2026-04-06T09:15:00Z",
  },
  {
    id: "lead-004",
    email: "alex@petwell.store",
    siteUrl: "petwell-supplies.myshopify.com",
    storeName: "PetWell Supplies",
    challengeArea: "systems-integrations",
    consentStatus: true,
    createdAt: "2026-04-05T16:40:00Z",
  },
  {
    id: "lead-005",
    email: "diana@handmade-jewelry.com",
    siteUrl: "handmade-jewelry.myshopify.com",
    storeName: "Handmade Jewelry Co",
    challengeArea: "general-operations",
    consentStatus: true,
    createdAt: "2026-04-05T11:05:00Z",
  },
];

export const MOCK_JOBS: AuditJob[] = [
  { id: "job-001", leadId: "lead-001", status: "complete", startedAt: "2026-04-07T10:00:05Z", completedAt: "2026-04-07T10:03:22Z" },
  { id: "job-002", leadId: "lead-002", status: "complete", startedAt: "2026-04-06T14:22:10Z", completedAt: "2026-04-06T14:25:45Z" },
  { id: "job-003", leadId: "lead-003", status: "processing", startedAt: "2026-04-06T09:15:08Z" },
  { id: "job-004", leadId: "lead-004", status: "pending" },
  { id: "job-005", leadId: "lead-005", status: "failed", startedAt: "2026-04-05T11:05:12Z", errorMessage: "Unable to access storefront" },
];

export const MOCK_CONSULTATIONS: Consultation[] = [
  { id: "con-001", leadId: "lead-001", consultationStatus: "scheduled", bookedAt: "2026-04-10T14:00:00Z", notes: "Interested in catalog restructuring" },
  { id: "con-002", leadId: "lead-002", consultationStatus: "requested", notes: "Wants to discuss order automation" },
];
