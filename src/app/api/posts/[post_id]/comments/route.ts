import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { commentSchema } from "@/lib/validators";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  const { post_id } = await params;
  const { data, error } = await supabaseAdmin
    .from("comments")
    .insert({
      post_id,
      author: auth.sub,
      content: parsed.data.content,
    })
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("author")
    .eq("id", post_id)
    .single();
  if (post && post.author !== auth.sub) {
    await supabaseAdmin.from("notifications").insert({
      recipient: post.author,
      sender: auth.sub,
      notification_type: "comment",
      post_id,
      message: `commented on your post: "${parsed.data.content.substring(
        0,
        50
      )}${parsed.data.content.length > 50 ? "..." : ""}"`,
    });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("*, profiles!comments_author_fkey(username, avatar_url)")
    .eq("post_id", (await params).post_id)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data);
}
