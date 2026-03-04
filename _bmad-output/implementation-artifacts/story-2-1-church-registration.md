---
story_id: 2.1
title: Church Registration Flow
epic: 'Epic 1: Identity & Multi-Tenancy'
priority: High
status: todo
owner: dev
acceptance_criteria:
  - User can submit "Register Church" form (Name, Location, Privacy)
  - Church tenant is created with Admin role assigned to creator
  - Slug is auto-generated (Name -> slug) if empty
  - Conflict Check: Duplicate slug returns 409
  - Session Context switches to newly created Church

technical_notes:
  - `POST /api/v1/churches` Endpoint
  - `Church` Table Migration (add fields: location, privacyMode)
  - `Membership` Table creation (User <-> Church, Role Enum)
  - Transactional Create: (Church, Membership:Admin)
---

# Story 2.1: Church Tenant Registration

**As a** Church Planter/Admin,
**I want** to register my church and become its first admin,
**So that** I can invite members and manage the community.

## Tasks
- [x] Implement `POST /v1/churches` (Create Church + Membership)
- [x] Add `slug` generation utility (`slugify`)
- [x] Add `privacyMode` enum (Open, Invite-Only)
- [x] Update frontend with Registration Form (`CreateChurch.jsx`)
- [x] E2E Test: New user creates church, gets Admin role
