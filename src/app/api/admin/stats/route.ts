import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const [{ data: users }, { data: posts }, { data: activeToday }] =
    await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte(
          "last_login",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ),
    ]);
  return NextResponse.json({
    total_users: users?.length ?? 0,
    total_posts: posts?.length ?? 0,
    active_today: activeToday?.length ?? 0,
  });
}
