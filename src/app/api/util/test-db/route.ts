import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET || "";
  const header = req.headers.get("x-seed-secret") || "";
  if (!secret || header !== secret) {
    return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
  }

  // 1) Simple connectivity check
  const { error: pingErr } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .limit(1);
  if (pingErr) {
    return NextResponse.json(
      { ok: false, error: pingErr.message },
      { status: 500 }
    );
  }

  // 2) Upsert a test user
  const email = "testuser@example.com";
  const username = "testuser";
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // Check existing
  const { data: existing, error: exErr } = await supabaseAdmin
    .from("profiles")
    .select("id, email, username")
    .or(`email.eq.${email},username.eq.${username}`)
    .maybeSingle();
  if (exErr) {
    return NextResponse.json(
      { ok: false, error: exErr.message },
      { status: 500 }
    );
  }

  if (existing) {
    return NextResponse.json({
      ok: true,
      message: "Already exists",
      user: existing,
    });
  }

  const { data: created, error: insErr } = await supabaseAdmin
    .from("profiles")
    .insert({
      email,
      username,
      first_name: "Test",
      last_name: "User",
      password_hash: passwordHash,
      role: "user",
      is_verified: true,
    })
    .select("id, email, username")
    .single();
  if (insErr) {
    return NextResponse.json(
      { ok: false, error: insErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, user: created });
}
