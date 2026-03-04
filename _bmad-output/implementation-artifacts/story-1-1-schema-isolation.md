---
story_id: 1.1
title: Multi-Tenant Schema Isolation
epic: 'Epic 1: Identity & Multi-Tenancy'
priority: High
status: complete
owner: dev
acceptance_criteria:
  - `Church` model enforces slug uniqueness (one slug per tenant) - ✅
  - `Request` (and other scoped entities) MUST have `churchId` field - ✅
  - Queries for scoped entities without `churchId` fail or return nothing - ✅
  - `Test: Multi-Tenant Data` passes (User A cannot list Requests from Church B) - ✅

technical_notes:
  - Database-level constraint: `Church.slug` (unique)
  - Prisma Middleware or Service pattern to inject `where: { churchId: ... }`
  - Integration Test: Seed two churches, insert requests, cross-fetch

---

# Story 1.1: Multi-Tenant Schema Implementation

**As a** System,
**I want** to isolate data by church tenant,
**So that** private information does not leak between organizations.

## Tasks
- [x] Add `churchId` Foreign Key to `User`, `Request`
- [x] Implement `slug` generation logic (`slugify`)
- [x] Update `prisma/schema.prisma` with constraints
- [x] Create Scoped Service Layer (e.g., `requests.service.list(churchId)`)
- [x] Add Integration Test: Cross-Tenant Isolation
