# BoazPlan

This repository hosts the BoazPlan application.

## Getting Started
1. Install root dependencies:
   ```bash
   npm install
   ```
2. Start development servers (API + Web):
   ```bash
   npm run dev
   ```

### Database
The API uses Prisma as the ORM. By default the `apps/api/.env` is configured
for PostgreSQL, which is the production target. To run locally you can either:

- Override `DATABASE_URL` to `file:./dev.db` (SQLite) for simple testing, or
- Start a Postgres server (e.g. via Docker) and point `DATABASE_URL` at it.

Example command to run a disposable Postgres container:

```bash
docker run --name boazplan-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/boazplan?schema=public"
cd apps/api && npm run migrate
```

E2E tests `npm run test:e2e` work against either configuration as long as the
front-end can proxy to `http://localhost:4000`.
