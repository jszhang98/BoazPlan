---
stepsCompleted: [1]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/system-architecture-BoazPlan-2026-02-13.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# BoazPlan - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for BoazPlan, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

**User & Church Management**
- FR1: [User] can register and verify membership (invite or OTP) and associate with a church.
- FR2: [User] can maintain a minimal profile (display name, notification preferences).
- FR3: [Pastor/Admin] can invite members, assign roles (member, leader, pastor), and remove access.
- FR4: [Pastor/Admin] can configure church-level privacy defaults and visibility rules.

**Request & Prayer Management**
- FR5: [Member] can create a request or prayer post with type, short description, visibility, and urgency.
- FR6: [Member] can post anonymously (privacy option) when allowed by church settings.
- FR7: [Member] can edit or cancel their request prior to assignment.
- FR8: [Pastor/Leader] can view an approval queue, approve/decline posts, and add moderator notes.
- FR9: [Member] can view the status and history of their requests and related updates.

**Volunteer Matching & Assignment**
- FR10: [Group Leader/Pastor] can assign a volunteer to a request.
- FR11: [Volunteer] can accept or decline an assignment.
- FR12: [Group Leader/Pastor] can view suggested volunteers for a request (based on basic criteria).
- FR13: [Volunteer] can update assignment status (accepted, in-progress, completed).

**Notifications & Communications**
- FR14: [User] can receive notifications (push/in-app/email) for relevant events (assignment, approval, updates).
- FR15: [Pastor/Leader] can send announcements or digests to a church or group.
- FR16: [User] can control notification preferences (channels and frequency).

**Moderation & Safety**
- FR17: [User] can report a post or user for policy violations.
- FR18: [Moderator/Pastor] can flag, hide, or remove content and capture a moderation reason.
- FR19: [Admin] can access audit logs of moderation and approval actions.

**Admin & Metrics**
- FR20: [Pastor/Admin] can view dashboard metrics (MAU, request response rate, avg response time).
- FR21: [Admin] can export reports listing requests, assignments, and resolution statuses.
- FR22: [Pastor/Admin] can configure governance settings (approval thresholds and visibility policies) using saved presets; changes must persist immediately and be recorded in the audit log with actor and timestamp.

**Offline & Sync**
- FR23: [Member] can save a draft request locally and continue editing while offline.
- FR24: [Member] can submit a request that will be retried/synced when connectivity is restored, and receive confirmation when accepted server-side.
- FR25: [User] can read recent feeds cached for offline viewing (basic read‑only offline support).

**Integration & Platform (PWA / SEO / Privacy)**
- FR26: [System] must expose public marketing pages with SEO metadata and OpenGraph/Twitter meta tags.
- FR27: [System] must prevent indexing of private content and enforce server-side access control for private endpoints.
- FR28: [System] must support push notifications via platform push services and provide an email digest fallback.

**Homepage & Registrations**
- FR39: [Visitor] can view the homepage with a hero, short tagline, and two clear CTAs (`Join as Member`, `Register a Church`).
- FR40: [User] can begin a member registration flow from the homepage and complete account creation.
- FR41: [Admin/Verified Rep] can begin Church registration from the homepage and complete the Church create flow (may enter *Pending* state if verification is required).

**Prayer‑Centric (Innovation)**
- FR29: [Member] can post to a church prayer wall with an anonymity option and optional pastor-approval requirement.
- FR30: [User] can indicate support with a one‑tap action (e.g., “Prayed / Praying”) for a prayer post.
- FR31: [Member] can submit a short testimony linked to a previously posted prayer to close the loop.
- FR32: [Pastor/Admin] can request or generate a daily/weekly prayer digest for groups or the church.

