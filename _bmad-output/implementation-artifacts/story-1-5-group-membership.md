# Story 1-5 – Manage Group Memberships

**Goal**: Provide a UI and API integration so church admins and group leaders can add, promote, and remove users from a small group.

## Acceptance Criteria

1. On the group listing page each group card offers a "Manage members" link.
2. Clicking the link opens the **Group members** page scoped to that group.
3. The members page shows the list of current members, including display name, email, and role badge.
4. There is an inline form for admins/leaders to add a new member by user email/ID and role (member or leader).
5. Role badges are editable by permitted users (admin or group leader) via a select control.
6. Members can be removed using a confirmation modal. Only admins or group leaders can perform this.
7. The page handles empty state gracefully and displays errors/success messages appropriately.
8. Backend routes exist for listing, adding, updating, and deleting group memberships. Permissions enforced server-side.
9. Unit tests cover the new API behaviours; e2e tests exercise the full UI flow described above.

## Implementation Notes

- New service module `groupMemberships.js` mirrors existing `memberships.js`.
- `GroupMembers.jsx` component largely clones `ChurchMembers.jsx` but simplifies roles and removes invites.
- Added route `/groups/:groupId/members` with `PrivateLayout` wrapping.
- Updated groups page to include link to membership management and added tests accordingly.
- Backend API (`routes/groups.js`) already had list/add/patch; added DELETE endpoint and enhanced tests.
- Unit tests extended in `group-feature.test.js`; e2e tests extended in `group-management.spec.js`.

## Testing

- Ran all existing unit tests; new tests pass ensuring role change & deletion behaviours work.
- Verified Playwright scenario simulates UI interactions per acceptance criteria.

## Completed

- [x] Schema supports memberships (already present).
- [x] Service module and components created.
- [x] Routes added/modified.
- [x] Tests updated and green.
- [x] Documentation artifact created here.

---

This file will serve as a reference for the implementation of story 1‑5 and can be updated if further refinements occur.