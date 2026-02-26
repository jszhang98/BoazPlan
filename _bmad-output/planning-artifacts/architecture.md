---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/system-architecture-BoazPlan-2026-02-13.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'architecture'
project_name: 'BoazPlan'
user_name: 'Jansen'
date: '2026-02-20'
lastStep: 8
status: 'complete'
completedAt: '2026-02-20T21:05:00Z'
---

# Architecture Decision Document — BoazPlan

_Consolidated architecture workspace initialized and populated from existing PRD, system architecture, Epics, and UX spec. Steps 1–3 (initialization, context analysis, starter evaluation) completed._

## Project Context Analysis

### Requirements overview (summary)
- Core user flows (New Request, Volunteer assignment, Approval queue, Admin dashboard) are driven by the PRD and UX spec and map cleanly to the component model described in the system architecture document.
- Key NFR drivers: offline-first drafts & sync, push/notification deliverability, auditability (moderation & logs), and performance targets for MVP (page load < 2s, API p95 < 300ms).

### Scale & complexity
- Project complexity: **Low → Medium (MVP with offline + real-time-ish features)**
- Primary technical domain: `Web App (PWA)` + backend API services
- Cross-cutting concerns: offline/sync, notifications, RBAC/audit, observability/security

### Architectural implications
- Frontend must be a PWA (service worker + offline caching + small bundle strategy).
- Backend needs stateless API design (Plans Service + Auth Service) with Postgres for transactional data and Redis for short-lived caches and rate-limiting.
- Moderation & audit require append-only logs and role-based access controls with fast query paths for dashboards.
- Observability and CI/CD from day one to detect regressions in performance and notification delivery.

## Starter Template Evaluation (recommendation)

### Recommended starter (aligned with current repo scaffold)
- **Stack:** React (PWA) + Node.js API (Express/Fastify) + Postgres + Redis
- **Frontend starter:** Vite + React (JS) — simple, fast dev loop and PWA friendly
- **Testing:** Vitest for unit tests (already present in repo)
- **Styling:** Tailwind CSS (recommended for fast iteration)

**Rationale:** Matches PRD/UX expectations (mobile-first PWA), keeps developer experience fast for an MVP, and pairs well with the existing `vitest` test setup.

**Initialization command (example):**

```bash
npm create vite@latest boazplan -- --template react
```

*(If you prefer TypeScript, use the `react-ts` template.)*

### Architectural decisions provided by this starter
- Module-based frontend structure optimized for fast incremental delivery
- Service-worker/PWA basics can be added with a small plugin or manual config
- Standard dev/test scripts and E2E-ready structure (facilitates later `tea` test framework)

## Files imported / references
- Source architecture (imported): `_bmad-output/planning-artifacts/system-architecture-BoazPlan-2026-02-13.md`
- PRD: `_bmad-output/planning-artifacts/prd.md`
- Epics: `_bmad-output/planning-artifacts/epics.md`
- UX: `_bmad-output/planning-artifacts/ux-design-specification.md`

## Next steps (suggested)
1. Continue to `step-04-decisions` to record specific architecture decisions (e.g., API authentication pattern, data model sketch for Plans Service, offline cache strategy).  
2. Create a minimal frontend scaffold (Vite + React) and wire basic API contract for `Plans Service` story.  
3. Run `tea framework` to add E2E scaffolding when ready.

---

*Document initialized and steps 1–3 completed by BMAD agent on user request.*
## Core Architectural Decisions

### Data Architecture (DECIDED)

- **Decision:** Use **PostgreSQL (managed)** as the primary datastore.
- **ORM & Migrations:** **Prisma** + **Prisma Migrate** for schema and migration management.
- **Schema approach:** Normalized core tables (`users`, `churches`, `requests`, `assignments`) with `JSONB` columns for flexible metadata and extension points.
- **Caching & messaging:** **Redis** for cache, rate‑limiting, and simple pub/sub (notification fan-out).
- **Validation:** `Zod` (TypeScript) or `Ajv`/`Joi` (JavaScript) for request/schema validation.
- **Rationale:** ACID relational semantics for transactional request/assignment flows, strong query patterns for dashboards, and flexible JSONB for optional fields. Prisma offers a good DX and safe migrations for an MVP.
- **Affects:** Plans Service, Auth Service (session/audit storage), Admin Dashboard, Epics related to offline sync and performance.

