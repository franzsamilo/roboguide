import Link from "next/link";
import { Cpu } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="relative inline-block mb-8">
          <Cpu className="h-16 w-16 text-slate-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[10px] font-bold text-red-500">ERR</span>
          </div>
        </div>
        <h1 className="text-8xl font-black tracking-tighter text-slate-200 mb-4 font-mono">404</h1>
        <h2 className="text-xl font-bold uppercase mb-2">PAGE_NOT_FOUND</h2>
        <p className="text-slate-500 font-mono text-sm mb-8 uppercase">
          The requested resource does not exist in the registry.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Return Home
          </Link>
          <Link
            href="/wiki"
            className="px-6 py-3 border border-technical-border font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            Browse Wiki
          </Link>
        </div>
      </div>
    </div>
  );
}
