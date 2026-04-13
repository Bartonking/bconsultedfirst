# Stripe + Booking Flow Fix Plan

## Purpose

This document defines the implementation plan to fix the current audit-to-booking flow and add a paid consultation path using Stripe and Calendly.

The requested user-facing options on the booking page are:

1. `Subscribe to email list`
2. `Book Consultation ($50 USD)`

The new flow must preserve prior audit submission data, avoid trusting raw query params for identity, and track payment and scheduling status end to end.

## Current Flow: What Exists Today

The current implementation already covers pieces of the journey, but not the full intended experience.

### Audit submission

The homepage audit form submits:

- `email`
- `storeUrl`
- `challenge`

From:

- [src/components/audit/AuditForm.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/components/audit/AuditForm.tsx)

Into:

- [src/app/api/audits/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/audits/route.ts)

That route creates:

- a `lead`
- an `auditJob`

Then enqueues worker processing.

### Report generation + email

The audit worker:

- loads the `lead`
- generates the report
- stores the report
- marks the job complete
- sends the report email

From:

- [src/app/api/worker/audit/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/worker/audit/route.ts)

The HTML email contains a `Book a Consultation` CTA generated in:

- [src/lib/report-html.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/report-html.ts)

That CTA currently links to:

```txt
/book?email=...&name=...&storeUrl=...
```

### Booking page

The booking page:

- reads `name`, `email`, and `storeUrl` from query params
- renders a lead form
- posts to `/api/consultations`
- then renders the Calendly inline widget

From:

- [src/app/book/page.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/book/page.tsx)
- [src/app/api/consultations/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/consultations/route.ts)

Calendly receives:

- `name`
- `email`
- `utm_content=consultationId`

### Calendly webhook

The Calendly webhook already exists and updates the consultation record by reading `payload.tracking.utm_content`.

From:

- [src/app/api/webhooks/calendly/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/webhooks/calendly/route.ts)

This is good and should be preserved.

## Current Problems

### 1. The handoff to `/book` is weak

The email CTA currently trusts raw query params.

Issues:

- query params can be altered
- the audit CTA only carries partial data
- the results page CTA drops prior data entirely

### 2. Email delivery is not guaranteed at the point the UI implies

The audit job is marked `complete` before email sending is attempted.

That means:

- the user can see the report results
- the UI can claim the report was emailed
- but the email could still fail

### 3. The audit does not collect enough canonical identity data

The audit flow currently does not collect `name`.

As a result:

- email CTA usually cannot prefill name
- booking still requires a fresh name entry

### 4. Consultation creation happens before payment

The current booking page creates a consultation record as soon as the form is submitted, before Stripe payment exists.

That will become incorrect once the consultation is a paid step.

### 5. Calendly is not gated by payment

The current booking page immediately opens Calendly after consultation creation.

The new flow should be:

```txt
Audit -> Email -> Booking page -> Choose option -> Stripe payment -> Calendly -> Webhook updates scheduled
```

### 6. No subscription path exists

There is currently no email-list subscription workflow, data model, or provider sync.

## Target Flow

### Desired user flow

```txt
User submits audit
-> audit is generated
-> report email is delivered
-> email CTA opens /book with a signed booking token
-> booking page loads prior submission context
-> page offers:
   - Subscribe to email list
   - Book Consultation ($50)
-> if user subscribes:
   - marketing opt-in is saved
   - success confirmation shown
-> if user books consultation:
   - Stripe Checkout session is created
   - user completes payment
   - app confirms payment
   - Calendly is shown
   - Calendly webhook marks consultation as scheduled
```

### Booking page UX

The booking page should show:

- audit/store summary
- merchant email
- merchant store URL
- optional challenge area
- a concise explanation of the two choices

The page should then present two actions:

1. `Subscribe to Email List`
2. `Book Consultation - $50 USD`

### Security model

The page should no longer trust user identity from raw URL parameters.

