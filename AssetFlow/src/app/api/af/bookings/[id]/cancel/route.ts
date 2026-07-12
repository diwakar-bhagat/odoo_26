import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const { id } = await params;
    const booking = await sql`SELECT id, status FROM public.af_bookings WHERE id = ${id}`;
    if (booking.length === 0) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    if (booking[0].status === "Cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 });
    }

    await sql`UPDATE public.af_bookings SET status = 'Cancelled' WHERE id = ${id}`;
    return NextResponse.json({ success: true, message: "Booking cancelled" });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