**Church Onboarding & Membership**
- FR33: [Admin] can create a Church with name, short-id, optional location, and basic governance settings.
- FR34: [Admin] can send an invite (link or OTP) to a person to join a Church; invitee can accept and be associated with the Church.
- FR35: [Pastor/Admin] can assign roles to Church members (Pastor, Group Leader, Member) and role-based visibility/permissions are enforced.
- FR36: [Pastor/Admin] can configure Church-level privacy defaults (e.g., require pastor approval for sensitive posts).
- FR37: [Group Leader] can create and manage small groups associated with a Church and add/remove members.
- FR38: [Pastor/Admin] can view a Church admin dashboard showing pending approvals, request counts, and response rate metrics.

### NonFunctional Requirements

- NFR1: Data minimization - Minimal PII; default retention for non-consented volunteer info 365 days; remove PII within 30 days of deletion.
- NFR2: Access controls - RBAC for all roles; default restricted visibility; RBAC enforcement pass rate ≥ 99%.
- NFR3: Encryption - TLS 1.2+ in-transit; AES-256 at-rest; secure secret management.
- NFR4: Anonymization - Support anonymized posts; automated redaction with ≥99% accuracy; manual redaction SLA 72 hours.
- NFR5: Privacy controls - Support deletion/export (deletion ≤ 30 days); clear retention policies.
- NFR6: Audit logs - Record approval, moderation, assignment, deletion actions.
- NFR7: Log segregation - Separate analytics from identifiable logs.
- NFR8: Log Retention - Define retention (e.g., 90 days detailed, 1 year summary).
- NFR9: Authentication - MFA for pastor/admin; session controls/expiration.
- NFR10: Vulnerability management - Dependency scanning; pentesting; critical remediation 7 days, high 14 days.
- NFR11: Incident response - Plan with 72h notification timeline.
- NFR12: Secure development - Code reviews, SAST, DAST, secrets scanning.
- NFR13: Scalability - Support 10k MAU; API p95 < 300ms.
- NFR14: Autoscaling - Stateless services; managed DBs with read replicas.
- NFR15: Async processing - Offload heavy tasks to background queues.
- NFR16: Caching & CDN - CDN for static/SSR; edge caching for marketing; rate limit private endpoints.
- NFR17: Rate limiting - Per-user posting ≤ 5/hr; Per-IP ≤ 200/min.
- NFR18: Backups - Daily backups; configurable retention (30-90 days); quarterly restore usage.
- NFR19: RPO/RTO - RPO ≤ 1hr; RTO ≤ 4hr.
- NFR20: Availability - 99.9% uptime target; graceful degradation.
- NFR21: Monitoring - Instrument latency, errors, queue depth; alerting for SLO breaches.
- NFR22: SLOs - API latency p95 < 300ms; notification delivery ≥ 95%; error rate < 0.5%.
- NFR23: Alerting - Error rate > 1%; queue depth > 1000; notification success < 95%.
- NFR24: Compliance - GDPR-like controls; policy documentation.

### Additional Requirements

**Architecture Constraints:**
- **App Stack:** React Web App (PWA), API Gateway/BFF, Auth Service, Plans Service, Notification Service.
- **Data:** Postgres (Primary), Redis (Cache).
- **Deployment:** Single-region deployment, Managed Cloud Services.
- **Starter Template:** None explicitly mandated, but "Single-region", "MVP-first" implies standardized setup (create-react-app or Vite implied for React PWA).

**UX Constraints:**
- **Performance:** "New Request" flow must complete in ≤ 2 minutes.
- **Offline:** Drafts must auto-save locally and support resume/retry.
- **Accessibility:** WCAG AA compliance.

### FR Coverage Map

