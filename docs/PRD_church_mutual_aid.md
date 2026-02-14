# Project Requirements Document (PRD)

Project: Church Mutual-Aid System
Owner: (TBD)
Prepared by: John (Product)
Date: 2026-01-25

## 1. Purpose

Build a church-centric mutual-aid web application (PWA) that enables congregation members to request and offer practical help, share resources, and post prayer requests while preserving privacy and enabling church governance.

## 2. Objectives & Success Metrics

- Monthly Active Users (MAU) — target for pilot: 200 within first 3 months
- Monthly requests created — target: 100 within first 3 months
- Request response rate — ≥ 60% claimed by volunteers
- Median time-to-claim — ≤ 24 hours for high-priority requests
- Admin satisfaction — qualitative target: 80% positive in pilot survey

## 3. Scope

MVP will include: user & church unit registration, role & permission model, create/list requests (goods/services), volunteer claim workflow, prayer wall, approval workflow, in-app notifications, basic calendar, admin export & delete. Out of scope: cross-church public marketplace, advanced gamification, full offline-first sync, enterprise SSO integrations (unless pilot requires).

## 4. Users & Stakeholders

- Congregation members (requesters & volunteers)
- Pastors and ministry leaders (approvers, overseers)
- Volunteer coordinators
- System admin / deploy & maintainer

## 5. Key Features

- Authentication & Church Unit Model: registration, invite links, roles (member, volunteer, leader, admin).
- Request Posting: structured forms for goods/services, urgency, location/time, limited PII fields.
- Matching & Claiming: volunteer sign-up, claim locking, status updates, timeline.
- Approval Workflow: configurable per church (auto-publish or leader approval), audit trail.
- Prayer Wall: prayer posts, updates, mark-as-answered, subscription to updates.
- Notifications: in-app; email/SMS optional via provider integration.
- Calendar: calendar view for scheduled tasks and events.
- Admin Tools: member management, configurable visibility rules, data export & delete.

## 6. Non-functional Requirements

- Privacy & Compliance: minimal PII, export/delete support, encrypted backups where practical.
- Performance: mobile-first PWA, acceptable on low bandwidth; page load ≤ 3s on 3G for main flows.
- Security: role-based access control, HTTPS, audit logs for approvals/deletions.
- Maintainability: modular service boundaries, config-driven approval rules, documented admin flows.

## 7. User Flows (high-level)

1. Member registers and joins church using invite code.
2. Member creates a help request or prayer post with visibility setting.
3. (If enabled) Leader approves request; otherwise request publishes.
4. Volunteers browse or get notified; volunteer claims the request.
5. Volunteer completes task, marks complete; requester and leader notified.

## 8. Acceptance Criteria (MVP)

- AC-Auth: A new user can register, receive invite, and join a church unit.
- AC-RequestCreate: A member can submit a request; the request appears in church feed respecting visibility rules.
- AC-Approval: A leader can approve/decline requests when approval is required; approval history is logged.
- AC-ClaimFlow: A volunteer can claim a request; claim locks the item for others; status changes propagate to UI and notifications.
- AC-Notifications: In-app notifications are generated for claim, approval, and completion; email/SMS is optional and configurable.
- AC-DataMgmt: Admin can export a member’s PII and perform deletion; deletion removes PII while retaining anonymized audit entries.

## 9. Technical Recommendations

- Frontend: React (PWA) with responsive design
- Backend: Node.js + NestJS
- Database: PostgreSQL for relational data and audit logs
- Notifications: transactional email provider (SendGrid/Mailgun) + optional SMS (Twilio)
- Hosting: Managed cloud (e.g., Heroku / AWS Elastic Beanstalk / Vercel + managed Postgres)

## 10. Phased Roadmap

- Phase 0 (2 weeks): Discovery & governance — interviews with pilot churches, finalize privacy rules.
- Phase 1 (6–8 weeks): MVP — auth, request CRUD, approval, matching, notifications, admin UI, pilot release.
- Phase 2 (4–6 weeks): Enhancements — calendar polish, exports, analytics, SMS integration, offline improvements.

## 11. Risks & Mitigations

- Privacy risks: minimize public fields, approval gates, audit logs.
- Low engagement: onboarding flows, reminder opt-ins, recognition/leaderboard for volunteers.
- Maintenance costs: choose managed services, automate backups, provide admin training.

## 12. Deliverables

- Pilot-ready PWA with MVP features
- Admin documentation, privacy policy draft
- Small pilot deployment and deployment runbook

## 13. Next Steps

1. Conduct 3–5 interviews with pilot churches and capture governance requirements.
2. Confirm tech stack and hosting budget.
3. Approve MVP backlog and start Sprint 1.

---

Document generated from project brief. For the Jira stories and sprint plan, see companion files in this folder.
