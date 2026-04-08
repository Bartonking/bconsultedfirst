# bConsulted First — Site Update 1: Audit-Led Website Redesign

## Document Purpose

Complete sitemap, wireframe plan, component architecture, content strategy, and design strategy for transforming the current single-page consultancy site into a multi-page audit-led lead generation website.

**Framework:** Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
**Current state:** Single-page landing at `src/app/page.tsx` (~1033 lines, all inline)

---

# 1. Sitemap

## Public Pages

| # | Route | Page | Purpose |
|---|-------|------|---------|
| 1 | `/` | Home | Primary conversion page — audit form, value prop, social proof |
| 2 | `/how-it-works` | How the Audit Works | Explain audit process, build trust, set expectations |
| 3 | `/who-its-for` | Who It's For | Qualify visitors, show fit/not-fit |
| 4 | `/services` | Services | Show service ladder: audit → sprint → backbone → support |
| 5 | `/about` | About | Company POV, credibility, operations-first philosophy |
| 6 | `/faq` | FAQ | Handle objections, reduce friction |
| 7 | `/book` | Book Consultation | Consultation form + optional Calendly embed |
| 8 | `/contact` | Contact | General inquiry form |
| 9 | `/privacy` | Privacy Policy | Legal |
| 10 | `/terms` | Terms of Service | Legal |

## Functional Pages (Audit Flow)

| # | Route | Page | Purpose |
|---|-------|------|---------|
| 11 | `/audit/processing` | Audit Processing | Loading/progress state while audit runs |
| 12 | `/audit/results/[id]` | Audit Results | Summary scores, findings, report-sent confirmation |
| 13 | `/audit/thank-you` | Thank You | Post-audit confirmation + consultation CTA |

## Admin Pages (Internal/Protected)

| # | Route | Page | Purpose |
|---|-------|------|---------|
| 14 | `/admin` | Lead Dashboard | List leads, status, audit results |
| 15 | `/admin/audit/[id]` | Audit Report Review | View generated report details |
| 16 | `/admin/consultations` | Consultation Tracking | Track booking status and pipeline |

---

# 2. Page Goals

### Home (`/`)
- **Primary goal:** Capture email + store URL via audit form
- **Secondary goal:** Build trust and explain value
- **KPI:** Form submission rate

### How the Audit Works (`/how-it-works`)
- **Primary goal:** Remove uncertainty about the process
- **Secondary goal:** Drive visitors back to audit form
- **KPI:** Return-to-home click rate

### Who It's For (`/who-its-for`)
- **Primary goal:** Help visitors self-qualify
- **Secondary goal:** Show specificity (not generic agency)
- **KPI:** Time on page, audit form clicks

### Services (`/services`)
- **Primary goal:** Show the value ladder beyond the free audit
- **Secondary goal:** Position consultation as logical next step
- **KPI:** Book consultation clicks

### About (`/about`)
- **Primary goal:** Build credibility and trust
- **Secondary goal:** Differentiate from storefront-focused agencies
- **KPI:** Downstream conversion lift

### FAQ (`/faq`)
- **Primary goal:** Handle objections before they block conversion
- **Secondary goal:** SEO for long-tail queries
- **KPI:** Bounce rate reduction

### Book Consultation (`/book`)
- **Primary goal:** Capture consultation requests
- **Secondary goal:** Qualify leads with structured form
- **KPI:** Form completion rate

### Contact (`/contact`)
- **Primary goal:** General inquiry capture
- **KPI:** Submission rate

