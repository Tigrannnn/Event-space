# Event Space

> **Tour & experience booking platform (MVP)**

Monorepo for a B2B-oriented event booking product: public catalog, user bookings with capacity control, and an admin panel for tour operators. Built with Next.js, NestJS, Prisma, and shared Zod contracts.

**Current scope:** single-tenant deployment (one brand per instance). Multi-tenant white-label, payments, and booking emails are planned — not shipped yet.

---

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | NestJS 11, Passport JWT, cookie-based sessions |
| **Database** | PostgreSQL 15, Prisma 6 |
| **Cache / rate limits** | Redis 7 |
| **Validation** | Zod (`@event-space/shared`) |
| **State (web)** | TanStack Query, Zustand |
| **Media** | Cloudinary |
| **Infra** | Docker Compose (dev DB + prod full stack) |

---

## Monorepo structure

```
event-space/
├── apps/
│   ├── api/              # NestJS REST API (port 5000)
│   └── web/              # Next.js frontend (port 3000)
├── packages/
│   └── shared/           # Zod schemas, types, constants (+ Prisma-generated Zod)
├── docker-compose.yml    # Dev: Postgres + Redis
├── docker-compose.prod.yml
└── package.json          # npm workspaces root
```

---

## Features (implemented)

### Public

- Event catalog with cursor pagination and text search (title, description, category, location)
- Event detail pages with images (Cloudinary), capacity, pricing display
- Booking flow: quantity 1–4, optimistic capacity locking, conflict handling when sold out
- User profile and booking list

### Authentication

- Email/password registration with OTP verification
- Login, forgot password / reset via OTP
- Google OAuth (authorization code flow, server-side token exchange)
- JWT access (15 min) + opaque refresh tokens (httpOnly cookies, rotation on refresh)
- Redis-backed rate limiting on auth endpoints

### Admin (`ADMIN` role)

- Dashboard: KPIs, capacity usage, recent activity, “needs attention” queues
- Events CRUD (multipart + images), statuses: `DRAFT` / `PUBLISHED` / `CANCELLED`
- Users and bookings management (search, pagination, role/status updates)

### API

- OpenAPI / Swagger UI at `/api`
- E2E tests for auth and booking concurrency (`apps/api/test/`)

---

## Data model (simplified)

```
User ──< Event (organizer)
User ──< Booking >── Event
Event ──< EventImage
User ──< RefreshToken
```

- **Booking** statuses: `PENDING` | `CONFIRMED` | `CANCELLED` (user flow creates `CONFIRMED` immediately)
- **Capacity:** denormalized `Event.currentParticipants` updated in transactions with conditional `updateMany`

---

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm (workspaces)

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/Tigrannnn/Event-space.git
cd event-space
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Edit `.env` at the **repository root** (both `api` and `web` load it via `dotenv-cli`).

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `REDIS_URL` | Yes | e.g. `redis://localhost:6379` (add if missing — API needs it for OTP and rate limits) |
| `JWT_ACCESS_SECRET` | Yes | Use a long random string in production |
| `ALLOWED_ORIGINS` | Yes | Comma-separated; include `http://localhost:3000` for dev |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For OAuth | From Google Cloud Console |
| `SMTP_*` / `MAIL_DEV_MODE` | For email | Set `MAIL_DEV_MODE=true` to log OTP codes to the API console |
| `CLOUDINARY_*` | For uploads | Event images in admin |
| `API_URL` | Yes | `http://localhost:5000` (used by Next.js server/middleware) |
| `FRONTEND_URL` | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` (Open Graph / metadata in `layout.tsx`) |

For E2E tests, copy `.env.test.example` to `.env.test`.

### 3. Start infrastructure

```bash
docker compose up -d
```

Starts PostgreSQL and Redis.

### 4. Database migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Run development servers

In two terminals (shared package is built automatically for `api:dev`):

```bash
npm run api:dev
npm run web:dev
```

Or build everything:

```bash
npm run build:all
```

### 6. URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| Swagger (dev only) | http://localhost:5000/api |
| Health | http://localhost:5000/health |
| Prisma Studio | `npm run prisma:studio` |

---

## NPM scripts (root)

```bash
npm run shared:build    # Build @event-space/shared
npm run api:dev         # NestJS watch mode
npm run web:dev         # Next.js (Turbopack)
npm run build:all       # shared + web + api
npm run clean           # Remove dist / .next artifacts

npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

npm run test:e2e:prepare   # Migrate test DB (.env.test)
npm run test:e2e           # Auth + booking E2E (apps/api)
```

Workspace shortcuts:

```bash
npm --workspace apps/web run dev
npm --workspace apps/api run start:dev
```

---

## Production (Docker)

Full stack (API, web, Postgres, Redis):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Ensure production `.env` has strong secrets, `NODE_ENV=production`, and real SMTP/Cloudinary credentials.

---

## Security overview

- Passwords: **bcrypt** (12 rounds)
- Sessions: **httpOnly** cookies (`accessToken`, `refreshToken`), `SameSite=strict`, `secure` in production
- Refresh tokens: opaque `id.validator`; only bcrypt hash stored in DB; rotation on refresh
- API authorization: `AccessTokenGuard` + `RolesGuard` (`USER` / `ADMIN`)
- Admin UI: server-side role check in `apps/web/src/app/admin/layout.tsx`; API enforces `ADMIN` on `/admin/*`
- Input validation: Zod pipes on auth, bookings, and user profile; extend to all admin mutations before production
- CORS: explicit `ALLOWED_ORIGINS` with credentials

Do not commit `.env`. Rotate `JWT_ACCESS_SECRET` and database credentials for any public deployment.

---

## Testing

```bash
# Requires Docker (Postgres + Redis) and .env.test
cp .env.test.example .env.test
npm run test:e2e:prepare
npm run test:e2e
```

Covers registration/OTP/login, refresh rotation, rate limits, and concurrent booking for the last available spot.

---

## License

ISC

---

*Built for tour operators who need a modern booking surface — with a clear path toward payments and multi-tenant B2B.*
