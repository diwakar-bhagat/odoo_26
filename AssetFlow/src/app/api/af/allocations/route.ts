import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureAllocationsTable } from "@/lib/assetflow-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const allocations = await sql`
      SELECT al.*,
        a.name as asset_name, a.asset_tag,
        u.name as user_name, u.email as user_email,
        dep.name as department_name
      FROM public.af_allocations al
      JOIN public.af_assets a ON al.asset_id = a.id
      LEFT JOIN public.af_users u ON al.user_id = u.id
      LEFT JOIN public.af_departments dep ON al.department_id = dep.id
      ORDER BY al.allocated_at DESC
    `;

    return NextResponse.json({ allocations });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager", "Department Head"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();
    const { asset_id, user_id, department_id, expected_return, notes } = body;

    if (!asset_id) return NextResponse.json({ error: "asset_id is required" }, { status: 400 });
    if (!user_id && !department_id) {
      return NextResponse.json({ error: "Either user_id or department_id is required" }, { status: 400 });
    }

    await ensureAllocationsTable();

    // ═══════════════════════════════════════════════════════
    // CRITICAL: Double-allocation prevention
    // ═══════════════════════════════════════════════════════
    const asset = await sql`SELECT id, status, name, asset_tag FROM public.af_assets WHERE id = ${asset_id}`;
    if (asset.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    if (asset[0].status !== "Available") {
      return NextResponse.json({
        error: `Cannot allocate: Asset "${asset[0].asset_tag}" is currently "${asset[0].status}". Only "Available" assets can be allocated.`,
        current_status: asset[0].status,
      }, { status: 409 });
    }

    // Double-check: no active allocation exists
    const activeAlloc = await sql`
      SELECT id FROM public.af_allocations
      WHERE asset_id = ${asset_id} AND status = 'Active'
      LIMIT 1
    `;
    if (activeAlloc.length > 0) {
      return NextResponse.json({
        error: `Asset "${asset[0].asset_tag}" already has an active allocation. Return it first.`,
      }, { status: 409 });
    }

    // Create allocation
    const allocation = await sql`
      INSERT INTO public.af_allocations (asset_id, user_id, department_id, expected_return, notes)
      VALUES (${asset_id}, ${user_id ?? null}, ${department_id ?? null}, ${expected_return ?? null}, ${notes ?? null})
      RETURNING *
    `;

    // Update asset status to Allocated
    await sql`UPDATE public.af_assets SET status = 'Allocated', updated_at = NOW() WHERE id = ${asset_id}`;

    // Create notification for the assigned user
    if (user_id) {
      await sql`
        INSERT INTO public.af_notifications (user_id, title, message, type, reference_id, reference_type)
        VALUES (
          ${user_id},
          'Asset Allocated',
          ${`Asset "${asset[0].asset_tag}" has been allocated to you.`},
          'ALLOCATION',
          ${allocation[0].id},
          'allocation'
        )
      `;
    }

    return NextResponse.json({ allocation: allocation[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
