# HRMS

A production-grade Human Resource Management System built for the Odoo Hackathon. Covers authentication with email verification, employee profiles, attendance tracking, leave management, payroll, and file uploads.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, TanStack Query v5, React Hook Form, Zod, Framer Motion |
| Backend | Node.js 20 LTS, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Auth | JWT access tokens (15 min) + rotating opaque refresh tokens, bcrypt, Helmet, CORS, rate limiting |
| Email | Nodemailer — maildev (local SMTP catcher) in development |
| Validation | Zod on both frontend and backend |

---

## Prerequisites

- Node.js 20+
- npm
- Docker and Docker Compose

---

## Running Locally

### Option A — Docker Compose (recommended)

Starts all four services: `postgres`, `maildev`, `backend`, `frontend`.

```bash
# 1. Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Fill in required secrets in backend/.env
#    At minimum: DATABASE_URL, JWT_ACCESS_SECRET

# 3. Start the full stack
docker compose up --build
```

Seed demo data (first run only):

```bash
docker compose exec backend npm run seed
```

### Option B — Local dev servers

Start infrastructure via Docker, then run the servers natively for hot reload.

**Step 1 — Infrastructure**

```bash
docker compose up -d postgres maildev
```

**Step 2 — Backend**

```bash
cd backend
npm install
cp .env.example .env          # edit DATABASE_URL and JWT_ACCESS_SECRET
npx prisma migrate deploy     # apply migrations
npm run seed                  # load demo data
npm run dev                   # http://localhost:4000
```

Verify the backend is up:

```bash
curl http://localhost:4000/health
# {"success":true,"data":{"status":"ok","uptime":...}}
```

**Step 3 — Frontend** (separate terminal)

```bash
cd frontend
npm install
cp .env.example .env          # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev                   # http://localhost:3000
```

---

## Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Health check | http://localhost:4000/health |
| maildev inbox | http://localhost:1080 |
| Prisma Studio | http://localhost:5555 (run `npm run prisma:studio` from `backend/`) |

---

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hrms.local` | `Admin@123` |

Additional seeded employees are listed in `prisma/seed.ts`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `4000` | API server port |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |
| `JWT_ACCESS_SECRET` | — | Secret for signing access tokens |
| `JWT_ACCESS_EXPIRES` | `15m` | Access token lifetime |
| `REFRESH_TOKEN_TTL_DAYS` | `7` | Refresh token lifetime |
| `REFRESH_TOKEN_TTL_DAYS_REMEMBER` | `30` | Refresh lifetime with "Remember me" |
| `BCRYPT_COST` | `12` | bcrypt work factor |
| `EMAIL_VERIFY_TTL_HOURS` | `24` | Email verification token lifetime |
| `PASSWORD_RESET_TTL_HOURS` | `1` | Password reset token lifetime |
| `SMTP_HOST` | `localhost` | SMTP server host |
| `SMTP_PORT` | `1025` | SMTP server port |
| `SMTP_FROM` | `HRMS <no-reply@hrms.local>` | From address on outgoing mail |
| `APP_WEB_URL` | `http://localhost:3000` | Frontend base URL (used in email links) |
| `ORG_TIMEZONE` | `Asia/Kolkata` | Display timezone (storage is UTC) |
| `UPLOAD_DIR` | `src/uploads` | File upload directory |
| `MAX_IMAGE_MB` | `5` | Max image upload size |
| `MAX_DOC_MB` | `10` | Max document upload size |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend API base URL |

---

## Prisma Commands

Run from the `backend/` directory.

| Command | Description |
|---|---|
| `npm run prisma:migrate` | Create and apply a new migration (dev) |
| `npx prisma migrate deploy` | Apply existing migrations (production-safe) |
| `npx prisma generate` | Regenerate the Prisma Client after a schema change |
| `npm run seed` | Clean and reseed demo data (idempotent) |
| `npm run prisma:studio` | Open Prisma Studio GUI at http://localhost:5555 |

The schema lives at `prisma/schema.prisma` (repo root). The `backend/package.json` `prisma.schema` field points to it, so plain `npx prisma` commands work from `backend/` without extra flags.

---

## Available Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier |
| `npm test` | Run Jest tests |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build production bundle |
| `npm start` | Serve production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest + Testing Library tests |

---

## Repository Layout

```
.
├── backend/            Express + Prisma REST API
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       ├── middleware/
│       ├── validators/
│       └── config/
├── frontend/           Next.js application
│   └── app/
│       ├── (auth)/     Login, register, verify-email, select-role, forgot/reset-password
│       └── (protected)/Dashboard, attendance, leave, payroll, profile, admin
├── prisma/             schema.prisma, migrations, seed.ts
├── docker-compose.yml  Full dev stack definition
└── SETUP.md            Extended setup reference
```

---

## Auth Workflow

1. User registers with name, email, and password.
2. A verification email is sent via SMTP (maildev in dev — check http://localhost:1080).
3. User clicks the link in the email to verify their account.
4. On first login after registration, the user picks a role (Employee or HR/Admin) on the select-role page. Seeded demo users already have roles assigned and skip this step.
5. Login issues a short-lived JWT access token and a rotating opaque refresh token (stored in an httpOnly cookie).
6. The refresh token is rotated on every silent refresh. Old tokens are invalidated immediately.
7. Password reset follows the same email-link pattern with a 1-hour expiry.
