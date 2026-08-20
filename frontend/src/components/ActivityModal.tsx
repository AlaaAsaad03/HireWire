import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import type {
  Activity,
  ActivityType,
  Application,
  CreateActivityDto,
} from "../types";

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateActivityDto) => void;
  activity?: Activity | null;
  applications: Application[];
  preSelectedApplicationId?: string;
}

const activityTypeLabels: Record<ActivityType, string> = {
  application_submitted: "Application Submitted",
  email_received: "Email Received",
  email_sent: "Email Sent",
  phone_call_received: "Phone Call Received",
  phone_call_made: "Phone Call Made",
  interview_scheduled: "Interview Scheduled",
  interview_completed: "Interview Completed",
  follow_up_sent: "Follow-up Sent",
  status_changed: "Status Changed",
  note_added: "Note Added",
  other: "Other",
};

export default function ActivityModal({
  isOpen,
  onClose,
  onSubmit,
  activity,
  applications,
  preSelectedApplicationId,
}: ActivityModalProps) {
  const [formData, setFormData] = useState<CreateActivityDto>({
    type: "note_added",
    title: "",
    description: "",
    activityDate: new Date().toISOString().slice(0, 16),
    applicationId: preSelectedApplicationId || "",
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description || "",
        activityDate: new Date(activity.activityDate)
          .toISOString()
          .slice(0, 16),
        applicationId: activity.applicationId,
      });
    } else {
      setFormData({
        type: "note_added",
        title: "",
        description: "",
        activityDate: new Date().toISOString().slice(0, 16),
        applicationId: preSelectedApplicationId || "",
      });
    }
  }, [activity, isOpen, preSelectedApplicationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-2xl font-bold">
                  {activity ? "Edit Activity" : "Add Activity"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Activity Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {Object.entries(activityTypeLabels).map(
                      ([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <Input
                  label="Title *"
                  name="title"
                  placeholder="e.g., Phone call with recruiter"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="activityDate"
                    value={formData.activityDate}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Application *
                  </label>
                  <select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={!!activity}
                  >
                    <option value="">Select an application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company} - {app.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="flex w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Additional details about this activity..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {activity ? "Update Activity" : "Add Activity"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
