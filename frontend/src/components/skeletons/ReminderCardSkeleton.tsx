import { motion } from "framer-motion";

export default function ReminderCardSkeleton({
  index = 0,
}: {
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* Icon skeleton */}
        <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="h-5 bg-muted rounded w-48 mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-32 animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>

          <div className="h-4 bg-muted rounded w-full mt-3 mb-3 animate-pulse" />

          <div className="flex gap-2">
            <div className="h-9 bg-muted rounded w-24 animate-pulse" />
            <div className="h-9 bg-muted rounded w-10 animate-pulse" />
            <div className="h-9 bg-muted rounded w-10 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
