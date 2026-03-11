"use client";

import { useState } from "react";
import { SEOMetadata } from "@/lib/types";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button onClick={copy} className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#7c6efc] transition-colors">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default function SEOMetaCard({ meta }: { meta: SEOMetadata }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
        <span className="text-[#7c6efc]">⬡</span> SEO Metadata
      </h3>
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Title Tag</span>
            <CopyButton text={meta.title_tag} />
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-snug">{meta.title_tag}</p>
          <p className="text-xs text-slate-400 mt-1">{meta.title_tag.length} chars</p>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Meta Description</span>
            <CopyButton text={meta.meta_description} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{meta.meta_description}</p>
          <p className="text-xs text-slate-400 mt-1">{meta.meta_description.length} chars</p>
        </div>
      </div>
    </div>
  );
}