### Audit Processing (`/audit/processing`)
- **Primary goal:** Keep user engaged during async processing
- **Secondary goal:** Set expectations for what's coming
- **KPI:** Wait-through rate (don't lose them)

### Audit Results (`/audit/results/[id]`)
- **Primary goal:** Deliver immediate value via findings
- **Secondary goal:** Drive consultation booking
- **KPI:** Consultation CTA click rate

### Thank You (`/audit/thank-you`)
- **Primary goal:** Confirm report delivery
- **Secondary goal:** Final consultation push
- **KPI:** Consultation booking rate

### Admin Dashboard (`/admin`)
- **Primary goal:** Track all leads and audit statuses
- **Secondary goal:** Enable follow-up workflow

---

# 3. Homepage Wireframe

Sections in conversion-optimized order:

```
┌─────────────────────────────────────────────────────┐
│  HEADER / NAV                                       │
│  Logo | How It Works | Who It's For | Services |    │
│  About | FAQ          [Book Consultation] (btn)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 1: HERO + AUDIT FORM                       │
│  ┌─────────────────────┬───────────────────────┐    │
│  │ H1: Get a Free      │  ┌─────────────────┐  │    │
│  │ Shopify Operations  │  │  AUDIT FORM      │  │    │
│  │ Audit               │  │                  │  │    │
│  │                     │  │  Email            │  │    │
│  │ Subhead: AI-powered │  │  Store URL        │  │    │
│  │ preliminary review  │  │  Challenge (opt)  │  │    │
│  │ of your store ops   │  │                  │  │    │
│  │                     │  │  [Get My Audit]   │  │    │
│  │ Helper: No login    │  │                  │  │    │
│  │ required. Based on  │  │  Helper text      │  │    │
│  │ public storefront.  │  └─────────────────┘  │    │
│  └─────────────────────┴───────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 2: WHAT THE AUDIT REVIEWS                  │
│  Grid of 7 review categories with icons             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Storefront│ │Navigation│ │ Product  │            │
│  │ Clarity  │ │& Catalog │ │  Trust   │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │Merchandis│ │Conversion│ │ Ops      │            │
│  │   ing    │ │ Friction │ │ Maturity │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│  ┌──────────┐                                       │
│  │Reporting │  + disclaimer badge                   │
│  │& Workflow│                                       │
│  └──────────┘                                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 3: WHAT YOU'LL RECEIVE                     │
│  ┌─────────────────────┬───────────────────────┐    │
│  │ Checklist:          │  SAMPLE REPORT PREVIEW │    │
│  │ ✓ Executive summary │  ┌───────────────────┐ │    │
│  │ ✓ Category scores   │  │ Mock report card   │ │    │
│  │ ✓ Key findings      │  │ with scores,       │ │    │
│  │ ✓ Recommendations   │  │ findings preview,  │ │    │
│  │ ✓ Next steps        │  │ branded template   │ │    │
│  │ ✓ Consultation link │  └───────────────────┘ │    │
│  └─────────────────────┴───────────────────────┘    │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 4: WHY OPERATIONS MATTER                   │
│  Left: Copy about ops friction being the real       │
│  growth blocker, not storefront design               │
│  Right: Problem indicators list with icons          │
│  - Missed process steps                             │
│  - Manual workarounds                               │
│  - Inconsistent catalog                             │
│  - Unclear reporting                                │
│  - System disconnects                               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 5: HOW IT WORKS                            │
│  3-step horizontal flow:                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Step 1   │→ │ Step 2   │→ │ Step 3   │          │
│  │ Enter    │  │ AI       │  │ Get      │          │
│  │ email +  │  │ reviews  │  │ report + │          │
│  │ store URL│  │ & scores │  │ book     │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 6: WHO IT'S FOR                            │
│  Two columns:                                       │
│  Best for:              │  Not ideal for:           │
│  • Growing Shopify      │  • Brand new stores       │
│  • Multi-SKU merchants  │  • Visual redesign only   │
│  • Manual workflows     │  • No diagnostic step     │
│  • Outgrown spreadsheets│                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 7: COMMON PROBLEMS WE IDENTIFY             │
│  Grid of 6 problem cards with icons                 │
│  Each: icon + title + one-line description          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 8: CONSULTATION CTA                        │
│  Full-width green background                        │
│  "Need a deeper review?"                            │
│  Copy about human-led audit                         │
│  [Book a Consultation] button                       │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 9: SERVICES PREVIEW                        │
│  4 compact cards:                                   │
│  Ops Audit | Workflow Sprint | Ops Backbone | Support│
│  Each: title + 1-line desc + arrow link             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 10: FAQ                                    │
│  Accordion: 7 questions                             │
│  Expandable answers                                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  FOOTER                                             │
│  Logo | Nav links | Legal links | Copyright         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

# 4. Audit Results Page Wireframe

```
┌─────────────────────────────────────────────────────┐
│  HEADER / NAV                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  "Your Shopify Audit Is Ready"                      │
│  Store: example-store.myshopify.com                 │
│  Audit date: April 7, 2026                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  OVERALL SCORE                                      │
│  ┌─────────────────────────────────────┐            │
│  │  Overall: 62/100  [===========---] │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  CATEGORY SCORES (5 horizontal bars)                │
│  Storefront Clarity    ████████░░  78               │
│  Catalog Structure     ██████░░░░  55               │
│  Product Trust         ███████░░░  68               │
│  Operational Signals   █████░░░░░  45               │
│  Opportunity Level     ████████░░  72               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TOP FINDINGS (3-5 cards)                           │
│  ┌─────────────────────────────────────┐            │
│  │ Finding 1                           │            │
│  │ Observation: ...                    │            │
│  │ Why it matters: ...                 │            │
│  │ Recommendation: ...                 │            │
│  └─────────────────────────────────────┘            │
│  (repeat for each finding)                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✓ Full report sent to your email                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CONSULTATION CTA                                   │
│  "Want a deeper operational review?"                │
│  [Book a Consultation]                              │
│                                                     │
├─────────────────────────────────────────────────────┤
│  FOOTER                                             │
└─────────────────────────────────────────────────────┘
```

---

# 5. Admin Dashboard Wireframe

```
┌─────────────────────────────────────────────────────┐
│  ADMIN HEADER                                       │
│  Dashboard | Consultations | [Export CSV]            │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │  LEAD TABLE                              │
│          │  ┌────┬──────┬────────┬──────┬────────┐  │
│ Dashboard│  │ # │Email │Store   │Status│Actions │  │
│ Consult. │  ├────┼──────┼────────┼──────┼────────┤  │
│ Settings │  │ 1 │j@... │store.co│Done  │View    │  │
│          │  │ 2 │m@... │brand.co│Proc. │View    │  │
│          │  │ 3 │k@... │shop.co │Pend. │Re-run  │  │
│          │  └────┴──────┴────────┴──────┴────────┘  │
│          │                                          │
│          │  STATS BAR                               │
│          │  Total leads: 47 | Completed: 38 |       │
│          │  Consultations: 12 | Conversion: 25%     │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

---

# 6. Component Architecture

## Layout Components

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, metadata, global providers)
│   ├── page.tsx                      # Homepage (refactored from monolith)
│   ├── how-it-works/
│   │   └── page.tsx
│   ├── who-its-for/
│   │   └── page.tsx
│   ├── services/
│   │   └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── faq/
│   │   └── page.tsx
│   ├── book/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   ├── audit/
│   │   ├── processing/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── thank-you/
│   │       └── page.tsx
│   ├── admin/
│   │   ├── layout.tsx               # Admin layout (sidebar, auth check)
│   │   ├── page.tsx                 # Lead dashboard
│   │   ├── audit/
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Audit report review
│   │   └── consultations/
│   │       └── page.tsx             # Consultation tracking
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx               # Site-wide navigation
│   │   ├── Footer.tsx               # Site-wide footer
│   │   ├── MobileMenu.tsx           # Mobile nav overlay
│   │   └── AdminSidebar.tsx         # Admin layout sidebar
│   │
│   ├── audit/
│   │   ├── AuditForm.tsx            # Primary lead capture form (hero)
│   │   ├── AuditFormInline.tsx      # Compact inline version for other pages
│   │   ├── AuditProcessing.tsx      # Progress/loading animation
│   │   ├── AuditScoreBar.tsx        # Single category score bar
│   │   ├── AuditScoreCard.tsx       # Overall score display
│   │   ├── AuditFinding.tsx         # Single finding card
│   │   ├── AuditResultsSummary.tsx  # Full results layout
│   │   └── SampleReportPreview.tsx  # Mock report preview for homepage
│   │
│   ├── sections/
│   │   ├── Hero.tsx                 # Homepage hero with audit form
│   │   ├── WhatWeReview.tsx         # Audit categories grid
│   │   ├── WhatYouReceive.tsx       # Report contents + preview
│   │   ├── WhyOpsMatter.tsx         # Operations value prop
│   │   ├── HowItWorks.tsx           # 3-step process flow
│   │   ├── WhoItsFor.tsx            # Fit / not-fit columns
│   │   ├── CommonProblems.tsx       # Problem cards grid
│   │   ├── ConsultationCTA.tsx      # Full-width consultation banner
│   │   ├── ServicesPreview.tsx      # Compact service cards
│   │   ├── FAQSection.tsx           # Accordion FAQ
│   │   └── TrustStats.tsx           # Stats bar (reuse existing)
│   │
│   ├── ui/
│   │   ├── Button.tsx               # Primary, secondary, tertiary variants
│   │   ├── Input.tsx                # Form input with label + validation
│   │   ├── Select.tsx               # Dropdown select
│   │   ├── Card.tsx                 # Reusable card wrapper
│   │   ├── Badge.tsx                # Status badges, tags
│   │   ├── Accordion.tsx            # Expandable FAQ item
│   │   ├── ProgressBar.tsx          # Score/progress visualization
│   │   ├── SectionWrapper.tsx       # Consistent section padding/spacing
│   │   └── StepIndicator.tsx        # Numbered step display
│   │
│   ├── admin/
│   │   ├── LeadTable.tsx            # Sortable/filterable lead list
│   │   ├── LeadRow.tsx              # Single lead row
│   │   ├── StatsBar.tsx             # Dashboard summary stats
│   │   ├── AuditReportView.tsx      # Full report display for admin
│   │   └── ConsultationList.tsx     # Consultation status tracker
│   │
│   └── icons/
│       └── index.tsx                # All SVG icon components (refactor from page.tsx)
│
├── lib/
│   ├── constants.ts                 # Site-wide constants, nav links, service data
│   ├── types.ts                     # TypeScript types (Lead, AuditJob, AuditReport, etc.)
│   └── mock-data.ts                 # Sample audit data for UI development
│
└── public/
    └── (existing assets)
