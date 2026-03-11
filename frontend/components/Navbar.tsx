"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/keys", { method: "DELETE" });
    document.cookie = "auth=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0d0d12]/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <Image src="/seoai.png" alt="AISEO" width={120} height={40} className="object-contain" />
          <span className="text-slate-300 dark:text-slate-600 font-light">-</span>
          <span className="text-slate-500 dark:text-slate-400 font-medium text-base">Sparsh Jain</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/history" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#7c6efc] transition-colors font-medium">
            History
          </Link>
          <Link href="/settings" className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#7c6efc] transition-colors font-medium">
            API Keys
          </Link>
          <button
            onClick={logout}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
