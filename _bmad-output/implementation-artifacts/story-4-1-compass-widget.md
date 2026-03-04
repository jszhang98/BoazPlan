# Story 4.1: Compass Widget (Geospatial Urgency Sorting)

**Status**: review

## Goal
Implement a "Compass Widget" — a dynamic UI element that surfaces the most urgent unmet needs to members and volunteers. Requests are ranked by a composite Urgency Score: severity level, time since posted ("forgotten first"), and optional proximity distance. The widget guides users toward actionable ministry rather than passive browsing.

## Acceptance Criteria
- [x] AC1: `GET /api/v1/requests/compass` returns open, non-hidden requests for the tenant sorted by descending Urgency Score
- [x] AC2: Urgency Score formula: `Score = (Wsev × severityLevel) + (Wtime × hoursOld) − (Wdist × distanceKm)` where `Wsev=10, Wtime=0.5, Wdist=1.0`; severity mapping: `urgent=3, high=2, normal=1`; distance term only applied when requester provides `?lat=&lng=` and the request has stored coordinates; distance computed via Haversine formula in application code (SQLite-compatible)
- [x] AC3: When `?lat=&lng=` query params are present, requests with stored coordinates are scored with the distance term; requests without coordinates omit the distance term
- [x] AC4: Route respects tenant isolation (requires `X-Tenant-ID` header, scoped to `churchId`)
- [x] AC5: Route supports optional authentication (`optionalAuthenticate`); `currentUserPrayed` field included in response
- [x] AC6: Response is capped at 20 results; only `status: open` and `hidden: false` requests are included
- [x] AC7: `Request` schema gains optional `lat Float?` and `lng Float?` fields; `POST /requests` and `PATCH /requests/:id` accept these optional fields
- [x] AC8: Frontend `CompassWidget` component fetches and displays the top 5 compass results with urgency badge, time-ago label, and prayer count
- [x] AC9: `CompassWidget` can optionally request the user's geolocation (browser API) and pass coordinates to the API for distance-aware sorting
- [x] AC10: `CompassWidget` is displayed on the main feed page (`RequestFeed`) as a sidebar or pinned banner section

## Tasks / Subtasks

### Task 1 — Schema & Migration
- [x] Add `lat Float?` and `lng Float?` fields to the `Request` model in `schema.prisma`
- [x] Run Prisma migration: `npx prisma migrate dev --name add_compass_coords`
- [x] Regenerate Prisma client

### Task 2 — Backend: Compass Endpoint
- [x] Add Haversine distance helper function in `requests.js` (pure JS, SQLite-compatible)
- [x] Add urgency score computation function: `computeScore(request, userLat, userLng)`
- [x] Register `GET /api/v1/requests/compass` route with `optionalAuthenticate`, tenant check, and `?lat`, `?lng` query params
- [x] Fetch open, non-hidden requests for tenant, compute scores in JS, sort descending, return top 20
- [x] Update `POST /requests` to accept optional `lat` and `lng` fields (float validation)
- [x] Update `PATCH /requests/:id` to accept optional `lat` and `lng` fields

### Task 3 — Frontend Service
- [x] Add `getCompassRequests(params)` to `apps/web/src/services/requests.js` — calls `GET /api/v1/requests/compass` with optional `lat` and `lng`

### Task 4 — Frontend UI: CompassWidget
- [x] Create `apps/web/src/features/compass/CompassWidget.jsx`:
  - Displays top 5 compass results as a compact ranked list
  - Each item shows: 🧭 rank, urgency badge (colored), title (truncated), `X hrs ago` label, `🙏 N` prayer count
  - "📍 Use my location" toggle button that calls `navigator.geolocation.getCurrentPosition` and re-fetches with coordinates
  - Loading skeleton and empty state ("All needs are being met 🙏")
- [x] Add `CompassWidget` to `apps/web/src/features/requests/RequestFeed.jsx` — rendered above the request list as a collapsible "🧭 Compass — Most Urgent Needs" section

