import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { sql } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const asset = await sql`
      SELECT a.*, c.name as category_name, d.name as department_name
      FROM public.af_assets a
      LEFT JOIN public.af_asset_categories c ON a.category_id = c.id
      LEFT JOIN public.af_departments d ON a.department_id = d.id
      WHERE a.id = ${id}
    `;
    if (asset.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    // Get allocation history
    const allocations = await sql`
      SELECT al.*, u.name as user_name, u.email as user_email, dep.name as dept_name
      FROM public.af_allocations al
      LEFT JOIN public.af_users u ON al.user_id = u.id
      LEFT JOIN public.af_departments dep ON al.department_id = dep.id
      WHERE al.asset_id = ${id}
      ORDER BY al.allocated_at DESC
    `;

    // Get maintenance history
    const maintenance = await sql`
      SELECT m.*, u.name as requested_by_name
      FROM public.af_maintenance m
      LEFT JOIN public.af_users u ON m.requested_by = u.id
      WHERE m.asset_id = ${id}
      ORDER BY m.requested_at DESC
    `;

    return NextResponse.json({ asset: asset[0], allocations, maintenance });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, location, condition, status, notes, department_id, is_bookable } = body;

    const existing = await sql`SELECT id FROM public.af_assets WHERE id = ${id}`;
    if (existing.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const result = await sql`
      UPDATE public.af_assets SET
        name = COALESCE(${name ?? null}, name),
        location = COALESCE(${location ?? null}, location),
        condition = COALESCE(${condition ?? null}, condition),
        status = COALESCE(${status ?? null}, status),
        notes = COALESCE(${notes ?? null}, notes),
        department_id = COALESCE(${department_id ?? null}, department_id),
        is_bookable = COALESCE(${is_bookable ?? null}, is_bookable),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ asset: result[0] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Only Admin or Asset Manager can delete assets" }, { status: 403 });
    }

    const { id } = await params;

    const existing = await sql`SELECT id, asset_tag FROM public.af_assets WHERE id = ${id}`;
    if (existing.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    // Block deletion while the asset is actively checked out.
    const activeAlloc = await sql`
      SELECT id FROM public.af_allocations WHERE asset_id = ${id} AND status = 'Active' LIMIT 1
    `;
    if (activeAlloc.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete "${existing[0].asset_tag}": it has an active allocation. Return it first.` },
        { status: 409 },
      );
    }

    await sql`DELETE FROM public.af_assets WHERE id = ${id}`;

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
