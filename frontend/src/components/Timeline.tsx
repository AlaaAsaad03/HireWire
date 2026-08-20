import { motion } from "framer-motion";
import {
  Send,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import type { Activity } from "../types";
import EmptyState from "./EmptyState";

interface TimelineProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void;
}

const activityIcons = {
  application_submitted: Send,
  email_received: Mail,
  email_sent: Mail,
  phone_call_received: Phone,
  phone_call_made: Phone,
  interview_scheduled: Calendar,
  interview_completed: CheckCircle,
  follow_up_sent: Send,
  status_changed: AlertCircle,
  note_added: FileText,
  other: Clock,
};

const activityColors = {
  application_submitted: "bg-status-info-soft text-status-info border-status-info/20",
  email_received: "bg-brand-soft text-primary border-primary/20",
  email_sent: "bg-brand-soft text-primary border-primary/20",
  phone_call_received: "bg-status-success-soft text-status-success border-status-success/20",
  phone_call_made: "bg-status-success-soft text-status-success border-status-success/20",
  interview_scheduled: "bg-status-warning-soft text-status-warning border-status-warning/20",
  interview_completed:
    "bg-status-success-soft text-status-success border-status-success/20",
  follow_up_sent: "bg-status-info-soft text-status-info border-status-info/20",
  status_changed: "bg-status-warning-soft text-status-warning border-status-warning/20",
  note_added: "bg-secondary text-secondary-foreground border-border",
  other: "bg-secondary text-secondary-foreground border-border",
};

export default function Timeline({
  activities,
  onEdit,
  onDelete,
}: TimelineProps) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No activities yet"
        description="Start tracking your interactions by adding your first activity. Record calls, emails, interviews, and notes."
        actionLabel=""
        onAction={() => {}}
      />
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activityIcons[activity.type] || Clock;

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative pl-8 pb-8 last:pb-0"
          >
            {/* Timeline line */}
            {index !== activities.length - 1 && (
              <div className="absolute left-[15px] top-8 w-0.5 h-full bg-border" />
            )}

            {/* Timeline dot */}
            <div
              className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center ${activityColors[activity.type]}`}
            >
              <Icon className="w-4 h-4" />
            </div>

            {/* Content */}
            <div className="ui-panel p-4 hover:shadow-soft-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {activity.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(
                      new Date(activity.activityDate),
                      "MMM dd, yyyy • h:mm a",
                    )}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(activity)}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                  >
                    <Edit className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              {activity.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {activity.description}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
