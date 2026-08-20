import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "outline";
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  default: "bg-secondary text-secondary-foreground border-transparent",
  success: "bg-status-success-soft text-status-success border-status-success/20",
  warning: "bg-status-warning-soft text-status-warning border-status-warning/20",
  danger: "bg-status-danger-soft text-status-danger border-status-danger/20",
  info: "bg-status-info-soft text-status-info border-status-info/20",
  purple: "bg-brand-soft text-primary border-primary/20",
  outline: "border-border text-muted-foreground bg-transparent",
};

const dotStyles = {
  default: "bg-secondary-foreground",
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info",
  purple: "bg-primary",
  outline: "bg-muted-foreground",
};

export default function Badge({ children, variant = "default", className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors",
        variantStyles[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 animate-pulse",
            dotStyles[variant]
          )}
        />
      )}
      {children}
    </span>
  );
}

