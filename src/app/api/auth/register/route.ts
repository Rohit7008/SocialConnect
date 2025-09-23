import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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

  // Ensure unique username
  const { data: existing, error: exErr } = await supabase
    .from("profiles")
    .select("id")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();
  if (exErr)
    return NextResponse.json({ detail: exErr.message }, { status: 500 });
  if (existing)
    return NextResponse.json(
      { detail: "Email or username already exists" },
      { status: 409 }
    );

  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
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
  if (error)
    return NextResponse.json({ detail: error.message }, { status: 500 });

  // Send verification email integration would go here (omitted). Mark unverified.
  return NextResponse.json(
    { id: data.id, message: "Registered. Please verify email." },
    { status: 201 }
  );
}
