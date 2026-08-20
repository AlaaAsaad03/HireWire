export default function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative pl-8 pb-8 last:pb-0">
          {/* Timeline line */}
          {i !== 3 && (
            <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
          )}

          {/* Timeline dot */}
          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-muted animate-pulse" />

          {/* Content */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="h-5 bg-muted rounded w-48 mb-2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-32 animate-pulse" />
              </div>
            </div>
            <div className="h-4 bg-muted rounded w-full mt-3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
