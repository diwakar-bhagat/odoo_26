import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureTransfersTable } from "@/lib/assetflow-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    const transfers = await sql`
      SELECT t.*, a.name as asset_name, a.asset_tag,
        fe.name as from_name, te.name as to_name,
        ab.name as approved_by_name
      FROM public.af_transfers t
      JOIN public.af_assets a ON t.asset_id = a.id
      JOIN public.af_users fe ON t.from_employee_id = fe.id
      JOIN public.af_users te ON t.to_employee_id = te.id
      LEFT JOIN public.af_users ab ON t.approved_by = ab.id
      ORDER BY t.requested_at DESC
    `;
    return NextResponse.json({ transfers });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();
    const { asset_id, to_employee_id, reason } = body;

    if (!asset_id || !to_employee_id) {
      return NextResponse.json({ error: "asset_id and to_employee_id are required" }, { status: 400 });
    }

    await ensureTransfersTable();

    // Must have an active allocation
    const alloc = await sql`
      SELECT id, user_id FROM public.af_allocations
      WHERE asset_id = ${asset_id} AND status = 'Active'
      LIMIT 1
    `;
    if (alloc.length === 0) {
      return NextResponse.json({ error: "Asset has no active allocation to transfer" }, { status: 400 });
    }

    const transfer = await sql`
      INSERT INTO public.af_transfers (asset_id, allocation_id, from_employee_id, to_employee_id, reason)
      VALUES (${asset_id}, ${alloc[0].id}, ${alloc[0].user_id}, ${to_employee_id}, ${reason ?? null})
      RETURNING *
    `;

    // Notify target user
    await sql`
      INSERT INTO public.af_notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES (${to_employee_id}, 'Transfer Request', 'An asset transfer has been requested to you.', 'TRANSFER_REQ', ${transfer[0].id}, 'transfer')
    `;

    return NextResponse.json({ transfer: transfer[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
