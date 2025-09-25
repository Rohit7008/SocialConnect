import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ detail: "email required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, username, is_verified")
      .eq("email", email)
      .maybeSingle();

    if (error)
      return NextResponse.json({ detail: error.message }, { status: 400 });

    return NextResponse.json({
      exists: !!data,
      user: data ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { detail: e?.message ?? "unexpected error" },
      { status: 500 }
    );
  }
}
