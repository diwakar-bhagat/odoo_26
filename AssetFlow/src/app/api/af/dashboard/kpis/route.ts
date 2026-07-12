import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const [totalAssets] = await sql`SELECT COUNT(*)::int as count FROM public.af_assets`;
    const [availableAssets] = await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Available'`;
    const [allocatedAssets] = await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Allocated'`;
    const [maintenanceAssets] = await sql`SELECT COUNT(*)::int as count FROM public.af_assets WHERE status = 'Under Maintenance'`;

    const [activeBookings] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_bookings
      WHERE status IN ('Upcoming', 'Ongoing')
    `;

    // Overdue returns: allocated with expected_return in the past
    const [overdueReturns] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_allocations
      WHERE status = 'Active' AND expected_return IS NOT NULL AND expected_return < NOW()
    `;

    // Overdue bookings: end_time in the past but still Ongoing
    const [overdueBookings] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_bookings
      WHERE status = 'Ongoing' AND end_time < NOW()
    `;

    const [pendingMaintenance] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_maintenance WHERE status = 'Pending'
    `;

    const [pendingTransfers] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_transfers WHERE status = 'Pending'
    `;

    // Status breakdown for chart
    const statusBreakdown = await sql`
      SELECT status, COUNT(*)::int as count FROM public.af_assets GROUP BY status ORDER BY count DESC
    `;

    // Category breakdown for chart
    const categoryBreakdown = await sql`
      SELECT c.name as category, COUNT(*)::int as count
      FROM public.af_assets a
      JOIN public.af_asset_categories c ON a.category_id = c.id
      GROUP BY c.name ORDER BY count DESC
    `;

    // Recent activity
    const recentAllocations = await sql`
      SELECT al.*, a.name as asset_name, a.asset_tag, u.name as user_name
      FROM public.af_allocations al
      JOIN public.af_assets a ON al.asset_id = a.id
      LEFT JOIN public.af_users u ON al.user_id = u.id
      ORDER BY al.allocated_at DESC LIMIT 5
    `;

    return NextResponse.json({
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
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
