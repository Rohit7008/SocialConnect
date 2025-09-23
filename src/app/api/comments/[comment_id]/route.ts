import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ comment_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { comment_id } = await params;
  const { data: comment } = await supabaseAdmin
    .from("comments")
    .select("id, author")
    .eq("id", comment_id)
    .single();
  if (!comment || comment.author !== auth.sub)
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { error } = await supabaseAdmin
    .from("comments")
    .delete()
    .eq("id", comment_id);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
