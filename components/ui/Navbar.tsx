"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { LogIn, LogOut, Menu, Cpu, BookOpen, PlusSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-technical-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative p-1">
              <Cpu className="h-6 w-6 text-slate-700 group-hover:text-blue-500 transition-colors" />
              <motion.div 
                className="absolute inset-0 border border-blue-500 opacity-0 group-hover:opacity-100"
                initial={false}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            <span className="text-xl font-bold tracking-tighter text-slate-800 font-sans uppercase">
              ROBOGUIDE
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-widest">
          <Link href="/wiki" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <BookOpen className="h-4 w-4" />
            Wiki
          </Link>
          <Link href="/submit" className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <PlusSquare className="h-4 w-4" />
            Submit
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-mono font-bold leading-none">{user.displayName}</p>
                <p className="text-[10px] text-slate-500 font-mono">CONTRIBUTOR</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 border border-technical-border hover:bg-slate-50 transition-all hover:circuit-glow"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 border border-technical-border font-mono text-xs font-bold hover:bg-slate-50 transition-all hover:circuit-glow"
            >
              <LogIn className="h-4 w-4" />
              SIGN IN
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
