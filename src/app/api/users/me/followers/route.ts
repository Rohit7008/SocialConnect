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

  const { data, error } = await supabaseAdmin
    .from("follows")
    .select(
      `
      follower,
      created_at,
      profiles!follows_follower_fkey(
        id,
        username,
        first_name,
        last_name,
        avatar_url,
        bio,
        visibility
      )
    `
    )
    .eq("following", auth.sub)
    .order("created_at", { ascending: false })
    .range(offset, offset + per_page - 1);

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json({
    page,
    per_page,
    data: data || [],
    total: data?.length || 0,
  });
}
