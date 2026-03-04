---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
---

# BoazPlan - Sprint Plan

**Date:** 2026-02-28
**Status:** Draft
**Sprint Duration:** 2 Weeks

## Strategy
This plan breaks down the BoazPlan MVP into 4 Sprints, prioritizing the **Core Foundation** (Multi-tenancy, Auth) in Sprint 1, followed by the **Key Value Loop** (Requests, Volunteers) in Sprint 2.

**Critical Path:**
1.  **Sprint 1:** Foundation (Tenant Schema, Auth, PWA Shell).
2.  **Sprint 2:** Core Loop (Request Creation, Volunteer Assignment, Offline Sync).
3.  **Sprint 3:** Engagement & Innovation (Compass, Badges, Journals).
4.  **Sprint 4:** Governance & Polish (Moderation, Admin Dashboards, SEO).

---

## Sprint 1: Foundation & Identity (Weeks 1-2)
**Goal:** A secured, multi-tenant app where users can register, join a church, and see a basic home screen.

### Stories
*   **Story 0.1:** [Scaffold] Initialize Repo, PWA Shell (Vite+React), & CI Pipeline.
*   **Story 0.2:** [Backend] Setup Node.js + Fastify + Prisma with Multi-Tenant Schema Middleware.
*   **Story 1.1:** [Backend] Implement Schema-per-tenant Isolation & Migrations.
*   **Story 1.2:** [Frontend] Build Landing Page & PWA Install Prompts.
*   **Story 2.1:** [Feature] Church Registration Flow (Create Tenant).
*   **Story 2.2:** [Feature] Member Invite & Join Flow (Unique Links).
*   **Story 2.3:** [Feature] User Profile Management.

**Deliverable:** A deployed URL where a user can sign up and join a specific church tenant.

---

## Sprint 2: The Core Loop (Weeks 3-4)
**Goal:** Members can post requests (even offline) and Volunteers can be assigned.

### Stories
*   **Story 3.1:** [Feature] Create Request with Offline Drafting (IndexedDB).
*   **Story 3.2:** [Feature] Volunteer Assignment & Logic (Proximity Sorting).
*   **Story 3.3:** [Feature] Volunteer Accept/Decline Flow.
*   **Story 3.4:** [Feature] Request Status Tracking & History.
*   **Story 4.4:** [Feature] Prayer Wall & Anonymity Logic (Basic Feed).

**Deliverable:** Functional "Ask for Help" and "Give Help" loop.

---

## Sprint 3: Engagement & Innovation (Weeks 5-6)
**Goal:** Deepen engagement with the "Compass", "Badges", and "Supporter" features.

### Stories
*   **Story 4.1:** [Innovation] Compass Widget (Geospatial Sorting & UI).
*   **Story 4.3:** [Innovation] Spiritual Reactions (Praying/Listening).
*   **Story 6.1:** [Gamification] Badge Management & Awarding (Pastor View).
*   **Story 6.2:** [Gamification] Badge Display on Profiles.
*   **Story 5.1:** [Monetization] Stripe Subscription Integration (Supporter Upgrade).
*   **Story 5.2:** [Privacy] Private Prayer Journal with Client-Side Encryption.

**Deliverable:** The "Sticky" features that make the app unique.

---

## Sprint 4: Governance & Launch Readiness (Weeks 7-8)
**Goal:** Tools for safety, compliance, and public launch.

### Stories
*   **Story 7.1:** [Moderation] Moderation Queue & Content Flagging.
*   **Story 7.2:** [Governance] Church Privacy & Default Settings.
*   **Story 7.3:** [Admin] Admin Dashboard Metrics (MAU, Response Rate).
*   **Story 1.3:** [Compliance] Data Sovereignty (Export/Delete Tenant).
*   **Story 7.2:** [SEO] Public Marketing Pages & Meta Tags.

**Deliverable:** A launch-ready, compliant platform.

---

## Next Steps
1.  **Approve Plan:** Confirm this sprint breakdown.
2.  **Generate Tickets:** Convert Sprint 1 stories into implementable markdown files.
