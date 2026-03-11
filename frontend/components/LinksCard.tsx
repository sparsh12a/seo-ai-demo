import { LinkingSuggestion, ExternalReference } from "@/lib/types";

export default function LinksCard({
  internal,
  external,
}: {
  internal: LinkingSuggestion[];
  external: ExternalReference[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <span className="text-[#7c6efc]">↗</span> Internal Links
        </h3>
        <div className="space-y-3">
          {internal.map((link, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-[#7c6efc]">{link.anchor_text}</p>
              <p className="text-xs text-slate-500 mt-0.5">{link.suggested_target}</p>
              <p className="text-xs text-slate-400 mt-1 italic">{link.context_note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <span className="text-[#7c6efc]">⊕</span> External References
        </h3>
        <div className="space-y-3">
          {external.map((ref, i) => (
            <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ref.source_name}</p>
              <p className="text-xs text-[#7c6efc] break-all mt-0.5">{ref.url}</p>
              <p className="text-xs text-slate-400 mt-1 italic">{ref.placement_context}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
