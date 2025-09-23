import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("*, profiles!notifications_sender_fkey(username, avatar_url)")
    .eq("recipient", auth.sub)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data);
}
