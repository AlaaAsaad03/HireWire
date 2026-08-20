import { motion } from "framer-motion";

export default function ApplicationCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="bg-card/90 border border-border/60 rounded-xl p-4 flex flex-col justify-between h-full backdrop-blur-sm"
    >
      <div>
        {/* Header: Avatar + Company + Badge */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 bg-muted/60 rounded-lg animate-pulse flex-shrink-0" />
            <div className="h-3.5 w-24 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="h-5 w-16 bg-muted/60 rounded-full animate-pulse flex-shrink-0" />
        </div>

        {/* Full-width Title Skeleton */}
        <div className="h-5 w-4/5 bg-muted/70 rounded animate-pulse mb-3" />

        {/* Chips */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="h-6 w-24 bg-muted/50 rounded-md animate-pulse" />
          <div className="h-6 w-20 bg-muted/50 rounded-md animate-pulse" />
          <div className="h-6 w-16 bg-muted/40 rounded-md animate-pulse" />
        </div>

        {/* Match score bar */}
        <div className="mb-3 p-2 rounded-lg bg-muted/20 border border-border/20">
          <div className="flex justify-between mb-2">
            <div className="h-3 w-20 bg-muted/60 rounded animate-pulse" />
            <div className="h-3 w-8 bg-muted/60 rounded animate-pulse" />
          </div>
          <div className="h-1.5 w-full bg-muted/50 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-14 bg-muted/60 rounded-md animate-pulse" />
          <div className="h-5 w-14 bg-muted/60 rounded-md animate-pulse" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-7 w-7 bg-muted/60 rounded-lg animate-pulse" />
          <div className="h-7 w-7 bg-muted/60 rounded-lg animate-pulse" />
          <div className="h-7 w-7 bg-muted/60 rounded-lg animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

