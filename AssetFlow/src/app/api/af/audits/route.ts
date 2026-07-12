import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const audits = await sql`
      SELECT a.*, u.name as auditor_name,
        (SELECT COUNT(*)::int FROM public.af_assets) as total_assets
      FROM public.af_audits a
      JOIN public.af_users u ON a.auditor_id = u.id
      ORDER BY a.started_at DESC
    `;

    return NextResponse.json({ audits });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized. Admin only." }, { status: 403 });
    }

    const { notes } = await request.json();

    const newAudit = await sql`
      INSERT INTO public.af_audits (auditor_id, status, notes)
      VALUES (${user.id}, 'In Progress', ${notes || null})
      RETURNING *
    `;

    return NextResponse.json({ audit: newAudit[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
