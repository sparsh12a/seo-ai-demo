import { ArticleOutput, Job, JobRequest, JobStatusResponse } from "./types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `/api/proxy?path=${encodeURIComponent(path)}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createJob(req: JobRequest): Promise<ArticleOutput> {
  return request<ArticleOutput>("/jobs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
}

export async function getJob(jobId: string): Promise<ArticleOutput | JobStatusResponse> {
  return request<ArticleOutput | JobStatusResponse>(`/jobs/${jobId}`);
}

export async function listJobs(): Promise<Job[]> {
  return request<Job[]>("/jobs");
}
