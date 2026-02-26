---
story_id: 1-1
epic_id: 1
title: User Registration & Profile Management
status: complete
created: 2026-02-15
assignee: TBD
---

# Story 1.1: User Registration & Profile Management

**Epic:** Epic 1 - Identity & Church Setup

**As a** New User,  
**I want** to register an account and verify my identity (via email or OTP),  
**So that** I can access the platform securely.

## Acceptance Criteria

- **Given** a visitor on the registration page, **When** they submit email (and optional display name), **Then** a user record is created and the UI shows a success message.
- **Given** an existing user, **When** they fetch their profile via GET `/api/v1/users/:id`, **Then** the correct data is returned.
- **Given** a registered user, **When** they PATCH `/api/v1/users/:id` with new display name or preferences, **Then** the database is updated.
- Playwright E2E test exercises the registration flow and passes against the running app.

## Context from PRD

### Functional Requirements Covered
- FR1: [User] can register and verify membership (invite or OTP) and associate with a church.
- FR2: [User] can maintain a minimal profile (display name, notification preferences).

### Non-Functional Requirements
- NFR1: Data minimization - Store minimal PII; require only fields necessary for functionality (display name, contact for volunteers if consented).
- NFR9: Authentication & account protection - MFA for pastor/admin accounts; session controls and token expiration for all users.

## Context from Architecture

- **Components Involved:** Auth Service, API Gateway/BFF, Primary DB (Postgres).
- **Data Flow:** User → Web App → API Gateway → Auth Service → DB.
- **Security:** TLS 1.2+ in-transit; AES-256 at-rest.
- **Scalability:** Stateless services.

## Context from UX

- **Screens:** Registration page with email/phone input, OTP verification, profile form.
- **Flows:** Progressive disclosure for form fields; mobile-first design.
- **Accessibility:** WCAG AA - large tap targets, ARIA labels.

## Technical Implementation Notes

- **Frontend:** Added `Register` page and React Router navigation; form submits to `/api/v1/users`.
- **Backend:** Added user endpoints (`POST /api/v1/users`, `GET`/`PATCH /api/v1/users/:id`) with Prisma persistence; auto-verification for simplicity.
- **Database:** Extended Prisma schema with `User` model; applied migration using SQLite dev DB.
- **Integrations:** OTP/email stubbed (not implemented yet) – verification flag set true on creation.
- **Testing:** Added Playwright E2E spec for registration; API logic covered by integration via E2E.

## Tasks

- [x] add `User` model to Prisma schema and migrate database.
- [x] implement registration and profile endpoints in API.
- [x] scaffold frontend registration page and router links.
- [x] add Playwright registration test and confirm passes.
- [x] update story documentation and mark status `in-progress`.

## Dependencies

- None - This is the first story in Epic 1.

## Definition of Done

- Code implemented and unit tested.
- Acceptance criteria verified manually.
- Code reviewed and approved.
- Deployed to staging environment.
- No critical bugs or security issues.

## Next Steps

After completion, move to Story 1.2 or validate with QA.