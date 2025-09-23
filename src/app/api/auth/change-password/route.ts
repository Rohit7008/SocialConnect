import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyToken } from "@/lib/jwt";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { old_password, new_password } = await req.json();
  if (!old_password || !new_password)
    return NextResponse.json({ detail: "Missing fields" }, { status: 400 });
  const payload = await verifyToken(token);
  if (payload.type !== "access")
    return NextResponse.json({ detail: "Invalid token" }, { status: 401 });

  const { data: user, error } = await supabase
    .from("profiles")
    .select("id, password_hash")
    .eq("id", payload.sub)
    .single();
  if (error || !user)
    return NextResponse.json({ detail: "User not found" }, { status: 404 });
  const ok = await bcrypt.compare(old_password, user.password_hash);
  if (!ok)
    return NextResponse.json(
      { detail: "Invalid old password" },
      { status: 400 }
    );
  const password_hash = await bcrypt.hash(new_password, 10);
  await supabase.from("profiles").update({ password_hash }).eq("id", user.id);
  return NextResponse.json({ message: "Password changed" });
}