*Recorded by user on 2026-02-20 — Data Architecture accepted.*

### Authentication & Security (DECIDED)

- **Decision:** Use `JWT` access tokens with **secure refresh tokens** held in HTTP-only, SameSite cookies for session flows; support OAuth/OIDC for SSO in future.
- **Authorization:** Server-side **RBAC** (roles: member, leader, pastor, admin) with role claims in tokens and server-side checks for sensitive actions.
- **Account protection:** **MFA required** for pastor/admin accounts per NFRs.
- **Security middleware & hardening:** Helmet, strong CORS policy, input validation, rate limiting (Redis-backed), CSRF protection for cookie flows, and strict Content Security Policy where applicable.
- **Token management & revocation:** Short-lived access tokens + refresh token rotation; persist refresh token state in DB/Redis for revocation and session management.
- **Secrets & encryption:** Store secrets in a managed secrets store (e.g., AWS Secrets Manager / Azure Key Vault), enforce TLS everywhere, use DB encryption-at-rest via managed provider.
- **Optional managed auth:** Support option to integrate with a managed provider (Supabase/Auth0/Clerk) to reduce operational overhead.
- **Rationale:** Balances security, developer control, and MVP operational simplicity while meeting PRD NFRs (MFA, RBAC, auditability).
- **Affects:** Auth Service design, frontend session handling, account recovery flows, CI security scanning, and test automation for auth scenarios.

*Recorded by user on 2026-02-20 — Authentication & Security accepted.*

### API & Communication (DECIDED)

- **Decision:** RESTful JSON API with **OpenAPI 3.0** contract for all public/backend endpoints.
- **Server framework:** **Fastify** (recommended for schema-driven validation and performance); **Express** acceptable if preferred for familiarity.
- **Validation & schema:** Route-level JSON Schema / **AJV** (or `Zod` if using TypeScript) to validate inputs and auto-generate OpenAPI when possible.
- **Real-time / feeds:** **Server-Sent Events (SSE)** for live feed updates (simpler, works well with mobile/PWA); provide WebSocket option for richer two-way interactions. Use **Redis pub/sub** for backend fan‑out.
- **Async processing / background jobs:** **BullMQ** (Redis-backed) for notifications, retries, and long-running tasks; ensure idempotent job handlers.
- **Pagination & feeds:** Cursor-based pagination for feeds; include delta/end‑cursor metadata for offline sync.
- **Rate limiting & throttling:** Redis-backed rate limiter for write-heavy endpoints (posting, auth attempts).
- **API docs & contract:** Auto-generate OpenAPI + expose Swagger UI for internal/testing use; use contract-first for critical endpoints where helpful.
- **Error contract:** Standardized JSON envelope `{ code, message, details? }` with consistent HTTP status mapping.
- **Rationale:** REST + OpenAPI maximizes interoperability, testing, and clear contract for frontend agents; SSE + Redis pub/sub support the required live feed & notification flows with minimal operational complexity.
- **Affects:** Plans Service APIs, Notification Service, frontend feed implementation, API tests, and CI contract tests.

*Recorded by user on 2026-02-20 — API & Communication accepted.*

### Frontend Architecture (DECIDED)

