import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createPostSchema } from "@/lib/validators";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const { post_id } = await params;
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*, profiles!posts_author_fkey(username, avatar_url)")
    .eq("id", post_id)
    .maybeSingle();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = createPostSchema.partial().safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  const { post_id } = await params;
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("author")
    .eq("id", post_id)
    .single();
  if (!post || post.author !== auth.sub)
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { error } = await supabaseAdmin
    .from("posts")
    .update(parsed.data)
    .eq("id", post_id);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Updated" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { post_id } = await params;
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("author")
    .eq("id", post_id)
    .single();
  if (!post || post.author !== auth.sub)
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  const { error } = await supabaseAdmin
    .from("posts")
    .delete()
    .eq("id", post_id);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Deleted" });
}
