# Event Space

> Tour and experience booking platform with a public catalog, Stripe-based payments, and an admin console for operators.

Event Space is a monorepo built around a Next.js frontend, a NestJS API, Prisma, PostgreSQL, Redis, and a shared package for schemas and types. The current version covers the full operator workflow: publishing events, running promotional banners, managing bookings and date changes, collecting and moderating reviews, handling payments and refunds, and giving operators a live admin console.

---

## What is implemented now

### Public experience
- Event catalog with search, filters (price, dates, guest count, difficulty), and infinite-scroll pagination
- Event detail pages with media, pricing, duration, location, and cancellation policy
- Occurrence-based scheduling: each event can have several dates, each with its own capacity
- Per-date discounts: an occurrence can carry a percent off the event's base price (up to 100%, i.e. a free booking), shown as a struck-through price and badge everywhere the price appears
- Guest-count filtering so public listings only show events that can fit the requested group size
- Booking flow with quantity selection, capacity locking, and conflict handling for sold-out slots
- Stripe checkout and payment confirmation flow, including webhook fallback reconciliation; a 100%-discounted booking confirms without touching Stripe at all
- Changing the quantity on a confirmed booking (top-up charge or partial refund, by the cancellation policy or in full)
- Self-service cancellation with a refund estimate shown before confirming
- Booking without an account: a guest gives a name, an email (typed twice, with a hint for slips like `gmial.com`) and a phone, pays through Stripe and lands on a booking page behind a signed link that is also in the confirmation email. The link works without signing in: the check-in QR, cancellation with a refund estimate, changing the number of guests, accepting a moved date and leaving a review. Registering later with the same email picks the guest bookings up; an email that belongs to a confirmed account is refused, so nobody can book under someone else's name. The form tells the guest why the email matters and suggests an account first
- A home-page banner carousel the admin curates, with per-locale images and optional link to an event
- Favorites list
- Per-brand sites: the brand (name, colours, logo, contacts, "About" texts, language texts and **skin**) is resolved from the request host, so one codebase serves a separate-looking site per customer; see [Brands and skins](#brands-and-skins)
- Six interchangeable site skins (`classic`, `minimal`, `listing`, `soft`, `market`, `drawer`) that change the layout and not just the colours: header, event cards, catalog grid, banner, event page, booking panel, profile, modals, footer and navigation. One of them (`drawer`) moves the account, company pages, contacts and language into a side menu in the header's corner
- Catalog loads in steps of whole rows (three rows on desktop, six cards on a phone, whatever the column count of the skin) with infinite scroll
- Company contacts (Instagram, phone, email, map) shown as a list of direct links, a header tile or a side menu depending on the skin
- Reviews: star rating plus optional text, open only in the eligible window after the tour ends, editable for 48 hours; the author's own review is pinned at the top of the event page (with a "pending moderation" notice while it waits), review invitations are emailed automatically, and a signed link lets a guest (booked by an admin or on the site) leave a review without an account
- User dashboard with bookings, booking history, and favorites, both using keyset pagination with infinite scroll
- Changing your own email address (code sent to the new address, notice sent to the old one) and basic profile fields
- Live-updating event and booking-modal data: spots left and price refresh in the background every ~20–30s, so a seat that filled up on another device shows up before checkout rather than failing only at submit

### Authentication and security
- Email/password registration with OTP verification
- Login with a password, sign-in by a one-time code from the email (setting a password is optional there), changing the password from the profile, and Google OAuth. A code proves the mailbox, so it also confirms the address; other devices are signed out only when the password actually changes
- JWT access tokens with refresh-token rotation and httpOnly cookies
- Redis-backed rate limiting for authentication and sensitive endpoints
- Zod-based validation and shared contracts between API and web

### Admin panel
- Live dashboard (auto-refreshing, no reload needed): revenue, booking flow, booking state and cohort breakdowns over a custom date range, a "needs attention" list, upcoming events, and an activity feed
- Event CRUD with image upload, multiple occurrences per event, per-occurrence discounts, and status management
- Banner CRUD with drag-to-reorder, per-locale images, scheduling, and optional event targeting
- Booking management with search, filtering, manual (phone/offline) booking creation, check-in, and quantity changes
- Admin-side booking cancellation with refund strategy options: full, rules-based, or manual
- Date reschedule for an occurrence, with guest notification email and a refund window for anyone who can't make the new date
- Review moderation queue (publish/reject with a reason) and replying to a review as the company
- User management: role changes, and editing the guest profiles an admin creates for walk-in/manual bookings (name, phone, email) — a real account's email can only be changed by its owner
- Category CRUD
- Cancellation-policy rules per event (refund percentage by hours before the tour)

### Platform infrastructure
- Swagger/OpenAPI docs at the API endpoint
- Prisma migrations and generated shared schema artifacts
- MJML email templates (verification, booking confirmation with the check-in QR attached inline and a link to manage the booking, reminder, cancellation, reschedule, review invite/pending/reply, email-changed notice), sent over SMTP or Resend's HTTP API
- Background jobs: booking reminders, payment reconciliation and retry, refund retry, review invitations, and dashboard snapshotting
- Docker-based local development; Dockerfiles per app for platform deployment (the project runs in production on Railway, one deployment per brand/customer, sharing one codebase)
- E2E tests covering auth and booking behavior, including concurrent booking scenarios

---

## Brands and skins

Every customer is a **brand** defined in `packages/shared/src/constants/brands.constant.ts`, keyed by the host it is served from (for example `rstour.event-space.space`). A brand carries its name, primary and accent colours, logo, contact details, "About" texts per language and an optional `skin`. Unknown hosts (including `localhost`) get the default brand, which uses the `classic` skin.

A skin is chosen per brand and is applied through `data-skin` on `<html>`, a `useSkin()` hook and `in-data-[skin=…]:` Tailwind variants. Adding a brand is one entry in that file; adding a skin means following the checklist in [`docs/skins.md`](docs/skins.md), which also lists every component each skin touches and how to preview one locally.

To preview a skin locally, temporarily make `getBrandForHost` in `apps/web/src/config/brands.ts` return a brand with the skin you want, and revert it before committing. After changing types in `packages/shared`, rebuild it with `npm run shared:build`.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Backend | NestJS 11, Passport, JWT, cookie-based sessions |
| Database | PostgreSQL 15, Prisma 6 |
| Cache / limits | Redis 7 |
| Validation | Zod via the shared package |
| State | TanStack Query, Zustand |
| Media | Cloudinary |
| Payments | Stripe |
| Email | MJML templates, SMTP or Resend |
| Infra | Docker Compose, Nginx, Railway (production) |

---

## Repository structure

```text
event-space/
├── apps/
│   ├── api/           # NestJS API and Prisma schema
│   └── web/           # Next.js app router frontend
├── packages/
│   └── shared/        # Shared schemas, enums, types, utilities
├── infra/
│   └── nginx/         # Reverse proxy config for production
├── docs/
│   └── skins.md       # Site skins: how they work and how to add one
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json       # Root workspaces and shared scripts
```

---

## Prerequisites

- Node.js 20+
- Docker Desktop or Docker Engine with Compose
- npm

---

## Quick start

### 1. Install dependencies

```bash
git clone https://github.com/Tigrannnn/Event-space.git
cd event-space
npm install
```

### 2. Configure environment variables

Create a root `.env` file and fill in the required values.

```bash
cp .env.example .env
```

Key variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Yes | Example: `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | Yes | Strong random secret for JWT signing |
| `REVIEW_TOKEN_SECRET` | No | Signs the links guests get by email (booking, review) and the check-in QR; each kind is signed under its own label, derived from `JWT_ACCESS_SECRET` if unset |
| `ALLOWED_ORIGINS` | Yes | Comma-separated list, including `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For OAuth | Google Cloud Console credentials |
| `SMTP_*` / `MAIL_DEV_MODE` | For email | Set `MAIL_DEV_MODE=true` to log OTPs and other emails in the API console |
| `RESEND_API_KEY` | For email | Optional: sends mail over Resend's HTTP API instead of SMTP (SMTP is blocked below paid tiers on hosts like Railway) |
| `COOKIE_DOMAIN` | No | Widens auth cookies to a parent domain when the API runs on a sibling subdomain of the frontend |
| `CLOUDINARY_*` | For uploads | Used by admin event image and banner uploads; give each environment its own `CLOUDINARY_UPLOAD_FOLDER` |
| `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` | For checkout | Stripe keys |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret |
| `BOOKING_RESERVATION_TTL_SECONDS` | No | How long a pending booking holds its spot before releasing it; defaults to 120 |
| `API_URL` | Yes | Usually `http://localhost:5000` |
| `FRONTEND_URL` | Yes | Usually `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Public frontend base URL |

For end-to-end tests, create a `.env.test` file as well.

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL and Redis.

### 4. Run Prisma migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Start the apps

In two terminals:

```bash
npm run api:dev
npm run web:dev
```

Or build everything at once:

```bash
npm run build:all
```

### 6. Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| Swagger / OpenAPI | http://localhost:5000/api (disabled when `NODE_ENV=production`) |
| Health | http://localhost:5000/health |
| Prisma Studio | `npm run prisma:studio` |

---

## Useful scripts

```bash
npm run shared:build      # Build shared package
npm run api:dev           # Start NestJS in watch mode
npm run web:dev           # Start Next.js in dev mode
npm run build:all         # Build shared, web, and api
npm run clean             # Remove build artifacts

npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

npm run test:e2e:prepare
npm run test:e2e
```

Workspace shortcuts are also available:

```bash
npm --workspace apps/web run dev
npm --workspace apps/web run lint

npm --workspace apps/api run start:dev
npm --workspace apps/api run lint
npm --workspace apps/api run test          # unit tests — run a single file at a time, not the whole suite, on a small machine
npm --workspace apps/api run test:e2e
npm --workspace apps/api run test:live     # exercises a live, already-running environment
npm --workspace apps/api run templates:build  # compile .mjml email templates
```

---

## Production deployment

Run the full stack with Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The production setup includes the web app, API, PostgreSQL, Redis, and Nginx. The API is kept internal to the Docker network, while the public URL should be exposed through the environment variables.

In practice this project is deployed to Railway rather than a single Compose stack: each brand/customer gets its own Railway deployment of the same codebase (no multi-tenancy — separate databases and environment variables per deployment), built from the `apps/api/Dockerfile` and `apps/web/Dockerfile`. `RESEND_API_KEY` exists because Railway blocks outbound SMTP below its paid tiers.

Make sure production secrets are strong, `NODE_ENV=production` is set, and SMTP/Resend, Cloudinary, and Stripe credentials are configured correctly. Run `npx prisma migrate deploy` (not `migrate dev`) against the production database.

---

## Security notes

- Passwords are hashed with bcrypt
- Sessions use httpOnly cookies with refresh-token rotation
- API authorization is enforced with role-based guards for user and admin access
- CORS is explicitly configured via `ALLOWED_ORIGINS`
- Changing a real account's email requires the current password (when one is set) and a code sent to the new address; the old address is notified after the change
- Do not commit `.env` files to source control

---

## Testing

```bash
cp .env.test.example .env.test
npm run test:e2e:prepare
npm run test:e2e
```

The current test suite covers auth, booking, pricing/discount, admin, and review flows, including concurrent booking scenarios. Unit tests run per-file with `--runInBand`; see `apps/api/package.json` for the exact commands.

---

## License

ISC
