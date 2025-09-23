import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { user_id } = await params;
  const target = user_id;
  if (target === auth.sub)
    return NextResponse.json({ detail: "Cannot follow self" }, { status: 400 });
  const { error } = await supabaseAdmin
    .from("follows")
    .insert({ follower: auth.sub, following: target });
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 400 });
  // Notification
  await supabaseAdmin.from("notifications").insert({
    recipient: target,
    sender: auth.sub,
    notification_type: "follow",
    message: "started following you",
  });
  return NextResponse.json({ message: "Followed" }, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { user_id } = await params;
  const target = user_id;
  const { error } = await supabaseAdmin
    .from("follows")
    .delete()
    .eq("follower", auth.sub)
    .eq("following", target);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 400 });
  return NextResponse.json({ message: "Unfollowed" });
}
