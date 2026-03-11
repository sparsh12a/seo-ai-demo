"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [anthropicKey, setAnthropicKey] = useState("");
  const [serpKey, setSerpKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropic_key: anthropicKey, serp_key: serpKey }),
      });
      if (!res.ok) throw new Error("Failed to save keys");
      setSaved(true);
      setTimeout(() => router.push("/"), 1000);
    } catch {
      setError("Failed to save keys. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">API Keys</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Keys are stored in secure httpOnly cookies and expire after 1 hour. They are never logged or stored on the server.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 text-sm text-amber-800 dark:text-amber-300">
        <strong>Session expires in 1 hour.</strong> After that you will need to sign in and re-enter your keys.
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {saved && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
            Keys saved. Redirecting...
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Anthropic API Key
          </label>
          <input
            type="password"
            value={anthropicKey}
            onChange={(e) => setAnthropicKey(e.target.value)}
            placeholder="sk-ant-..."
            required
            autoComplete="off"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c6efc] transition text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">Used for keyword extraction, article generation, and SEO enrichment.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            SerpAPI Key
          </label>
          <input
            type="password"
            value={serpKey}
            onChange={(e) => setSerpKey(e.target.value)}
            placeholder="your-serpapi-key"
            required
            autoComplete="off"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7c6efc] transition text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">Used to fetch Google search results for your keyword.</p>
        </div>

        <button
          type="submit"
          disabled={saving || !anthropicKey || !serpKey}
          className="gradient-btn w-full py-2.5 rounded-xl text-white font-semibold text-sm"
        >
          {saving ? "Saving..." : "Save Keys and Continue"}
        </button>
      </form>
    </div>
  );
}
