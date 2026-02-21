"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegistryItemSchema } from "@/lib/schemas";
import Navbar from "@/components/ui/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Send, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { redirect } from "next/navigation";

export default function SubmitPage() {
  const { user, loading } = useAuth();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(RegistryItemSchema),
    defaultValues: {
      tags: [],
      specifications: {}
    }
  });

  if (loading) return null;
  if (!user) redirect("/");

  const nextStep = async () => {
    const fields = step === 1 ? ["name", "slug", "category"] : step === 2 ? ["description"] : [];
    const isValid = await trigger(fields as any);
    if (isValid) setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const onSubmit = (data: any) => {
    console.log("Submitting:", data);
    setStep(4); // Success state
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/20 bg-blue-500/5 rounded-full mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
              Authorized Contributor Mode
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">Initialize New Record</h1>
          <p className="text-slate-500 font-mono text-sm mt-2">SYSTEM_INPUT_LEVEL_01 // SECURE_TRANSIT</p>
        </header>

        <div className="technical-card p-1 bg-slate-900 mb-8">
          <div className="flex h-1 bg-slate-800">
            <motion.div 
              className="bg-blue-500 h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Resource Name</label>
                    <input 
                      {...register("name")}
                      placeholder="e.g. ESP32-WROOM-32"
                      className={`w-full p-4 border ${errors.name ? 'border-safety outline-none ring-1 ring-safety-red' : 'border-technical-border'} font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                    />
                    {errors.name && (
                      <motion.p initial={{ x: -2 }} animate={{ x: [2, -2, 2, 0] }} className="text-[10px] flex items-center gap-1 text-safety-red font-mono uppercase">
                        <AlertCircle className="h-3 w-3" /> {errors.name.message as string}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Registry Slug (Auto-ID)</label>
                    <input 
                      {...register("slug")}
                      placeholder="esp32-wroom-32"
                      className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Resource Category</label>
                  <select 
                    {...register("category")}
                    className="w-full p-4 border border-technical-border font-mono text-sm appearance-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="">SELECT_CATEGORY...</option>
                    <option value="mcu">MICROCONTROLLER</option>
                    <option value="sensor">SENSOR_RADIO</option>
                    <option value="power">POWER_MANAGEMENT</option>
                  </select>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Technical Abstract</label>
                  <textarea 
                    {...register("description")}
                    rows={6}
                    placeholder="Enter detailed hardware description and intended use cases..."
                    className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="technical-card p-12 text-center border-dashed bg-slate-50">
                  <Cpu className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="font-mono text-xs text-slate-500 uppercase">Awaiting final validation of registry entries...</p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="technical-card p-12 text-center"
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold uppercase mb-2">Registry Initialized</h2>
                <p className="text-slate-500 font-mono text-xs mb-8">ENTRY_AUTH: SUCCESS // REDIRECT_IN_PROGRESS</p>
                <button 
                  onClick={() => redirect("/wiki")}
                  className="px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Return to Wiki
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className="flex justify-between pt-8 border-t border-slate-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 px-6 py-3 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all disabled:opacity-0"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {step === totalSteps ? (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all hover:circuit-glow"
                >
                  Push to Registry <Send className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
