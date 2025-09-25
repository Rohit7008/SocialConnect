import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "./lib/jwt";

const PROTECTED_PREFIXES = [
  "/api/users",
  "/api/posts", // Will be handled specially for GET requests
  "/api/feed",
  "/api/notifications",
  "/api/admin",
];

const PUBLIC_POST_ROUTES = [
  "/api/posts", // GET /api/posts (list posts)
];

const PUBLIC_POST_PATTERNS = [
  /^\/api\/posts\/[^\/]+\/?$/, // GET /api/posts/[id] (individual post)
  /^\/api\/posts\/[^\/]+\/comments\/?$/, // GET /api/posts/[id]/comments (post comments)
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // Check if this is a public post route (GET requests only)
  const isPublicPostRoute = PUBLIC_POST_ROUTES.some(
    (route) =>
      pathname.startsWith(route) && req.method === "GET" && pathname === route // Exact match for /api/posts (not /api/posts/[id])
  );

  const isPublicPostPattern = PUBLIC_POST_PATTERNS.some(
    (pattern) => pattern.test(pathname) && req.method === "GET"
  );

  if (isPublicPostRoute || isPublicPostPattern) {
    // Allow unauthenticated access to public post routes (GET only)
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;
  if (!token)
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });

  try {
    const payload = await verifyToken<JwtPayload>(token);
    (req as unknown as { user?: JwtPayload }).user = payload;
    if (
      req.nextUrl.pathname.startsWith("/api/admin") &&
      payload.role !== "admin"
    ) {
      return NextResponse.json({ detail: "Forbidden" }, { status: 403 });
    }
    return NextResponse.next();
  } catch {
    return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
