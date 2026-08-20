import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  /** Tailwind classes for the icon container: bg + text + border */
  color: string;
  delay?: number;
  /** Optional small trend/subtitle text */
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  delay = 0,
  subtitle,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.32, ease: "easeOut" }}
      className="
        relative overflow-hidden rounded-xl border border-border/60 p-5 bg-card/90 backdrop-blur-sm
        hover:-translate-y-1 hover:border-primary/30
        hover:shadow-soft-md
        transition-all duration-200 cursor-default group
      "
    >
      {/* Dynamic top gradient line accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Subtle radial glow in top-right */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none opacity-20 transition-opacity group-hover:opacity-40"
        style={{
          background: "radial-gradient(circle at top right, hsl(var(--primary)), transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Top row: title + icon */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className={`p-2.5 rounded-xl border flex-shrink-0 shadow-xs transition-transform group-hover:scale-105 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {/* Metric Value */}
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums leading-none">
            {value}
          </p>
        </div>

        {/* Optional subtitle */}
        {subtitle && (
          <p className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
