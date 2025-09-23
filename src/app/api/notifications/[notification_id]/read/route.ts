import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ notification_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { notification_id } = await params;
  const { error } = await supabaseAdmin
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notification_id)
    .eq("recipient", auth.sub);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Marked read" });
}
