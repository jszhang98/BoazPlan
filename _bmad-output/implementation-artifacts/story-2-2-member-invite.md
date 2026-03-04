---
story_id: 2.2
title: Member Invite Flow & Approval Workflow
epic: 'Epic 1: Identity & Multi-Tenancy'
priority: High
status: done
owner: dev
acceptance_criteria:
  - Admin can generate an invite link (e.g., `/join/:slug`)
  - Admin can revoke or expire links (optional MVP: 1 active)
  - User clicking link is added as `Member` (if public) or `Pending` (if private or configured)
  - Admin dashboard shows "Pending Requests" tab
  - Admin can Approve/Reject members
  - Validation: Cannot join if `privacyMode: Invite-Only` and no valid link

technical_notes:
  - `GET /v1/churches/:slug/invite` Endpoint
  - `Member` role is default, `status` defaults to `active` or `pending` based on privacy
  - Frontend: `Join.jsx` page (Preview Church Details -> "Join")
  - Backend: `POST /v1/churches/:uuid/members/join` (Accepts slug/code)
  - New Endpoint: `PATCH /v1/churches/:id/members/:userId` (Status Update)
---

# Story 2.2: Member Invitation & Approval Workflow

**As a** Community Leader,
**I want** to manage who joins my church,
**So that** I maintain community safety and alignment.

## Tasks
- [x] Implement `GET /v1/churches/:id/invite-link` (Generate/Read)
- [x] Implement `POST /v1/churches/join` (Add Membership) with `pending` status support
- [x] Frontend: Copy Invite Link Button (Admin Dashboard)
- [x] Frontend: Public Join Landing (Verify Link -> Join)
- [x] Logic for Unique/Private Join Links (Optional Extension)
- [x] Schema migration: added `status` to `ChurchMembership` (Active/Pending)
- [x] Backend: Add filtering by status and approval endpoint
- [x] Frontend: Admin UI to manage pending requests in `ChurchMembers.jsx`
