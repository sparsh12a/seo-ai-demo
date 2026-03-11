import { listJobs } from "@/lib/api-server";
import { Job } from "@/lib/types";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  failed: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400",
  running: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  pending: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function JobRow({ job }: { job: Job }) {
  const isCompleted = job.status === "completed";
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#7c6efc]/40 transition-colors group">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{job.keyword}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{job.target_word_count.toLocaleString()} words</span>
          <span>·</span>
          <span>{job.language.toUpperCase()}</span>
          <span>·</span>
          <span>{formatDate(job.created_at)}</span>
        </div>
        {job.status === "failed" && job.error_message && (
          <p className="text-xs text-red-400 mt-1 truncate">{job.error_message}</p>
        )}
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[job.status]}`}>
        {job.status}
      </span>
      {isCompleted ? (
        <Link
          href={`/jobs/${job.id}`}
          className="flex-shrink-0 px-4 py-1.5 rounded-lg gradient-btn text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View →
        </Link>
      ) : (
        <div className="w-16 flex-shrink-0" />
      )}
    </div>
  );
}

export default async function HistoryPage() {
  let jobs: Job[] = [];
  let error: string | null = null;

  try {
    jobs = await listJobs();
  } catch (err: unknown) {
    error = err instanceof Error ? err.message : "Failed to load jobs";
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Article History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {jobs.length} article{jobs.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <Link href="/" className="gradient-btn px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
          + New Article
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm mb-6">
          {error}
        </div>
      )}

      {jobs.length === 0 && !error ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📄</p>
          <p className="text-slate-500 dark:text-slate-400">No articles yet.</p>
          <Link href="/" className="gradient-btn inline-block mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold">
            Generate your first article
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => <JobRow key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
