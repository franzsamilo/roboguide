"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="card-flat p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title || "Something Went Wrong"}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline">
          <RefreshCw className="h-4 w-4" /> Try Again
        </button>
      )}
    </div>
  );
}
