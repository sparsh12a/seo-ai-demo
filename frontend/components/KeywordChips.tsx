import { KeywordAnalysis } from "@/lib/types";

export default function KeywordChips({ analysis }: { analysis: KeywordAnalysis }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <span className="text-[#7c6efc]">◈</span> Keywords
      </h3>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Primary</p>
        <span className="inline-block px-3 py-1.5 rounded-full bg-[#7c6efc] text-white text-sm font-medium">
          {analysis.primary_keyword}
        </span>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Secondary</p>
        <div className="flex flex-wrap gap-2">
          {analysis.secondary_keywords.map((kw) => (
            <span
              key={kw}
              className="inline-block px-3 py-1 rounded-full bg-[#7c6efc]/10 text-[#7c6efc] dark:text-[#a594fd] text-sm border border-[#7c6efc]/20"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
