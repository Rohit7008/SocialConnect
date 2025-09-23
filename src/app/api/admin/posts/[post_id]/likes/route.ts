import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

  const { post_id } = await params;

  try {
    const { data: likes, error } = await supabaseAdmin
      .from("likes")
      .select(
        `
        user_id,
        created_at,
        profiles!likes_user_id_fkey (
          username
        )
      `
      )
      .eq("post_id", post_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching likes:", error);
      return NextResponse.json(
        { detail: "Failed to fetch likes" },
        { status: 500 }
      );
    }

    return NextResponse.json(likes || []);
  } catch (error) {
    console.error("Error in likes API:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
