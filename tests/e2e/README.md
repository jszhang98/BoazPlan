# E2E Tests (Playwright)

These end-to-end tests exercise the running application in a browser.

## Prerequisites
1. Start both backend and frontend servers:
   ```bash
   npm run dev      # starts API (4000) and web (5173) simultaneously via `concurrently`
   ```
2. Open a separate terminal and execute the tests:
   ```bash
   npm run test:e2e
   ```

Tests assume `http://localhost:5173` is serving the web UI and that it proxies
`/api` requests to `http://localhost:4000` (see `apps/web/vite.config.js`).

The single current test covers the "New Request" flow.
