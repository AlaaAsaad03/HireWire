import { motion } from "framer-motion";

export default function ContactCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-card border border-border rounded-xl p-6 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Icon skeleton */}
          <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1">
            {/* Name skeleton */}
            <div className="h-5 bg-muted rounded w-32 mb-2 animate-pulse" />
            {/* Role badge skeleton */}
            <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-48 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-border">
        <div className="h-9 bg-muted rounded flex-1 animate-pulse" />
        <div className="h-9 bg-muted rounded w-10 animate-pulse" />
      </div>
    </motion.div>
  );
}
