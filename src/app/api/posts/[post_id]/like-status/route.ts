import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth) return NextResponse.json({ liked: false });
  const { data } = await supabaseAdmin
    .from("likes")
    .select("user_id")
    .eq("user_id", auth.sub)
    .eq("post_id", (await params).post_id)
    .maybeSingle();
  return NextResponse.json({ liked: Boolean(data) });
}
