import { NextRequest, NextResponse } from "next/server";
import { checkDatabaseConnection } from "@/lib/dbHealth";

export async function GET(req: NextRequest) {
  try {
    const dbHealthy = await checkDatabaseConnection();

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: dbHealthy ? "connected" : "disconnected",
        uptime: process.uptime(),
      },
      { status: dbHealthy ? 200 : 503 }
    );
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
