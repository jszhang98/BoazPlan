---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - docs/project_brief_church_mutual_aid.md
  - _bmad/bmm/data/project-context-template.md
date: 2026-02-12
author: Jansen
completed: true
completedAt: 2026-02-12T00:00:00Z
---

# Product Brief: BoazPlan

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Input documents loaded
- `docs/project_brief_church_mutual_aid.md`
- `_bmad/bmm/data/project-context-template.md`

## Executive Summary

BoazPlan is a church-centered mobile-first app that makes it easy for congregation members, pastors, and group leaders to request and offer help, coordinate prayer, and manage volunteer tasks—while preserving privacy and church governance. The app focuses on simplicity and trust so people feel comfortable using it regularly, turning goodwill into timely, verifiable help.

---

## Core Vision

### Problem Statement

Church communities lack a single, church-managed digital place to coordinate mutual aid, prayer requests, and practical help. Current communication is fragmented (phone trees, ad-hoc messages, public social platforms) and makes it hard to match needs with volunteers while maintaining privacy and oversight.

### Problem Impact

- Requests for help go unanswered or are delayed.  
- Pastors and leaders struggle to track and approve sensitive requests or manage privacy.  
- Community goodwill is under-leveraged due to friction and poor follow-through.

### Why Existing Solutions Fall Short

- General social platforms don’t offer church governance, privacy controls, or simple approval workflows.  
- Ad-hoc systems miss structured volunteer matching and auditability, reducing trust and repeat use.

### Proposed Solution

A secure, church-governed app where members can post needs (material help, rides, caregiving, prayer), leaders can approve or triage requests, volunteers can sign up and update status, and notifications/reminders close the loop. Mobile-first UX, lightweight signup (church email/phone + OTP or invite), and configurable visibility rules will make participation easy and safe.

### Key Differentiators

- Church-controlled governance and privacy settings (visibility, approval workflows).  
- Built-in volunteer matching and simple task status tracking.  
- Low-friction mobile UX designed for quick posting and responses.  
- Practical metrics and admin views for pastors (response rate, MAU).

### Success Metrics

- Monthly Active Users (MAU) within participating churches  
- Request response rate (percentage of requests accepted and resolved)  
- Pastor/leader satisfaction and continued adoption

---

## Metrics Definition

- **Metric name:** MAU (Monthly Active Users)
  - **Definition:** Unique users with activity in the last 30 days
  - **Formula:** count(distinct user_id where event_date in last 30 days)
  - **Data source:** analytics event stream / `user_activity` table
  - **Frequency:** Monthly
  - **Owner:** Product
  - **Baseline:** TBD
  - **Target:** Pilot = 100 MAU (3 months)
  - **Action / Alert:** If <50% of target, improve onboarding & outreach

- **Metric name:** Request Response Rate
  - **Definition:** % of requests assigned to a volunteer within 72 hours
  - **Formula:** (requests assigned within 72h / total requests) * 100
  - **Data source:** `requests` and `assignments` tables
  - **Frequency:** Weekly
  - **Owner:** Community Lead
  - **Baseline:** TBD
  - **Target:** ≥70%
  - **Action / Alert:** If < target, run volunteer engagement campaign + review notifications

- **Metric name:** Request Resolution Rate
  - **Definition:** % of requests marked complete within 14 days
  - **Frequency:** Weekly
  - **Owner:** Community Lead
  - **Baseline:** TBD
  - **Target:** ≥80%
  - **Action / Alert:** Follow-up nudges and volunteer support if low

- **Metric name:** Pastor/Leader Satisfaction
  - **Definition:** Average survey score (1–5) from leaders about moderation & governance
  - **Frequency:** Monthly/Quarterly
  - **Owner:** Product/PM
  - **Baseline:** TBD
  - **Target:** ≥4.0
  - **Action / Alert:** Run targeted interviews if < target


---

## Target Users

### Primary Users

- **Sarah Miller — Member**  
  - Context: Regular church member who wants to connect, share prayer requests, offer help, and post testimonies.  
  - Motivations & Goals: Quickly post needs/offers, get timely responses, maintain privacy, and see help completed.  
  - Pain Points: Fragmented communication, uncertain follow-through, unclear who saw or answered requests.  
  - Success Vision: Can post a prayer or help request in <2 minutes and get a response or assignment within hours.

