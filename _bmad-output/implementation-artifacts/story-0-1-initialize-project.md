---
story_id: 0.1
title: Initialize Project & PWA Shell
epic: Epic 7 - Platform Architecture & PWA
priority: high
status: in-progress
owner: dev
acceptance_criteria:
  - Frontend scaffold (Vite + React) present under `apps/web/` and `npm run dev` starts without errors.
  - Backend scaffold (Fastify) present under `apps/api/` with `/api/v1/requests` POST and GET implemented (in-memory for MVP).
  - Frontend `New Request` form posts to `/api/v1/requests` and displays created items.
  - Playwright/TEA E2E test added covering the new request flow; `npm run test:e2e` passes when dev servers are running.
  - Artifact documented in `_bmad-output/implementation-artifacts/story-0-1-initialize-project.md`.

tasks:
  - create: apps/web (Vite + React) scaffold + basic PWA manifest
  - create: apps/api (Fastify) scaffold with basic requests API
  - wire: `New Request` UI to `/api/v1/requests`
  - verify: dev servers start and UI ↔ API end-to-end POST works

notes: |
  This is the project bootstrap story (Story 0.1) used to validate the frontend ↔ backend contract for early development and test wiring. The backend initially used an in-memory store for rapid iteration; it was upgraded to Prisma/SQLite in Story 0.2 and will later target Postgres for production.
---

Short description
-----------------
Scaffolded initial frontend (Vite + React) and backend (Fastify) and wired a minimal `New Request` UI to the `/api/v1/requests` contract for the first implementation story.
