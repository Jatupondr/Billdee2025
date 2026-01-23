import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(req: NextRequest) {
  const session = getSessionCookie(req);
  console.log("session", session);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  return NextResponse.next();
}

// ✅ ใช้ matcher เดียวจบ:
// - กันทุกหน้า
// - ยกเว้น: "/", "/login" (รวม subpath), ทุกไฟล์ที่มีจุด (static assets), ทั้ง _next/* และ api/*
export const config = {
  matcher: [
    "/((?!(?:api|_next|.*\\..*|login(?:/.*)?$|register(?:/.*)?$|forgot-password(?:/.*)?$|verified(?:/.*)?$|reset-password(?:/.*)?$)).*)",
  ],
};