- **Pastor David Cole — Pastor**  
  - Context: Lead pastor responsible for approval, governance, and community well‑being.  
  - Motivations & Goals: Approve sensitive posts, form groups, assign volunteers, publish events, and monitor church health metrics.  
  - Pain Points: Hard to track requests and approvals across channels; privacy and governance concerns.  
  - Success Vision: Efficient moderation and oversight with clear audit trails and simple admin dashboards.

- **Lisa Carter — Group Leader**  
  - Context: Small group leader coordinating meetings, materials, and member care.  
  - Motivations & Goals: Match members with needs and volunteers, share study content, and maintain group cohesion.  
  - Pain Points: Difficulty knowing which members need help and who’s available to serve.  
  - Success Vision: Quickly view group needs, assign helpers, and confirm task completion from one place.


## User Journeys (summary)

- **Sarah — Member**  
  - Discovery: Invited via church or hears about app in announcement.  
  - Onboarding: Quick verification (church email/OTP) → select church → join groups.  
  - Core Usage: Post prayer/request or offer help → receive notifications when matched → update status when task done.  
  - Aha Moment: A volunteer accepts and updates status within hours.  
  - Long-term: Uses app for weekly group updates and occasional help requests.

- **Pastor David — Pastor**  
  - Discovery: Church leadership rollout.  
  - Onboarding: Admin setup with approval workflows and visibility rules.  
  - Core Usage: Review pending posts → approve/triage → view metrics (response rate, unresolved requests).  
  - Aha Moment: Real-time dashboard shows improved response rates after two weeks.  
  - Long-term: Uses metrics to coordinate volunteers and policy improvements.

- **Lisa — Group Leader**  
  - Discovery: Assigned during onboarding or volunteer sign-up.  
  - Onboarding: Join group(s) and set notification preferences.  
  - Core Usage: Monitor group feed → match requests to volunteers → confirm completion.  
  - Aha Moment: Group members respond quickly to a time-sensitive need because assignments are clear.  
  - Long-term: Reliably coordinates weekly care and small-group logistics.


## Constraints & Design Implications
- **Privacy:** Role-based visibility; pastor approval for sensitive posts; minimal personal data.  
- **Content Moderation:** All posts routed for approval; audit logs for transparency.  
- **Accessibility:** Support screen readers, large text, and simple navigation.  
- **Devices & Connectivity:** Mobile-first PWA with offline read/cache and graceful sync.  
- **Safety:** Policies & reporting for paid services and identity verification for higher-risk offers.

---

## Workflow Completion

🎉 **Product Brief Complete, Jansen!**

**What we've accomplished:**

- ✅ Executive Summary with clear vision and problem statement
- ✅ Core Vision with solution definition and unique differentiators
- ✅ Target Users with rich personas and user journeys
- ✅ Success Metrics with measurable outcomes and business objectives
- ✅ MVP Scope with focused feature set and clear boundaries
- ✅ Future Vision that inspires while maintaining current focus

**Document location:** `_bmad-output/planning-artifacts/product-brief-BoazPlan-2026-02-12.md`

### Document Quality Check
- Executive summary communicates the vision and problem clearly
- Target users and personas are aligned with the problem and solution
- Success metrics are measurable and tied to user outcomes
- MVP scope is focused and realistic

### Recommended Next Steps
- Run workflow: `create-prd` to generate a detailed PRD based on this brief
- Consider: `create-ux-design` for UX research & designs, and `domain-research` if deeper market insights are needed

**Your brief is ready for the next phase — tell me if you want to start `create-prd` now or need any edits.**

---

## MVP Scope

### Core Features

- Church & user onboarding (invite/OTP, minimal profile)
- Post requests (help/prayer) and offers with simple forms
- Approval workflow (pastor/group leader moderation)
- Volunteer matching, assignment, and status updates
- Notifications (push/email/in-app)
- Basic admin dashboard for pastors (pending posts, response metrics)
- Accessibility basics (screen reader support, large text, simple navigation)

### Out of Scope for MVP

- Payments and commerce features
- Advanced analytics and long-term retention tooling
- Multi-church federation or complex cross-church sharing
- Full offline-first sync (beyond basic caching)
- Complex role/custom permissions and integrations

### MVP Success Criteria

- Core flow validated: a request can be posted, approved, assigned, and resolved
- Request Response Rate ≥ 70% within 72 hours
- Pastor/Leader Satisfaction ≥ 4.0 (survey)
- Pilot MAU ≥ 100 within 3 months

### Future Vision

- Richer analytics and admin reporting, scheduling integration, SMS gateway, identity verification for higher-risk offers, expanded volunteer profiles, and broader multi-church support.