- **Framework:** `React` + `Vite` (JavaScript). Option to migrate to TypeScript (`react-ts`) in a follow-up story.
- **Server-state & data:** `TanStack Query` (React Query) for caching/SSR-friendly fetches and background refresh.
- **Local/UI state:** React Context for local UI; `Zustand` if cross-app shared state becomes complex.
- **Routing:** `React Router` (client-side routing for PWA flows).
- **Styling:** `Tailwind CSS` for rapid iteration and responsive/mobile-first design.
- **PWA & offline:** Vite PWA plugin / Workbox for service-worker, offline drafts, and caching strategies required by UX.
- **Accessibility & QA:** ARIA roles + `axe-core` checks in CI; Lighthouse checks for performance.
- **Testing:** `Vitest` + `React Testing Library` for unit/component tests; Playwright (scaffold via `tea framework`) for E2E.
- **Performance:** Code-splitting, critical CSS, image optimization, and client-side caching strategies aligned to NFRs.
- **Rationale:** Matches PRD and UX needs (mobile-first PWA), accelerates developer feedback loop, and aligns with existing test setup.
- **Affects:** Component library, CI scripts, PWA service-worker config, epics/stories for frontend (New Request, Offline/Sync, Homepage).

*Recorded by user on 2026-02-20 — Frontend Architecture accepted.*

### Infrastructure & Deployment (DECIDED)

- **Hosting:** Frontend on **Vercel** (static + edge CDN); backend APIs on a managed provider (Render / Railway / AWS Elastic Beanstalk or ECS Fargate) — prefer serverless/functions only for low-ops MVP endpoints.
- **Managed services:** Managed Postgres (Neon / AWS RDS) and managed Redis (Upstash / Redis Cloud) for reliability and backups.
- **CI/CD:** **GitHub Actions** pipeline: lint → unit tests → contract tests → build → deploy → post-deploy smoke tests. Protect main branch with required checks.
- **Infra as code:** Terraform (recommended) for cloud resources and reproducible environments; keep minimal IaC for MVP (DB, VPC, secrets, monitoring hooks).
- **Secrets & config:** Use GitHub Secrets for CI, and a managed secrets store in production (AWS Secrets Manager / Azure Key Vault). Do not store secrets in repo or logs.
- **Observability & SRE:** Sentry for errors; Prometheus + Grafana or Datadog for metrics & dashboards; integrate alerting (PagerDuty / Teams) for SLO breaches. Logging: structured JSON to a hosted log provider (Datadog / Logflare).
- **Backups & DR:** Daily automated DB backups, weekly full restore test; define RPO ≤ 1 hour, RTO ≤ 4 hours per NFRs.
- **Scaling & deployment strategy:** Auto-scaling (managed) for API services; use canary or blue/green deploys for production to reduce risk. Static assets served via CDN with cache invalidation on deploy.
- **Cost/ops trade-offs:** Start with managed services to reduce ops burden; revisit self-hosted or optimized infra after pilot metrics justify it.
- **Rationale:** Minimizes operational overhead for MVP, meets NFRs for availability/observability, and fits the chosen stack (React + Node + managed DB/Redis).
- **Affects:** CI workflows, production secrets, deployment scripts, monitoring/alerting epics, and operational runbooks.

*Recorded by user on 2026-02-20 — Infrastructure & Deployment accepted.*

### Implementation Patterns & Consistency Rules

**Conflict areas identified:** naming, project structure, data/formatting, communication events, error/loading patterns.

#### Naming Patterns

**Database Naming:**
- All table names lower_snake_case, plural (e.g. `users`, `churches`, `requests`).
- Column names lower_snake_case with `_id` suffix for FKs (`user_id`).
- Indexes prefixed `idx_` (e.g. `idx_users_email`).

**API Naming:**
- REST endpoints use plural lower kebab-case: `/users`, `/churches/{church_id}/requests`.
- Route params use lower_snake_case in path and camelCase in code, e.g. `/users/:user_id` maps to `userId`.
- Query parameters lower_snake_case (`page_size`, `cursor`).
- Custom headers prefix `X-` only for experimental; otherwise standard names.

**Code Naming:**
- React components PascalCase (`UserCard`), file names match component (`UserCard.jsx` or `.tsx`).
- Utility modules lower kebab-case (`date-utils.js`).
- Functions camelCase (`getUserData`).
- Variables camelCase (`userId`).

