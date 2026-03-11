"use client";

import Link from "next/link";
import { Inbox, type LucideIcon } from "lucide-react";

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionHref,
  icon: Icon,
}: {
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: LucideIcon;
}) {
  const DisplayIcon = Icon || Inbox;

  return (
    <div className="card-flat p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
        <DisplayIcon className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
