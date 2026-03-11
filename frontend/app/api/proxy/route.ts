import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

async function forward(req: NextRequest, path: string, method: string) {
  const anthropic_key = req.cookies.get("anthropic_key")?.value ?? "";
  const serp_key = req.cookies.get("serp_key")?.value ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (anthropic_key) headers["x-anthropic-key"] = anthropic_key;
  if (serp_key) headers["x-serp-key"] = serp_key;

  const body = method !== "GET" ? await req.text() : undefined;

  const upstream = await fetch(`${BACKEND}${path}`, {
    method,
    headers,
    body,
    signal: AbortSignal.timeout(180_000),
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  return forward(req, path, "GET");
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "/";
  return forward(req, path, "POST");
}
