"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/config";
import { LogIn, LogOut, Menu, X, Cpu, BookOpen, PlusSquare, FolderOpen, Shield, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/wiki", label: "Wiki", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/submit", label: "Submit", icon: PlusSquare },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-technical-border bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
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

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-mono text-sm uppercase tracking-widest">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 transition-colors ${
                  isActive(href) ? "text-blue-600" : "hover:text-blue-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {user && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 transition-colors ${
                  isActive("/admin") ? "text-blue-600" : "hover:text-blue-500"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-mono font-bold leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-slate-500 font-mono">CONTRIBUTOR</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 border border-technical-border hover:bg-slate-50 transition-all hover:circuit-glow"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-technical-border font-mono text-xs font-bold hover:bg-slate-50 transition-all hover:circuit-glow"
              >
                <LogIn className="h-4 w-4" />
                SIGN IN
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 border border-technical-border hover:bg-slate-50 transition-all"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-16 right-0 bottom-0 z-50 w-72 bg-white border-l border-technical-border shadow-2xl md:hidden overflow-y-auto"
            >
              <div className="p-6 space-y-1">
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-4">Navigation</p>
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                      isActive(href)
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                      isActive("/admin")
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </div>

              <div className="p-6 border-t border-slate-100">
                {user ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-mono font-bold">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-technical-border font-mono text-xs font-bold uppercase hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { handleLogin(); setMobileOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest"
                  >
                    <LogIn className="h-4 w-4" /> Sign In
                  </button>
                )}
              </div>

              <div className="p-6 border-t border-slate-100">
                <div className="flex items-center gap-2 text-[10px] font-mono text-green-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  SYSTEM_ONLINE
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
