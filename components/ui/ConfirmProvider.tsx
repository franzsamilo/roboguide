"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setOpen(false);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {open && options && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${options.destructive ? "bg-red-50" : "bg-blue-50"}`}>
                    <AlertTriangle className={`h-5 w-5 ${options.destructive ? "text-red-500" : "text-blue-500"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase tracking-wide mb-1">{options.title}</h3>
                    <p className="text-sm text-slate-500 font-sans">{options.message}</p>
                  </div>
                  <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 p-4 border-t border-slate-100 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all"
                >
                  {options.cancelLabel || "Cancel"}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 font-mono text-xs font-bold uppercase text-white transition-all ${
                    options.destructive
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {options.confirmLabel || "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
