# Event Space

> **Premium Experience-Booking Platform**

A modern, scalable monorepo architecture for booking unique events and experiences. Built with engineering excellence in mind, leveraging the latest stable versions of Next.js, NestJS, and Prisma.

---

## 🏗 Architecture

| Layer       | Technology                          |
|-------------|-------------------------------------|
| **Frontend**| Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **Backend** | NestJS 11, TypeScript, Passport JWT |
| **Database**| PostgreSQL 15, Prisma 6 ORM         |
| **Validation**| Zod (end-to-end type safety)      |
| **State**   | Zustand, TanStack Query             |
| **Infra**   | Docker, Docker Compose              |

### Monorepo Structure

```
event-space/
├── apps/
│   ├── api/          # NestJS 11 REST API
│   └── web/          # Next.js 15 Frontend
├── packages/
│   └── shared/       # Shared types, schemas (Zod), constants
├── docker-compose.yml
└── package.json
```

**Benefits:**
- ✅ **Shared Type Safety** — Zod schemas in `@event-space/shared` ensure consistency between frontend and backend
- ✅ **Independent Deployment** — API and Web can be built/deployed separately
- ✅ **Unified Dev Experience** — Single `npm run dev` command spins up the entire stack

---

## 🚀 Core Features (Current)

### Backend (`apps/api`)
- **User Module** — CRUD operations with Prisma, password hashing (bcrypt)
- **Event Module** — Full CRUD for experiences with filtering by date/category
- **Prisma Service** — Centralized DB connection with lifecycle hooks
- **Swagger Documentation** — Auto-generated API docs at `/api/docs`
- **Role-Based Access** — `USER` / `ADMIN` enum ready for guards

### Frontend (`apps/web`)
- **Next.js 15 App Router** — Server Components, optimized routing
- **Responsive UI** — Tailwind CSS 4 with Framer Motion animations
- **Form Handling** — React Hook Form + Zod validation
- **State Management** — Zustand for global state, TanStack Query for server state
- **Design System** — Lucide React icons, custom components

### Database Schema

```prisma
User ──< Event
```

- **User** — Authentication (email/password, Google OAuth), role management
- **Event** — Title, description, images, location, difficulty, pricing, participant limits
- **Relation** — One-to-Many (User creates multiple Events as organizer)

---

## 📍 Strategic Roadmap

| Phase | Focus Area              | Milestones                                      |
|-------|-------------------------|-------------------------------------------------|
| **1** | **Foundation** ✅       | Monorepo setup, NestJS API, Next.js UI, Prisma schema, Docker DB |
| **2** | **Security & Payments** | JWT auth, OTP verification, AmeriaBank integration, session management |
| **3** | **Operations**          | Admin dashboard, analytics, booking management, email notifications |
| **4** | **Growth**              | Reviews/ratings, multi-region support, social sharing, referral system |

---

## 🛠 Technical Setup

### Prerequisites

```bash
Node.js 20+
Docker & Docker Compose
npm (workspaces enabled)
```

### 1. Clone & Install

```bash
git clone https://github.com/Tigrannnn/Event-space.git
cd event-space
npm install
```

### 2. Environment Setup

```bash
# Copy example env
cp .env.example .env


### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations

```bash
# From project root (recommended)
npm run prisma:generate
npm run prisma:migrate

# Or from apps/api
cd apps/api
npm run prisma:generate
npm run prisma:migrate
```

### 5. Development

```bash
# Run everything (shared → api + web)
npm run web:dev
npm run api:dev

# Or build all
npm run build:all
```

### 6. Access

| Service     | URL                  |
|-------------|----------------------|
| Frontend    | http://localhost:3000 |
| API         | http://localhost:5000 |
| Swagger     | http://localhost:5000/api |
| PostgreSQL  | localhost:5432       |

---

## 📦 NPM Workspaces Commands

```bash
# Shared package
npm run shared:build
npm run shared:dev

# Individual apps
npm --workspace apps/web run dev
npm --workspace apps/api run start:dev

# Clean all build artifacts
npm run clean
```

---

## 🔐 Security Notes

- Passwords hashed with `bcrypt` (cost factor 10)
- JWT tokens for session management (Phase 2)
- Environment variables never committed (`.env` in `.gitignore`)
- Zod validation on all API inputs

---

## 📄 License

ISC

---

*Built with ❤️ for modern event experiences*
