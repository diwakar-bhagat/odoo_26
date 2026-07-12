import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";
import { ensureBookingsTable } from "@/lib/assetflow-schema";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const bookings = await sql`
      SELECT b.*, a.name as resource_name, a.asset_tag, a.location,
        u.name as booked_by_name, u.email as booked_by_email
      FROM public.af_bookings b
      JOIN public.af_assets a ON b.resource_id = a.id
      JOIN public.af_users u ON b.user_id = u.id
      ORDER BY b.start_time ASC
    `;

    return NextResponse.json({ bookings });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DB not configured" }, { status: 503 });

    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const body = await request.json();
    const { resource_id, title, start_time, end_time } = body;

    if (!resource_id || !title || !start_time || !end_time) {
      return NextResponse.json({ error: "resource_id, title, start_time, and end_time are required" }, { status: 400 });
    }

    const startDt = new Date(start_time);
    const endDt = new Date(end_time);
    if (endDt <= startDt) {
      return NextResponse.json({ error: "end_time must be after start_time" }, { status: 400 });
    }

    await ensureBookingsTable();

    // Check resource exists and is bookable
    const resource = await sql`
      SELECT id, name, asset_tag, is_bookable FROM public.af_assets WHERE id = ${resource_id}
    `;
    if (resource.length === 0) return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    if (!resource[0].is_bookable) {
      return NextResponse.json({ error: `"${resource[0].name}" is not a bookable resource` }, { status: 400 });
    }

    // ═══════════════════════════════════════════════════════
    // CRITICAL: Overlap prevention
    // RequestedStart < ExistingEnd AND RequestedEnd > ExistingStart
    // ═══════════════════════════════════════════════════════
    const overlaps = await sql`
      SELECT id, title, start_time, end_time
      FROM public.af_bookings
      WHERE resource_id = ${resource_id}
        AND status IN ('Upcoming', 'Ongoing')
        AND start_time < ${endDt.toISOString()}
        AND end_time > ${startDt.toISOString()}
    `;

    if (overlaps.length > 0) {
      return NextResponse.json({
        error: `Booking conflict: "${resource[0].name}" is already booked during that time slot.`,
        conflicts: overlaps.map((o: any) => ({
          id: o.id,
          title: o.title,
          start: o.start_time,
          end: o.end_time,
        })),
      }, { status: 409 });
    }

    // Create booking
    const booking = await sql`
      INSERT INTO public.af_bookings (resource_id, user_id, title, start_time, end_time)
      VALUES (${resource_id}, ${user.id}, ${title}, ${startDt.toISOString()}, ${endDt.toISOString()})
      RETURNING *
    `;

    return NextResponse.json({ booking: booking[0] }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
