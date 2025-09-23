import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { detail: "Verification token is required" },
        { status: 400 }
      );
    }

    // Verify the token using Supabase's native auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    });

    if (authError) {
      console.error("Supabase email verification error:", authError);
      return NextResponse.json(
        { detail: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { detail: "User not found in verification response" },
        { status: 404 }
      );
    }

    // Update user verification status in our profiles table
    const { data: profileData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_verified: true })
      .eq("email", authData.user.email)
      .select("username, email")
      .single();

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      // Don't fail if profile update fails - the user is still verified in Supabase auth
      return NextResponse.json({
        message: "Email verified successfully in Supabase Auth",
        verified: true,
        user: {
          email: authData.user.email,
          username: "Unknown" // Fallback if profile update failed
        }
      });
    }

    return NextResponse.json({
      message: "Email verified successfully",
      verified: true,
      user: {
        email: profileData.email,
        username: profileData.username
      }
    });

  } catch (error) {
    console.error("Unexpected error during Supabase email verification:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
