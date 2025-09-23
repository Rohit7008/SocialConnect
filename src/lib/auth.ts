import { NextRequest } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";

export async function getAuth(req: NextRequest): Promise<JwtPayload | null> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const payload = await verifyToken<JwtPayload>(token);
    if (payload.type !== "access") return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(payload: JwtPayload | null) {
  if (!payload) throw Object.assign(new Error("Unauthorized"), { status: 401 });
}

export function requireAdmin(payload: JwtPayload | null) {
  requireAuth(payload);
  if (payload!.role !== "admin")
    throw Object.assign(new Error("Forbidden"), { status: 403 });
}
