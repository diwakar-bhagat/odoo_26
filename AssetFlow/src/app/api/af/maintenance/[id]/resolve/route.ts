import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

// Resolve maintenance → asset status returns to "Available"
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await _req.json();
    const { resolution } = body;

    const req = await sql`SELECT * FROM public.af_maintenance WHERE id = ${id}`;
    if (req.length === 0) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (!["Approved", "In Progress"].includes(req[0].status)) {
      return NextResponse.json({ error: `Cannot resolve: status is ${req[0].status}` }, { status: 400 });
    }

    await sql`
      UPDATE public.af_maintenance
      SET status = 'Resolved', resolution = ${resolution ?? null}, completed_at = NOW()
      WHERE id = ${id}
    `;

    // Transition asset back to Available
    await sql`UPDATE public.af_assets SET status = 'Available', updated_at = NOW() WHERE id = ${req[0].asset_id}`;

    return NextResponse.json({ success: true, message: "Maintenance resolved, asset back to Available" });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
