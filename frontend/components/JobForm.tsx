"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createJob } from "@/lib/api";
import LoadingState from "./LoadingState";

const WORD_COUNT_PRESETS = [800, 1500, 2500];
const LANGUAGES = [
  { value: "en", label: "English", available: true },
  { value: "nl", label: "Dutch", available: false },
  { value: "fr", label: "French", available: false },
  { value: "de", label: "German", available: false },
];

export default function JobForm() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [wordCount, setWordCount] = useState(1500);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const output = await createJob({ keyword: keyword.trim(), word_count: wordCount, language: "en" });
      router.push(`/jobs/${output.job_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (loading) return <LoadingState keyword={keyword} />;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Target keyword
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="e.g. best productivity tools for remote teams"
          required
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c6efc] transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Word count: <span className="text-[#7c6efc] font-semibold">{wordCount}</span>
        </label>
        <div className="flex gap-2 mb-3">
          {WORD_COUNT_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setWordCount(n)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${
                wordCount === n
                  ? "bg-[#7c6efc] border-[#7c6efc] text-white"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#7c6efc]"
              }`}
            >
              {n.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={500}
          max={4000}
          step={100}
          value={wordCount}
          onChange={(e) => setWordCount(Number(e.target.value))}
          className="w-full accent-[#7c6efc]"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>500</span><span>4,000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Language
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGES.map((l) => (
            <div key={l.value} className="relative group">
              <div
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-between transition ${
                  l.available
                    ? "border-[#7c6efc] bg-[#7c6efc]/5 text-[#7c6efc] cursor-default"
                    : "border-slate-200 dark:border-slate-700 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                }`}
              >
                <span>{l.label}</span>
                {l.available ? (
                  <span className="text-xs bg-[#7c6efc] text-white px-2 py-0.5 rounded-full">Active</span>
                ) : (
                  <span className="text-xs text-slate-400">Soon</span>
                )}
              </div>
              {!l.available && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Will be there soon
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!keyword.trim()}
        className="gradient-btn w-full py-3.5 rounded-xl text-white font-semibold text-base"
      >
        Generate Article
      </button>
    </form>
  );
}
