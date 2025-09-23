import { NextRequest, NextResponse } from "next/server";

// Stub: verify token and set new password. For scope, accept and 200.
export async function POST(_req: NextRequest) {
  return NextResponse.json({ message: "Password has been reset" });
}
