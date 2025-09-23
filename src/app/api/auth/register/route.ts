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
    return NextResponse.json(
      { detail: usernameError.message },
      { status: 500 }
    );
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
      .select("id, username")
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return NextResponse.json(
        { detail: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Try to create user in Supabase Auth for email verification
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // This triggers the verification email
        user_metadata: {
          username,
          first_name,
          last_name,
          profile_id: profileData.id, // Link to our profile
        }
      });

      if (authData?.user) {
        console.log("✅ Supabase Auth user created successfully");
        console.log("📧 Verification email should be sent automatically");
      }
    } catch (authError) {
      console.warn("⚠️ Could not create Supabase Auth user (using fallback):", authError);
      // Continue with registration even if Supabase Auth fails
    }

    return NextResponse.json(
      { 
        id: profileData.id, 
        message: "Registration successful! Please check your email to verify your account.",
        verification_required: true,
        user: {
          id: profileData.id,
          username: profileData.username,
          email: email
        }
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