Instead:

- the email CTA should contain a short-lived signed token
- the token should resolve to a canonical lead/report context on the server
- all payment and scheduling records should be tied back to that context

## Architecture Decisions

### Decision 1: Use a signed booking token

Recommended token payload:

```json
{
  "leadId": "lead-abc123",
  "reportId": "rpt-xyz789",
  "jobId": "job-123",
  "exp": 1760000000,
  "source": "audit_email"
}
```

Recommended properties:

- signed with HMAC using a server secret
- URL-safe
- includes expiration timestamp
- does not expose mutable booking state

Suggested env var:

```env
BOOKING_TOKEN_SECRET=replace-me
```

### Decision 2: Gate Calendly behind successful payment

Calendly should not open until Stripe confirms payment.

That means the booking flow becomes:

```txt
Create consultation intent
-> create Stripe Checkout session
-> user pays
-> Stripe webhook marks consultation paid
-> success page or returned booking state unlocks Calendly
```

### Decision 3: Use Stripe Checkout, not custom card collection

Use Stripe Checkout for the first pass because it is:

- faster to implement
- lower maintenance
- simpler for sandbox and production rollout
- easier to secure than a custom Elements form

### Decision 4: Keep Calendly `utm_content=consultationId`

The current Calendly webhook already uses `utm_content` to map the event back to a consultation record.

Keep that pattern.

## Data Model Changes

The existing data model in [src/lib/types.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/types.ts) needs to expand.

### `Lead`

Current:

```ts
export interface Lead {
  id: string;
  email: string;
  siteUrl: string;
  storeName?: string;
  challengeArea?: string;
  consentStatus: boolean;
  createdAt: string;
}
```

Recommended:

```ts
export interface Lead {
  id: string;
  email: string;
  siteUrl: string;
  storeName?: string;
  challengeArea?: string;
  consentStatus: boolean;
  createdAt: string;

  marketingStatus?: "unsubscribed" | "subscribed";
  marketingSubscribedAt?: string;
  marketingSource?: "book_page" | "audit_email" | "manual";
}
```

### `Consultation`

Recommended expansion:

```ts
export interface Consultation {
  id: string;
  leadId: string;
  consultationStatus: "requested" | "paid" | "scheduled" | "completed" | "cancelled";

  bookedAt?: string;
  notes?: string;

  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentAmount?: number;
  paymentCurrency?: "usd";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;

  calendlyEventUri?: string;
  calendlyInviteeUri?: string;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
  cancelUrl?: string;
  rescheduleUrl?: string;

  source?: "audit_email" | "results_page" | "direct";
  reportId?: string;
}
```

### Optional: separate payment record

For the first pass, payment fields can live on `Consultation`.

If reporting grows later, add:

```ts
export interface ConsultationPayment {
  id: string;
  consultationId: string;
  leadId: string;
  amount: number;
  currency: "usd";
  status: "pending" | "paid" | "failed" | "refunded";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: string;
  paidAt?: string;
}
```

For now, this is optional.

## Route and File Plan

### Existing files to update

- [src/lib/types.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/types.ts)
- [src/lib/validation.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/validation.ts)
- [src/lib/report-html.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/report-html.ts)
- [src/app/api/worker/audit/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/worker/audit/route.ts)
- [src/app/book/page.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/book/page.tsx)
- [src/app/api/consultations/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/consultations/route.ts)
- [src/app/api/webhooks/calendly/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/webhooks/calendly/route.ts)
- [src/app/audit/results/[id]/page.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/audit/results/[id]/page.tsx)

### New files recommended

- `src/lib/booking-token.ts`
- `src/lib/stripe.ts`
- `src/app/api/book/context/route.ts`
- `src/app/api/book/subscribe/route.ts`
- `src/app/api/stripe/checkout-session/route.ts`
- `src/app/api/webhooks/stripe/route.ts`

### Optional new route

