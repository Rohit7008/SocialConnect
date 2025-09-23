import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

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

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, username, email, password_hash, role, is_verified")
    .or(`email.eq.${identifier},username.eq.${identifier}`)
    .single();
  if (error)
    return NextResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 }
    );
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok)
    return NextResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 }
    );

  const skipVerify = process.env.DEV_SKIP_VERIFICATION === "true";
  if (!user.is_verified && !skipVerify)
    return NextResponse.json({ detail: "Email not verified" }, { status: 403 });

  const access = await signAccessToken({ sub: user.id, role: user.role });
  const refresh = await signRefreshToken({ sub: user.id, role: user.role });

  // track last_login
  await supabase
    .from("profiles")
    .update({ last_login: new Date().toISOString() })
    .eq("id", user.id);

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
