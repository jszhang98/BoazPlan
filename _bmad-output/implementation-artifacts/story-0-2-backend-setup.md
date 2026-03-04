---
story_id: 0.2
title: Backend Setup (Fastify/Prisma)
epic: 'Epic 1: Identity & Multi-Tenancy'
priority: High
status: todo
owner: dev
acceptance_criteria:
  - `apps/api` uses Prisma ORM connected to SQLite (dev) / Postgres (prod)
  - Schema includes `User`, `Church`, `Request` models
  - Multi-tenant middleware resolves `X-Tenant-ID`
  - Routes correctly scope to the resolved Tenant
  - `prisma generate` and `prisma migrate` scripts work

technical_notes:
  - Install `prisma` and `@prisma/client`
  - Create `prisma/schema.prisma` with initial models
  - Use `fastify-plugin` for DB connector
  - Implement request decoration: `req.tenantId`
  - Ensure env vars (DATABASE_URL) are loaded via `dotenv`
---

# Story 0.2: Backend Setup & Schema

**As a** Developer,
**I want** the database layer and initial schemas configured,
**So that** we can persist multi-tenant data effectively.

## Tasks
- [ ] Install Prisma and Initialize Schema
- [ ] Define Core Models (`User`, `Church`, `Request`)
- [ ] Implement DB Connection Plugin (`plugins/db.js`)
- [ ] Implement Tenant Resolution Middleware (`plugins/tenant.js`)
- [ ] Verify Schema Scoping (Manual/Test)
- [ ] Add `migrate` script to `package.json`