| Epic | Functional Req Coverage | Non-Functional Req Coverage |
| :--- | :--- | :--- |
| **Epic 1: Identity & Church Setup** | FR1, FR2, FR3, FR4, FR33, FR34, FR35, FR37, FR40, FR41 | NFR1, NFR2, NFR5, NFR9 |
| **Epic 2: Request & Prayer Management** | FR5, FR6, FR7, FR9, FR23, FR24, FR25, FR29, FR30, FR31 | NFR13, NFR17 |
| **Epic 3: Volunteer Operations** | FR10, FR11, FR12, FR13 | NFR2 |
| **Epic 4: Communications & Notifications** | FR14, FR15, FR16, FR28, FR32 | NFR22, NFR23 |
| **Epic 5: Moderation & Safety** | FR8, FR17, FR18, FR19, FR36 | NFR4, NFR6, NFR24 |
| **Epic 6: Admin Dashboard & Analytics** | FR20, FR21, FR22, FR38 | NFR7, NFR8 |
| **Epic 7: Platform Architecture & PWA** | FR26, FR27, FR39 | NFR3, NFR10, NFR11, NFR12, NFR14-16, NFR18-21 |

## Epic List

1.  **Identity & Church Setup**: Establish the multi-tenant foundation, user authentication, and church organizational structure.
2.  **Request & Prayer Management**: Enable the core value proposition of posting, managing, and interacting with prayer requests.
3.  **Volunteer Operations**: Facilitate the assignment and tracking of volunteers to fulfill needs.
4.  **Communications & Notifications**: Keep users informed and engaged through multi-channel updates.
5.  **Moderation & Safety**: ensure content quality, safety, and compliance with church values.
6.  **Admin Dashboard & Analytics**: Provide oversight, metrics, and governance tools for administrators.
7.  **Platform Architecture & PWA**: Deliver a performant, secure, and offline-capable application experience.

## Epic 1: Identity & Church Setup

**Goal**: Enable secure user registration, authentication, and the creation of church organizations with role-based access control.

### Story 1.1: User Registration & Profile Management
**As a** New User,  
**I want** to register an account and verify my identity (via email or OTP),  
**So that** I can access the platform securely.

**Acceptance Criteria:**
- **Given** a visitor on the registration page, **When** they enter a valid email/phone, **Then** they receive a verification code.
- **Given** a verified user, **When** they complete the profile form (Name, Display Name), **Then** the account is created.
- **Given** a registered user, **When** they update their notification preferences, **Then** the settings are saved.

### Story 1.2: Church Organization Creation & Configuration
**As an** Admin,  
**I want** to create a new Church entity with specific settings,  
**So that** I can manage my congregation's digital space.

**Acceptance Criteria:**
- **Given** an admin user, **When** they access the "Create Church" flow, **Then** they can input Church Name, Short ID/Slug, and Location.
- **Given** a new Church, **When** created, **Then** default privacy settings are applied.
- **Given** an existing Church, **When** the admin updates the settings, **Then** the changes are persisted.

### Story 1.3: Role-Based Access Control (RBAC) Implementation
**As an** Admin,  
**I want** to assign roles (Pastor, Leader, Member) to users within my church,  
**So that** they have appropriate permissions to view and manage data.

**Acceptance Criteria:**
- **Given** a church member list, **When** an admin changes a user's role to "Pastor", **Then** that user gains access to admin dashboards and moderation tools.
- **Given** a "Member" user, **When** they attempt to access an admin route, **Then** they are denied access (403 Forbidden).
- **Given** an "Admin", **When** they start the invitation flow, **Then** they can send invites with a pre-assigned role.

---

## Epic 2: Request & Prayer Management

**Goal**: Provide a robust system for creating, editing, and managing prayer requests and needs, including offline support.

### Story 2.1: Create Prayer Request with Offline Support
**As a** Member,  
**I want** to draft and submit a prayer request, even if I have poor connectivity,  
**So that** I can share my needs without losing my work.

**Acceptance Criteria:**
- **Given** a logged-in member, **When** they fill out the request form (Title, Description, Urgency) and click Submit, **Then** the request is queued for upload.
- **Given** an offline device, **When** the network is restored, **Then** the queued request is automatically synced to the server.
- **Given** a request being drafted, **When** the app is closed and reopened, **Then** the draft content is restored.

### Story 2.2: View Request Feeds & History
**As a** Member,  
**I want** to view a feed of relevant requests and my own submission history,  
**So that** I can stay updated on my community's needs.

