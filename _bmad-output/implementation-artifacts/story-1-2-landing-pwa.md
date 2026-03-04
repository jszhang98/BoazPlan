---
story_id: 1.2
title: Landing Page & PWA Install
epic: 'Epic 7: Platform Architecture & PWA'
priority: High
status: todo
owner: dev
acceptance_criteria:
  - Landing page (`/`) shows project branding
  - Users are prompted to install the PWA on supported devices
  - Manifest includes theme color, icons, and `display: standalone`
  - Offline fallback page works (basic network error message)

technical_notes:
  - `vite-plugin-pwa` installation
  - Custom `manifest.json` with correct start URL (`/`)
  - Simple React component: `PWAInstallPrompt`
  - Fallback offline page or caching strategy (StaleWhileRevalidate)
---

# Story 1.2: PWA Landing & Installation

**As a** New User,
**I want** to see a branded landing page and easily install the app,
**So that** I can engage with the platform natively.

## Tasks
- [ ] Configure `vite-plugin-pwa` with correct manifest
- [ ] Create `pages/Landing.jsx` (Hero section, CTA)
- [ ] Implement `PWAInstallPrompt` Component (detects `beforeinstallprompt`)
- [ ] Add Service Worker caching strategy (basic assets)
- [ ] Verify PWA auditing (Lighthouse > 80 PWA Score)
