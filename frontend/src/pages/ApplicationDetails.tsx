import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Users,
  Clock,
  Plus,
  Edit
} from "lucide-react";
import { toast } from "sonner";
import Timeline from "../components/Timeline";
import ContactCard from "../components/ContactCard";
import ActivityModal from "../components/ActivityModal";
import ContactModal from "../components/ContactModal";
import ApplicationModal from "../components/ApplicationModal";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { applicationsApi } from "../api/applications";
import { contactsApi } from "../api/contacts";
import { activitiesApi } from "../api/activities";
import { format } from "date-fns";
import { tagsApi } from "../api/tags";

import type {
  Activity,
  Application,
  Contact,
  CreateActivityDto,
  CreateContactDto,
  UpdateApplicationDto,
} from "../types";
import TimelineSkeleton from "../components/skeletons/TimelineSkeleton";
import ContactCardSkeleton from "../components/skeletons/ContactCardSkeleton";
import EmailGeneratorCard from "../components/EmailGeneratorCard";
import { useConfirm } from "../hooks/useConfirm";
import EmptyState from "../components/EmptyState";

const STATUS_CONFIG = {
  applied: { label: "Applied", variant: "info" as const },
  interview_scheduled: { label: "Interview Scheduled", variant: "purple" as const },
  interviewed: { label: "Interviewed", variant: "info" as const },
  offer: { label: "Offer Received", variant: "success" as const },
  rejected: { label: "Rejected", variant: "danger" as const },
  withdrawn: { label: "Withdrawn", variant: "outline" as const },
};

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const { confirm, ConfirmationDialog } = useConfirm();

  useEffect(() => {
    if (id) {
      fetchApplication();
      fetchContacts();
      fetchActivities();
    }
  }, [id]);

  async function fetchApplication() {
    if (!id) return;
    try {
      setLoading(true);
      const data = await applicationsApi.getOne(id);
      setApplication(data);
    } catch (error) {
      console.error("Failed to fetch application:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  async function fetchContacts() {
    if (!id) return;
    try {
      const data = await contactsApi.getByApplication(id);
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  };

  async function fetchActivities() {
    if (!id) return;
    try {
      const data = await activitiesApi.getByApplication(id);
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    }
  };

  async function handleAddActivity(data: CreateActivityDto) {
    try {
      if (editingActivity) {
        await activitiesApi.update(editingActivity.id, data);
        toast.success("Activity updated successfully!");
      } else {
        await activitiesApi.create(data);
        toast.success("Activity added successfully!");
      }
      setIsActivityModalOpen(false);
      setEditingActivity(null);
      fetchActivities();
    } catch (error) {
      console.error("Failed to save activity:", error);
      toast.error("Failed to save activity");
    }
  };

  async function handleDeleteActivity(activityId: string) {
    const confirmed = await confirm({
      title: "Delete Activity",
      description: "Are you sure you want to delete this activity?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;
    try {
      await activitiesApi.delete(activityId);
      toast.success("Activity deleted successfully!");
      fetchActivities();
    } catch (error) {
      console.error("Failed to delete activity:", error);
      toast.error("Failed to delete activity");
    }
  };

  async function handleAddContact(data: CreateContactDto) {
    try {
      if (editingContact) {
        await contactsApi.update(editingContact.id, data);
        toast.success("Contact updated successfully!");
      } else {
        await contactsApi.create(data);
        toast.success("Contact added successfully!");
      }
      setIsContactModalOpen(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error("Failed to save contact");
    }
  };

  async function handleDeleteContact(contactId: string) {
    const confirmed = await confirm({
      title: "Delete Contact",
      description: "Are you sure you want to delete this contact?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;
    try {
      await contactsApi.delete(contactId);
      toast.success("Contact deleted successfully!");
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  async function handleUpdateApplication(
    data: UpdateApplicationDto,
    selectedTagIds: string[],
  ) {
    if (!id || !application) return;
    try {
      await applicationsApi.update(id, data);

      const currentTagIds = application.tags?.map((t) => t.id) || [];
      const tagsToAdd = selectedTagIds.filter((id) => !currentTagIds.includes(id));
      const tagsToRemove = currentTagIds.filter((id) => !selectedTagIds.includes(id));

      await Promise.all([
        ...tagsToAdd.map((tagId) => tagsApi.addToApplication(id, tagId)),
        ...tagsToRemove.map((tagId) => tagsApi.removeFromApplication(id, tagId)),
      ]);

      toast.success("Application updated successfully!");
      setIsEditModalOpen(false);
      fetchApplication();
    } catch (error) {
      console.error("Failed to update application:", error);
      toast.error("Failed to update application");
    }
  };

  if (!application) return null;

  const statusConfig = STATUS_CONFIG[application.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.applied;

  return (
    <>
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="ui-panel-strong p-6 mb-6"
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 avatar-tile flex items-center justify-center flex-shrink-0 font-bold text-base">
                {application.company.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{application.company}</h1>
                <p className="text-sm text-muted-foreground font-medium">{application.position}</p>
              </div>
            </div>
            <div>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {application.jobUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(application.jobUrl, "_blank")}
                className="gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Posting
              </Button>
            )}
            <Button size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y hairline">
          {application.location && (
            <div className="space-y-1.5">
              <p className="section-label flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Location
              </p>
              <p className="text-sm font-semibold">{application.location}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <p className="section-label flex items-center gap-1.5">
              <Calendar className="w-3 h-3" /> Applied
            </p>
            <p className="text-sm font-semibold">
              {format(new Date(application.appliedDate), "MMM dd, yyyy")}
            </p>
          </div>
          {application.salary && (
            <div className="space-y-1.5">
              <p className="section-label flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Salary
              </p>
              <p className="text-sm font-semibold">
                ${application.salary.toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {application.notes && (
          <div className="mt-4 pt-4 border-t hairline">
            <p className="section-label mb-2">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{application.notes}</p>
          </div>
        )}

        {application.tags && application.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t hairline">
            <p className="section-label mb-2">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {application.tags.map((tag: any) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold text-white tracking-wide"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - 2 columns */}
        <div className="lg:col-span-2">
          <div className="ui-panel p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold">Activity Timeline</h2>
              </div>
              <Button
                onClick={() => {
                  setEditingActivity(null);
                  setIsActivityModalOpen(true);
                }}
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Activity
              </Button>
            </div>
            {loading ? (
              <TimelineSkeleton />
            ) : (
              <Timeline
                activities={activities}
                onEdit={(activity) => {
                  setEditingActivity(activity);
                  setIsActivityModalOpen(true);
                }}
                onDelete={handleDeleteActivity}
              />
            )}
          </div>
          
          {/* Email Generation Section */}
          <div className="mt-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              AI Email Assistant
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <EmailGeneratorCard application={application} type="followUp" />
              <EmailGeneratorCard application={application} type="thankYou" />
            </div>
          </div>
        </div>

        {/* Contacts - 1 column */}
        <div>
          <div className="ui-panel p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-bold">Contacts</h2>
              </div>
              <Button
                onClick={() => {
                  setEditingContact(null);
                  setIsContactModalOpen(true);
                }}
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <ContactCardSkeleton index={0} />
                <ContactCardSkeleton index={1} />
              </div>
            ) : contacts.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={Users}
                  title="No contacts"
                  description="Add recruiters and hiring managers."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact, index) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={(c) => {
                      setEditingContact(c);
                      setIsContactModalOpen(true);
                    }}
                    onDelete={handleDeleteContact}
                    index={index}
                    showApplication={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setEditingActivity(null);
        }}
        onSubmit={handleAddActivity}
        activity={editingActivity}
        applications={application ? [application] : []}
        preSelectedApplicationId={application?.id}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setEditingContact(null);
        }}
        onSubmit={handleAddContact}
        contact={editingContact}
        applications={application ? [application] : []}
        preSelectedApplicationId={application?.id}
      />

      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateApplication}
        application={application}
      />

      <ConfirmationDialog />
    </>
  );
}
