import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { detail: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is not already verified
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_verified")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { detail: "User not found" },
        { status: 404 }
      );
    }

    if (user.is_verified) {
      return NextResponse.json(
        { detail: "Email is already verified" },
        { status: 400 }
      );
    }

    // Send verification email using Supabase Auth
    const { error } = await supabaseAdmin.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`
      }
    });

    if (error) {
      console.error("Error sending verification email:", error);
      return NextResponse.json(
        { detail: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Verification email sent successfully"
    });

  } catch (error) {
    console.error("Unexpected error sending verification email:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
