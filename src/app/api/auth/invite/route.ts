import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo } = await req.json();
    if (!email)
      return NextResponse.json({ detail: "email required" }, { status: 400 });

    const redirect =
      typeof redirectTo === "string" && redirectTo.length > 0
        ? redirectTo
        : `${
            process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
          }/verify-email`;

    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: redirect }
    );
    if (error)
      return NextResponse.json({ detail: error.message }, { status: 400 });
    return NextResponse.json({ message: "Invite sent", data });
  } catch (e: any) {
    return NextResponse.json(
      { detail: e?.message ?? "unexpected error" },
      { status: 500 }
    );
  }
}
