# Product Requirements Document

## Product Name

**Shopify Audit AI**

## Product Summary

Shopify Audit AI is a lead-generation and diagnostic web product for ecommerce merchants. A visitor enters their email address and Shopify store URL, and the platform runs an AI-assisted storefront and operations review. The system then generates a structured pre-templated audit report, presents key findings on screen, recommends a consultation, and emails the report to the lead. The technical foundation fits well with Google Cloud because Vertex AI provides multimodal generative models, Cloud Run is suitable for running the application and background services, and Firebase Authentication is a straightforward option if you decide later to add accounts or gated report access.

---

# 1. Product Vision

Create a website that turns anonymous Shopify traffic into qualified consulting leads by giving merchants a fast, useful, AI-generated operational audit that feels credible enough to start a sales conversation.

## Vision Statement

**Help growing Shopify merchants quickly understand where operational friction exists, then turn that insight into a consultation opportunity.**

---

# 2. Product Goal

The website should:

-   capture qualified leads,
-   produce an instant or near-instant audit,
-   position your company as the operations specialist,
-   create a strong handoff into a paid consultation or audit sprint.

---

# 3. My Product Opinion

This is a strong concept, but only if you position it correctly.

My view: **do not market it as a full audit. Market it as an “AI-Powered Preliminary Shopify Audit” or “Operational Snapshot.”**

Why? Because AI can review public storefront signals, site structure, obvious UX gaps, and some operational clues, but it cannot truly inspect internal back-office workflows, ERP issues, admin exceptions, finance reconciliation, or fulfillment rules without deeper access. If you oversell the audit, the product will feel shallow. If you frame it as a credible first-pass review, it becomes a very good lead magnet and trust-builder.

So the smart positioning is:

> “Get a fast AI-generated Shopify operational snapshot, then book a consultation for a deeper human-led audit.”

That is honest and commercially strong.

---

# 4. Target Users

## Primary User

Founder, operator, ecommerce manager, or store owner of a growing Shopify business.

## Secondary User

COO, operations lead, finance lead, or agency-side partner evaluating store operational maturity.

## User Profile

-   already has a live Shopify store
-   experiencing growth or complexity
-   suspects inefficiency
-   wants quick, practical feedback
-   is open to consultation if findings are useful

---

# 5. Problem Statement

Growing Shopify merchants often know something feels inefficient, but they do not have a fast, structured way to identify operational friction. Traditional audits require calls, manual review, and time commitment. Many merchants want immediate value before they commit to a conversation.

---

# 6. Proposed Solution

A website that:

1.  captures lead email and store URL,
2.  runs AI-assisted review workflows,
3.  generates a templated report with findings and recommendations,
4.  presents an executive summary to the lead,
5.  emails the full report,
6.  prompts the lead to book a consultation.

---

# 7. Core Value Proposition

For the merchant:

-   fast feedback,
-   low friction,
-   useful operational observations,
-   clear next steps.

For your business:

-   qualified leads,
-   trust-building,
-   scalable top-of-funnel asset,
-   repeatable audit framework.

---

# 8. Scope Definition

## In Scope for MVP

-   landing page
-   lead capture form
-   store URL validation
-   AI-driven public-site review
-   structured scoring framework
-   pre-templated report generation
-   email delivery of report
-   consultation CTA
-   admin dashboard for submissions
-   analytics/event tracking

## Out of Scope for MVP

-   deep Shopify admin integration
-   app installation into merchant’s Shopify store
-   real-time dashboard for merchant logins
-   ERP/accounting system access
-   authenticated merchant portal
-   custom-branded white-label audit exports
-   voice-based interactive audit agent

Note: you mentioned “Google voice offering.” My recommendation is **do not start with voice**. Start with web + email. Voice adds complexity without improving the core lead conversion loop. If later you want a voice assistant, Google Cloud does have speech services and broader AI tooling, but that is not where your first value comes from. Vertex AI and Cloud Run are enough to start the right version of this product.

---

# 9. User Journey

## Primary Flow

1.  User lands on website.
2.  User reads value proposition.
3.  User enters:
    -   email
    -   Shopify store URL
4.  User submits request.
5.  System validates URL and creates audit job.
6.  System crawls or reviews public storefront signals.
7.  AI produces findings using your predefined framework.
8.  Report is assembled into structured template.
9.  User sees summary page with 3 to 5 key findings.
10.  Full report is emailed to the user.
11.  User is invited to book a consultation.

