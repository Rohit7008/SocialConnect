import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email, redirectTo } = await req.json();
    if (!email) {
      return NextResponse.json({ detail: "email required" }, { status: 400 });
    }

    const redirect =
      typeof redirectTo === "string" && redirectTo.length > 0
        ? redirectTo
        : "http://localhost:3000/verify-email";

    // First attempt: resend signup confirmation for existing users
    const { data: resendData, error: resendError } = await supabaseAdmin.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirect },
    } as any);

    if (!resendError) {
      return NextResponse.json({ message: "Verification email resent", data: resendData });
    }

    // Fallback: invite (creates user if missing) - may fail if constraints
    const { data: inviteData, error: inviteError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo: redirect });

    if (inviteError) {
      return NextResponse.json({ detail: inviteError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Verification email sent", data: inviteData });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}


