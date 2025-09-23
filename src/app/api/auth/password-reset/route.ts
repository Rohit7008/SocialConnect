import { NextRequest, NextResponse } from "next/server";

// Stub: in real app, send email with token link. Here just 200.
export async function POST(_req: NextRequest) {
  return NextResponse.json({
    message: "If the email exists, a reset link will be sent.",
  });
}
