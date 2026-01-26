# Church Mutual-Aid  Frontend Architecture Document

**Prepared for:** Church Mutual-Aid System (Pilot)
**Date:** 2026-01-26

---

## Overview

This document captures the frontend architecture recommendations for the Church Mutual-Aid PWA pilot. It favors a fast, mobile-first stack optimized for rapid iteration, accessibility, and small bundles to meet pilot goals.

## 1. Starter & Framework

- Starter: **Vite** + **React** + **TypeScript**
- PWA support: `vite-plugin-pwa`
- Styling: **Tailwind CSS** with CSS variables for theme tokens
- Component primitives: Headless UI / Radix for accessible building blocks

**Rationale:** Vite provides fast dev iteration and small bundles; Tailwind speeds styling and theming; TypeScript improves safety for critical flows (auth, claim/approval).

## 2. Tech Stack (summary)

- Framework: React (latest)
- UI primitives: Headless UI / Radix
- State: React Query (server-state) + Jotai (local UI) or Redux Toolkit if needed
- Routing: React Router v6
- Build tool: Vite
- Styling: Tailwind CSS (+ plugins)
- Testing: Jest + React Testing Library, Playwright (E2E)
- Dev tools: ESLint, Prettier, Storybook

## 3. Project Structure

Feature-first, e.g.:

```
src/
  assets/
  features/
    auth/
    feed/
    requests/
    prayer/
    admin/
  components/
  routes/
  services/
  state/
  styles/
  utils/
  App.tsx
  main.tsx
  service-worker.ts

public/
  manifest.json
  icons/
```

## 4. Component Standards

- PascalCase folders and files (e.g., `Button/Button.tsx`)
- Colocate tests & stories with components
- Use `forwardRef`, strict TypeScript props, accessibility attributes
- Storybook for docs & theme previews

## 5. State Management

- React Query for feeds, requests, claims (caching, optimistic updates)
- Example: `useRequests`, `useClaimRequest` with optimistic updates + rollback
- Jotai atoms (or Redux Toolkit) for modal state, selections

## 6. API Integration

- Centralized HTTP client (`src/services/api.ts`) with auth interceptors, consistent error shape
- Use idempotency keys for claim/create operations
- Prefer ETag/If-None-Match for feed efficiency where possible

## 7. Routing

- React Router v6 with nested layouts and lazy-loaded feature routes
- Protected route wrapper for role-based UI guards (server must validate as well)

## 8. Styling & Theme Tokens

- Tailwind CSS with CSS variables (`:root`) for colors, spacing, typography
- `darkMode: 'class'` and Storybook theme previews

## 9. Testing Strategy

- Unit/Integration: Jest + React Testing Library
- E2E: Playwright for core flows (auth, request create, claim, approval)
- Accessibility: axe checks + Storybook a11y
- CI: lint, types, tests, axe as pre-merge gates

## 10. Environment & Secrets

- Client env only for public values (prefixed `VITE_`)
- Server secrets in secret manager (Database, JWT, SendGrid, Twilio)
- Prefer runtime config endpoint for values you may change without rebuild

## 11. Developer Standards

- `tsconfig` strict mode
- ESLint + Prettier + husky pre-commit hooks
- Enforce optimistic UI with rollback, idempotency, and explicit error handling
- Accessibility-first components and keyboard/focus behavior

## Next Steps

1. Review and approve this draft with stakeholders.  
2. Add a short Storybook and component checklist to demo claim/approval flows.  
3. Create initial app skeleton (Vite + TypeScript + Tailwind) and CI with test & lint gates.

---

*Draft generated from `front-end-architecture-tmpl.yaml` and PRD.*
