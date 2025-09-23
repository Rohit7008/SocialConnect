import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { profileUpdateSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .rpc("get_user_profile_with_counts", { p_user_id: auth.sub })
    .maybeSingle();
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuth(req);
  if (!auth)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(parsed.data)
    .eq("id", auth.sub);
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });
  return NextResponse.json({ message: "Updated" });
}
