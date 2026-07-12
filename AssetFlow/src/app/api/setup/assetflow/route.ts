import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { bootstrapAssetFlowSchema } from "@/lib/assetflow-schema";

const DEMO_USERS = [
  { email: "admin@assetflow.dev", name: "Asset Admin", role: "Admin" },
  { email: "manager@assetflow.dev", name: "Morgan Manager", role: "Asset Manager" },
  { email: "head@assetflow.dev", name: "Harper Head", role: "Department Head" },
  { email: "employee@assetflow.dev", name: "Ellis Employee", role: "Employee" },
];

const DEMO_PASSWORD = "password123";

const DEPARTMENTS = [
  { name: "Engineering", description: "Software and hardware engineering" },
  { name: "Human Resources", description: "People and talent management" },
  { name: "Operations", description: "Day-to-day business operations" },
  { name: "Finance", description: "Accounting and financial planning" },
  { name: "Marketing", description: "Brand and growth marketing" },
];

const CATEGORIES = [
  { name: "Laptop", description: "Portable computing devices" },
  { name: "Monitor", description: "Display screens and projectors" },
  { name: "Vehicle", description: "Company vehicles" },
  { name: "Conference Room", description: "Bookable meeting spaces" },
  { name: "Furniture", description: "Office desks, chairs, and storage" },
  { name: "Networking", description: "Routers, switches, and access points" },
  { name: "Phone", description: "Mobile and desk phones" },
];

