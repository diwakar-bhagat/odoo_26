import { sql } from "@/lib/db";

// ── Role enum values ──
export const USER_ROLES = ["Admin", "Asset Manager", "Department Head", "Employee"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ASSET_STATUSES = [
  "Available",
  "Allocated",
  "Reserved",
  "Under Maintenance",
  "Lost",
  "Retired",
  "Disposed",
] as const;
export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const BOOKING_STATUSES = ["Upcoming", "Ongoing", "Completed", "Cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const MAINTENANCE_STATUSES = ["Pending", "Approved", "In Progress", "Resolved", "Rejected"] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

export const TRANSFER_STATUSES = ["Pending", "Approved", "Rejected"] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

// ── Schema bootstrap ──

export async function ensureUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.af_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Employee',
      department_id UUID,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function ensureDepartmentsTable() {
  await ensureUsersTable();
  await sql`
    CREATE TABLE IF NOT EXISTS public.af_departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      head_id UUID REFERENCES public.af_users(id) ON DELETE SET NULL,
      parent_id UUID REFERENCES public.af_departments(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_user_department'
      ) THEN
        ALTER TABLE public.af_users
          ADD CONSTRAINT fk_user_department
          FOREIGN KEY (department_id)
          REFERENCES public.af_departments(id)
          ON DELETE SET NULL;
      END IF;
    END $$
  `;

  await sql`ALTER TABLE public.af_departments ADD COLUMN IF NOT EXISTS description TEXT`;
}

export async function ensureAssetCategoriesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS public.af_asset_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      custom_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function ensureAssetsTable() {
  await ensureAssetCategoriesTable();
  await ensureDepartmentsTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_tag TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      serial_number TEXT UNIQUE,
      category_id UUID REFERENCES public.af_asset_categories(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'Available',
      condition TEXT NOT NULL DEFAULT 'Good',
      location TEXT,
      department_id UUID REFERENCES public.af_departments(id) ON DELETE SET NULL,
      purchase_date TIMESTAMPTZ,
      purchase_cost NUMERIC(14,2),
      warranty_expiry TIMESTAMPTZ,
      acquisition_date TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT,
      is_bookable BOOLEAN NOT NULL DEFAULT false,
      image_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Add columns if they don't exist (for existing databases)
  await sql`ALTER TABLE public.af_assets ADD COLUMN IF NOT EXISTS serial_number TEXT UNIQUE`;
  await sql`ALTER TABLE public.af_assets ADD COLUMN IF NOT EXISTS acquisition_date TIMESTAMPTZ DEFAULT NOW()`;
  await sql`ALTER TABLE public.af_assets ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT false`;
  await sql`ALTER TABLE public.af_assets ADD COLUMN IF NOT EXISTS image_url TEXT`;
}

export async function ensureAllocationsTable() {
  await ensureAssetsTable();
  await ensureUsersTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_allocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES public.af_assets(id) ON DELETE CASCADE,
      user_id UUID REFERENCES public.af_users(id) ON DELETE CASCADE,
      department_id UUID REFERENCES public.af_departments(id) ON DELETE SET NULL,
      allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expected_return TIMESTAMPTZ,
      returned_at TIMESTAMPTZ,
      condition_notes TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Active'
    )
  `;

  // Fix: make user_id nullable and add department_id if they don't exist
  await sql`ALTER TABLE public.af_allocations ALTER COLUMN user_id DROP NOT NULL`;
  await sql`ALTER TABLE public.af_allocations ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.af_departments(id) ON DELETE SET NULL`;
  await sql`ALTER TABLE public.af_allocations ADD COLUMN IF NOT EXISTS condition_notes TEXT`;
}

export async function ensureTransfersTable() {
  await ensureAllocationsTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES public.af_assets(id) ON DELETE CASCADE,
      allocation_id UUID NOT NULL REFERENCES public.af_allocations(id) ON DELETE CASCADE,
      from_employee_id UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      to_employee_id UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'Pending',
      reason TEXT,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      approved_by UUID REFERENCES public.af_users(id) ON DELETE SET NULL
    )
  `;
}

export async function ensureBookingsTable() {
  await ensureAssetsTable();
  await ensureUsersTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_bookings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      resource_id UUID NOT NULL REFERENCES public.af_assets(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT no_end_before_start CHECK (end_time > start_time)
    )
  `;
}

export async function ensureMaintenanceTable() {
  await ensureAssetsTable();
  await ensureUsersTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_maintenance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES public.af_assets(id) ON DELETE CASCADE,
      requested_by UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      assigned_to UUID REFERENCES public.af_users(id) ON DELETE SET NULL,
      approved_by UUID REFERENCES public.af_users(id) ON DELETE SET NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      status TEXT NOT NULL DEFAULT 'Pending',
      description TEXT NOT NULL,
      resolution TEXT,
      requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      approved_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    )
  `;

  await sql`ALTER TABLE public.af_maintenance ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ`;
}

export async function ensureAuditTable() {
  await ensureAssetsTable();
  await ensureUsersTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_audits (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES public.af_assets(id) ON DELETE CASCADE,
      auditor_id UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      found_status TEXT NOT NULL,
      found_condition TEXT NOT NULL,
      discrepancy TEXT,
      notes TEXT,
      audited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function ensureNotificationsTable() {
  await ensureUsersTable();

  await sql`
    CREATE TABLE IF NOT EXISTS public.af_notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES public.af_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      read BOOLEAN NOT NULL DEFAULT false,
      reference_id UUID,
      reference_type TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

// ── Bootstrap everything ──

export async function bootstrapAssetFlowSchema() {
  await ensureUsersTable();
  await ensureDepartmentsTable();
  await ensureAssetCategoriesTable();
  await ensureAssetsTable();
  await ensureAllocationsTable();
  await ensureTransfersTable();
  await ensureBookingsTable();
  await ensureMaintenanceTable();
  await ensureAuditTable();
  await ensureNotificationsTable();
}
