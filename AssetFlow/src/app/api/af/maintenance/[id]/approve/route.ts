import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

// Approve maintenance request → asset status changes to "Under Maintenance"
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await _req.json();
    const { assigned_to } = body;

    const req = await sql`SELECT * FROM public.af_maintenance WHERE id = ${id}`;
    if (req.length === 0) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (req[0].status !== "Pending") {
      return NextResponse.json({ error: `Cannot approve: status is ${req[0].status}` }, { status: 400 });
    }

    await sql`
      UPDATE public.af_maintenance
      SET status = ${assigned_to ? "In Progress" : "Approved"},
          approved_by = ${user.id},
          approved_at = NOW(),
          assigned_to = ${assigned_to ?? null}
      WHERE id = ${id}
    `;

    // Transition asset to Under Maintenance
    await sql`UPDATE public.af_assets SET status = 'Under Maintenance', updated_at = NOW() WHERE id = ${req[0].asset_id}`;

    return NextResponse.json({ success: true, message: "Maintenance approved" });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