```

## Component Hierarchy (Homepage)

```
layout.tsx
└── page.tsx (Home)
    ├── Navbar
    ├── Hero
    │   └── AuditForm
    ├── WhatWeReview
    ├── WhatYouReceive
    │   └── SampleReportPreview
    ├── WhyOpsMatter
    ├── HowItWorks
    │   └── StepIndicator (x3)
    ├── WhoItsFor
    ├── CommonProblems
    ├── ConsultationCTA
    ├── ServicesPreview
    │   └── Card (x4)
    ├── FAQSection
    │   └── Accordion (x7)
    └── Footer
```

## Component Hierarchy (Audit Results)

```
layout.tsx
└── audit/results/[id]/page.tsx
    ├── Navbar
    ├── AuditScoreCard
    ├── AuditScoreBar (x5)
    ├── AuditFinding (x3-5)
    ├── Badge ("Report sent to email")
    ├── ConsultationCTA
    └── Footer
```

---

# 7. Content Strategy

## Voice & Tone
- **Practical over promotional** — show operational expertise, not marketing fluff
- **Specific over vague** — name actual problems (catalog disorder, manual fulfillment steps)
- **Honest about scope** — "preliminary audit", "public storefront signals", "AI-powered snapshot"
- **Consulting-grade accessibility** — expert but not jargon-heavy

## Key Messaging Framework

| Page | Primary Message | Supporting Message |
|------|----------------|-------------------|
| Home | "Get a free AI-powered Shopify operations audit" | "See what's slowing your store before it costs you" |
| How It Works | "A structured process, not a black box" | "Public review + AI inference = actionable snapshot" |
| Who It's For | "Built for merchants who've outgrown duct tape" | "Growing stores need ops clarity, not just a nicer storefront" |
| Services | "From snapshot to full operational transformation" | "The audit is step one. Here's the rest of the journey." |
| About | "We focus on the systems behind the storefront" | "Most agencies optimize what customers see. We fix what they don't." |
| Results | "Your audit is ready" | "Here's what we found — and what to do about it" |

## CTA Hierarchy (Site-Wide)
1. **Primary:** "Get My Audit" — green filled button, appears in hero, nav, and inline throughout
2. **Secondary:** "Book a Consultation" — bordered/outlined button, appears after value delivery
3. **Tertiary:** "Learn How It Works" — text link with arrow, for curious-but-not-ready visitors

## Disclaimer Language (Required)
Every audit-related page must include:
> "This is a preliminary AI-powered review based on publicly visible storefront signals and operational best-practice patterns. It does not access your Shopify admin, internal data, or private systems."

## FAQ Content Plan (7 Questions)
1. What does the audit review?
2. Does this require Shopify login access?
3. Is the audit really free?
4. How long does it take?
5. Will I receive the report by email?
6. Is this a full operational audit?
7. What happens after the audit?

---

# 8. Design Strategy

## Design Language
- **Premium consulting meets SaaS product** — not agency template, not startup toy
- **Spacious layout** — generous whitespace, clear visual hierarchy
- **Strong typography** — large headings, readable body, clear section labels
- **Subtle card-based sections** — white cards on light backgrounds with gentle borders
- **Trust-first visual hierarchy** — proof before CTA, value before ask

## Color System (Preserve Existing)
- Primary: `#398860` (sage green) — CTAs, key accents, branding
- Primary Light: `#9ACC77` — secondary accents, charts, score bars
- Primary Pale: `#E5EAD4` — backgrounds, badges, soft highlights
- Accent: `#2c6e49` — hover states, emphasis
- Background: `#fafaf8` — off-white page background
- Foreground: `#1a2332` — dark navy headings
- Muted: `#6b7280` — secondary text
- Section Alt: `#f3f4f1` — alternating section backgrounds

