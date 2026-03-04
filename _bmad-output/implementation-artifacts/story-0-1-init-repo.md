---
story_id: 0.1
title: Initialize Repo, PWA Shell & CI
epic: 'Epic 7: Platform Architecture & PWA'
priority: High
status: todo
owner: dev
acceptance_criteria:
  - Frontend scaffold (Vite + React) present under `apps/web/`
  - Backend scaffold (Fastify) present under `apps/api/`
  - CI Pipeline (GitHub Actions) configured to run `lint` and `test`
  - PWA Manifest and Service Worker configured for "Add to Homescreen"
  - App runs locally with `npm run dev` (concurrently)

technical_notes:
  - Use `npm create vite@latest apps/web -- --template react`
  - Use `fastify-cli` or manual setup for `apps/api`
  - Configure `concurrently` in root `package.json`
  - Install `vite-plugin-pwa` for service worker generation
  - Ensure `vitest` is set up for unit testing
---

# Story 0.1: Project Initialization

**As a** Developer,
**I want** the repository structure, CI pipeline, and basic PWA shell set up,
**So that** we have a stable foundation for building features.

## Tasks
- [ ] Initialize Monorepo structure (`apps/web`, `apps/api`)
- [ ] Scaffold Frontend (Vite + React + Tailwind)
- [ ] Scaffold Backend (Fastify + ESLint)
- [ ] Configure GitHub Actions (`.github/workflows/ci.yml`)
- [ ] Add PWA Manifest (`manifest.json`) and Icon assets
- [ ] Verify Local Development Loop (`npm run dev`)
