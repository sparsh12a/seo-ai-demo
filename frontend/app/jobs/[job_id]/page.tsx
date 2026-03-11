import { getJob } from "@/lib/api-server";
import { ArticleOutput, JobStatusResponse } from "@/lib/types";
import ArticleResult from "@/components/ArticleResult";
import Link from "next/link";

function isArticleOutput(data: ArticleOutput | JobStatusResponse): data is ArticleOutput {
  return "article" in data;
}

export default async function JobPage({ params }: { params: Promise<{ job_id: string }> }) {
  const { job_id } = await params;

  let data: ArticleOutput | JobStatusResponse | null = null;
  let errorMsg: string | null = null;

  try {
    data = await getJob(job_id);
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load job";
  }

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">✗</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Error</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{errorMsg}</p>
        <Link href="/" className="gradient-btn inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold">
          ← Back to home
        </Link>
      </div>
    );
  }

  if (!data || !isArticleOutput(data)) {
    const status = (data as JobStatusResponse | null)?.status ?? "unknown";
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">⏳</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Job {status}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2 font-mono text-sm">{job_id}</p>
        <p className="text-slate-400 text-sm mb-6">This job hasn&apos;t completed yet. Check back shortly.</p>
        <Link href="/" className="gradient-btn inline-block px-6 py-2.5 rounded-xl text-white text-sm font-semibold">
          ← Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" className="text-slate-400 hover:text-[#7c6efc] transition-colors text-sm">
          ← New article
        </Link>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-xs text-slate-400 font-mono">{job_id}</span>
      </div>
      <ArticleResult output={data} />
    </div>
  );
}
