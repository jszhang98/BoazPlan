---
story_id: 2.3
title: User Profile Management
epic: 'Epic 1: Identity & Multi-Tenancy'
priority: Medium
status: done
owner: dev
acceptance_criteria:
  - User can view current profile info (name, email, role)
  - User can update `displayName` and `avatar` (url/file)
  - User can manage notification preferences (Email/Push)
  - Basic Account Deletion (soft delete or disable)
  - Protected Page: Only authenticated users can access `/profile`

technical_notes:
  - `GET /v1/users/me`
  - `PATCH /v1/users/me`
  - `DELETE /v1/users/me` (requires 2FA or confirmation?)
  - Frontend: `Profile.jsx` Component forms
---

# Story 2.3: User Profile Management

**As a** User,
**I want** to manage my personal details and settings,
**So that** my profile reflects my identity within the community.

## Tasks
- [x] Implement `GET /v1/users/me` endpoint (incl. memberships)
- [x] Implement `PATCH /v1/users/me` (displayName + notificationPreferences validation)
- [x] Implement `DELETE /v1/users/me` (PII anonymisation + audit log)
- [x] Frontend: Profile page with notification prefs toggles & membership list
- [x] Backend tests: 6 passing (user-profile-me.test.js)
