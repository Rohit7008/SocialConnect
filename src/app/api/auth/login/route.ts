import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { identifier, password } = parsed.data;

  // Find by email or username
  const { data: user, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, email, password_hash, role, is_verified")
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .single();

  if (error || !user) {
    return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return NextResponse.json({ detail: "Invalid credentials" }, { status: 401 });
  }

  const skipVerify = process.env.DEV_SKIP_VERIFICATION === "true";
  if (!user.is_verified && !skipVerify) {
    return NextResponse.json({ detail: "Email not verified" }, { status: 403 });
  }

  const access = await signAccessToken({ sub: user.id, role: user.role });
  const refresh = await signRefreshToken({ sub: user.id, role: user.role });

  return NextResponse.json({
    access,
    refresh,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}
