export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="h-5 w-48 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-64 rounded bg-secondary/60 animate-pulse ml-2" />
      </div>
      {/* Content skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
