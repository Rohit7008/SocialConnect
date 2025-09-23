import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { detail: "Email and user ID are required" },
        { status: 400 }
      );
    }

    // Check if user exists and is not verified
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, is_verified, username")
      .eq("id", userId)
      .eq("email", email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ detail: "User not found" }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json(
        { detail: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate a verification token
    const verificationToken = Buffer.from(`${userId}:${Date.now()}`).toString(
      "base64"
    );

    // Store verification token (you could store this in a separate table for better security)
    // For now, we'll use a simple approach with the token in the URL

    // In a real implementation, you would:
    // 1. Send an email using a service like SendGrid, Resend, or Nodemailer
    // 2. Store the verification token in a secure table with expiration
    // 3. Use proper email templates

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}&user=${userId}`;

    console.log(`📧 Verification email would be sent to: ${email}`);
    console.log(`🔗 Verification URL: ${verificationUrl}`);

    // For development/testing, we'll just return the URL
    // In production, you would actually send the email here
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json({
      message: isDevelopment
        ? `Verification email sent! (Dev mode: ${verificationUrl})`
        : "Verification email sent successfully",
      verification_url: isDevelopment ? verificationUrl : undefined,
      token: isDevelopment ? verificationToken : undefined,
    });
  } catch (error) {
    console.error("Error sending verification email:", error);
    return NextResponse.json(
      { detail: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
