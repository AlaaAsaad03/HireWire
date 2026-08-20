import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  ChevronDown,
  CheckCircle2,
  Clock,
  Zap,
} from "lucide-react";
import Button from "../components/ui/Button";
import ReminderCard from "../components/ReminderCard";
import type { Reminder } from "../types";

interface RemindersWidgetProps {
  pendingReminders: Reminder[];
  completedReminders: Reminder[];
  onAddReminder: () => void;
  onCompleteReminder: (id: string) => void;
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersWidget({
  pendingReminders,
  completedReminders,
  onAddReminder,
  onCompleteReminder,
  onEditReminder,
  onDeleteReminder,
}: RemindersWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending",
  );

  const totalReminders = pendingReminders.length + completedReminders.length;
  const completionRate =
    totalReminders > 0
      ? Math.round((completedReminders.length / totalReminders) * 100)
      : 0;

  const stats = [
    {
      label: "Pending",
      value: pendingReminders.length,
      icon: Clock,
      color: "text-status-warning bg-status-warning-soft",
      borderColor: "border-status-warning/20",
    },
    {
      label: "Completed",
      value: completedReminders.length,
      icon: CheckCircle2,
      color: "text-status-success bg-status-success-soft",
      borderColor: "border-status-success/20",
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: Zap,
      color: "text-status-info bg-status-info-soft",
      borderColor: "border-status-info/20",
    },
  ];

  const allReminders =
    activeTab === "pending" ? pendingReminders : completedReminders;
  const hasReminders = totalReminders > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-12"
    >
      {/* ============ HEADER (ALWAYS VISIBLE) ============ */}
      <div
        className="rounded-t-lg border border-border/70 bg-card/88 px-6 py-5 cursor-pointer hover:bg-secondary/50 transition-colors backdrop-blur-sm"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          {/* Left: Icon + Title + Badge */}
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-lg transition-colors ${
                pendingReminders.length > 0
                  ? "bg-status-warning-soft text-status-warning"
                  : "bg-primary/10 text-primary"
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Reminders & Actions
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {pendingReminders.length === 0
                  ? "No pending reminders"
                  : `${pendingReminders.length} action${pendingReminders.length !== 1 ? "s" : ""} required`}
              </p>
            </div>

            {/* Badge for pending count */}
            {pendingReminders.length > 0 && (
              <div className="ml-2 px-3 py-1 rounded-md bg-status-warning-soft border border-status-warning/25">
                <span className="text-xs font-semibold text-status-warning">
                  {pendingReminders.length}
                </span>
              </div>
            )}
          </div>

          {/* Right: Collapse + Add Button */}
          <div className="flex items-center gap-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAddReminder();
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>

            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ============ EXPANDED CONTENT WITH FIXED HEIGHT & SCROLL ============ */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-t-0 border-border/70 bg-card/60 rounded-b-lg overflow-hidden backdrop-blur-sm"
          >
            {/* ⭐ FIXED HEIGHT WITH SCROLL */}
            <div className="px-6 py-6 space-y-6 max-h-[600px] overflow-y-auto">
              {/* STATS ROW */}
              {hasReminders && (
                <div className="grid grid-cols-3 gap-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className={`p-4 rounded-lg border ${stat.borderColor} ${stat.color}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {stat.label}
                          </span>
                          <Icon className="w-4 h-4 opacity-50" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TABS */}
              {hasReminders && (
                <div className="flex gap-4 border-b hairline">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "pending"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Pending ({pendingReminders.length})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("completed")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "completed"
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed ({completedReminders.length})
                    </span>
                  </button>
                </div>
              )}

              {/* CONTENT */}
              {allReminders.length === 0 ? (
                <div className="text-center py-12">
                  {pendingReminders.length === 0 &&
                  completedReminders.length === 0 ? (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-lg bg-primary/10">
                          <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No Reminders Yet
                      </h3>
                      <p className="text-muted-foreground text-sm mb-6">
                        Create your first reminder to stay on top of your job
                        search.
                      </p>
                      <Button
                        onClick={onAddReminder}
                        size="sm"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Reminder
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-lg bg-primary/10">
                          <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        All Caught Up!
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        No {activeTab === "pending" ? "pending" : "completed"}{" "}
                        reminders.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {allReminders.map((reminder, index) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onComplete={onCompleteReminder}
                      onEdit={onEditReminder}
                      onDelete={onDeleteReminder}
                      index={index}
                      showApplication={true}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ CUSTOM SCROLLBAR STYLES ============ */}
      <style>{`
        .max-h-\\[600px\\]::-webkit-scrollbar {
          width: 8px;
        }
        .max-h-\\[600px\\]::-webkit-scrollbar-track {
          background: transparent;
        }
        .max-h-\\[600px\\]::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 4px;
        }
        .max-h-\\[600px\\]::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--border) / 0.8);
        }
      `}</style>
    </motion.div>
  );
}