### Task 5 — Tests
- [x] Create `apps/api/tests/compass.test.js` covering:
  - Urgency score sorts urgent > high > normal (same age, no location)
  - "Forgotten first": older requests of same urgency score higher than newer ones
  - Distance term: request with stored `lat/lng` scored lower when far from user, higher when nearby (compared to same-urgency request with no coords)
  - Tenant isolation: compass only returns requests for the specified tenant
  - Only open + non-hidden requests included
  - Capped at 20 results
  - `currentUserPrayed` field correct for authenticated user
  - `lat`/`lng` accepted on POST /requests
  - Missing tenant → 400

## Dev Notes

### Architecture
- **No PostGIS needed for SQLite/dev**: Haversine computed in application JS. When migrating to Postgres production, PostGIS can replace the app-layer calculation, but the API contract remains the same.
- **Score formula (from architecture-validation-report-2026-02-28.md)**:
  `Score = (Wsev × severityLevel) + (Wtime × hoursOld) − (Wdist × distanceKm)`
  - `Wsev = 10`, `Wtime = 0.5`, `Wdist = 1.0`
  - `urgent=3, high=2, normal=1`
  - Distance term is subtracted (closer = less penalty = higher score)
  - If no user coords or no request coords: distance term = 0

### Haversine Formula (JS)
```js
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
```

### Existing Patterns (must follow)
- Route file: `apps/api/src/routes/requests.js` — all request-domain routes live here
- Auth: use `optionalAuthenticate` (already imported) for the compass endpoint
- Tenant: `req.tenant?.id` — return 400 if missing (same as existing GET /requests)
- Response envelope: `{ data: [...] }` — consistent with existing routes
- `scrubAuthor()` helper — apply to all request objects returned
- Prayer count + currentUserPrayed — reuse the same pattern from GET /requests

### Frontend Patterns
- Service calls in `apps/web/src/services/requests.js`
- Feature folder: `apps/web/src/features/compass/`
- Use `useState` / `useEffect` (no TanStack Query yet in this codebase)
- Tailwind CSS for all styling
- Consistent with existing card/badge component patterns in `RequestFeed.jsx`

## Dev Agent Record

### Implementation Plan
Full TDD cycle with schema-first approach:
1. Schema migration (lat/lng on Request)
2. Backend route with Haversine + scoring
3. Frontend service function
4. CompassWidget UI component
5. Tests confirming all 14 ACs

### Completion Notes
- Implemented Haversine distance formula in pure JS (SQLite-compatible; no PostGIS needed at dev stage)
- `score = (10 × severityLevel) + (0.5 × hoursOld) − (1.0 × distanceKm)` where distance term omitted if no coords
- Compass route registered BEFORE `/:id` param route to avoid Fastify route collision
- Prisma schema was partially corrupted by a prior git checkout (Story 4.4 changes to Prayer model and RequestStatusEvent had been lost) — restored all missing models during this task; 3 new sync migrations created
- All 14 compass tests pass; pre-existing auth failures in other suites confirmed as unrelated

### Files Modified
- `apps/api/prisma/schema.prisma` — added `lat Float?`, `lng Float?` to Request; restored `type String`, `Prayer` model, `RequestStatusEvent` model, and back-relations on User and Request
- `apps/api/prisma/migrations/20260228143018_add_compass_coords/` — new
- `apps/api/prisma/migrations/20260228143504_noop/` — restored Prayer + Request.type
- `apps/api/prisma/migrations/20260228143711_restore_status_events/` — restored RequestStatusEvent
- `apps/api/src/routes/requests.js` — `haversineKm()`, `computeScore()`, `GET /api/v1/requests/compass`, lat/lng in POST + PATCH
- `apps/web/src/services/requests.js` — `getCompassRequests(params)`
- `apps/web/src/features/compass/CompassWidget.jsx` — NEW
- `apps/web/src/features/requests/RequestFeed.jsx` — import + render CompassWidget

### Change Log
- 2026-02-28: Story 4.1 implemented by Amelia (Dev Agent). All 14 tests passing. Status moved to `review`.
