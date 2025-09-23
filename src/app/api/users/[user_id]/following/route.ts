import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  const uid = user_id;
  const { data, error } = await supabaseAdmin
    .from("follows")
    .select("following, profiles!follows_following_fkey(username, avatar_url)")
    .eq("follower", uid);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data);
}
