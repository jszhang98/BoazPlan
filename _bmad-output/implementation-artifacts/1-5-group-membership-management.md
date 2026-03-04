# 1-5: Group Membership Management

**As a** Church administrator or small‑group leader,
**I want** to view and manage the members of a particular group,
**So that** I can add people, remove them, and appoint or demote leaders as needed.

## Acceptance Criteria

- Given I am an authenticated church admin or group leader, when I navigate to a group's members page, I see a list of current members with their names and roles.
- A button toggles the add‑member form. Once visible, the form accepts a user ID (or email) and role (`member` or `leader`).
- Each member row has controls to remove the person from the group or change their role.
- Only users with church admin/pastor role or existing group leader role can perform add/remove/update actions; others see a read‑only list.
- If the group has no members, an empty state message invites the admin/leader to add the first member.
- Loading indicators and error messages are shown appropriately during network requests, and tenant headers (`x-user-id`, `X-Tenant-ID`) are included on all fetches.
- Page styling is consistent with other admin pages and uses the design system components.
- (Stretch) If the member list is long, pagination or infinite scroll is available.

## Notes

This page will reuse patterns from `ChurchMembers.jsx` but scoped to a single group. The backend already exposes `/api/v1/groups/:groupId/members` endpoints for list, create, update, and delete.

> **Backend caveat:** there is currently **no API route to delete an entire group**; only member‑level operations exist.  If a future story requires group deletion it will need a new handler with appropriate permission checks.

Make sure the documentation captures all intended behaviours, including unimplemented server endpoints so reviewers are aware of gaps.
