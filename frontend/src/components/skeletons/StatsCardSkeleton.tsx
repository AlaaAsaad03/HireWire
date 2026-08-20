import { motion } from "framer-motion";

export default function StatsCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="rounded-xl border border-border/85 bg-card p-5 shadow-soft h-[104px] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="h-8 w-12 bg-muted rounded animate-pulse" />
    </motion.div>
  );
}
