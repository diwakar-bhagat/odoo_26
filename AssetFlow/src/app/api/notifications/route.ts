import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth-utils";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const rows = await sql`
      SELECT * FROM public.af_notifications
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const [unreadCount] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_notifications
      WHERE user_id = ${user.id} AND read = false
    `;

    // Map database fields to the UI schema
    const notifications = rows.map((row: any) => ({
      id: row.id,
      reffNo: row.title,
      styleName: row.reference_type || null,
      message: row.message,
      createdBy: "System",
      isRead: row.read,
      type: row.type || "INFO",
      createdAt: row.created_at,
    }));

    const payload = {
      notifications,
      unreadCount: unreadCount?.count ?? 0,
    };

    // Return format supporting both notifications-view (flat) and notifications-panel (nested under data)
    return NextResponse.json({
      ...payload,
      data: payload,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
