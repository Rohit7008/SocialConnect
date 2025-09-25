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
    // Previous custom auth: create profile with bcrypt password hash
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
        is_verified: true,
      })
      .select("id, username")
      .single();

    if (profileError) {
      return NextResponse.json(
        { detail: "Failed to create user profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: profileData.id,
        message: "Registration successful! You can now login.",
        verification_required: false,
        user: {
          id: profileData.id,
          username: profileData.username,
          email: email,
        },
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