## Typography (Preserve Existing)
- Primary: Open Sans (Google Fonts)
- Headings: Bold/semibold, large scale (text-3xl to text-5xl)
- Body: Regular weight, text-base to text-lg

## Component Design Patterns
- **Cards:** `bg-white border border-border rounded-xl p-6 hover:shadow-md transition`
- **Buttons Primary:** `bg-primary text-white rounded-lg px-6 py-3 font-semibold hover:bg-accent`
- **Buttons Secondary:** `border-2 border-primary text-primary rounded-lg px-6 py-3 hover:bg-primary-pale`
- **Section Spacing:** `py-16 md:py-24` with consistent `max-w-6xl mx-auto px-4`
- **Score Bars:** Horizontal progress bars using primary/primary-light colors
- **Form Inputs:** `border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary`

## Page-Specific Design Notes

### Homepage
- Hero gets the most visual weight — audit form is THE focal point
- Form should be in a elevated card with subtle shadow
- Alternating white/section-alt backgrounds for rhythm
- No hero illustration competing with the form (form IS the hero)

### Audit Results
- Score bars are the visual centerpiece
- Findings in structured cards with clear observation/recommendation split
- Green success badge for "report sent" confirmation
- Consultation CTA gets full-width treatment at bottom

### Admin Dashboard
- Clean table layout, minimal design
- Status badges: pending (yellow), processing (blue), complete (green), failed (red)
- Functional over beautiful — this is internal tooling

