# AssetFlow

Enterprise Asset & Resource Management System, built by our team for Odoo Hackathon '26.

Repository: https://github.com/diwakar-bhagat/odoo_26 (AssetFlow lives under the `/AssetFlow` folder)

Mockup / POC: https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby

## Overview

Most organizations still track equipment, furniture, vehicles, and shared spaces using spreadsheets and paper registers. It works fine until someone allocates a laptop that's already with someone else, or two teams book the same conference room at the same time.

AssetFlow is a centralized ERP module that solves this. It lets any organization - offices, schools, hospitals, factories, agencies - register assets, allocate them without conflicts, book shared resources by time slot, route maintenance through proper approvals, and run structured audit cycles. It is scoped on purpose: no purchasing, no invoicing, no accounting. Just asset and resource lifecycle management, done properly.

## About This Codebase

This project is built on top of our existing admin dashboard shell (originally set up for a garment production ERP called "CTA Apparels" - you'll still see references to it in the sidebar branding, `Dashboard.html`, `erp.ctaapparels.com/`, and the `components/cta` folder). That base gave us the layout system, theming, and component library already wired up, so the team could focus on building the actual AssetFlow modules instead of a UI shell from scratch.

The AssetFlow-specific work - the ten screens from the problem statement, the database schema, the API routes, and the business logic - lives under `src/app/(main)/dashboard/`, `src/app/api/af/`, and `src/lib/assetflow-schema.ts`. Everything under `prisma/`, `legacy_*`, and `_reference/` is leftover from the CTA Apparels base and is not part of the AssetFlow feature set.

If you open the app right now, the sidebar will still show a mix of old CTA Apparels navigation (CTA Mill, Procurement & Dispatch, Sample Tracking, Style Development, etc.) alongside the new AssetFlow modules. Cleaning that up - removing the unused CTA nav items and finishing the rebrand - is one of the next things on our list.

## Tech Stack

- Next.js 16 (App Router) with TypeScript
- Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion for the interface
- Zustand for client state, TanStack Query and TanStack Table for data fetching and tables
- NextAuth with the Credentials provider, passwords hashed with bcrypt
- PostgreSQL through the Neon serverless driver, with raw SQL table definitions in `src/lib/assetflow-schema.ts`
- Redis (Upstash) for caching
- React Hook Form with Zod for form validation
- Biome for linting and formatting, Husky and lint-staged for pre-commit checks
- Deployed on Vercel, with a Docker setup available for self-hosting

## User Roles

- **Admin** - sets up departments, asset categories, and audit cycles. Promotes employees to Department Head or Asset Manager. Views organization-wide analytics.
- **Asset Manager** - registers and allocates assets. Approves transfers, maintenance requests, audit discrepancies, and returns.
- **Department Head** - views their department's allocated assets, approves allocation and transfer requests within the department, books shared resources on the department's behalf.
- **Employee** - views assets allocated to them, books shared resources, raises maintenance requests, initiates returns and transfers.

Signup only ever creates an Employee account - there's no role picker at signup. Department Head and Asset Manager roles are assigned only by an Admin, from the Employee Directory screen. That is the only place roles are ever changed.

## Screens and Modules

1. **Login / Signup** - email and password auth, forgot password, session validation
2. **Dashboard** - KPI cards (Available, Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns), overdue returns shown separately from upcoming ones, quick actions
3. **Organization Setup (Admin only)** - Department Management, Asset Category Management, Employee Directory and role promotion
4. **Asset Registration & Directory** - register assets with auto-generated tags, search and filter, lifecycle status, per-asset allocation and maintenance history
5. **Asset Allocation & Transfer** - allocate to employee or department, conflict blocking, transfer workflow, return with condition check-in notes
6. **Resource Booking** - calendar view per resource, overlap validation, cancel/reschedule, reminder notifications
7. **Maintenance Management** - Pending, Approved/Rejected, Technician Assigned, In Progress, Resolved, with the asset status syncing automatically at each step
8. **Asset Audit** - audit cycles with assigned auditors, each asset marked Verified/Missing/Damaged, auto-generated discrepancy reports, cycle closure
9. **Reports & Analytics** - utilization trends, maintenance frequency, department allocation summary, booking heatmap, exportable reports
10. **Activity Logs & Notifications** - every action logged, real-time alerts for assignments, approvals, overdue returns, and audit flags

## Business Rules

**Allocation conflict** - Priya has Laptop AF-0114. If Raj tries to allocate the same laptop, the system blocks it, shows him it's currently held by Priya, and offers a Transfer Request instead.

**Booking overlap** - Room B2 is booked 9:00 to 10:00. A request for 9:30 to 10:30 is rejected because it overlaps. A request for 10:00 to 11:00 goes through because it starts right after the existing booking ends.

**Maintenance gating** - An asset stays Available until its maintenance request is Approved by an Asset Manager. Only then does it move to Under Maintenance. It moves back to Available once the request is Resolved.

**Audit closure** - Closing an audit cycle locks it and updates asset statuses automatically - confirmed-missing items get marked Lost.

## Project Structure

```
AssetFlow/
  src/
    app/
      (main)/dashboard/
        organization/     Screen 3 - Departments, Categories, Employee Directory
        assets/           Screen 4 - Asset Registration & Directory
        allocations/      Screen 5 - Allocation & Transfer
        transfers/        Transfer request approvals
        bookings/         Screen 6 - Resource Booking
        maintenance/      Screen 7 - Maintenance Management
        audits/           Screen 8 - Asset Audit
        notifications/    Screen 10 - Activity Logs & Notifications
        page.tsx          Screen 2 - Dashboard / Home
      login/              Screen 1 - Login / Signup
      api/af/             REST endpoints for assets, allocations, bookings,
                          maintenance, audits, transfers, organization,
                          notifications, and the dashboard
    components/erp/       AssetFlow-specific UI components
    lib/assetflow-schema.ts   Postgres table definitions and auto-migrations
    lib/auth-config.ts    NextAuth credentials and role-based sessions
    stores/                Zustand client state
  prisma/                 Legacy schema from the CTA Apparels base, not used by AssetFlow
  Dockerfile
  vercel.json
```

## Getting Started

You'll need:

- Node.js 20 or newer
- npm
- A PostgreSQL database (Neon's free tier works well: console.neon.tech)
- A Redis instance (Upstash, optional - only needed for caching)

Steps:

1. Clone the repo and move into the AssetFlow folder
   ```
   git clone https://github.com/diwakar-bhagat/odoo_26.git
   cd odoo_26/AssetFlow
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up your environment file
   ```
   cp .env.example .env.local
   ```
   Then open `.env.local` and fill in the values - see the table below for what each one is and where to get it.

4. Start the dev server
   ```
   npm run dev
   ```

5. Open the app at http://localhost:3000. The first request will automatically create all the required database tables through `assetflow-schema.ts` - there's no separate migration command to run.

6. Sign up through the login screen. This always creates an Employee account. To get your first Admin account, update the `role` column for that user directly in the `af_users` table in your database - after that, you can promote everyone else through the Employee Directory screen.

## Environment Variables

| Variable | Description | Where to get it |
|---|---|---|
| DATABASE_URL | Postgres connection string | Neon Console, under Connection strings |
| NEXTAUTH_SECRET | Random secret used to sign session tokens | Generate one with `openssl rand -base64 32` |
| NEXTAUTH_URL | Base URL of the app | `http://localhost:3000` for local dev |
| UPSTASH_REDIS_REST_URL | Redis REST endpoint, optional | Upstash Console |
| UPSTASH_REDIS_REST_TOKEN | Redis REST token, optional | Upstash Console |
| ERP_SYNC_SECRET | Shared secret for internal ERP sync endpoints | Any random string you choose |

## Available Scripts

| Command | What it does |
|---|---|
| npm run dev | Starts the dev server with hot reload |
| npm run build | Creates a production build |
| npm run start | Runs the production build |
| npm run lint | Lints the codebase with Biome |
| npm run format | Auto-formats the codebase with Biome |
| npm run check | Runs build and lint together |

## Docker

```
docker build -t assetflow .
docker run -p 3000:3000 --env-file .env.local assetflow
```

## Screenshots

This is the app as it stands right now, before the CTA Apparels rebrand cleanup mentioned above.

Sidebar navigation, still showing the mixed CTA Apparels / AssetFlow menu:

![Sidebar navigation](docs/screenshots/sidebar-navigation.png)

Dashboard overview, running on the CTA Apparels base template:

![Dashboard overview](docs/screenshots/dashboard-overview.png)

## What's Left To Do

- Remove the leftover CTA Apparels sidebar items (CTA Mill, Procurement & Dispatch, Sample Tracking, Style Development, Fabric and Trim Inventory, Supplier Performance) and finish renaming the shell to AssetFlow
- QR-code based asset lookup
- Email/SMS delivery for overdue and reminder notifications
- Bulk asset import via CSV or Excel
- Exportable audit reports as PDF

## Team

- **Diwakar** - Team Lead. Owns system architecture, backend, REST API design, business logic, the workflow engine, authentication, authorization/RBAC, and database architecture. Directories: `src/app/api/`, `src/lib/`, `middleware.ts`.
- **Gautam Sharma** - Frontend Lead. Owns UI components, the dashboard, layouts, responsive design, and overall user experience. Directories: `src/components/`, `src/app/`, `src/layout/`.
- **Vansh Harit** - Database & Integration Lead. Owns the Prisma schema (legacy), Postgres schema work, migrations, seed data, and connecting the frontend to the APIs. Directories: `prisma/`, `src/db/`, `src/repositories/`.
- **Garv Kathuria** - QA & Support. Owns manual testing, documentation, demo data, and static assets. Directories: `docs/`, `README.md`, `public/`.

Full branching strategy and daily Git workflow are in `TEAM_WORKFLOW.md`.

## Contributing

1. Fork the repo and create a feature branch, for example `feature/your-feature-name`
2. Follow the existing module pattern: `src/app/(main)/dashboard/<module>` paired with `src/app/api/af/<module>`
3. Run `npm run check` before pushing
4. Open a pull request describing which screen or module you touched and why

More detail is in `CONTRIBUTING.md`.

## License

Distributed under the MIT License. See `LICENSE` for details.
