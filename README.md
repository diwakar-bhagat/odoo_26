<div align="center">

# 🗂️ AssetFlow

### Enterprise Asset & Resource Management System

Track. Allocate. Book. Maintain. Audit. — all in one place.

Built for **Odoo Hackathon '26**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech)
[![Tailwind](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Mockup / POC](https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby) · [Report a Bug](../../issues) · [Request a Feature](../../issues)

</div>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Why AssetFlow](#-why-assetflow)
- [Tech Stack](#-tech-stack)
- [User Roles](#-user-roles)
- [Screens & Modules](#-screens--modules)
- [Business Rules That Matter](#-business-rules-that-matter)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Docker](#-docker)
- [Roadmap](#-roadmap)
- [Team](#-team)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About the Project

Most organizations still track their equipment, furniture, vehicles, and shared spaces on spreadsheets and paper registers. It works — until someone allocates a laptop that's already with someone else, or two teams book the same conference room at the same time.

**AssetFlow** is a centralized ERP module that fixes this. It gives every organization — offices, schools, hospitals, factories, agencies — a single system to register assets, allocate them without conflicts, book shared resources by time slot, route maintenance through proper approvals, and run structured audit cycles.

It is scoped deliberately: **no purchasing, no invoicing, no accounting.** Just clean asset and resource lifecycle management, done right.

## ✨ Why AssetFlow

- ✅ **No double-allocation** — the system blocks it outright and offers a transfer request instead
- ✅ **No overlapping bookings** — time-slot validation on every resource
- ✅ **No maintenance without approval** — an asset can't flip to "Under Maintenance" until an Asset Manager signs off
- ✅ **No self-appointed admins** — every account starts as an Employee; roles are promoted, never self-assigned
- ✅ **Full audit trail** — every allocation, transfer, booking, and maintenance action is logged and reportable

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling / UI | Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion |
| Client State | Zustand, TanStack Query, TanStack Table |
| Auth | NextAuth (Credentials provider) + bcrypt |
| Database | PostgreSQL via Neon serverless driver (raw SQL, `src/lib/assetflow-schema.ts`) |
| Cache | Redis (Upstash) |
| Forms & Validation | React Hook Form + Zod |
| Tooling | Biome (lint & format), Husky + lint-staged |
| Deployment | Vercel / Docker (Next.js standalone output) |

---

## 👥 User Roles

| Role | What they can do |
|---|---|
| **Admin** | Sets up departments, asset categories, and audit cycles. Promotes employees to Department Head / Asset Manager. Views organization-wide analytics. |
| **Asset Manager** | Registers and allocates assets. Approves transfers, maintenance requests, audit discrepancies, and returns. |
| **Department Head** | Views their department's allocated assets. Approves allocation/transfer requests within the department. Books shared resources on the department's behalf. |
| **Employee** | Views assets allocated to them. Books shared resources. Raises maintenance requests. Initiates returns and transfers. |

> 🔒 **Signup only ever creates an Employee account** — there's no role picker at signup. Department Head and Asset Manager roles are assigned exclusively by an Admin from the Employee Directory. This is the only place roles change hands.

---

## 🖥️ Screens & Modules

| # | Screen | What it does |
|---|---|---|
| 1 | **Login / Signup** | Email & password auth, forgot password, session validation |
| 2 | **Dashboard** | KPI cards (Available, Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns), overdue returns highlighted separately, quick actions |
| 3 | **Organization Setup** *(Admin)* | Department Management · Asset Category Management · Employee Directory & role promotion |
| 4 | **Asset Registration & Directory** | Register assets with auto-generated tags, search/filter, lifecycle status, per-asset allocation + maintenance history |
| 5 | **Asset Allocation & Transfer** | Allocate to employee/department, conflict blocking, transfer workflow, return with condition check-in |
| 6 | **Resource Booking** | Calendar view, overlap validation, cancel/reschedule, reminder notifications |
| 7 | **Maintenance Management** | Raise → Approve/Reject → Assign Technician → In Progress → Resolved, with automatic status sync on the asset |
| 8 | **Asset Audit** | Audit cycles with assigned auditors, Verified/Missing/Damaged marking, auto-generated discrepancy reports, cycle closure |
| 9 | **Reports & Analytics** | Utilization trends, maintenance frequency, department allocation summary, booking heatmap, exportable reports |
| 10 | **Activity Logs & Notifications** | Every action logged; real-time alerts for assignments, approvals, overdue returns, and audit flags |

---

## ⚖️ Business Rules That Matter

**Allocation conflict**
> Priya has Laptop `AF-0114`. Raj tries to allocate the same laptop — the system blocks it, shows him it's currently held by Priya, and offers a **Transfer Request** button instead.

**Booking overlap**
> Room B2 is booked 9:00–10:00. A request for 9:30–10:30 is rejected (overlaps). A request for 10:00–11:00 goes through fine (starts right after).

**Maintenance gating**
> An asset stays `Available` until its maintenance request is **Approved** — only then does it flip to `Under Maintenance`. It flips back to `Available` on `Resolved`.

**Audit closure**
> Closing an audit cycle locks it permanently and updates asset statuses — confirmed-missing items are marked `Lost` automatically.

---

## 📁 Project Structure

```
AssetFlow/
├── src/
│   ├── app/
│   │   ├── (main)/dashboard/
│   │   │   ├── organization/     # Screen 3 – Departments, Categories, Employee Directory
│   │   │   ├── assets/           # Screen 4 – Asset Registration & Directory
│   │   │   ├── allocations/      # Screen 5 – Allocation & Transfer
│   │   │   ├── transfers/        # Transfer request approvals
│   │   │   ├── bookings/         # Screen 6 – Resource Booking
│   │   │   ├── maintenance/      # Screen 7 – Maintenance Management
│   │   │   ├── audits/           # Screen 8 – Asset Audit
│   │   │   ├── notifications/    # Screen 10 – Activity Logs & Notifications
│   │   │   └── page.tsx          # Screen 2 – Dashboard / Home
│   │   ├── login/                # Screen 1 – Login / Signup
│   │   └── api/af/               # REST endpoints – assets, allocations, bookings,
│   │                             #   maintenance, audits, transfers, organization,
│   │                             #   notifications, dashboard
│   ├── components/erp/           # AssetFlow-specific UI components
│   ├── lib/assetflow-schema.ts   # Postgres table definitions & auto-migrations
│   ├── lib/auth-config.ts        # NextAuth credentials + role-based session
│   └── stores/                   # Zustand client state
├── prisma/                       # Legacy schema (unrelated internal module, ignore for AssetFlow)
├── Dockerfile
└── vercel.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed / ready before you start:

- **Node.js** 20 or newer
- **npm** (comes with Node)
- A **PostgreSQL** database — [Neon](https://console.neon.tech) is the easiest free option
- A **Redis** instance — [Upstash](https://console.upstash.com/redis) (optional, only needed for caching)

### Step-by-step setup

**1. Clone the repo**
```bash
git clone https://github.com/diwakar-bhagat/odoo_26.git
cd odoo_26/AssetFlow
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env.local
```
Now open `.env.local` and fill in the values — see the [Environment Variables](#-environment-variables) table below for where to get each one.

**4. Run the dev server**
```bash
npm run dev
```

**5. Open the app**

Go to [http://localhost:3000](http://localhost:3000) in your browser. The first request will automatically create all required tables in your Postgres database — there's no separate migration command to run.

**6. Create your first account**

Sign up through the login screen — this always creates an `Employee` account. To get an Admin account, either promote a signed-up user manually in the database (`af_users` table, `role` column) the first time, or seed one via `scripts/` if provided.

---

## 🔐 Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | Neon Console → Connection strings |
| `NEXTAUTH_SECRET` | Random secret used to sign session tokens | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Base URL of the app | `http://localhost:3000` locally |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint (optional) | Upstash Console |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token (optional) | Upstash Console |
| `ERP_SYNC_SECRET` | Shared secret for internal ERP sync endpoints | Any random string you choose |

---

## 📜 Available Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase with Biome |
| `npm run format` | Auto-format the codebase with Biome |
| `npm run check` | Build + lint, in one go |

---

## 🐳 Docker

Prefer containers? This works too:

```bash
docker build -t assetflow .
docker run -p 3000:3000 --env-file .env.local assetflow
```

---

## 🗺️ Roadmap

- [ ] QR-code based asset lookup on mobile
- [ ] Email/SMS delivery for overdue and reminder notifications
- [ ] Bulk asset import via CSV/Excel
- [ ] Configurable approval chains per department
- [ ] Exportable audit reports as PDF

---

## 👨‍💻 Team

| Member | Role | Owns |
|---|---|---|
| **Diwakar** | Team Lead — Architecture, Backend, Auth, RBAC, API Design | `src/app/api/`, `src/lib/`, `middleware.ts` |
| **Gautam** | Frontend Lead — UI, Dashboard, Layouts, UX | `src/components/`, `src/app/`, `src/layout/` |
| **Vansh Harit** | Database & Integration Lead | `prisma/`, `src/db/`, `src/repositories/` |
| **Garv Kathuria** | QA & Support — Testing, Docs, Demo Data | `docs/`, `README.md`, `public/` |

See [`TEAM_WORKFLOW.md`](./TEAM_WORKFLOW.md) for the full branching strategy and daily Git workflow.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch (`feature/your-feature-name`)
2. Follow the existing module pattern: `src/app/(main)/dashboard/<module>` + `src/app/api/af/<module>`
3. Run `npm run check` before pushing
4. Open a PR describing what screen/module you touched and why

More detail in [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">
Made with a lot of debugging and chai ☕ by the AssetFlow team.
</div>
