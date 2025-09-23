import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, username, password, first_name, last_name } = parsed.data;

  // Check if username already exists
  const { data: existingUsername, error: usernameError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  
  if (usernameError)
    return NextResponse.json({ detail: usernameError.message }, { status: 500 });
  if (existingUsername)
    return NextResponse.json(
      { detail: "Username already exists" },
      { status: 409 }
    );

  try {
    // Create profile record directly (using our custom auth system)
    const password_hash = await bcrypt.hash(password, 10);
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        email,
        username,
        first_name,
        last_name,
        password_hash,
        role: "user",
        is_verified: false,
      })
      .select("id")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { detail: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Send verification email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/send-verification-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId: profileData.id,
        }),
      });

      const emailData = await emailResponse.json();
      
      if (emailResponse.ok) {
        console.log("Verification email sent:", emailData.message);
      } else {
        console.warn("Failed to send verification email:", emailData.detail);
      }
    } catch (emailError) {
      console.warn("Error sending verification email:", emailError);
      // Don't fail registration if email sending fails
    }

    return NextResponse.json(
      { 
        id: profileData.id, 
        message: "Registration successful! Please check your email to verify your account.",
        verification_required: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { detail: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