- `src/app/book/success/page.tsx`

This page can confirm Stripe payment and unlock Calendly if you want a clean redirect return.

## Booking Token Design

### Server helper

Create a small utility in `src/lib/booking-token.ts`.

Suggested API:

```ts
export type BookingTokenPayload = {
  leadId: string;
  reportId?: string;
  jobId?: string;
  source: "audit_email" | "results_page";
  exp: number;
};

export function signBookingToken(payload: BookingTokenPayload): string;
export function verifyBookingToken(token: string): BookingTokenPayload | null;
```

### Email CTA generation

Replace this style of link:

```ts
const bookParams = new URLSearchParams();
if (leadInfo?.email) bookParams.set("email", leadInfo.email);
if (leadInfo?.name) bookParams.set("name", leadInfo.name);
bookParams.set("storeUrl", report.storeUrl);
const bookUrl = `${baseUrl}/book${bookParams.size ? "?" + bookParams.toString() : ""}`;
```

With:

```ts
const token = signBookingToken({
  leadId,
  reportId: report.id,
  jobId: report.jobId,
  source: "audit_email",
  exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 14,
});

const bookUrl = `${baseUrl}/book?token=${encodeURIComponent(token)}`;
```

Note: `renderReportHtml()` currently does not receive `leadId`, so its call signature will need to change.

## Booking Context Loading

### Problem

`/book` should not trust `name`, `email`, or `storeUrl` from the URL directly.

### Recommended approach

Create a small route:

```txt
GET /api/book/context?token=...
```

That route should:

1. verify the token
2. load the lead from Firestore
3. load the report if present
4. return canonical booking context

Example response:

```json
{
  "leadId": "lead-123",
  "reportId": "rpt-456",
  "email": "merchant@example.com",
  "name": "Acme Store",
  "storeUrl": "acme.myshopify.com",
  "challengeArea": "catalog",
  "source": "audit_email"
}
```

### Use in `/book`

The booking page should:

- require a valid token for the audit-origin flow
- render loaded context at the top
- let the merchant add missing `name` if needed

## Booking Page Redesign

### Page content

Suggested page structure:

1. header
2. merchant/audit summary card
3. explanation of next actions
4. two-option action section

### Suggested wireframe

```txt
Book Your Next Step

Store: acme.myshopify.com
Email: merchant@example.com
Challenge: Catalog complexity

[ Subscribe to Email List ]
Get updates, operational insights, and practical Shopify guidance.

[ Book Consultation - $50 ]
30-minute review with a specialist. Payment required before scheduling.
```

### Option A: Subscribe to email list

Behavior:

- user confirms subscription
- `Lead.marketingStatus` becomes `subscribed`
- show success state

### Option B: Book Consultation ($50)

Behavior:

- collect missing required fields
- create consultation intent or pending consultation
- create Stripe Checkout session
- redirect to Stripe

## Stripe Integration Plan

### Required package

Install:

```bash
npm install stripe
```

### Environment variables

