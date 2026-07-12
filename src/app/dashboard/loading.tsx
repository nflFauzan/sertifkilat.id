export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-ink-200 rounded-lg" />
        <div className="h-4 w-72 bg-ink-100 rounded-lg" />
      </div>

      {/* Plan Card Skeleton */}
      <div className="h-32 w-full bg-ink-100 rounded-2xl border border-ink-150" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-5 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3.5 w-20 bg-ink-100 rounded" />
              <div className="h-8 w-14 bg-ink-200 rounded-lg" />
              <div className="h-3 w-28 bg-ink-100 rounded" />
            </div>
            <div className="w-11 h-11 bg-ink-200 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((card) => (
          <div key={card} className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-ink-100 flex justify-between items-center">
              <div className="h-5 w-32 bg-ink-200 rounded" />
              <div className="h-4 w-16 bg-ink-100 rounded" />
            </div>
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-4">
                  <div className="w-9 h-9 bg-ink-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-ink-200 rounded" />
                    <div className="h-3 w-1/2 bg-ink-100 rounded" />
                  </div>
                  <div className="h-6 w-12 bg-ink-100 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
