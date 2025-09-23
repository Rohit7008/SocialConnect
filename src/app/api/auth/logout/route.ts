import { NextRequest, NextResponse } from "next/server";

// Stateless JWT logout: client should discard refresh token; optional blacklist table can be added
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: "Logged out" });
}