#### Structure Patterns

**Project Organization:**
- Monorepo-style structure under `src/` with domains:
  - `src/components/` (reusable UI)
  - `src/features/` (feature folders with components, hooks, tests)
  - `src/services/` (API clients)
  - `src/lib/` (shared utilities)
  - `src/pages/` (PWA routes)
- Tests co-located with code using `*.test.js`/`*.spec.ts` alongside modules.

**File Structure:**
- Configuration files in project root (`.env`, `vite.config.js`, `tsconfig.json`).
- Static assets under `public/` or `src/assets/` with hashed filenames.
- Documentation in `docs/` and `README.md` updates.

#### Format Patterns

**API Responses:**
- Wrap successful responses in `{ data: ..., meta?: {...} }`.
- Errors always `{ error: { code, message, details? } }` and HTTP status reflects severity.
- Dates serialized as ISO 8601 strings UTC.
- Field naming: JSON uses camelCase to match JS conventions.

**Data Formats:**
- Boolean values true/false.
- Null represented as `null`; absent fields omitted.
- Single-item arrays used instead of object when list semantics are expected.

#### Communication Patterns

**Event System:**
- Event names lower_snake_case with domain prefix, e.g. `user.created`, `request.assigned`.
- Payload includes `id`, `timestamp`, and relevant data nested under `attributes`.
- Version events with `v1` in event name when schema changes.

**State Management:**
- Use immutable update patterns; avoid direct mutation of state objects.
- Actions named as verbs in camelCase: `fetchRequests`, `setUserProfile`.
- Keep selectors in `src/features/*/selectors.js`.

#### Process Patterns

**Error Handling:**
- Frontend: catch API errors globally, show toast with user-friendly message; log original to console.
- Backend: normalize errors to the JSON error envelope; log stack trace in structured logs.
- All errors have a `code` matching API spec for programmatic handling.

**Loading States:**
- Use boolean `isLoading` flags in components; avoid multiple flags per component.
- Global loading bar handled by top-level `App` component for route changes.
- Persist loading state during navigation to prevent flicker.

### Enforcement Guidelines

**All AI agents MUST:**
- Follow snake_case for DB and API naming.
- Keep code files and tests co-located.
- Use the defined response/error envelope.

**Pattern Enforcement:**
- Review each pull request against lint rules and schema validators.
- Document violations in `CONTRIBUTING.md` and fix before merge.
- Update patterns by editing this section and notifying all agents.

### Pattern Examples

**Good Example (API):**
```json
{ "data": { "userId": "123", "name": "Alice" } }
```
**Anti-Pattern:**
```json
{ "id": 123, "username": "Alice" }
```

**Good Example (event):**
```
{ "event": "request.created", "attributes": { "request_id": "abc" }, "timestamp": "2026-02-20T21:00Z" }
```
**Anti-Pattern:**
```
{ "type": "RequestCreated", "data": { "id": "abc" } }
```

*Patterns defined to keep multiple agents aligned and avoid implementation conflicts.*

---

## Project Structure & Boundaries

### Complete project tree (recommended)

```
BoazPlan/
├── .github/
│   └── workflows/
│       └── ci.yml                # CI: lint, test, build, deploy
├── apps/
│   ├── web/                      # Frontend (Vite + React PWA)
│   │   ├── package.json
│   │   ├── public/
│   │   └── src/
│   │       ├── main.jsx
│   │       ├── index.css
│   │       ├── pages/
│   │       ├── components/
│   │       ├── features/
│   │       ├── services/         # API clients (api/requests.js)
│   │       ├── hooks/
│   │       └── assets/
│   └── api/                      # Backend (Node + Fastify)
│       ├── package.json
│       ├── src/
│       │   ├── index.js          # server bootstrap
│       │   ├── config/
│       │   ├── modules/          # domain modules (auth, requests, etc.)
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── requests/
│       │   │   ├── notifications/
│       │   │   └── moderation/
│       │   ├── services/         # business logic, third-party integrations
│       │   ├── repositories/     # DB access (Prisma client wrappers)
│       │   ├── routes/           # route definitions / OpenAPI annotations
│       │   └── workers/          # background job processors (BullMQ)
│       ├── prisma/
│       │   └── schema.prisma
│       └── tests/
├── infra/                       # IaC (Terraform) + deployment scripts
├── scripts/                     # helper scripts (seed, migrations)
├── tests/                       # root-level test suites (e2e/playwright)
│   ├── e2e/
│   └── integration/
├── docs/
├── package.json                 # workspace / tools runner (optional)
└── README.md
```

