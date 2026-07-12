import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    const notifications = await sql`
      SELECT * FROM public.af_notifications
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const [unreadCount] = await sql`
      SELECT COUNT(*)::int as count FROM public.af_notifications
      WHERE user_id = ${user.id} AND read = false
    `;

    return NextResponse.json({ notifications, unread_count: unreadCount?.count ?? 0 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
