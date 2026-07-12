import {
  ensureAllocationsTable,
  ensureAssetsTable,
  ensureAuditTable,
  ensureBookingsTable,
  ensureDepartmentsTable,
  ensureMaintenanceTable,
  ensureNotificationsTable,
  ensureTransfersTable,
  ensureUsersTable,
} from "@/lib/assetflow-schema";
import { sql } from "@/lib/db";

/**
 * Server-side data access for AssetFlow dashboard pages.
 *
 * These functions are called directly from React Server Components instead of
 * self-fetching the app's own `/api/af/*` routes over HTTP. Self-fetching from
 * an RSC is fragile in production (host-header resolution, cookie forwarding,
 * deployment protection) and any failure throws during render, surfacing as
 * "An error occurred in the Server Components render".
 *
 * Every function here is resilient: if the database is not configured or a
 * query fails, it logs and returns a safe empty fallback so the page still
 * renders (with an empty state) rather than crashing the whole route.
 */

const dbConfigured = () => Boolean(process.env.DATABASE_URL);

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!dbConfigured()) return fallback;
  try {
    return await fn();
  } catch (err) {
    console.error(`[af-data] ${label} failed:`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

export type DashboardData = {
  kpis: {
    total_assets: number;
    available_assets: number;
    allocated_assets: number;
    maintenance_assets: number;
    active_bookings: number;
    overdue_returns: number;
    overdue_bookings: number;
    pending_maintenance: number;
    pending_transfers: number;
    overdue_total: number;
  };
  charts: {
    status_breakdown: { status: string; count: number }[];
    category_breakdown: { category: string; count: number }[];
  };
  recent_allocations: any[];
  db_configured: boolean;
};

const EMPTY_DASHBOARD: DashboardData = {
  kpis: {
    total_assets: 0,
    available_assets: 0,
    allocated_assets: 0,
    maintenance_assets: 0,
    active_bookings: 0,
    overdue_returns: 0,
    overdue_bookings: 0,
    pending_maintenance: 0,
    pending_transfers: 0,
    overdue_total: 0,
  },
  charts: { status_breakdown: [], category_breakdown: [] },
  recent_allocations: [],
  db_configured: false,
};

export async function getDashboardData(): Promise<DashboardData> {
  return safe<DashboardData>(
    "getDashboardData",
    async () => {
      await ensureAssetsTable();

      const [totalAssets] = await sql`SELECT COUNT(*)::int as count FROM public.af_assets`;
      const [availableAssets] =
        await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Available'`;
      const [allocatedAssets] =
        await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Allocated'`;
      const [maintenanceAssets] =
        await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Under Maintenance'`;
      const [activeBookings] = await sql`
        SELECT COUNT(*)::int as count FROM public.af_bookings WHERE status IN ('Upcoming', 'Ongoing')`;
      const [overdueReturns] = await sql`
        SELECT COUNT(*)::int as count FROM public.af_allocations
        WHERE status = 'Active' AND expected_return IS NOT NULL AND expected_return < NOW()`;
      const [overdueBookings] = await sql`
        SELECT COUNT(*)::int as count FROM public.af_bookings WHERE status = 'Ongoing' AND end_time < NOW()`;
      const [pendingMaintenance] =
        await sql`SELECT COUNT(*)::int as count FROM public.af_maintenance WHERE status = 'Pending'`;
      const [pendingTransfers] =
        await sql`SELECT COUNT(*)::int as count FROM public.af_transfers WHERE status = 'Pending'`;
      const statusBreakdown = await sql`
        SELECT status, COUNT(*)::int as count FROM public.af_assets GROUP BY status ORDER BY count DESC`;
      const categoryBreakdown = await sql`
        SELECT c.name as category, COUNT(*)::int as count
        FROM public.af_assets a
        JOIN public.af_asset_categories c ON a.category_id = c.id
        GROUP BY c.name ORDER BY count DESC`;
      const recentAllocations = await sql`
        SELECT al.*, a.name as asset_name, a.asset_tag, u.name as user_name
        FROM public.af_allocations al
        JOIN public.af_assets a ON al.asset_id = a.id
        LEFT JOIN public.af_users u ON al.user_id = u.id
        ORDER BY al.allocated_at DESC LIMIT 5`;

      return {
        kpis: {
          total_assets: totalAssets?.count ?? 0,
          available_assets: availableAssets?.count ?? 0,
          allocated_assets: allocatedAssets?.count ?? 0,
          maintenance_assets: maintenanceAssets?.count ?? 0,
          active_bookings: activeBookings?.count ?? 0,
          overdue_returns: overdueReturns?.count ?? 0,
          overdue_bookings: overdueBookings?.count ?? 0,
          pending_maintenance: pendingMaintenance?.count ?? 0,
          pending_transfers: pendingTransfers?.count ?? 0,
          overdue_total: (overdueReturns?.count ?? 0) + (overdueBookings?.count ?? 0),
        },
        charts: { status_breakdown: statusBreakdown, category_breakdown: categoryBreakdown },
        recent_allocations: recentAllocations,
        db_configured: true,
      };
    },
    EMPTY_DASHBOARD,
  );
}

export async function getAssets(): Promise<any[]> {
  return safe("getAssets", async () => {
    await ensureAssetsTable();
    return sql`
        SELECT a.*, c.name as category_name, d.name as department_name
        FROM public.af_assets a
        LEFT JOIN public.af_asset_categories c ON a.category_id = c.id
        LEFT JOIN public.af_departments d ON a.department_id = d.id
        ORDER BY a.created_at DESC`;
  }, []);
}

export async function getAllocations(): Promise<any[]> {
  return safe("getAllocations", async () => {
    await ensureAllocationsTable();
    return sql`
        SELECT al.*,
          a.name as asset_name, a.asset_tag,
          u.name as user_name, u.email as user_email,
          dep.name as department_name
        FROM public.af_allocations al
        JOIN public.af_assets a ON al.asset_id = a.id
        LEFT JOIN public.af_users u ON al.user_id = u.id
        LEFT JOIN public.af_departments dep ON al.department_id = dep.id
        ORDER BY al.allocated_at DESC`;
  }, []);
}

export async function getTransfers(): Promise<any[]> {
  return safe("getTransfers", async () => {
    await ensureTransfersTable();
    return sql`
        SELECT t.*, a.name as asset_name, a.asset_tag,
          fe.name as from_name, te.name as to_name,
          ab.name as approved_by_name
        FROM public.af_transfers t
        JOIN public.af_assets a ON t.asset_id = a.id
        JOIN public.af_users fe ON t.from_employee_id = fe.id
        JOIN public.af_users te ON t.to_employee_id = te.id
        LEFT JOIN public.af_users ab ON t.approved_by = ab.id
        ORDER BY t.requested_at DESC`;
  }, []);
}

export async function getBookings(): Promise<any[]> {
  return safe("getBookings", async () => {
    await ensureBookingsTable();
    return sql`
        SELECT b.*, a.name as resource_name, a.asset_tag, a.location,
          u.name as booked_by_name, u.email as booked_by_email
        FROM public.af_bookings b
        JOIN public.af_assets a ON b.resource_id = a.id
        JOIN public.af_users u ON b.user_id = u.id
        ORDER BY b.start_time ASC`;
  }, []);
}

export async function getMaintenance(): Promise<any[]> {
  return safe("getMaintenance", async () => {
    await ensureMaintenanceTable();
    return sql`
        SELECT m.*, a.name as asset_name, a.asset_tag,
          rb.name as requested_by_name,
          at.name as assigned_to_name,
          ab.name as approved_by_name
        FROM public.af_maintenance m
        JOIN public.af_assets a ON m.asset_id = a.id
        JOIN public.af_users rb ON m.requested_by = rb.id
        LEFT JOIN public.af_users at ON m.assigned_to = at.id
        LEFT JOIN public.af_users ab ON m.approved_by = ab.id
        ORDER BY m.requested_at DESC`;
  }, []);
}

export async function getAudits(): Promise<any[]> {
  return safe("getAudits", async () => {
    await ensureAuditTable();
    return sql`
        SELECT a.*, u.name as auditor_name,
          (SELECT COUNT(*)::int FROM public.af_assets) as total_assets
        FROM public.af_audits a
        JOIN public.af_users u ON a.auditor_id = u.id
        ORDER BY a.started_at DESC`;
  }, []);
}

export async function getDepartments(): Promise<any[]> {
  return safe("getDepartments", async () => {
    await ensureDepartmentsTable();
    return sql`
        SELECT d.*, h.name as head_name, p.name as parent_name,
          (SELECT COUNT(*) FROM public.af_users u WHERE u.department_id = d.id)::int as employee_count,
          (SELECT COUNT(*) FROM public.af_allocations al WHERE al.department_id = d.id AND al.status = 'Active')::int as asset_count
        FROM public.af_departments d
        LEFT JOIN public.af_users h ON d.head_id = h.id
        LEFT JOIN public.af_departments p ON d.parent_id = p.id
        ORDER BY d.name ASC`;
  }, []);
}

export async function getEmployees(): Promise<any[]> {
  return safe("getEmployees", async () => {
    await ensureUsersTable();
    return sql`
        SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department_name,
          (SELECT COUNT(*) FROM public.af_allocations al WHERE al.user_id = u.id AND al.status = 'Active')::int as active_allocations
        FROM public.af_users u
        LEFT JOIN public.af_departments d ON u.department_id = d.id
        ORDER BY u.name ASC`;
  }, []);
}

export type OrganizationData = { departments: any[]; employees: any[] };

export async function getOrganization(): Promise<OrganizationData> {
  const [departments, employees] = await Promise.all([getDepartments(), getEmployees()]);
  return { departments, employees };
}

/**
 * Lightweight lookup lists used to populate create/edit forms (asset, user and
 * department pickers). Kept resilient so form dialogs still open when the DB is
 * briefly unreachable.
 */
export type FormOptions = {
  assets: { id: string; asset_tag: string; name: string; status: string; is_bookable: boolean }[];
  bookableAssets: { id: string; asset_tag: string; name: string; location: string | null }[];
  users: { id: string; name: string; email: string; role: string }[];
  departments: { id: string; name: string }[];
  categories: { id: string; name: string }[];
};

const EMPTY_FORM_OPTIONS: FormOptions = {
  assets: [],
  bookableAssets: [],
  users: [],
  departments: [],
  categories: [],
};

export async function getFormOptions(): Promise<FormOptions> {
  return safe(
    "getFormOptions",
    async () => {
      await ensureAssetsTable();
      await ensureUsersTable();

      const [assets, bookableAssets, users, departments, categories] = await Promise.all([
        sql`SELECT id, asset_tag, name, status, is_bookable FROM public.af_assets ORDER BY asset_tag ASC`,
        sql`SELECT id, asset_tag, name, location FROM public.af_assets WHERE is_bookable = true ORDER BY asset_tag ASC`,
        sql`SELECT id, name, email, role FROM public.af_users ORDER BY name ASC`,
        sql`SELECT id, name FROM public.af_departments ORDER BY name ASC`,
        sql`SELECT id, name FROM public.af_asset_categories ORDER BY name ASC`,
      ]);

      return {
        assets,
        bookableAssets,
        users,
        departments,
        categories,
      } as FormOptions;
    },
    EMPTY_FORM_OPTIONS,
  );
}
