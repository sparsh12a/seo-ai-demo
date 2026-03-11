import { ArticleOutput } from "@/lib/types";
import SEOMetaCard from "./SEOMetaCard";
import KeywordChips from "./KeywordChips";
import ArticleViewer from "./ArticleViewer";
import QualityReport from "./QualityReport";
import FAQAccordion from "./FAQAccordion";
import LinksCard from "./LinksCard";

export default function ArticleResult({ output }: { output: ArticleOutput }) {
  return (
    <div className="space-y-6">
      {/* Overview strip */}
      <div className="rounded-xl border border-[#7c6efc]/30 bg-gradient-to-r from-blue-500/5 to-[#7c6efc]/10 p-5 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Keyword</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {output.keyword_analysis.primary_keyword}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Word Count</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {output.article.word_count.toLocaleString()}
          </p>
        </div>
        {output.quality_report && (
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Quality Score</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {Math.round(output.quality_report.overall_score * 100)} / 100
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Revision Attempts</p>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
            {output.revision_attempts}
          </p>
        </div>
        <div className="ml-auto">
          <span className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-semibold">
            ✓ Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SEOMetaCard meta={output.seo_metadata} />
        <KeywordChips analysis={output.keyword_analysis} />
      </div>

      <ArticleViewer article={output.article} />

      {output.article.faqs.length > 0 && (
        <FAQAccordion faqs={output.article.faqs} />
      )}

      {output.quality_report && <QualityReport report={output.quality_report} />}

      <LinksCard internal={output.internal_links} external={output.external_references} />
    </div>
  );
}
