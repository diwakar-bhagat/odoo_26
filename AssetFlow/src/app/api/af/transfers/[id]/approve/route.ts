import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    if (!["Admin", "Asset Manager"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await _req.json();
    const { action } = body; // "approve" or "reject"

    const transfer = await sql`SELECT * FROM public.af_transfers WHERE id = ${id}`;
    if (transfer.length === 0) return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    if (transfer[0].status !== "Pending") {
      return NextResponse.json({ error: `Transfer already ${transfer[0].status}` }, { status: 400 });
    }

    if (action === "reject") {
      await sql`UPDATE public.af_transfers SET status = 'Rejected', approved_by = ${user.id}, approved_at = NOW() WHERE id = ${id}`;
      return NextResponse.json({ success: true, message: "Transfer rejected" });
    }

    // Approve: close old allocation, create new one
    await sql`
      UPDATE public.af_allocations
      SET status = 'Returned', returned_at = NOW(), condition_notes = 'Transferred'
      WHERE id = ${transfer[0].allocation_id}
    `;

    await sql`
      INSERT INTO public.af_allocations (asset_id, user_id, notes)
      VALUES (${transfer[0].asset_id}, ${transfer[0].to_employee_id}, 'Transferred from previous holder')
    `;

    await sql`UPDATE public.af_transfers SET status = 'Approved', approved_by = ${user.id}, approved_at = NOW() WHERE id = ${id}`;

    return NextResponse.json({ success: true, message: "Transfer approved" });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