**Acceptance Criteria:**
- **Given** a member viewing the "Community" tab, **When** they scroll, **Then** approved requests visible to their role are loaded.
- **Given** a member viewing "My Requests", **When** a request status changes (e.g., Assigned), **Then** the status indicator is updated.
- **Given** a feed view, **When** the user is offline, **Then** cached data from the last session is displayed.

### Story 2.3: Anonymity & Privacy Options
**As a** Member,  
**I want** the option to post anonymously or restrict visibility to "Pastors Only",  
**So that** I can share sensitive needs comfortably.

**Acceptance Criteria:**
- **Given** the request form, **When** the user toggles "Anonymous", **Then** their name is hidden from the public feed view.
- **Given** a request marked "Pastors Only", **When** a regular member views the feed, **Then** this request is hidden.
- **Given** a pastor viewing an anonymous request, **When** they view details, **Then** they can see the original author (for safety/follow-up).

---

## Epic 3: Volunteer Operations

**Goal**: Streamline the process of matching volunteers to needs and tracking assignment progress.

### Story 3.1: Volunteer Assignment Logic
**As a** Leader,  
**I want** to assign a specific volunteer to a request,  
**So that** the need is addressed by a capable person.

**Acceptance Criteria:**
- **Given** a request in "Open" status, **When** a leader selects "Assign" and chooses a volunteer, **Then** the request status updates to "Assigned".
- **Given** a volunteer list, **When** searching for a candidate, **Then** the system filters valid members of the church.
- **Given** an assignment, **When** completed, **Then** the volunteer receives a notification.

### Story 3.2: Volunteer Dashboard & Status Updates
**As a** Volunteer,  
**I want** to see my assigned tasks and update their status,  
**So that** the leadership knows when a need has been met.

**Acceptance Criteria:**
- **Given** a volunteer logging in, **When** they view "My Assignments", **Then** a list of pending tasks is shown.
- **Given** an active assignment, **When** the volunteer marks it as "Completed", **Then** the request status updates and the original requester is notified (if configured).

---

## Epic 4: Communications & Notifications

**Goal**: Deliver timely and relevant updates to users through their preferred channels.

### Story 4.1: Multi-Channel Notification System
**As a** System,  
**I want** to send notifications via Push and Email,  
**So that** users are alerted regardless of their current app usage.

**Acceptance Criteria:**
- **Given** a trigger event (e.g., Assignment), **When** processed, **Then** a push notification is sent to the target user's device.
- **Given** a priority alert, **When** push fails or is disabled, **Then** an email fallback is triggered.
- **Given** a user preference, **When** they disable "Email Notifications", **Then** they only receive Push.

### Story 4.2: Announcements & Digests
**As a** Pastor,  
**I want** to send announcements or generate a prayer digest,  
**So that** I can mobilize the church for broad initiatives.

**Acceptance Criteria:**
- **Given** a pastor dashboard, **When** they create a "Church Announcement", **Then** all members receive a notification.
- **Given** a scheduled job, **When** the weekly digest runs, **Then** a summary email of open requests is generated for subscribers.

---

## Epic 5: Moderation & Safety

**Goal**: Ensure the platform remains a safe, trusted environment through community reporting and administrative oversight.

### Story 5.1: Content Reporting Workflow
**As a** User,  
**I want** to report inappropriate content or behavior,  
**So that** moderators can take action.

**Acceptance Criteria:**
- **Given** a post in the feed, **When** a user clicks "Report" and selects a reason, **Then** a moderation case is created.
- **Given** a reported post, **When** the report threshold is met (e.g., 3 reports), **Then** the content is temporarily hidden pending review.

### Story 5.2: Moderator Queue & Actions
**As a** Moderator,  
**I want** to view a queue of flagged content and take accept/reject actions,  
**So that** I can efficiently manage platform safety.

