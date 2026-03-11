"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Analyzing SERP results",
  "Extracting keywords",
  "Building content outline",
  "Writing article sections",
  "Running quality checks",
];

export default function LoadingState({ keyword }: { keyword: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 9000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c6efc]/10 text-[#7c6efc] text-sm font-medium mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c6efc] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c6efc]" />
          </span>
          Generating your article
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          &ldquo;{keyword}&rdquo; · This takes 30–60 seconds
        </p>
      </div>

      <div className="space-y-3 text-left">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <div
              key={step}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                active ? "bg-[#7c6efc]/10 dark:bg-[#7c6efc]/20" : ""
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                done
                  ? "bg-[#7c6efc] text-white"
                  : active
                  ? "border-2 border-[#7c6efc]"
                  : "border-2 border-slate-200 dark:border-slate-700"
              }`}>
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : active ? (
                  <span className="w-2 h-2 rounded-full bg-[#7c6efc] animate-pulse" />
                ) : null}
              </div>
              <span className={`text-sm font-medium ${
                done ? "text-slate-500 line-through decoration-[#7c6efc]/40" :
                active ? "text-slate-900 dark:text-slate-100" :
                "text-slate-400 dark:text-slate-600"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
