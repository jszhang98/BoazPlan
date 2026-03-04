# Story 4.4: Prayer Wall & Anonymity

**Status**: review

## Goal
Implement a "Prayer Wall" feed that allows users to view and pray for requests, and ensure anonymous requests properly hide author details across the application.

## Acceptance Criteria
- [x] AC1: Requests can be posted as type `need` (default) or `prayer`
- [x] AC2: `GET /requests?type=prayer` returns only prayer-type requests
- [x] AC3: `GET /requests?type=need` returns only need-type requests
- [x] AC4: `POST /requests/:id/pray` and `DELETE /requests/:id/pray` toggle a user's prayer on a request
- [x] AC5: Prayer interactions are idempotent (duplicate pray / unpray = success, no error)
- [x] AC6: `GET /requests` and `GET /requests/:id` include `prayerCount` and `currentUserPrayed` fields
- [x] AC7: `currentUserPrayed` is correctly scoped to the authenticated user via optional auth header
- [x] AC8: Anonymous requests return `authorId: null` and `author: null` in all API responses
- [x] AC9: The DB still stores `authorId` for anonymous posts (only scrubbed from responses)
- [x] AC10: Frontend `NewRequest` form includes Request Type selector (Need / Prayer Request)
- [x] AC11: Frontend `RequestFeed` includes type tab strip (All / Needs / Prayer Wall) and a Pray button per card

## Tasks / Subtasks

### Task 1 — Schema & Migration ✅
- [x] Add `type String @default("need")` to `Request` model
- [x] Create `Prayer` model with `@@unique([requestId, userId])`
- [x] Apply migration `20260228135713_add_prayer_wall`
- [x] Regenerate Prisma client

### Task 2 — Backend Routes ✅
- [x] Add `VALID_TYPE` validation, reject unknown types
- [x] Update `POST /requests` to accept `type` field
- [x] Update `PATCH /requests/:id` to accept `type` field with validation
- [x] Update `GET /requests` list to support `?type=` filter, include `prayerCount` and `currentUserPrayed`
- [x] Update `GET /requests/:id` to include `prayerCount` and `currentUserPrayed`
- [x] Add `POST /requests/:id/pray` (authenticated)
- [x] Add `DELETE /requests/:id/pray` (authenticated, idempotent)
- [x] Add `optionalAuthenticate` plugin to auth.js for optional user context on public GET routes
- [x] Apply `optionalAuthenticate` preHandler to GET /requests and GET /requests/:id

### Task 3 — Frontend Services ✅
- [x] Add `togglePrayer(id, isPraying)` to `apps/web/src/services/requests.js`

### Task 4 — Frontend UI ✅
- [x] `NewRequest.jsx`: Add `TYPE_OPTIONS`, `type` state, type selector UI, include type in payload and draft
- [x] `RequestFeed.jsx`: Import `togglePrayer`, add `TYPE_TABS` (All/Needs/Prayer Wall), add `PrayButton` component with optimistic UI, display prayer count and badge for prayer-type requests

### Task 5 — Tests ✅
- [x] `apps/api/tests/prayer-wall.test.js` — 22 tests covering: type validation, feed filtering, prayer CRUD, idempotency, prayerCount, currentUserPrayed, anonymity scrubbing

## Dev Agent Record

### Implementation Notes
- Added `optionalAuthenticate` helper in `auth.js` to populate `req.user` from `x-user-id` header on public endpoints without requiring auth; this enables `currentUserPrayed` to work for authenticated users calling non-guarded GET routes.
- `PrayButton` in `RequestFeed.jsx` uses optimistic UI (immediate count/state update with rollback on failure) and calls `e.stopPropagation()` to prevent navigating to the detail page when clicking Pray inside a card `<Link>`.
- Anonymous post: `scrubAuthor()` strips `authorId` and `author` from all API responses; the actual `authorId` is preserved in the DB for admin/moderation access.

### Files Modified
- `apps/api/prisma/schema.prisma` — Added `type` field to `Request`, added `Prayer` model
- `apps/api/prisma/migrations/20260228135713_add_prayer_wall/` — Migration files
- `apps/api/src/plugins/auth.js` — Added `optionalAuthenticate`
- `apps/api/src/routes/requests.js` — Prayer endpoints, type filtering, optional auth on GETs
- `apps/web/src/services/requests.js` — Added `togglePrayer`
- `apps/web/src/features/requests/NewRequest.jsx` — Type selector, draft persistence for type
- `apps/web/src/features/requests/RequestFeed.jsx` — Type tabs, PrayButton, prayer badge
- `apps/api/tests/prayer-wall.test.js` — New test file (22 tests, all passing)

