import { NextRequest, NextResponse } from "next/server";

const ONE_HOUR = 60 * 60;

export async function POST(req: NextRequest) {
  const { anthropic_key, serp_key } = await req.json();
  if (!anthropic_key || !serp_key) {
    return NextResponse.json({ error: "Both keys are required" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("anthropic_key", anthropic_key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ONE_HOUR,
    path: "/",
  });
  res.cookies.set("serp_key", serp_key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: ONE_HOUR,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("anthropic_key", "", { maxAge: 0, path: "/" });
  res.cookies.set("serp_key", "", { maxAge: 0, path: "/" });
  return res;
}