export async function POST() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
    }

    // 1. Bootstrap all tables
    await bootstrapAssetFlowSchema();

    // 2. Seed users
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
    for (const user of DEMO_USERS) {
      await sql`
        INSERT INTO public.af_users (email, password_hash, name, role)
        VALUES (${user.email}, ${hash}, ${user.name}, ${user.role})
        ON CONFLICT (email) DO NOTHING
      `;
    }

    // 3. Seed departments
    for (const dept of DEPARTMENTS) {
      await sql`
        INSERT INTO public.af_departments (name, description)
        VALUES (${dept.name}, ${dept.description})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 4. Seed categories
    for (const cat of CATEGORIES) {
      await sql`
        INSERT INTO public.af_asset_categories (name, description)
        VALUES (${cat.name}, ${cat.description})
        ON CONFLICT (name) DO NOTHING
      `;
    }

    // 5. Seed assets
    const categories = await sql`SELECT id, name FROM public.af_asset_categories`;
    const departments = await sql`SELECT id, name FROM public.af_departments`;
    const catMap: Record<string, string> = {};
    for (const c of categories) catMap[c.name] = c.id;
    const deptMap: Record<string, string> = {};
    for (const d of departments) deptMap[d.name] = d.id;

    const assets = [
      { tag: "AF-0001", name: 'MacBook Pro 16"', serial: "SN-MBP-001", cat: "Laptop", loc: "Floor 2, Desk 12", dept: "Engineering", cost: 2499.00, cond: "Good" },
      { tag: "AF-0002", name: 'Dell XPS 15"', serial: "SN-DXP-002", cat: "Laptop", loc: "Floor 2, Desk 8", dept: "Engineering", cost: 1899.00, cond: "Good" },
      { tag: "AF-0003", name: "ThinkPad X1 Carbon", serial: "SN-TPX-003", cat: "Laptop", loc: "Floor 1, Desk 3", dept: "Finance", cost: 1599.00, cond: "Good" },
      { tag: "AF-0004", name: "LG UltraWide 34\"", serial: "SN-LGU-004", cat: "Monitor", loc: "Floor 2, Desk 12", dept: "Engineering", cost: 699.00, cond: "Good" },
      { tag: "AF-0005", name: "Dell 27\" 4K", serial: "SN-D27-005", cat: "Monitor", loc: "Floor 1, Desk 5", dept: "Marketing", cost: 449.00, cond: "Fair" },
      { tag: "AF-0006", name: "Toyota Innova", serial: "VIN-TOY-006", cat: "Vehicle", loc: "Parking B2", dept: "Operations", cost: 32000.00, cond: "Good" },
      { tag: "AF-0007", name: "Board Room A", serial: null, cat: "Conference Room", loc: "Floor 3, Wing A", dept: "Operations", cost: null, cond: "Excellent", bookable: true },
      { tag: "AF-0008", name: "Meeting Room B", serial: null, cat: "Conference Room", loc: "Floor 2, Wing B", dept: "Operations", cost: null, cond: "Good", bookable: true },
      { tag: "AF-0009", name: "Huddle Space C", serial: null, cat: "Conference Room", loc: "Floor 1, Lobby", dept: "Human Resources", cost: null, cond: "Good", bookable: true },
      { tag: "AF-0010", name: "Cisco Router MX84", serial: "SN-CSR-010", cat: "Networking", loc: "Server Room 1", dept: "Engineering", cost: 2200.00, cond: "Good" },
      { tag: "AF-0011", name: "iPhone 15 Pro", serial: "SN-IP15-011", cat: "Phone", loc: "Floor 1, Desk 1", dept: "Marketing", cost: 1199.00, cond: "Good" },
      { tag: "AF-0012", name: "Standing Desk Uplift", serial: "SN-SDK-012", cat: "Furniture", loc: "Floor 2, Desk 14", dept: "Engineering", cost: 599.00, cond: "Good" },
      { tag: "AF-0013", name: "HP LaserJet Pro", serial: "SN-HPL-013", cat: "Networking", loc: "Floor 1, Print Bay", dept: "Operations", cost: 399.00, cond: "Fair" },
      { tag: "AF-0014", name: 'MacBook Air 13"', serial: "SN-MBA-014", cat: "Laptop", loc: "Floor 1, Desk 7", dept: "Human Resources", cost: 1299.00, cond: "Good" },
      { tag: "AF-0015", name: "Samsung Galaxy S24", serial: "SN-SGS-015", cat: "Phone", loc: "Floor 2, Desk 3", dept: "Finance", cost: 899.00, cond: "Good" },
    ];

    const existingAssets = await sql`SELECT asset_tag FROM public.af_assets`;
    const existingTags = new Set(existingAssets.map((a: any) => a.asset_tag));

    for (const a of assets) {
      if (existingTags.has(a.tag)) continue;
      await sql`
        INSERT INTO public.af_assets (
          asset_tag, name, serial_number, category_id, location,
          department_id, purchase_cost, condition, is_bookable, status
        ) VALUES (
          ${a.tag}, ${a.name}, ${a.serial ?? null}, ${catMap[a.cat] ?? null}, ${a.loc},
          ${deptMap[a.dept] ?? null}, ${a.cost ?? null}, ${a.cond}, ${(a as any).bookable ?? false}, 'Available'
        )
      `;
    }

    // 6. Assign department heads
    const adminUser = await sql`SELECT id FROM public.af_users WHERE email = 'head@assetflow.dev' LIMIT 1`;
    if (adminUser[0] && deptMap["Engineering"]) {
      await sql`
        UPDATE public.af_departments SET head_id = ${adminUser[0].id}
        WHERE name = 'Engineering' AND head_id IS NULL
      `;
    }

    // 7. Assign users to departments
    if (deptMap["Engineering"]) {
      await sql`UPDATE public.af_users SET department_id = ${deptMap["Engineering"]} WHERE email = 'employee@assetflow.dev' AND department_id IS NULL`;
      await sql`UPDATE public.af_users SET department_id = ${deptMap["Engineering"]} WHERE email = 'head@assetflow.dev' AND department_id IS NULL`;
    }
    if (deptMap["Operations"]) {
      await sql`UPDATE public.af_users SET department_id = ${deptMap["Operations"]} WHERE email = 'manager@assetflow.dev' AND department_id IS NULL`;
    }

    return NextResponse.json({
      success: true,
      message: "AssetFlow schema bootstrapped and demo data seeded.",
      seeded: { users: DEMO_USERS.length, departments: DEPARTMENTS.length, categories: CATEGORIES.length, assets: assets.length },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[setup/assetflow] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
