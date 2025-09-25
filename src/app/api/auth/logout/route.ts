import { NextRequest, NextResponse } from "next/server";

// Stateless JWT logout: client should discard refresh token; optional blacklist table can be added
export async function POST(_req: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("sb-access-token", "", {
    httpOnly: true,
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("sb-refresh-token", "", {
    httpOnly: true,
    secure: isProd,
    path: "/",
    maxAge: 0,
  });
  return res;
}
