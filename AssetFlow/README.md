# AssetFlow

Enterprise Asset & Resource Management ERP — a hackathon project for tracking, allocating, and
maintaining physical assets and shared resources (equipment, vehicles, rooms) across an organization.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Auth**: NextAuth (Credentials provider) + bcrypt, against a custom `af_users` table
- **Database**: PostgreSQL via Neon serverless driver (`@neondatabase/serverless`), raw SQL —
  no ORM. Schema is created imperatively on first use by `src/lib/assetflow-schema.ts`.
- **UI**: Tailwind CSS v4, shadcn/radix-ui
- **Cache** (optional): Upstash Redis REST

## Setup

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL at minimum
npm run dev
```

On first run, bootstrap the schema and demo data by sending one request:

```bash
curl -X POST http://localhost:3000/api/setup/assetflow
```

This creates the `af_*` tables and seeds departments, asset categories, and four demo accounts
(password `password123` for all):

| Email | Role |
|---|---|
| `admin@assetflow.dev` | Admin |
| `manager@assetflow.dev` | Asset Manager |
| `head@assetflow.dev` | Department Head |
| `employee@assetflow.dev` | Employee |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — Biome lint
- `npm run check` — build + lint

## Known gaps

- Employee self-signup and admin role-promotion (per the PRD) are not yet wired up — only the
  four seeded demo accounts can log in today.
