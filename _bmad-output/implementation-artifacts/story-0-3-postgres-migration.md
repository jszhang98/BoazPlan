---
story_id: 0.3
title: Migrate local database configuration to PostgreSQL
epic: Epic 7 - Platform Architecture & PWA
priority: medium
status: complete
owner: dev
acceptance_criteria:
  - Prisma `datasource` provider set to `postgresql` and reads from `DATABASE_URL`.
  - `.env` file contains example PostgreSQL connection string and guidance for SQLite override.
  - New migration paths available for Postgres (`npm run migrate` works when a Postgres server is reachable).
  - Documentation added describing how to spin up a local Postgres (e.g. via Docker) for development.
  - E2E tests still pass when the environment is configured for SQLite or Postgres.

tasks:
  - update `schema.prisma` to use `postgresql` provider with env variable.
  - adjust `.env` with example Postgres URL and comments.
  - create `story-0-3-postgres-migration.md` artifact with instructions.
  - ensure existing Prisma migrations are compatible or note resetting for Postgres.
  - verify E2E test runs using SQLite by default; note Postgres requirement in doc.

notes: |
  Postgres is the target database for production; this story updates the schema
  and environment configuration accordingly. Local development can still use
  SQLite by overriding DATABASE_URL, which allows e2e tests to continue without
  requiring a running Postgres instance in the workspace. When moving to a
  Postgres server, run `npm run migrate` to apply the existing migration or reset
  the database.
---

Migration instructions:

```bash
# with a local Postgres container:
# docker run --name boazplan-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
# export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boazplan?schema=public"
npx prisma migrate dev --name init
```