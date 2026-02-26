# UX Design Specification — BoazPlan

**Author:** UX Designer (BMAD)
**Date:** 2026-02-13
**Status:** Draft — ready for review by UX lead

---

## Project summary
- Purpose: Design a mobile-first, low-friction UI for posting and managing community help requests (BoazPlan).
- Primary users: Members, Pastors/Admins, Volunteers.
- Key constraint: Primary flow (New Request) must be completable in ≤ 2 minutes.

## Scope (this spec)
- New Request creation (primary + drafts + offline recovery)
- Visibility & Pastor approval workflow
- Volunteer assignment, accept/decline, status updates
- Notifications and basic messaging UX
- UI patterns, component library notes, accessibility and analytics hooks

## Success criteria
- Median task completion time (primary path) ≤ 2 minutes for ≥ 80% of participants
- ≥ 80% of pastors can change visibility and approval settings correctly
- Volunteers can accept/decline and change status with ≤ 1 error per task

## User flows (high level)
1. Onboard / quick sign-in (church email/phone + OTP or invite)
2. New Request — select category, write short description, set visibility, submit
3. Save Draft / resume after connectivity loss
4. Pastor approval queue — review, change visibility, approve/reject
5. Volunteer assignment — accept/decline, update progress, mark complete
6. Notifications — push / in-app badge / email summaries

## Screen inventory (mobile PWA)
- Home / Feed (filtered by visibility)
- New Request (single-column form, progressive disclosure)
- Drafts / My Requests
- Pastor Queue / Request Detail / Approve Modal
- Volunteer Dashboard / Assignment Detail
- Settings / Notifications / Privacy Controls

## Key UI components & behaviours
- Progressive New Request form: short title -> auto-suggest categories -> required fields highlighted
- Visibility chooser: `Public | Group | Private` with inline help and example of who will see the post
- Approval toggle (for pastors) with explicit confirmation and audit note
- Offline draft save + resume banner (graceful retry)
- Assignment CTA: `Accept` / `Decline` with immediate confirmation and notification to requester
- Minimal steps and keyboard-first inputs for fast completion

## Copy & microcopy (examples)
- Primary CTA: `Post request` (primary)
- Visibility helper: `Group only — only people in your small group will see this.`
- Offline hint: `Draft saved — we'll retry when you're back online.`

## Accessibility
- WCAG AA baseline: color contrast, focus order, semantic HTML roles
- Large tap targets (44px), reachable controls within one thumb zone
- ARIA labels for all modals, dynamic content announcements for status changes

## Analytics & instrumentation
- Track: time-to-submit, abandonment point per step, visibility changes, approval actions, assignment accept/decline
- Events: `new_request_start`, `new_request_submit`, `visibility_change`, `approval_action`, `assignment_accept`

## Edge cases & error handling
- Network: autosave drafts, clear error messages, retry option
- Duplicate requests: suggest similar requests before submit
- Privacy change after assignment: warn and require confirmation

## Acceptance criteria (for stories)
- New Request primary path completed in ≤ 2 minutes in manual test
- Draft autosave persists across tab reloads and offline/online transitions
- Pastor can change visibility and set approval — action reflected in feed
- Volunteer can accept assignment and update status; requester and volunteer receive notifications
- All new screens meet WCAG AA checks and pass basic accessibility audit

## Design tokens / component references
- Use project's token set (colors, spacing, typography) — add `ui-tokens.md` when available
- Components: `Button/Primary`, `Form/Input`, `Modal/Confirm`, `Toast/Offline`

## Additional Screen Specifications

### 1. Church Creation (New Church Registration)
*Target User: Pastor or Administrator establishing a new church instance.*
- **Step 1: Landing & Auth:** "Register your Church" CTA. Simple Email/OTP authentication or Social Login (Google/Apple).
- **Step 2: Church Details:** 
  - Input: Church Name (Required), Church ID/Handle (Unique URL slug, auto-generated, editable).
  - Location: Address search with map confirmation (Google Places API).
  - Branding: Upload Logo (optional), Primary Color picker.
- **Step 3: Admin Profile:** Confirm Admin Name and Contact Info.
- **Step 4: Operational Settings (Defaults):** 
  - Privacy: "Strict" (All posts require approval) vs "Open" (Trusted members post freely).
  - Terms: Accept platform MSA and Data Privacy agreement.
- **Success State:** "Church Created" dashboard with "Invite Leaders" and "Print QR Code" quick actions.

### 2. Admin Dashboard (Metrics & Moderation)
*Target User: Church Admins and Moderators.*
- **Overview Tab:**
  - **Key Metrics (Top Cards):** Monthly Active Users (MAU), Request Resolution Rate (%).
  - **Activity Sparklines:** Requests vs Solved over last 30 days.
- **Moderation Queue:**
  - List of "Pending Approval" requests & "Flagged" content.
  - Quick Actions: `Approve`, `Reject` (with reason preset), `Message User`.
  - Batch selection for clearing backlog.
- **Requests Management:**
  - Filterable list: Active, Unassigned, Overdue (>72h).
  - Status indicators: High Urgency (Red), Normal (Gray).
- **Members:** Searchable list, Role assignment (Member -> Leader -> Admin).

### 3. Public Homepage (Marketing & PWA Landing)
*Target User: Unauthenticated visitors, potential new churches.*
- **Hero Section:**
  - H1 Tagline: "Community help, coordinated."
  - Subtext: "A privacy-first platform for church mutual aid."
  - **Primary CTA:** "Join / Register Church".
  - **Secondary CTA:** "Log In".
- **PWA Install Prompt:**
  - Smart banner: "Install BoazPlan for a better experience" (Add to Home Screen instructions).
  - "How it works" 3-step graphic: Post Necessity -> Admin Approves -> Community Responds.
  - **Features Grid:** Privacy focus, Real-time updates, Volunteer matching.
- **Footer:** Links to Privacy Policy, Terms, Support.

## Deliverables & artifacts
- Clickable mobile PWA prototype (screens above)
- Annotated UI spec (this doc + screenshots)
- Acceptance-test checklist and analytics events map

## Review & next steps
1. Review this draft with Product & Engineering (assign a UX lead).  
2. Produce clickable prototype for the three core flows (New Request, Approval, Volunteer).  
3. Convert UI screens into epics & stories with acceptance criteria and analytics tasks.  

---

## Where to find / who to involve
- Internal UX workflow: `_bmad/bmm/workflows/2-plan-workflows/create-ux-design` (use to expand this spec).  
- UX agent doc: `_bmad/bmm/agents/ux-designer.md` — use for role guidance and review.  
- Output file (this spec): `_bmad-output/planning-artifacts/ux-design-specification.md`.

If you'd like, I can (A) expand this into a clickable prototype, (B) convert screens into Epics/Stories, or (C) draft a hiring brief to find an external UX expert. Reply with A, B, or C.
