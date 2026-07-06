# Event Space

> Tour and experience booking platform with a public catalog, Stripe-based payments, and an admin console for operators.

Event Space is a monorepo built around a Next.js frontend, a NestJS API, Prisma, PostgreSQL, Redis, and a shared package for schemas and types. The current version covers the full operator workflow: publishing events, managing bookings, handling payments, and supporting guest-capacity aware listings.

---

## What is implemented now

### Public experience
- Event catalog with search and pagination
- Event detail pages with media, pricing, duration, and location details
- Occurrence-based scheduling and capacity-aware availability
- Guest-count filtering so public listings only show events that can fit the requested group size
- Booking flow with quantity selection, capacity locking, and conflict handling for sold-out slots
- Stripe checkout and payment confirmation flow, including webhook fallback reconciliation
- User dashboard with bookings and basic booking history

### Authentication and security
- Email/password registration with OTP verification
- Login, password reset, and Google OAuth
- JWT access tokens with refresh-token rotation and httpOnly cookies
- Redis-backed rate limiting for authentication and sensitive endpoints
- Zod-based validation and shared contracts between API and web

### Admin panel
- Dashboard with KPIs, occupancy insights, and recent activity
- Event CRUD with image upload support and status management
- Booking management with search, filtering, and status visibility
- Admin-side booking cancellation with refund strategy options: full, rules-based, or manual
- Check-in flow and occurrence-based event details

### Platform infrastructure
- Swagger/OpenAPI docs at the API endpoint
- Prisma migrations and generated shared schema artifacts
- Docker-based local development and production deployment support
- E2E tests covering auth and booking behavior

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4 |
| Backend | NestJS 11, Passport, JWT, cookie-based sessions |
| Database | PostgreSQL 15, Prisma 6 |
| Cache / limits | Redis 7 |
| Validation | Zod via the shared package |
| State | TanStack Query, Zustand |
| Media | Cloudinary |
| Payments | Stripe |
| Infra | Docker Compose, Nginx |

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
| `ALLOWED_ORIGINS` | Yes | Comma-separated list, including `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | For OAuth | Google Cloud Console credentials |
| `SMTP_*` / `MAIL_DEV_MODE` | For email | Set `MAIL_DEV_MODE=true` to log OTPs in the API console |
| `CLOUDINARY_*` | For uploads | Used by admin event image uploads |
| `STRIPE_SECRET_KEY` | For checkout | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Stripe webhook signing secret |
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
| Swagger / OpenAPI | http://localhost:5000/api |
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
npm --workspace apps/api run start:dev
```

---

## Production deployment

Run the full stack with Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

The production setup includes the web app, API, PostgreSQL, Redis, and Nginx. The API is kept internal to the Docker network, while the public URL should be exposed through the environment variables.

Make sure production secrets are strong, `NODE_ENV=production` is set, and SMTP, Cloudinary, and Stripe credentials are configured correctly.

---

## Security notes

- Passwords are hashed with bcrypt
- Sessions use httpOnly cookies with refresh-token rotation
- API authorization is enforced with role-based guards for user and admin access
- CORS is explicitly configured via `ALLOWED_ORIGINS`
- Do not commit `.env` files to source control

---

## Testing

```bash
cp .env.test.example .env.test
npm run test:e2e:prepare
npm run test:e2e
```

The current test suite covers auth and booking flows, including concurrent booking scenarios.

---

## License

ISC