You provided the Stripe sandbox publishable key:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TL4cHHaKXReLj0QT4vRHoH69QVULW15p4mdORlbb1HN4zCZOuki1K4GRQLTI0fftPVNUtf8XmW9g4CUwuMUGZQd00waD4QmUW
```

Additional required env vars:

```env
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/your-handle/your-event
CALENDLY_WEBHOOK_SIGNING_KEY=replace_me
BOOKING_TOKEN_SECRET=replace_me
```

### Stripe helper

Create `src/lib/stripe.ts`:

```ts
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("Missing STRIPE_SECRET_KEY");
    stripe = new Stripe(apiKey);
  }
  return stripe;
}
```

### Checkout session route

Create:

```txt
POST /api/stripe/checkout-session
```

Responsibilities:

1. verify booking token or lead context
2. ensure required fields exist
3. create or update a pending consultation
4. create Stripe Checkout session
5. return the checkout URL

Suggested session metadata:

```ts
metadata: {
  consultationId,
  leadId,
  reportId: reportId ?? "",
  source: "audit_email",
}
```

Suggested line item:

```ts
line_items: [
  {
    price_data: {
      currency: "usd",
      unit_amount: 5000,
      product_data: {
        name: "bConsulted First Consultation",
        description: "30-minute Shopify operations consultation",
      },
    },
    quantity: 1,
  },
]
```

Suggested mode:

```ts
mode: "payment"
```

### Stripe webhook route

Create:

```txt
POST /api/webhooks/stripe
```

Handle at minimum:

- `checkout.session.completed`
- optional later: `payment_intent.payment_failed`
- optional later: refund events

On `checkout.session.completed`:

1. verify webhook signature
2. read `consultationId` from session metadata
3. update consultation:
   - `paymentStatus = "paid"`
   - `consultationStatus = "paid"`
   - `paymentAmount = 5000`
   - `paymentCurrency = "usd"`
   - `stripeCheckoutSessionId = ...`
   - `stripePaymentIntentId = ...`
   - `paidAt = now`

## Calendly Integration After Payment

### Current strength

The existing Calendly webhook already resolves `consultationId` from `utm_content`.

Keep this.

### Required booking-page change

Only render:

```tsx
<CalendlyEmbed ... />
```

when the consultation is confirmed `paid`.

### Return flow options

There are two acceptable patterns.

#### Option A: Stripe success page

Stripe redirects to:

```txt
/book/success?session_id=cs_test_...
```

That page:

- loads the Stripe session server-side
- confirms it is paid
- loads the related consultation
- renders Calendly

#### Option B: Re-open `/book` with payment state

Stripe redirects back to:

```txt
/book?token=...&checkout=success
```

The booking page then:

- reloads canonical context
- checks consultation payment status
- if paid, shows Calendly

Recommendation: **Option A** is cleaner.

## Subscription Flow Plan

### Minimal first-pass behavior

Create:

```txt
POST /api/book/subscribe
```

Input:

```json
{
  "token": "...",
  "email": "merchant@example.com"
}
```

Behavior:

1. verify booking token
2. load lead
3. update lead:
   - `marketingStatus = "subscribed"`
   - `marketingSubscribedAt = now`
   - `marketingSource = "audit_email"`

Response:

```json
{
  "success": true
}
```

### Optional provider sync

If later needed, add sync to:

- Mailchimp
- Klaviyo
- Resend audiences

That provider decision does not need to block the base flow.

## Email and Results Page Changes

### Email CTA

Update the report email CTA to use only the signed booking token.

### Results page CTA

The on-site results page should also preserve the same handoff context.

Instead of:

```tsx
<Link href="/book">Book a Consultation</Link>
```

Use a tokenized booking link generated from the lead/report context.

If the results page does not currently have access to the lead, add the required lookup.

### Email delivery truthfulness

Adjust the UX language so it does not always imply successful email delivery.

Recommended states:

- `Report ready. We’re sending the full report to your email.`
- `Report emailed successfully.`
- `We couldn’t email the report. Please use the on-screen results and contact us.`

## Validation Changes

The booking flow will need different validation depending on the action.

### Subscribe flow schema

Suggested:

```ts
export const subscribeLeadSchema = z.object({
  token: z.string().min(1),
});
```

### Paid consultation schema

Suggested:

```ts
export const createPaidConsultationSchema = z.object({
  token: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  storeUrl: z.string().min(1, "Store URL is required"),
  teamSize: z.string().optional(),
  challenge: z.string().optional(),
  context: z.string().optional(),
});
```

## Suggested Firestore Record Lifecycle

### Lead

Created at audit submission time.

### AuditJob

Created at audit submission time.

### AuditReport

Created at worker completion time.

### Consultation

Recommended lifecycle:

```txt
pending intent -> paid -> scheduled -> completed
```

Suggested practical first pass:

1. create consultation before Stripe Checkout with:
   - `consultationStatus = "requested"`
   - `paymentStatus = "pending"`
2. after Stripe webhook:
   - `consultationStatus = "paid"`
   - `paymentStatus = "paid"`
3. after Calendly webhook:
   - `consultationStatus = "scheduled"`

This preserves traceability across Stripe and Calendly.

## Detailed Implementation Checklist

### Phase 1: secure handoff and canonical booking context

- [ ] Add `BOOKING_TOKEN_SECRET` env support.
- [ ] Create `src/lib/booking-token.ts`.
- [ ] Add token signing and verification helpers.
- [ ] Update `renderReportHtml()` signature to accept `leadId` and source context.
- [ ] Update [src/app/api/worker/audit/route.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/api/worker/audit/route.ts) to pass `leadId` into report email generation.
- [ ] Replace raw `/book?email=...&storeUrl=...` links with `/book?token=...`.
- [ ] Create `GET /api/book/context`.
- [ ] Update [src/app/book/page.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/book/page.tsx) to load booking context from token.
- [ ] Update the audit results page CTA in [src/app/audit/results/[id]/page.tsx](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/app/audit/results/[id]/page.tsx) to use the same tokenized handoff.

### Phase 2: redesign booking page with two options

- [ ] Redesign `/book` to show merchant summary and two option cards.
- [ ] Add explicit action state: `subscribe` vs `paid_consultation`.
- [ ] Preserve existing explanatory copy only where it still fits the new flow.
- [ ] Collect `name` only when it is missing.
- [ ] Keep `storeUrl` visible and editable only if business rules require it.

### Phase 3: add email subscription path

- [ ] Extend `Lead` type with marketing subscription fields.
- [ ] Add schema for subscription requests in [src/lib/validation.ts](/Users/bartonking/Documents/claude_workspace/clients/bconsulted/bconsulted-site/src/lib/validation.ts).
- [ ] Create `POST /api/book/subscribe`.
- [ ] Update lead records on subscription.
- [ ] Add success UI state on `/book`.
- [ ] Optionally add provider sync stub for later integration.

### Phase 4: add Stripe Checkout

- [ ] Install `stripe`.
- [ ] Add `src/lib/stripe.ts`.
- [ ] Add env vars:
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Create `POST /api/stripe/checkout-session`.
- [ ] Create pending consultation/payment metadata before redirecting to Stripe.
- [ ] Redirect user to Stripe Checkout.

### Phase 5: add Stripe webhook

- [ ] Create `POST /api/webhooks/stripe`.
- [ ] Verify Stripe webhook signature.
- [ ] Handle `checkout.session.completed`.
- [ ] Update consultation payment fields.
- [ ] Mark consultation `paid`.
- [ ] Add idempotency protections so webhook retries do not duplicate state transitions.

### Phase 6: gate Calendly behind payment

- [ ] Add post-payment success page or success-state reload path.
- [ ] Show Calendly only when the consultation is confirmed paid.
- [ ] Continue sending `utm_content=consultationId`.
- [ ] Keep the existing Calendly webhook mapping.

### Phase 7: tighten audit email and results messaging

- [ ] Stop unconditionally telling the user the full report was sent by email.
- [ ] Surface `emailStatus` where appropriate.
- [ ] Add a fallback state if email delivery fails.

### Phase 8: admin and observability

- [ ] Update admin views to show:
  - [ ] lead subscription status
  - [ ] consultation payment status
  - [ ] consultation scheduled status
- [ ] Add logs around:
  - [ ] token verification failures
  - [ ] Stripe checkout creation
  - [ ] Stripe webhook events
  - [ ] Calendly webhook events

## Files To Touch by Phase

### Phase 1

- `src/lib/booking-token.ts` (new)
- `src/lib/report-html.ts`
- `src/app/api/worker/audit/route.ts`
- `src/app/api/book/context/route.ts` (new)
- `src/app/book/page.tsx`
- `src/app/audit/results/[id]/page.tsx`

### Phase 2

- `src/app/book/page.tsx`
- optional new booking subcomponents under `src/components/`

### Phase 3

- `src/lib/types.ts`
- `src/lib/validation.ts`
- `src/app/api/book/subscribe/route.ts` (new)

### Phase 4

- `package.json`
- `src/lib/stripe.ts` (new)
- `src/app/api/stripe/checkout-session/route.ts` (new)
- `src/app/book/page.tsx`
- `src/app/api/consultations/route.ts` or a new consultation-intent route

### Phase 5

- `src/app/api/webhooks/stripe/route.ts` (new)
- `src/lib/types.ts`

### Phase 6

- `src/app/book/page.tsx`
- optional `src/app/book/success/page.tsx` (new)
- `src/app/api/webhooks/calendly/route.ts`

### Phase 7

- `src/app/audit/results/[id]/page.tsx`
- optional worker/admin helpers if exposing email state

## Suggested API Contracts

### `GET /api/book/context`

```json
{
  "leadId": "lead-123",
  "reportId": "rpt-456",
  "email": "merchant@example.com",
  "name": "Merchant Name",
  "storeUrl": "merchant.myshopify.com",
  "challengeArea": "catalog",
  "source": "audit_email"
}
```

### `POST /api/book/subscribe`

Request:

```json
{
  "token": "signed-token"
}
```

Response:

```json
{
  "success": true
}
```

### `POST /api/stripe/checkout-session`

Request:

```json
{
  "token": "signed-token",
  "name": "Merchant Name",
  "email": "merchant@example.com",
  "storeUrl": "merchant.myshopify.com",
  "teamSize": "6-15",
  "challenge": "catalog",
  "context": "Need help with catalog operations"
}
```

Response:

```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

