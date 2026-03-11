import { cookies } from "next/headers";
import { ArticleOutput, Job, JobStatusResponse } from "./types";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const jar = await cookies();
  const anthropic_key = jar.get("anthropic_key")?.value ?? "";
  const serp_key = jar.get("serp_key")?.value ?? "";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(anthropic_key ? { "x-anthropic-key": anthropic_key } : {}),
    ...(serp_key ? { "x-serp-key": serp_key } : {}),
  };

  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function listJobs(): Promise<Job[]> {
  return request<Job[]>("/jobs");
}

export async function getJob(jobId: string): Promise<ArticleOutput | JobStatusResponse> {
  return request<ArticleOutput | JobStatusResponse>(`/jobs/${jobId}`);
}
