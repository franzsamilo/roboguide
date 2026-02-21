"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import { Cpu, BookOpen, PlusSquare, ArrowRight, Activity, Database, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center relative overflow-hidden">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 border border-slate-200 bg-white/50 backdrop-blur-sm rounded-full mb-8"
          >
            <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest">
              System v1.0.4 Online // Hardware Agnostic
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 leading-[0.9]"
          >
            The Living <br />
            <span className="text-blue-600">Blueprint</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto text-slate-500 text-lg md:text-xl font-sans mb-12"
          >
            A high-fidelity IoT knowledge repository bridging the gap between raw hardware data and hyperlocal regional context.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link 
              href="/wiki"
              className="group relative px-8 py-4 bg-slate-900 text-white font-mono text-sm font-bold uppercase tracking-widest overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Init_Repository <BookOpen className="h-4 w-4" />
              </span>
            </Link>

            <Link 
              href="/submit"
              className="group px-8 py-4 border border-technical-border font-mono text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all hover:circuit-glow"
            >
              Contribute_Data <PlusSquare className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 w-full">
          <div className="technical-card p-8 group hover:border-blue-500 transition-colors">
            <Database className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-6" />
            <h3 className="font-bold uppercase mb-2">Dynamic Registry</h3>
            <p className="text-slate-500 text-sm font-sans">Hardware-agnostic schema supporting arbitrary technical specifications via Firestore Maps.</p>
          </div>
          
          <div className="technical-card p-8 group hover:border-blue-500 transition-colors">
            <Globe className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-6" />
            <h3 className="font-bold uppercase mb-2">Hyperlocal Layer</h3>
            <p className="text-slate-500 text-sm font-sans">Bridge the gap with regional guides and supplier-specific documentation for global makers.</p>
          </div>

          <div className="technical-card p-8 group hover:border-blue-500 transition-colors">
            <Cpu className="h-8 w-8 text-slate-400 group-hover:text-blue-500 transition-colors mb-6" />
            <h3 className="font-bold uppercase mb-2">Technical Identity</h3>
            <p className="text-slate-500 text-sm font-sans">High-fidelity visualization of IoT components with animated schematics and trace-line logic.</p>
          </div>
        </div>

        {/* Background Decals */}
        <div className="absolute top-1/4 left-10 opacity-5 pointer-events-none hidden xl:block">
          <div className="font-mono text-[150px] font-black leading-none select-none uppercase">ROBO</div>
        </div>
        <div className="absolute bottom-1/4 right-10 opacity-5 pointer-events-none hidden xl:block">
          <div className="font-mono text-[150px] font-black leading-none select-none uppercase text-blue-600">GUIDE</div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono font-bold text-slate-400">© 2026 ROBOGUIDE_SYSTEMS</span>
            <div className="h-1 w-1 bg-slate-300 rounded-full" />
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-[0.2em]">The_Living_Blueprint</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="font-mono text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors">DOCS_01</a>
            <a href="#" className="font-mono text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors">TERMS_OF_ACCESS</a>
            <a href="#" className="font-mono text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors">ENCRYPTED_API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
