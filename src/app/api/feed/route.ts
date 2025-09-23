import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const per_page = Number(searchParams.get("per_page") || 20);
  const offset = (page - 1) * per_page;

  // get following ids
  const { data: following, error: fErr } = await supabaseAdmin
    .from("follows")
    .select("following")
    .eq("follower", auth.sub);
  if (fErr) return NextResponse.json({ detail: fErr.message }, { status: 500 });
  const ids = new Set<string>([
    auth.sub,
    ...(following ?? []).map((f) => f.following),
  ]);

  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*, profiles!posts_author_fkey(username, avatar_url)")
    .in("author", Array.from(ids))
    .order("created_at", { ascending: false })
    .range(offset, offset + per_page - 1);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ page, per_page, data });
}