## Test Plan

### Functional tests

1. Submit audit from homepage.
2. Confirm lead and audit job are created.
3. Confirm worker generates report.
4. Confirm report email contains tokenized booking link.
5. Open booking link and confirm prior audit context loads correctly.
6. Choose `Subscribe to Email List` and confirm lead marketing fields update.
7. Choose `Book Consultation ($50)` and confirm Stripe Checkout opens.
8. Complete Stripe sandbox payment.
9. Confirm Stripe webhook updates consultation to `paid`.
10. Confirm Calendly becomes available.
11. Complete booking in Calendly.
12. Confirm Calendly webhook updates consultation to `scheduled`.

### Negative tests

1. Expired booking token.
2. Invalid booking token signature.
3. Missing Stripe env vars.
4. Stripe webhook retry.
5. Calendly webhook without `utm_content`.
6. Email delivery failure.

## Open Decisions

These should be resolved before implementation begins:

1. Should `name` be collected during the audit flow, or only on booking?
2. Should email subscription sync to an external provider now or later?
3. Should the consultation price be configurable by env or hardcoded in the first pass?
4. Should `/book` allow direct entry without a token, or should tokenized flow be the primary supported path?
5. Should the audit results page also offer the same two options, or should that remain email-led only?

## Recommended Implementation Order

Implement in this order:

1. signed booking token
2. canonical booking context route
3. `/book` redesign with two options
4. email subscription endpoint
5. Stripe Checkout session route
6. Stripe webhook
7. payment-gated Calendly step
8. audit results page CTA cleanup
9. admin visibility and final polish

## Summary

The current application already has:

- audit creation
- report generation
- report email sending
- consultation record creation
- Calendly embed
- Calendly webhook tracking

The missing pieces are:

- secure booking handoff
- full prior-data preservation
- subscription option
- Stripe payment for consultation
- payment-gated scheduling
- more truthful email delivery UX

This plan keeps the existing good parts, fixes the broken handoff, and adds the required subscription and `$50` paid consultation flow on a clean, staged path.
