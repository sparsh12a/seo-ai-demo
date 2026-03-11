import JobForm from "@/components/JobForm";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-20 pb-12">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-6 max-w-3xl">
          Generate{" "}
          <span className="bg-gradient-to-r from-blue-500 to-[#7c6efc] bg-clip-text text-transparent">
            SEO-optimized
          </span>{" "}
          articles in seconds
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mb-12">
          Enter a keyword, get a fully researched article with SERP analysis,
          keyword extraction, and quality scoring — all in one click.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-3 justify-center mb-14">
          {["SERP Analysis", "Keyword Extraction", "AI Writing", "Quality Check", "SEO Metadata"].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="flex-1 flex items-start justify-center px-6 pb-20">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-100 dark:shadow-none p-8">
          <JobForm />
        </div>
      </section>
    </div>
  );
}