### Change Log
- 2026-02-28: Implemented Story 4.4 Prayer Wall & Anonymity — schema migration, full backend CRUD, frontend UI, 22 automated tests passing.

## Goal
Implement a "Prayer Wall" feed that allows users to view and pray for requests, and ensure anonymous requests properly hide author details across the application.

## Requirements
1.  **Prayer Wall Feed**: 
    *   A dedicated view (or filter on the main feed) for requests suitable for prayer.
    *   Typically, any request can be prayed for, but users might specifically want to see "Prayer Request" type items if we had that distinction. 
    *   *Correction*: The PRD mentions "Prayer Wall: prayer posts, updates, mark-as-answered".
    *   The current `Request` model doesn't have a "type" field (e.g., 'need' vs 'prayer'). 
    *   **Decision**: I will add a `type` field to `Request` model: `standard` (default) vs `prayer`.
    *   The "Prayer Wall" will filter for `type: 'prayer'`.
    *   Standard requests (needs) can also be prayed for, but the Prayer Wall specifically highlights these.
    *   Actually, let's look at `Request` model again. It has `title`, `description`, `urgency`, `visibility`. 
    *   If I add `type`, I need to update the creation form too. 
    *   **Alternative**: Just use a tag or category? No, `type` is cleaner for schema.
    *   **Wait**: `urngency` and `visibility` are there. Maybe "Prayer" is just a request with a specific tag? 
    *   Let's add `type` String @default("need") // need | prayer.

2.  **Anonymity**:
    *   Ensure `anonymous: true` requests return `author: null` in API responses (already handled in `scrubAuthor`).
    *   Verify frontend handles `author: null` gracefully (shows "Anonymous").
    *   Ensure creating a request allows setting `anonymous` flag (Backend supports it, Frontend needs checkbox).

3.  **Prayer Interaction**:
    *   Users should be able to click "Pray" on a request.
    *   This requires a `Prayer` or `Reaction` model. 
    *   The PRD mentions "Spiritual Reactions" is Story 4.3 (Sprint 3). 
    *   However, "Prayer Wall" without ability to pray is just a list. 
    *   I will implement a simple `Prayer` count/model for this story to make it functional.
    *   Model `Prayer`: `id`, `requestId`, `userId`, `createdAt`.
    *   API: `POST /requests/:id/pray`, `DELETE /requests/:id/pray`.
    *   Frontend: "Pray" button with counter.

## Steps

1.  **Schema Update**:
    *   Add `type` to `Request` (default 'need').
    *   Create `Prayer` model.
    *   Update `User` and `Request` relations.

2.  **Backend Logic**:
    *   Update `POST /requests` to accept `type`.
    *   Add `POST /requests/:id/pray` and `DELETE`.
    *   Update `GET /requests` to support `type` filter.
    *   Update `GET /requests` to include `prayerCount` and `currentUserPrayed` boolean.

3.  **Frontend UI**:
    *   Update `RequestForm` to allow selecting "Need" or "Prayer Request".
    *   Update `RequestForm` to allow "Post Anonymously" checkbox.
    *   Create `PrayerWall` page (filtered feed).
    *   Add `PrayButton` component to `RequestCard`.

4.  **Tests**:
    *   Test privacy of anonymous posts.
    *   Test prayer increment/decrement.
    *   Test feed filtering.

## Refinement
Story 4.3 is "Spiritual Reactions". I should probably stick to *just* the "Wall" (listing) and Anonymity for now, but a Prayer Wall without "Praying" is useless. I'll add a basic "Pray" action now and leave complex "Reactions" (Like, Amen, Hug) for 4.3.

**Revised Schema:**
```prisma
model Request {
  ...
  type String @default("need") // need | prayer
  prayers Prayer[]
}

model Prayer {
  id        String   @id @default(uuid())
  requestId String
  userId    String
  createdAt DateTime @default(now())

  request   Request @relation(fields: [requestId], references: [id], onDelete: Cascade)
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([requestId, userId])
}
```
