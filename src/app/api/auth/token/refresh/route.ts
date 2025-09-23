import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signAccessToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  const { refresh } = await req.json();
  if (!refresh)
    return NextResponse.json({ detail: "Missing refresh" }, { status: 400 });
  try {
    const payload = await verifyToken(refresh);
    if (payload.type !== "refresh") throw new Error("Not refresh");
    const access = await signAccessToken({
      sub: payload.sub,
      role: payload.role,
    });
    return NextResponse.json({ access });
  } catch {
    return NextResponse.json({ detail: "Invalid refresh" }, { status: 401 });
  }
}