## Secondary Flow

1.  Lead receives report by email.
2.  Email includes:
    -   summary findings
    -   CTA to book consultation
    -   optional paid audit offer
3.  Lead enters your pipeline for follow-up.

---

# 10. Functional Requirements

## 10.1 Landing Page

The system must provide a homepage that:

-   explains the audit offer,
-   describes what the user gets,
-   sets expectations clearly,
-   includes lead capture form,
-   includes consultation CTA.

## 10.2 Lead Capture Form

The system must collect:

-   email address
-   Shopify store URL
-   optional store name
-   optional primary challenge dropdown
-   consent checkbox for email/report delivery

Validation:

-   valid email format
-   valid URL format
-   reject duplicate spam submissions by rate limit and bot protection

## 10.3 Audit Request Processing

The system must:

-   create a unique audit job,
-   store submission data,
-   trigger AI review pipeline,
-   update job state: pending, processing, complete, failed.

## 10.4 AI Review Engine

The system must analyze public-facing site information and generate findings across a predefined framework.

### Suggested audit dimensions

-   homepage clarity
-   navigation and collection structure
-   product page completeness
-   trust signals
-   merchandising consistency
-   operational clues from storefront
-   catalog organization clues
-   conversion friction indicators
-   reporting/ops maturity assumptions
-   recommended next actions

Important: operational conclusions should be framed carefully as **signals**, **observations**, or **likely friction points**, not unverifiable certainty.

## 10.5 Report Generation

The system must generate a pre-templated audit report with:

-   cover header
-   store URL
-   audit date
-   executive summary
-   section scores
-   findings by category
-   recommended actions
-   consultation invitation
-   disclaimer about public-data review limitations

## 10.6 On-Screen Summary

The system must display:

-   audit completion state
-   concise score or grade
-   3 to 5 findings
-   “book consultation” CTA
-   “report sent to email” confirmation

## 10.7 Email Delivery

The system must send the report to the submitted email address.

Email must include:

-   greeting
-   summary findings
-   link or attachment to report
-   consultation CTA

## 10.8 Internal Lead Dashboard

Admin side should allow you to:

-   view submitted leads
-   review report status
-   inspect generated report
-   re-run audit
-   mark consultation status
-   export lead list

---

# 11. Non-Functional Requirements

## Performance

-   lead submission should complete in under 3 seconds
-   audit job should start immediately
-   target audit completion: under 2 to 5 minutes for MVP

## Reliability

-   failed jobs must be retryable
-   email delivery status must be logged
-   malformed URLs must fail gracefully

## Security

-   protect form endpoints against abuse
-   secure lead data at rest and in transit
-   do not expose internal prompts or processing logic
-   log user consent for report email delivery

## Scalability

Cloud Run is a strong fit for this kind of serverless web app and job-triggered backend because it is designed to run request-driven or event-driven services without you managing infrastructure.

---

# 12. Technical Approach

## Recommended Architecture

### Frontend

-   Next.js
-   public marketing site
-   lead capture form
-   results page

### Backend

-   Cloud Run API service
-   job orchestration layer
-   report generation service
-   email sending service

### AI Layer

-   Vertex AI with Gemini for audit synthesis and report writing
-   structured prompts + rubric-driven scoring

Vertex AI is Google Cloud’s unified AI platform and provides access to Gemini models for multimodal and generative use cases, which makes it a good fit for report generation and structured analysis workflows.

### Data Storage

-   Firestore or Postgres
-   tables/collections for:
    -   leads
    -   audit jobs
    -   reports
    -   email delivery logs
    -   consultation status

### Authentication

For MVP, you may not need user login at all.  
If you later add protected access to reports, Firebase Authentication is a practical option and supports password and federated sign-in.

### Optional Document Pipeline

If you later let merchants upload exported reports, screenshots, or operational docs, Document AI could help extract structured information from those files. But for your current public-site audit concept, Document AI is not essential. It is more relevant when you process forms, PDFs, and unstructured business documents.

---

# 13. Data Model

## Lead

-   id
-   email
-   site_url
-   store_name
-   challenge_area
-   consent_status
-   created_at

## AuditJob

-   id
-   lead_id
-   status
-   started_at
-   completed_at
-   error_message
-   model_version
-   processing_time_ms

## AuditReport

