import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const body = await _req.json();
    const { condition_notes } = body;

    const alloc = await sql`
      SELECT al.*, a.asset_tag FROM public.af_allocations al
      JOIN public.af_assets a ON al.asset_id = a.id
      WHERE al.id = ${id} AND al.status = 'Active'
    `;
    if (alloc.length === 0) return NextResponse.json({ error: "Active allocation not found" }, { status: 404 });

    // Mark allocation as returned
    await sql`
      UPDATE public.af_allocations
      SET status = 'Returned', returned_at = NOW(), condition_notes = ${condition_notes ?? null}
      WHERE id = ${id}
    `;

    // Set asset back to Available
    await sql`UPDATE public.af_assets SET status = 'Available', updated_at = NOW() WHERE id = ${alloc[0].asset_id}`;

    return NextResponse.json({ success: true, message: `Asset ${alloc[0].asset_tag} returned successfully` });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