**Acceptance Criteria:**
- **Given** a moderation queue, **When** a moderator selects "Remove", **Then** the content remains hidden and the author is notified.
- **Given** a flagged post, **When** the moderator selects "Keep", **Then** the flags are cleared and content is restored.
- **Given** a moderation action, **When** performed, **Then** the reason is required (e.g., "Hate Speech", "Spam").

### Story 5.3: Moderation Audit Logging
**As an** Admin,  
**I want** an immutable log of all moderation actions,  
**So that** I can review decisions and ensure accountability.

**Acceptance Criteria:**
- **Given** any moderation action (Hide, Approve, Ban), **When** executed, **Then** a log entry is created with Actor, Timestamp, Action, and Reason.
- **Given** the Admin Dashboard, **When** navigating to "Audit Logs", **Then** these records are searchable and viewable (Read-Only).

---

## Epic 6: Admin Dashboard & Analytics

**Goal**: Provide high-level visibility into church health and platform usage metrics.

### Story 6.1: Global Admin Dashboard
**As an** Admin,  
**I want** to see key metrics like Monthly Active Users (MAU) and Request Resolution Rate,  
**So that** I can assess the engagement level of my church.

**Acceptance Criteria:**
- **Given** the admin landing page, **When** loaded, **Then** summary cards display Total Members, Open Requests, and Volunteers.
- **Given** the metrics view, **When** a date range is selected, **Then** the charts update to reflect that period.

### Story 6.2: Data Export & Reporting
**As an** Admin,  
**I want** to export data on requests and volunteer activity,  
**So that** I can perform offline analysis or reporting.

**Acceptance Criteria:**
- **Given** a report selection (e.g., "Volunteer Activity"), **When** "Export to CSV" is clicked, **Then** a file is generated containing the relevant rows.
- **Given** sensitive data in reports, **When** exported, **Then** verify the user has "Admin" or "Pastor" role.

### Story 6.3: Governance Configuration
**As an** Admin,  
**I want** to configure global settings for my church (e.g., Approval Thresholds),  
**So that** the platform rules match our operational needs.

**Acceptance Criteria:**
- **Given** the Settings page, **When** an Admin toggles "Require Approval for All Posts", **Then** new posts default to "Pending Approval".
- **Given** a change in settings, **When** saved, **Then** an audit log is generated.

---

## Epic 7: Platform Architecture & PWA

**Goal**: Establish the technical foundations for a secure, performant, and installable web application.

### Story 7.1: PWA Shell & Service Worker Implementation
**As a** User,  
**I want** the app to load quickly and be installable on my home screen,  
**So that** I have an app-like experience without an app store download.

**Acceptance Criteria:**
- **Given** a mobile browser, **When** the user visits the site, **Then** the browser prompts to "Add to Home Screen" (Manifest valid).
- **Given** no internet connection, **When** the app opens, **Then** the app shell loads (Service Worker active) instead of a browser error.
- **Given** navigation between pages, **When** offline, **Then** a "You are offline" indicator is visible.

### Story 7.2: Public Marketing Homepage & SEO
**As a** Visitor,  
**I want** to find the platform via search engines and understand its purpose immediately,  
**So that** I am encouraged to join or register my church.

**Acceptance Criteria:**
- **Given** a search engine crawler, **When** it visits the root URL, **Then** it sees valid meta tags, title, and description (SSR/Indexable).
- **Given** the homepage, **When** loaded, **Then** clear "Login" and "Register Church" CTAs are visible above the fold.

### Story 7.3: Security & Privacy Infrastructure
**As a** System,  
**I want** to enforce encryption and data minimization policies,  
**So that** user trust and compliance are maintained.

**Acceptance Criteria:**
- **Given** any data transmission, **When** in transit, **Then** TLS 1.2+ is enforced.
- **Given** a request to delete a user account, **When** processed, **Then** all PII is removed or anonymized within 30 days (Job verification).
- **Given** public endpoints, **When** accessed, **Then** rate limiting (e.g., 200 req/min) prevents abuse.

