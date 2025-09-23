import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { user_id } = await params;
  const { data, error } = await supabaseAdmin
    .rpc("get_user_profile_with_counts", { p_user_id: user_id })
    .maybeSingle();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
