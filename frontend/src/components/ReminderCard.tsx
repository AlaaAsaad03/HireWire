import { motion } from "framer-motion";
import { Bell, Check, Clock, Trash2, Edit, Building2 } from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import Button from "./ui/Button";
import type { Reminder } from "../types";

interface ReminderCardProps {
  reminder: Reminder;
  onComplete: (id: string) => void;
  onEdit: (reminder: Reminder) => void;
  onDelete: (id: string) => void;
  index: number;
  showApplication?: boolean;
}

const reminderTypeColors = {
  follow_up: "bg-status-info-soft text-status-info border-status-info/20",
  interview_prep: "bg-brand-soft text-primary border-primary/20",
  thank_you: "bg-status-success-soft text-status-success border-status-success/20",
  custom: "bg-status-warning-soft text-status-warning border-status-warning/20",
};

const reminderTypeLabels = {
  follow_up: "Follow Up",
  interview_prep: "Interview Prep",
  thank_you: "Thank You",
  custom: "Custom",
};

export default function ReminderCard({
  reminder,
  onComplete,
  onEdit,
  onDelete,
  index,
  showApplication = false,
}: ReminderCardProps) {
  const reminderDate = new Date(reminder.reminderDate);
  const isOverdue = isPast(reminderDate) && !reminder.isCompleted;
  const isDueToday = isToday(reminderDate);
  const isDueTomorrow = isTomorrow(reminderDate);

  let dateLabel = format(reminderDate, "MMM dd, yyyy • h:mm a");
  if (isDueToday) dateLabel = `Today • ${format(reminderDate, "h:mm a")}`;
  if (isDueTomorrow) dateLabel = `Tomorrow • ${format(reminderDate, "h:mm a")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      className={`relative border rounded-xl p-4 transition-all duration-200 backdrop-blur-sm ${
        reminder.isCompleted
          ? "bg-card/60 border-border/50 opacity-65"
          : isOverdue
            ? "border-status-danger/40 bg-status-danger-soft/40 shadow-soft"
            : isDueToday
              ? "border-primary/40 bg-brand-soft/50 shadow-soft"
              : "bg-card/90 border-border/60 hover:border-primary/30 hover:shadow-soft-md"
      }`}
    >
      {/* Side status edge */}
      <div
        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
          reminder.isCompleted
            ? "bg-status-success"
            : isOverdue
              ? "bg-status-danger animate-pulse"
              : isDueToday
                ? "bg-primary animate-pulse"
                : "bg-muted-foreground/30"
        }`}
      />

      <div className="flex items-start gap-3.5 pl-2">
        {/* Icon / Action Check */}
        <button
          onClick={() => !reminder.isCompleted && onComplete(reminder.id)}
          disabled={reminder.isCompleted}
          className={`p-2.5 rounded-xl border flex-shrink-0 transition-transform ${
            reminder.isCompleted
              ? "bg-status-success-soft text-status-success border-status-success/30 cursor-default"
              : "hover:scale-105 cursor-pointer " + reminderTypeColors[reminder.type]
          }`}
          title={reminder.isCompleted ? "Completed" : "Click to mark done"}
        >
          {reminder.isCompleted ? (
            <Check className="w-4 h-4" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-sm leading-snug truncate ${
                  reminder.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {reminder.title}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span
                  className={
                    isOverdue && !reminder.isCompleted
                      ? "text-status-danger font-bold"
                      : "font-medium"
                  }
                >
                  {isOverdue && !reminder.isCompleted ? "Overdue • " : ""}
                  {dateLabel}
                </span>
              </div>
            </div>

            {/* Type Badge */}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider flex-shrink-0 ${reminderTypeColors[reminder.type]}`}
            >
              {reminderTypeLabels[reminder.type]}
            </span>
          </div>

          {/* Application Info */}
          {showApplication && reminder.application && (
            <div className="my-2 p-2 rounded-lg bg-muted/40 border border-border/40">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
                <span className="font-bold text-foreground truncate">
                  {reminder.application.company}
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground truncate">
                  {reminder.application.position}
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          {reminder.description && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              {reminder.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            {!reminder.isCompleted ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onComplete(reminder.id)}
                className="gap-1.5 text-xs h-7 px-2.5 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
              >
                <Check className="w-3.5 h-3.5" />
                Mark Done
              </Button>
            ) : (
              <span className="text-[11px] font-semibold text-status-success flex items-center gap-1">
                <Check className="w-3 h-3" /> Completed
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(reminder)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(reminder.id)}
                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
