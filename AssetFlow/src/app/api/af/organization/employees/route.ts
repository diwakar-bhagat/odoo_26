import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const department_id = searchParams.get("department_id");

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department_name,
        (SELECT COUNT(*) FROM public.af_allocations al WHERE al.user_id = u.id AND al.status = 'Active')::int as active_allocations
      FROM public.af_users u
      LEFT JOIN public.af_departments d ON u.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (department_id) {
      query += ` AND u.department_id = $1`;
      params.push(department_id);
    }
    
    query += ` ORDER BY u.name ASC`;

    const employees = params.length === 0 
      ? await sql`
          SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, d.name as department_name,
            (SELECT COUNT(*) FROM public.af_allocations al WHERE al.user_id = u.id AND al.status = 'Active')::int as active_allocations
          FROM public.af_users u
          LEFT JOIN public.af_departments d ON u.department_id = d.id
          ORDER BY u.name ASC
        `
      : await sql(query, params);

    return NextResponse.json({ employees });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
