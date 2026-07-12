import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureDepartmentsTable } from "@/lib/assetflow-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const departments = await sql`
      SELECT d.*, h.name as head_name, p.name as parent_name,
        (SELECT COUNT(*) FROM public.af_users u WHERE u.department_id = d.id)::int as employee_count,
        (SELECT COUNT(*) FROM public.af_allocations al WHERE al.department_id = d.id AND al.status = 'Active')::int as asset_count
      FROM public.af_departments d
      LEFT JOIN public.af_users h ON d.head_id = h.id
      LEFT JOIN public.af_departments p ON d.parent_id = p.id
      ORDER BY d.name ASC
    `;

    return NextResponse.json({ departments });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (user.role !== "Admin") {
      return NextResponse.json({ error: "Only Admin can create departments" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, head_id, parent_id } = body;

    if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

    await ensureDepartmentsTable();

    const existing = await sql`SELECT id FROM public.af_departments WHERE name = ${name}`;
    if (existing.length > 0) return NextResponse.json({ error: "Department name must be unique" }, { status: 409 });

    const dept = await sql`
      INSERT INTO public.af_departments (name, description, head_id, parent_id)
      VALUES (${name}, ${description ?? null}, ${head_id ?? null}, ${parent_id ?? null})
      RETURNING *
    `;

    return NextResponse.json({ department: dept[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
