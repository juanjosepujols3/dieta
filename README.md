# DietCraft

DietCraft is a modern diet planning platform built with Next.js App Router. It creates 4-week plans, enforces a freemium paywall, tracks daily adherence, and supports food scan + barcode logging. Images are processed in memory only and never stored.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- NextAuth (Google OAuth + Credentials)
- Prisma + PostgreSQL
- Zod + React Hook Form
- Framer Motion
- Recharts
- react-dropzone
- next-themes

## Features
- Landing page, auth, onboarding wizard
- Deterministic diet engine (TDEE + macro targets)
- 4-week plan cycle with groceries
- Daily check-ins and progress
- Paywall (week 1 free, weeks 2-4 paid)
- Food Scan (photo -> USDA mapping, no image storage)
- Barcode scan (Open Food Facts -> USDA fallback)
- Admin panel with RBAC

## Environment Variables
Create a `.env` file based on `.env.example`.

```bash
SUPERADMIN_EMAIL=
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
USDA_API_KEY=
OPENAI_API_KEY=
```

`OPENAI_API_KEY` is optional. If it is not set, Food Scan uses a mock detector.

## Setup
```bash
npm install
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

App runs at http://localhost:3000

## Prisma
- Migrations: `npm run db:migrate`
- Production migrations: `npm run db:deploy`
- Seed recipes: `npm run db:seed`
- Studio: `npm run db:studio`

## Paywall Rules
- FREE users: access week 1
- PAID or COMPED users: access weeks 1-4
- SUPERADMIN can promote/downgrade users in `/admin`

## Food Scan Notes
- Images are read in memory and discarded immediately.
- No images are stored in DB, storage, or logs.
- Accepted formats: JPG, PNG, WEBP (max 5MB).

## Deploy to EasyPanel (Docker)
1. Create a new app in EasyPanel from this repo.
2. Add a PostgreSQL service and set `DATABASE_URL`.
3. Set the env vars listed above (same as `.env.example`).
4. Build uses the included `Dockerfile` (Next.js standalone output).
5. Run migrations on deploy: `npm run db:deploy` (use EasyPanel build/deploy hooks).
6. Seed optional: `npm run db:seed`.

### EasyPanel env checklist
Set these in the EasyPanel UI (do not commit secrets):
- `SUPERADMIN_EMAIL`
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `USDA_API_KEY`
- `OPENAI_API_KEY` (optional)

### Suggested EasyPanel setup
- Build command: `docker build -t dietacraft .`
- Start command: `node server.js`
- Port: `3000`

## Scripts
- `npm run dev` - local dev
- `npm run build` - production build
- `npm run start` - start server
- `npm run db:migrate` - run Prisma migrations
- `npm run db:seed` - seed recipes