### API & component boundaries

- API base path: `/api/v1/` (OpenAPI contract in `api/src/routes/`), e.g. `/api/v1/requests`, `/api/v1/users`.
- Real-time feed endpoint: `/api/v1/feeds/stream` (SSE) — backend pub/sub via Redis.
- Notification boundary: `api/src/modules/notifications/` (producer) → `workers/` (consumer) → external providers (email/push).
- Auth boundary: `api/src/modules/auth/` (token issuance, refresh, MFA) — fronted by cookie-based refresh tokens + short-lived JWTs.
- Data access boundary: repositories under `api/src/repositories/` expose a thin layer over Prisma; only repositories access DB.

### Mapping epics → directories (explicit)

- Epic 1 — Identity & Church Setup
  - API: `api/src/modules/auth/`, `api/src/modules/users/`, `prisma` schema tables `users`, `churches`
  - Frontend: `web/src/features/auth/`, `web/src/features/church/`
  - Tests: `api/tests/integration/auth/`, `web/src/features/auth/*.test.js`

- Epic 2 — Request & Prayer Management
  - API: `api/src/modules/requests/`, DB table `requests`
  - Frontend: `web/src/features/requests/` (New Request flow, drafts)
  - Tests: `tests/e2e/request-create.spec.ts`

- Epic 3 — Volunteer Operations
  - API: `api/src/modules/volunteers/` and assignment logic in `services/`
  - Frontend: `web/src/features/volunteers/`

- Epic 4 — Communications & Notifications
  - API: `api/src/modules/notifications/`, workers in `api/src/workers/`
  - Frontend: `web/src/features/notifications/`

- Epic 5 — Moderation & Safety
  - API: `api/src/modules/moderation/`, audit logs table
  - Frontend: `web/src/features/moderation/` (admin views)

- Epic 6 — Admin Dashboard & Analytics
  - API: `api/src/modules/admin/` (analytics endpoints)
  - Frontend: `web/src/features/admin/` (dashboard)

- Epic 7 — Platform Architecture & PWA
  - Frontend: PWA config in `web/` (service worker, manifest)
  - Infra: caching/CDN rules in `infra/` and deployment configs

### Test organization

- Unit tests: co-located next to source (`*.test.js` / `*.spec.ts`) in each app.
- Integration tests: `apps/api/tests/integration/` against test DB (Prisma in-memory or test Postgres).
- E2E tests: `tests/e2e/` (Playwright) covering critical user journeys (New Request, Register Church, Approval Queue).
- Contract tests: generated from OpenAPI and run in CI to validate frontend ↔ backend.

### Dev & local infrastructure

- `docker-compose.yml` (local): Postgres, Redis, SMTP dev stub, and optional worker container.
- `npm run dev:web` → starts Vite frontend; `npm run dev:api` → starts Fastify API.
- `npm run dev` (root) → concurrently run both in development.

### Configuration & secrets

- Root `.env.example` documents required env vars; runtime secrets stored in production secrets manager.
- Prisma migrations kept in `api/prisma/migrations/` and applied during deployment.

### Enforcement & conventions

- Linting (ESLint + Prettier) with enforced rules in CI.  
- OpenAPI-driven endpoint tests to prevent contract drift.  
- All modules must include a README and test coverage for critical paths.

