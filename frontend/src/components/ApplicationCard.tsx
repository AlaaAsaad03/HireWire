import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Check,
} from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import type { Application } from "../types";

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
  index?: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  viewMode?: "list" | "grid";
}

const STATUS_CONFIG = {
  applied:             { label: "Applied",     variant: "info"    as const },
  interview_scheduled: { label: "Interview",   variant: "purple"  as const },
  interviewed:         { label: "Interviewed", variant: "warning" as const },
  offer:               { label: "Offer",       variant: "success" as const },
  rejected:            { label: "Rejected",    variant: "danger"  as const },
  withdrawn:           { label: "Withdrawn",   variant: "outline" as const },
};

function getAvatarStyle(company: string) {
  const charCode = (company.charCodeAt(0) || 65) + (company.charCodeAt(1) || 0);
  const styles = [
    { bg: "bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/20" },
    { bg: "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" },
    { bg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
    { bg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20" },
    { bg: "bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20" },
    { bg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  ];
  return styles[charCode % styles.length];
}

export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
  index = 0,
  isSelected = false,
  onSelect,
  viewMode = "list",
}: ApplicationCardProps) {
  const navigate = useNavigate();

  const status =
    STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.applied;

  const daysAgo = Math.floor(
    (Date.now() - new Date(application.appliedDate).getTime()) / 86_400_000,
  );

  const formattedDate = new Date(application.appliedDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric" },
  );

  const initials = application.company
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const avatarStyle = getAvatarStyle(application.company);
  const matchScore = (application as any).matchScore as number | undefined;

  function handleClick(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button,input,a")) return;
    navigate(`/applications/${application.id}`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HORIZONTAL LIST ROW VIEW (Structured Table Row Shape)
  // ═══════════════════════════════════════════════════════════════════════════
  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02, duration: 0.22, ease: "easeOut" }}
        className="group relative"
      >
        <div
          onClick={handleClick}
          className={`
            relative grid grid-cols-12 items-center gap-3 px-4 py-3 rounded-xl border
            cursor-pointer transition-all duration-200 backdrop-blur-sm
            before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full
            before:bg-primary before:transition-opacity before:duration-200
            ${isSelected
              ? "border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] bg-card before:opacity-100"
              : "border-border/60 bg-card/90 hover:border-primary/40 hover:shadow-soft-sm hover:bg-card before:opacity-0 hover:before:opacity-100"
            }
          `}
        >
          {/* Col 1: Checkbox + Avatar + Role & Company */}
          <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-4 flex items-center gap-3 min-w-0">
            {onSelect && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(application.id);
                }}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border/80 hover:border-primary/60 bg-muted/20"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
            )}

            <div
              className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-extrabold border shadow-xs transition-transform duration-200 group-hover:scale-105 ${avatarStyle.bg}`}
            >
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                {application.position}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                  {application.company}
                </span>
                {application.jobUrl && (
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
                )}
              </div>
            </div>
          </div>

          {/* Col 2: Location */}
          <div className="hidden md:flex col-span-2 items-center min-w-0">
            {application.location ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground truncate">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                <span className="truncate">{application.location}</span>
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/30">—</span>
            )}
          </div>

          {/* Col 3: Salary / Match */}
          <div className="hidden lg:flex col-span-2 items-center gap-2 min-w-0">
            {application.salary ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                {(application.salary / 1000).toFixed(0)}k/yr
              </span>
            ) : matchScore !== undefined ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                {matchScore}% match
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/30">—</span>
            )}
          </div>

          {/* Col 4: Status Badge & Date */}
          <div className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-2 flex items-center gap-2 min-w-0">
            <Badge variant={status.variant} dot className="text-xs flex-shrink-0">
              {status.label}
            </Badge>

            <span className="hidden xl:inline text-[11px] text-muted-foreground/70 whitespace-nowrap ml-auto">
              {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
            </span>
          </div>

          {/* Col 5: Actions */}
          <div
            className="col-span-6 sm:col-span-3 md:col-span-3 lg:col-span-2 flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {application.jobUrl && (
              <Button
                onClick={() => window.open(application.jobUrl, "_blank")}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors"
                title="View Job Post"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              onClick={() => onEdit(application)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors"
              title="Edit Application"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={() => onDelete(application.id)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Delete Application"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRID CARD VIEW (Modern Card Layout)
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.28, ease: "easeOut" }}
      className="group h-full relative"
    >
      <div
        onClick={handleClick}
        className={`
          h-full flex flex-col justify-between rounded-xl border p-4 cursor-pointer
          transition-all duration-200 backdrop-blur-sm relative overflow-hidden
          hover:-translate-y-1 hover:shadow-soft-md
          before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-r-full
          before:bg-primary before:transition-opacity before:duration-200
          ${isSelected
            ? "border-primary/50 shadow-[0_0_0_3px_hsl(var(--primary)/0.12)] bg-card before:opacity-100"
            : "border-border/60 bg-card/90 hover:border-primary/40 before:opacity-0 hover:before:opacity-100"
          }
        `}
      >
        <div>
          {/* Header Row: Checkbox + Avatar + Company & Status Badge */}
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {onSelect && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(application.id);
                  }}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border/80 hover:border-primary/60 bg-muted/20"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </button>
              )}

              <div
                className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-extrabold border shadow-xs transition-transform duration-200 group-hover:scale-105 ${avatarStyle.bg}`}
              >
                {initials}
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground truncate block">
                  {application.company}
                </span>
              </div>
            </div>

            <Badge variant={status.variant} dot className="text-xs flex-shrink-0">
              {status.label}
            </Badge>
          </div>

          {/* Position Title - Prominently on its own full line */}
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate mb-2.5">
            {application.position}
          </h3>

          {/* Metadata Chips: Location, Salary, Date */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3 text-xs">
            {application.location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/40 border border-border/40 text-muted-foreground font-medium truncate max-w-[160px]">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
                <span className="truncate">{application.location}</span>
              </span>
            )}

            {application.salary && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold">
                <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                {(application.salary / 1000).toFixed(0)}k/yr
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/30 border border-border/30 text-muted-foreground/70 font-medium">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              {formattedDate}
            </span>
          </div>

          {/* Match Score Indicator */}
          {matchScore !== undefined && (
            <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-primary" /> Match Score
                </span>
                <span className="font-extrabold tabular-nums text-foreground">{matchScore}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    matchScore >= 80
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : matchScore >= 60
                        ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                        : "bg-gradient-to-r from-rose-500 to-red-400"
                  }`}
                  style={{ width: `${matchScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions & Tags Row */}
        <div
          className="pt-2.5 mt-auto border-t border-border/40 flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {application.tags && application.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-white truncate shadow-xs"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            {application.tags && application.tags.length > 2 && (
              <span className="text-[10px] text-muted-foreground font-semibold px-1.5 py-0.5 rounded-md bg-muted">
                +{application.tags.length - 2}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {application.jobUrl && (
              <Button
                onClick={() => window.open(application.jobUrl, "_blank")}
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors"
                title="View Job"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              onClick={() => onEdit(application)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={() => onDelete(application.id)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

