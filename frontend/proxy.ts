import { NextRequest, NextResponse } from "next/server";

const PUBLIC = ["/login"];
const SKIP_KEYS_CHECK = ["/login", "/settings", "/api/keys"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = req.cookies.get("auth")?.value;
  const hasKeys =
    req.cookies.get("anthropic_key")?.value &&
    req.cookies.get("serp_key")?.value;

  // Not logged in -> login page
  if (!auth && !PUBLIC.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in + on login page -> settings (or home if keys exist)
  if (auth && pathname === "/login") {
    return NextResponse.redirect(new URL(hasKeys ? "/" : "/settings", req.url));
  }

  // Logged in but no keys -> settings page (unless already going there)
  if (auth && !hasKeys && !SKIP_KEYS_CHECK.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|seoai.png).*)"],
};
