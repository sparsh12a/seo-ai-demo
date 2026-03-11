"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Article } from "@/lib/types";

export default function ArticleViewer({ article }: { article: Article }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span className="text-[#7c6efc]">✦</span> Article
        </h3>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {article.word_count.toLocaleString()} words
        </span>
      </div>
      <div className="prose-article">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.full_markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
