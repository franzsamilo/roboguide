"use client";

export function CardSkeleton() {
  return (
    <div className="card-flat overflow-hidden">
      <div className="h-44 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 skeleton" />
        <div className="h-5 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-14 skeleton rounded-full" />
          <div className="h-5 w-16 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-5">
        <div className="aspect-square skeleton rounded-xl" />
      </div>
      <div className="lg:col-span-7 space-y-6">
        <div className="h-5 w-24 skeleton rounded-full" />
        <div className="h-10 w-3/4 skeleton" />
        <div className="h-20 w-full skeleton" />
        <div className="h-48 skeleton rounded-xl" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-lg" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 skeleton" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 skeleton" />
      ))}
    </div>
  );
}
