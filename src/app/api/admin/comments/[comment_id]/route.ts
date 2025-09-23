import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ comment_id: string }> }
) {
  const auth = await getAuth(req);
  if (!auth || auth.role !== "admin")
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });

  const { comment_id } = await params;

  try {
    // Instead of hard deleting, we'll set is_active to false to maintain data integrity
    const { error } = await supabaseAdmin
      .from("comments")
      .update({ is_active: false })
      .eq("id", comment_id);

    if (error) {
      console.error("Error deleting comment:", error);
      return NextResponse.json(
        { detail: "Failed to delete comment" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error in delete comment API:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
