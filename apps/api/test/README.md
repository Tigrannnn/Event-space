# E2E tests

E2E uses a **separate Postgres database** and **Redis logical DB 1** — not your dev `event_space` / redis `0`.

## One-time setup

```bash
cp .env.test.example .env.test   # from repo root

# Create empty test database (same Postgres as dev)
docker exec -it event-space-postgres psql -U postgres -c "CREATE DATABASE event_space_test;"
# or: createdb event_space_test

npm run test:e2e:prepare   # applies migrations to event_space_test
```

## Run

```bash
npm run test:e2e
```

Before each suite: tables are truncated + Redis DB 1 is flushed.  
If `DATABASE_URL` does not contain `_test`, tests **refuse to run** (safety guard).

## Suites

| File | Coverage |
|------|----------|
| `auth.e2e-spec.ts` | register, verify, resend, login, `/users/me`, refresh, logout, forgot/reset password, rate limits, Google invalid token |
| `booking.e2e-spec.ts` | create, concurrency (1 spot), draft forbidden, cancel, update qty, re-book, `GET /bookings/my` |

Helpers: `helpers/e2e-app.ts`, `auth-test.utils.ts`, `seed-event.ts` (`createTestEvent` with any `EventStatus`).
