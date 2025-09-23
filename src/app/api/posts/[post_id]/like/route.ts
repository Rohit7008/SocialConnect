import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { post_id } = await params;
  const postId = post_id;
  const { error } = await supabaseAdmin
    .from("likes")
    .insert({ user_id: auth.sub, post_id: postId });
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 400 });
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("author, content")
    .eq("id", postId)
    .single();
  if (post && post.author !== auth.sub) {
    const postPreview = post.content.substring(0, 50);
    await supabaseAdmin.from("notifications").insert({
      recipient: post.author,
      sender: auth.sub,
      notification_type: "like",
      post_id: postId,
      message: `liked your post: "${postPreview}${
        post.content.length > 50 ? "..." : ""
      }"`,
    });
  }
  return NextResponse.json({ message: "Liked" }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { error } = await supabaseAdmin
    .from("likes")
    .delete()
    .eq("user_id", auth.sub)
    .eq("post_id", (await params).post_id);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 400 });
  return NextResponse.json({ message: "Unliked" });
}