-   id
-   job_id
-   executive_summary
-   overall_score
-   findings_json
-   recommendations_json
-   report_html
-   report_pdf_url
-   created_at

## Consultation

-   id
-   lead_id
-   consultation_status
-   booked_at
-   notes

---

# 14. AI Prompting Strategy

## Prompt Structure

The system should use:

-   a strict audit rubric,
-   structured JSON output,
-   score ranges by category,
-   templated narrative generation,
-   required disclaimer language.

## Prompt Design Principle

Do not let the model freestyle the entire report.  
Use a two-step process:

1.  produce structured findings,
2.  render findings into your branded template.

That will make the output far more consistent.

---

# 15. Audit Framework Proposal

## Audit Categories

1.  Storefront clarity
2.  Navigation and catalog structure
3.  Product page trust and completeness
4.  Merchandising consistency
5.  Conversion friction indicators
6.  Operational maturity signals
7.  Reporting and process visibility assumptions
8.  Recommended next steps

## Output Format

For each category:

-   score
-   what was observed
-   why it matters
-   risk/opportunity
-   recommendation

---

# 16. Business Logic Rules

## Rule 1

The tool must never claim to inspect private Shopify admin data unless the merchant explicitly connects a store in a later product version.

## Rule 2

The tool must include a disclaimer that the report is based on public-facing review and inferred operational indicators.

## Rule 3

The consultation CTA should always connect findings to deeper human analysis:

-   workflow review
-   ops audit
-   integration planning
-   reporting cleanup

## Rule 4

The email follow-up sequence should segment leads by score and interest level.

---

# 17. Success Metrics

## Product Metrics

-   landing page conversion rate
-   form completion rate
-   successful audit generation rate
-   report email delivery rate
-   consultation booking rate
-   cost per completed audit
-   cost per booked consultation

## Business Metrics

-   qualified leads per month
-   consultations booked
-   paid audits sold
-   workflow sprint conversions
-   revenue influenced by audit tool

---

# 18. UX Requirements

## Landing Page Message

The page should communicate:

-   what this is,
-   how long it takes,
-   what the user receives,
-   why it is valuable.

## Good CTA Copy

-   Get My Shopify Audit
-   Get My Store Review
-   Get My Operational Snapshot

I would avoid “free full audit.” That sounds inflated.

## Results Page Message

-   your report is ready
-   here are the biggest issues we found
-   we emailed the full report
-   book a consultation to review the findings

---

# 19. Risks

## Risk 1: weak or generic output

If the report reads like generic AI fluff, it will hurt trust.

### Mitigation

-   strong rubric
-   structured prompts
-   examples
-   human review during early rollout
-   store category-specific logic

## Risk 2: overselling operational insight

A public URL alone cannot reveal everything.

### Mitigation

-   position this as preliminary
-   include assumptions/disclaimers
-   sell the next step as deeper diagnosis

## Risk 3: abuse and spam

Open forms attract bots and fake URLs.

### Mitigation

-   CAPTCHA
-   rate limiting
-   domain validation
-   background moderation

## Risk 4: long runtime

AI review plus scraping can get slow.

### Mitigation

-   async job pipeline
-   results page with progress state
-   email completion fallback

---

# 20. Roadmap

## MVP

-   landing page
-   email + URL form
-   job queue
-   AI-generated report
-   emailed report
-   consultation CTA
-   admin review panel

## V2

-   richer scoring model
-   industry-specific templates
-   screenshot-based review
-   PDF report export
-   CRM integration
-   automated follow-up sequences

## V3

-   Shopify app install option
-   authenticated merchant dashboard
-   deeper ops data ingestion
-   internal workflow benchmarking
-   paid premium audits

---

# 21. Recommended MVP Stack

My recommendation:

-   **Frontend:** Next js latest
-   **Backend:** Cloud Run API
-   **AI:** Vertex AI / Gemini
-   **Database:** Firestore
-   **Email:** transactional email provider - Resend (Api Key - re_9ckDJrcR_ESqUVmR9DasDGxdLFtj5Cq27)
-   **Queue/async processing:** background job pattern on Cloud Run
-   **Analytics:** basic funnel/event tracking

Reason: this is fast to ship, aligned with your skill set, and maps well to Google Cloud’s serverless + AI stack. Cloud Run is built for managed request/event workloads, and Vertex AI is the right Google Cloud layer for generative report workflows.

---