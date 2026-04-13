# Full Audit Service Plan

## Purpose

This document defines the next implementation track for the second-tier human-led service that follows the paid consultation.

The product split is:

1. `Preliminary AI Audit`
2. `$50 Consultation`
3. `Full Audit Service`

The full audit service should be managed from admin after the consultation, not sold or automated directly on the public site in the first pass.

## Product Definition

### Preliminary AI Audit

This is the current storefront-driven report:

- automated
- public-storefront-based
- fast
- emailed to the merchant

### Paid Consultation

This is the current Stripe + Calendly flow:

- one-time payment
- scheduled session
- Google Meet call
- short recap and next-step discussion

### Full Audit Service

This is a separate, human-led engagement that begins after the consultation.

The deliverable should include:

1. Executive summary
2. Business context
3. Current-state operations review
4. Findings by operational area
5. Severity and business impact
6. Recommended next steps
7. 30 / 60 / 90 day roadmap
8. Optional appendix with meeting notes, screenshots, and evidence

## Service Delivery Workflow

Recommended operational sequence:

```txt
Consultation paid
-> consultation scheduled
-> Google Meet call happens
-> admin decides to start full audit
-> full audit engagement created
-> intake collected / confirmed
-> audit work performed
-> final report drafted
-> final report emailed
-> engagement marked delivered
```

## Data Model Recommendation

Do not overload `Consultation` to store the full second-tier workflow.

Add a separate `AuditEngagement` record.

Suggested type:

```ts
export interface AuditEngagement {
  id: string;
  leadId: string;
  consultationId?: string;
  reportId?: string;

  serviceType: "full_audit";
  status:
    | "proposed"
    | "intake_pending"
    | "intake_received"
    | "meeting_scheduled"
    | "meeting_completed"
    | "in_progress"
    | "draft_ready"
    | "delivered"
    | "closed"
    | "cancelled";

  owner?: string;

  meetingAt?: string;
  meetingUrl?: string;
  meetingNotes?: string;

  intakeResponses?: {
    teamSize?: string;
    fulfillmentSetup?: string;
    systems?: string;
    topProblems?: string[];
    goals?: string;
  };

  internalNotes?: string;
  prioritySummary?: string;
  recommendedNextSteps?: string[];

  finalReportFormat?: "html" | "pdf";
  finalReportHtml?: string;
  finalReportUrl?: string;
  finalReportSentAt?: string;

  createdAt: string;
  updatedAt: string;
}
```

## Admin Requirements

Admin should eventually be able to:

1. create a full audit engagement from a consultation
2. view all engagements in one place
3. open a specific engagement detail page
4. track intake status
5. store meeting details
6. write internal notes
7. draft final report content
8. send the final report email
9. mark the engagement delivered

## Email / Report Delivery Requirements

The full audit service will need three new admin-driven email actions:

1. `Send Intake Email`
2. `Send Meeting Confirmation Email`
3. `Send Final Report Email`

The final report email should include:

- a brief thank-you note
- 3-5 key takeaways
- the full report as HTML or PDF
- recommended first step
- optional CTA for implementation support

## Phase Breakdown

### Phase 1

Build the admin and data-model foundation.

Deliverables:

- `AuditEngagement` type
- Firestore collection support
- admin services list API
- admin services detail API
- admin services list page
- admin services detail page
- admin navigation link

### Phase 2

Add creation and admin workflow controls.

Deliverables:

- create engagement from consultation
- create engagement from audit detail
- status updates
- meeting data capture
- intake data capture

### Phase 3

Add report authoring and email delivery.

Deliverables:

- final report storage
- email helpers
- send report from admin
- delivery timestamps

### Phase 4

Add polish and deeper service tooling.

Deliverables:

- PDF support
- file attachments
- implementation proposal follow-up
- richer reporting and filtering

## Phase 1 Scope In Detail

### Data model

Add `AuditEngagement` to:

- `src/lib/types.ts`

Add the Firestore collection name to:

- `src/lib/firebase.ts`

### Admin APIs

Add:

- `GET /api/admin/services`
- `GET /api/admin/services/[id]`

These routes should:

- read `auditEngagements`
- join related `lead`
- join related `consultation`
- join related `report` where relevant

### Admin pages

Add:

- `/admin/services`
- `/admin/services/[id]`

The list page should show:

- lead
- status
- linked consultation
- meeting date
- report delivery state
- last updated

The detail page should show:

- engagement summary
- lead information
- consultation snapshot
- source AI report snapshot
- placeholders for intake, meeting, and report sections

## Files Expected In Phase 1

Update:

- `src/lib/types.ts`
- `src/lib/firebase.ts`
- `src/app/admin/layout.tsx`

Add:

- `src/app/api/admin/services/route.ts`
- `src/app/api/admin/services/[id]/route.ts`
- `src/app/admin/services/page.tsx`
- `src/app/admin/services/[id]/page.tsx`

## Notes

- Phase 1 is intentionally admin-only.
- It does not yet include the action to create engagements from consultations.
- It does not yet send any new emails.
- It gives the project a stable place to manage the second-tier service without mixing it into the public consultation flow.
