import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureAssetsTable } from "@/lib/assetflow-schema";

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const bookable = searchParams.get("bookable");

    await ensureAssetsTable();

    let query = `
      SELECT a.*, c.name as category_name, d.name as department_name
      FROM public.af_assets a
      LEFT JOIN public.af_asset_categories c ON a.category_id = c.id
      LEFT JOIN public.af_departments d ON a.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIdx = 1;

    if (status) {
      query += ` AND a.status = $${paramIdx++}`;
      params.push(status);
    }
    if (category) {
      query += ` AND c.name = $${paramIdx++}`;
      params.push(category);
    }
    if (bookable === "true") {
      query += ` AND a.is_bookable = true`;
    }
    if (search) {
      query += ` AND (a.name ILIKE $${paramIdx} OR a.asset_tag ILIKE $${paramIdx} OR a.serial_number ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` ORDER BY a.created_at DESC`;

    // Use tagged template for simple case, raw for dynamic
    const assets = params.length === 0
      ? await sql`
          SELECT a.*, c.name as category_name, d.name as department_name
          FROM public.af_assets a
          LEFT JOIN public.af_asset_categories c ON a.category_id = c.id
          LEFT JOIN public.af_departments d ON a.department_id = d.id
          ORDER BY a.created_at DESC
        `
      : await sql(query, params);

    return NextResponse.json({ assets });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Only Admin or Asset Manager can register assets" }, { status: 403 });
    }

    const body = await request.json();
    const { name, asset_tag, serial_number, category_id, location, department_id, purchase_cost, condition, is_bookable, notes } = body;

    if (!name || !asset_tag) {
      return NextResponse.json({ error: "name and asset_tag are required" }, { status: 400 });
    }

    await ensureAssetsTable();

    // Check duplicate tag
    const existing = await sql`SELECT id FROM public.af_assets WHERE asset_tag = ${asset_tag}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: `Asset tag ${asset_tag} already exists` }, { status: 409 });
    }

    const result = await sql`
      INSERT INTO public.af_assets (
        name, asset_tag, serial_number, category_id, location,
        department_id, purchase_cost, condition, is_bookable, notes, status
      ) VALUES (
        ${name}, ${asset_tag}, ${serial_number ?? null}, ${category_id ?? null},
        ${location ?? null}, ${department_id ?? null}, ${purchase_cost ?? null},
        ${condition ?? "Good"}, ${is_bookable ?? false}, ${notes ?? null}, 'Available'
      )
      RETURNING *
    `;

    return NextResponse.json({ asset: result[0] }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
