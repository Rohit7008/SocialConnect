import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ user_id: string }> }
) {
  const { user_id } = await params;
  const { data: profile, error } = await supabase
    .rpc("get_user_profile_with_counts", { p_user_id: user_id })
    .maybeSingle();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  if (!profile)
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(profile);
}
