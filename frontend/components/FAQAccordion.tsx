"use client";

import { useState } from "react";
import { FAQ } from "@/lib/types";

function FAQItem({ faq, index }: { faq: FAQ; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4"
      >
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex gap-3">
          <span className="text-[#7c6efc] font-bold flex-shrink-0">Q{index + 1}</span>
          {faq.question}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {faq.answer}
        </div>
      )}
    </div>
  );
}

export default function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  if (!faqs.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
        <span className="text-[#7c6efc]">≡</span> FAQs
      </h3>
      {faqs.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
    </div>
  );
}
