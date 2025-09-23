import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, username, role, created_at, is_verified")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data);
}
