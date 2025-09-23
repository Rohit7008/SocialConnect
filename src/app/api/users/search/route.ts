import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json(
      { detail: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, first_name, last_name, avatar_url, bio, visibility")
    .or(
      `username.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
    )
    .neq("id", auth.sub) // Exclude current user
    .order("username", { ascending: true })
    .limit(20);

  if (error) {
    return NextResponse.json({ detail: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
