import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { post_id } = await params;
  const { error } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", post_id);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Post deleted" });
}
