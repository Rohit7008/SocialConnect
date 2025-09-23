import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("recipient", auth.sub)
    .eq("is_read", false);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "All read" });
}
