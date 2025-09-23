import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { token, userId } = await req.json();

    if (!token || !userId) {
      return NextResponse.json(
        { detail: "Verification token and user ID are required" },
        { status: 400 }
      );
    }

    // Decode and validate the token
    try {
      const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
      const [tokenUserId, timestamp] = decodedToken.split(':');
      
      if (tokenUserId !== userId) {
        return NextResponse.json(
          { detail: "Invalid verification token" },
          { status: 400 }
        );
      }

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - parseInt(timestamp);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        return NextResponse.json(
          { detail: "Verification token has expired" },
          { status: 400 }
        );
      }

    } catch (decodeError) {
      return NextResponse.json(
        { detail: "Invalid verification token format" },
        { status: 400 }
      );
    }

    // Update user verification status
    const { data: user, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ is_verified: true })
      .eq("id", userId)
      .select("email, username")
      .single();

    if (updateError) {
      console.error("Error updating verification status:", updateError);
      return NextResponse.json(
        { detail: "Failed to update verification status" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { detail: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Email verified successfully",
      verified: true,
      user: {
        email: user.email,
        username: user.username
      }
    });

  } catch (error) {
    console.error("Unexpected error during email verification:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
