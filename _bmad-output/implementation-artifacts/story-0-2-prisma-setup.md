---
story_id: 0.2
title: Initialize Database Layer with Prisma
epic: Epic 7 - Platform Architecture & PWA
priority: high
status: complete
owner: dev
acceptance_criteria:
  - `apps/api` uses Prisma ORM connected to a local development database (SQLite).
  - Schema includes a `Request` model matching the scaffolded API fields.
  - Migration scripts (`npm run migrate`, `npm run generate`) are available and executed.
  - Data persists across API restarts; manual verification performed.
  - E2E test (`tests/e2e/new-request.spec.js`) runs successfully against Prisma-backed API.

tasks:
  - install `prisma` and `@prisma/client` in `apps/api`.
  - add `prisma/schema.prisma` with `Request` model.
  - run initial migration to produce `dev.db` and generated client.
  - update API handlers to use Prisma client.
  - verify persistence and update documentation.

notes: |
  This support story upgrades the temporary in-memory storage to a persistent
  database using Prisma, laying groundwork for later Postgres migration.
---

**Implementation details:** schema defined; migration applied; API code updated.
Local SQLite used for dev; `prisma generate` included in package scripts.
E2E flow still exercises the same UI contract and passes against the database.
