import { QualityReport as QR } from "@/lib/types";

function ScoreCircle({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
        style={{ background: `conic-gradient(${color} ${pct}%, #e5e7eb ${pct}%)` }}
      >
        <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{pct}</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-2">Quality Score</p>
    </div>
  );
}

export default function QualityReport({ report }: { report: QR }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
        Quality Report
      </h3>
      <div className="flex gap-6 items-start flex-wrap">
        <ScoreCircle score={report.overall_score} />
        <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-2">
          {Object.entries(report.checks).map(([key, passed]) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <span className={passed ? "text-green-500" : "text-red-400"}>
                {passed ? "✓" : "✗"}
              </span>
              <span className="text-slate-700 dark:text-slate-300 capitalize">
                {key.replace(/_/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