---

# 9. Refactoring Strategy

## Current State
All content lives in `src/app/page.tsx` as inline components (~1033 lines). Icons, sections, forms, and layout are all in one file.

## Migration Plan
1. **Extract icons** → `components/icons/index.tsx` (all 20+ SVG icon components)
2. **Extract UI primitives** → `components/ui/` (Button, Input, Card, etc.)
3. **Extract layout** → `components/layout/` (Navbar, Footer, MobileMenu)
4. **Extract homepage sections** → `components/sections/` (one file per section)
5. **Rebuild homepage** → Clean `page.tsx` that composes section components
6. **Add new pages** → One page file per route, composing shared components
7. **Add types and mock data** → `lib/types.ts`, `lib/mock-data.ts`

This approach preserves all existing design work while enabling multi-page expansion.

---

# 10. Data Types (For Mock Data & Future Backend)

```typescript
// Lead
interface Lead {
  id: string;
  email: string;
  siteUrl: string;
  storeName?: string;
  challengeArea?: string;
  consentStatus: boolean;
  createdAt: string;
}

// Audit Job
interface AuditJob {
  id: string;
  leadId: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

// Audit Report
interface AuditReport {
  id: string;
  jobId: string;
  executiveSummary: string;
  overallScore: number;
  categories: AuditCategory[];
  findings: AuditFinding[];
  recommendations: string[];
  createdAt: string;
}

// Audit Category Score
interface AuditCategory {
  name: string;
  score: number;
  maxScore: number;
  summary: string;
}

// Audit Finding
interface AuditFinding {
  category: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  severity: 'low' | 'medium' | 'high';
}
```

---

# 11. Implementation Phases

## Phase 1: Restructure (Foundation)
- Extract components from monolithic `page.tsx`
- Set up route structure for all pages
- Create shared layout components (Navbar, Footer)
- Create UI primitives (Button, Input, Card, etc.)
- Define types and mock data

## Phase 2: Homepage Rebuild
- Rebuild homepage with new section components
- Replace existing hero with audit-form-centered hero
- Add all 10 homepage sections per wireframe
- Add sample report preview component

## Phase 3: Audit Flow Pages
- Build audit processing page (loading/progress UI)
- Build audit results page (scores, findings, CTAs)
- Build thank-you page
- Wire up with mock data

## Phase 4: Supporting Pages
- How It Works
- Who It's For
- Services
- About
- FAQ
- Book Consultation
- Contact

## Phase 5: Legal & Admin
- Privacy Policy page
- Terms of Service page
- Admin dashboard (mock UI)
- Admin audit review page
- Admin consultation tracking page

## Phase 6: Polish & Integration Prep
- Responsive testing across breakpoints
- Consistent CTA hierarchy across all pages
- Form validation patterns
- Prepare API route stubs for future backend integration

---

# 12. Verification Plan

1. **Visual:** Run `npm run dev` on port 3750, manually navigate every route
2. **Responsive:** Test at 375px (mobile), 768px (tablet), 1280px (desktop)
3. **Navigation:** Verify all nav links, CTAs, and internal links work
4. **Forms:** Test audit form and consultation form validation states
5. **Components:** Verify consistent styling across all reused components
6. **Audit flow:** Walk through: form submit → processing page → results page → thank you
7. **Admin:** Verify dashboard renders with mock data
8. **Build:** Run `npm run build` — confirm zero errors