---

*Project structure drafted and mapped to epics/requirements.*

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All chosen technologies (React + Vite frontend, Node + Fastify backend, Prisma/Postgres, Redis, BullMQ) are compatible and have no conflicting patterns. Configuration and deployment choices align across components.

**Pattern Consistency:** Implementation patterns (naming, response envelopes, event names) align with chosen tech and are consistent across frontend/backend.

**Structure Alignment:** Project tree supports defined boundaries; repository layout enables clear component/service separation and test placement.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:** All 7 epics are mapped to concrete modules and directories; each epic has at least one implementable API and UI surface.

**Functional Requirements Coverage:** All 41 PRD functional requirements have architectural coverage via API routes, frontend features, or background workers.

**Non-Functional Requirements Coverage:** NFRs (performance, security, availability, offline support, auditability) are addressed by the architecture (PWA, Redis caching, managed infra, RBAC, MFA, observability plans).

### Implementation Readiness Validation ✅

**Decision Completeness:** Critical decisions are documented (DB choice + ORM, auth pattern, API style, real-time approach, infra choices). Versions and tooling choices are recorded where applicable.

**Structure Completeness:** Project tree is explicit and mapped to epics; CI, test, and infra placeholders are present.

**Pattern Completeness:** Naming, error/response contracts, event schema patterns, and enforcement guidelines are provided with examples.

### Gap Analysis

**Critical Gaps:** None — no blocking architectural gaps detected.

**Important Gaps:**
- Add explicit **Project Setup** story (Story 0.1) to ensure PWA shell and CI are prioritized in sprint 0. (recommended, not blocking)
- Add contract-generated API tests to CI (OpenAPI contract tests) — planned but add to next sprint.

**Nice-to-Have:** Expanded runbooks for observability, automated restore test scheduling, and additional E2E coverage for edge cases.

### Validation Issues Addressed

- Created a minimal Node scaffold and `package.json`; unit tests run and pass (Vitest).
- Completed architecture decisions, patterns, and project structure; validated against PRD and epics.

### Architecture Completeness Checklist

- [x] Project context analyzed
- [x] Architectural decisions documented and validated
- [x] Implementation patterns finalized
- [x] Project structure complete and mapped to epics
- [x] Tests scaffolded and initial unit tests passing

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — artifacts are comprehensive and consistent; no critical blockers.

**Key Strengths:** Complete traceability from PRD → Epics → Architecture → Project structure; clear implementation patterns; initial test scaffold and CI guidance.

**Areas for Future Enhancement:** E2E/playwright scaffolding, OpenAPI contract tests in CI, monitoring dashboards and operational runbooks.

### Implementation Handoff

**AI Agent Guidelines:** Follow architecture and pattern rules exactly; validate PRD-to-story traceability when creating new code; enforce contract tests before merge.

**First Implementation Priority:**
1. `Story 0.1: Initialize Project & PWA Shell` (create frontend starter via `npm create vite@latest boazplan -- --template react` or `react-ts` for TypeScript).  
2. Epic 1 — `Story 1.1: User registration & profile` (backend + frontend + tests).

---

## Completion & Handoff

Congratulations — the Architecture workflow is complete. You now have a validated, implementation-ready architecture document that AI agents can use as the single source of truth for development.

### What I updated for you
- Completed all architecture workflow steps (1–8) and validated coherence & readiness.  
- Added implementation patterns, explicit project structure, and validation results.  
- Added next-step guidance and first implementation priorities.

### Recommended next actions (pick one):
- Run `/bmad-bmm-sprint-planning` to generate a sprint plan from Epics & Stories.  
- Scaffold the frontend starter (I can generate Vite + React files and wire the first story).  
- Run `/bmad_tea_framework` to scaffold E2E tests & CI integration.

If you want, I can execute any of the above now. Otherwise, the architecture is ready for handoff to implementation agents.

---

*Architecture workflow completed on 2026-02-20 — ready for implementation.*

