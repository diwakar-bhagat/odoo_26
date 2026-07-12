import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureMaintenanceTable } from "@/lib/assetflow-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const requests = await sql`
      SELECT m.*, a.name as asset_name, a.asset_tag,
        rb.name as requested_by_name,
        at.name as assigned_to_name,
        ab.name as approved_by_name
      FROM public.af_maintenance m
      JOIN public.af_assets a ON m.asset_id = a.id
      JOIN public.af_users rb ON m.requested_by = rb.id
      LEFT JOIN public.af_users at ON m.assigned_to = at.id
      LEFT JOIN public.af_users ab ON m.approved_by = ab.id
      ORDER BY m.requested_at DESC
    `;

    return NextResponse.json({ maintenance: requests });
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
    const { asset_id, description, priority } = body;

    if (!asset_id || !description) {
      return NextResponse.json({ error: "asset_id and description are required" }, { status: 400 });
    }

    await ensureMaintenanceTable();

    const result = await sql`
      INSERT INTO public.af_maintenance (asset_id, requested_by, description, priority)
      VALUES (${asset_id}, ${user.id}, ${description}, ${priority ?? "Medium"})
      RETURNING *
    `;

    return NextResponse.json({ maintenance: result[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
