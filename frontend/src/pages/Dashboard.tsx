import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Briefcase,
  Calendar,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import ApplicationCard from "../components/ApplicationCard";
import ApplicationModal from "../components/ApplicationModal";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { applicationsApi } from "../api/applications";
import type {
  Application,
  ApplicationStats,
  CreateApplicationDto,
  CreateReminderDto,
  Reminder,
} from "../types";
import { contactsApi } from "../api/contacts";
import { toast } from "sonner";

import { remindersApi } from "../api/reminders";
import ReminderModal from "../components/ReminderModal";

import { useConfirm } from "../hooks/useConfirm";
import EmptyState from "../components/EmptyState";
import WelcomeScreen from "../components/WelcomeScreen";
import AiAssistantButton from "../components/AiAssistantButton";
import AiAssistantModal from "../components/AiAssistantModal";
import { tagsApi, type Tag } from "../api/tags";

import { useBulkSelection } from "../hooks/useBulkSelection";
import BulkActionsToolbar from "../components/BulkActionsToolbar";
import AdvancedFilters, {
  type FilterOptions,
} from "../components/AdvancedFilters";
import { filterApplications } from "../utils/filterApplications";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import ShortcutsModal from "../components/ShortcutsModal";
import CommandPalette from "../components/CommandPalette";
import RemindersWidget from "../components/RemindersWidget";
import StatsCardSkeleton from "../components/skeletons/StatsCardSkeleton";
import ApplicationCardSkeleton from "../components/skeletons/ApplicationCardSkeleton";

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [pendingReminders, setPendingReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Reminder[]>([]);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: [],
    company: "",
    location: "",
    salaryMin: null,
    salaryMax: null,
    tags: [],
    dateFrom: "",
    dateTo: "",
  });
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const { confirm, ConfirmationDialog } = useConfirm();
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      callback: () => setShowCommandPalette(true),
      description: "Command palette",
    },
    {
      key: "n",
      ctrl: true,
      shift: true,
      callback: () => setIsModalOpen(true),
      description: "New application",
    },
    {
      key: "/",
      ctrl: true,
      callback: () => setShowShortcutsModal(true),
      description: "Show shortcuts",
    },
    {
      key: "Escape",
      callback: () => {
        setIsModalOpen(false);
        setShowCommandPalette(false);
        setShowShortcutsModal(false);
      },
      description: "Close modal",
    },
  ]);

  const bulkSelection = useBulkSelection();

  useEffect(() => {
    async function fetchTags() {
      try {
        const tags = await tagsApi.getAll();
        setAllTags(tags);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };

    fetchTags();
  }, []);

  async function fetchReminders() {
    try {
      const allReminders = await remindersApi.getAll();
      const pending = allReminders.filter((r) => !r.isCompleted);
      const completed = allReminders.filter((r) => r.isCompleted);
      setPendingReminders(pending);
      setCompletedReminders(completed);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const data = await applicationsApi.getAll();

      const applicationsWithContacts = await Promise.all(
        data.map(async (app) => {
          try {
            const contacts = await contactsApi.getByApplication(app.id);
            return { ...app, contacts };
          } catch {
            return { ...app, contacts: [] };
          }
        }),
      );

      setApplications(applicationsWithContacts);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    } finally {
      setLoading(false);
    }
  };

  async function fetchStats() {
    try {
      const data = await applicationsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  async function handleAddApplication(
    data: CreateApplicationDto,
    selectedTagIds: string[],
  ) {
    try {
      let app: Application;
      if (editingApplication) {
        app = await applicationsApi.update(editingApplication.id, data);

        const currentTagIds = editingApplication.tags?.map((t) => t.id) || [];
        const tagsToAdd = selectedTagIds.filter(
          (id) => !currentTagIds.includes(id),
        );
        const tagsToRemove = currentTagIds.filter(
          (id) => !selectedTagIds.includes(id),
        );

        await Promise.all([
          ...tagsToAdd.map((tagId) =>
            tagsApi.addToApplication(editingApplication.id, tagId),
          ),
          ...tagsToRemove.map((tagId) =>
            tagsApi.removeFromApplication(editingApplication.id, tagId),
          ),
        ]);

        toast.success("Application updated successfully!");
      } else {
        app = await applicationsApi.create(data);

        await Promise.all(
          selectedTagIds.map((tagId) =>
            tagsApi.addToApplication(app.id, tagId),
          ),
        );

        toast.success("Application created successfully!");
      }
      setIsModalOpen(false);
      setEditingApplication(null);
      fetchApplications();
      fetchStats();
    } catch (error: any) {
      console.error("Failed to save application:", error);
      toast.error(
        error.response?.data?.message || "Failed to save application",
      );
    }
  };

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Application",
      description:
        "Are you sure you want to delete this application? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;
    try {
      await applicationsApi.delete(id);
      toast.success("Application deleted successfully!");
      fetchApplications();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete application:", error);
      toast.error("Failed to delete application");
    }
  };

  async function handleAddReminder(data: CreateReminderDto) {
    try {
      if (editingReminder) {
        await remindersApi.update(editingReminder.id, data);
        toast.success("Reminder updated successfully!");
      } else {
        await remindersApi.create(data);
        toast.success("Reminder created successfully!");
      }
      setIsReminderModalOpen(false);
      setEditingReminder(null);
    } catch (error) {
      console.error("Failed to save reminder:", error);
      toast.error("Failed to save reminder");
    }
  };

  async function handleCompleteReminder(id: string) {
    try {
      await remindersApi.markComplete(id);
      toast.success("Reminder marked as complete!");
      fetchReminders();
    } catch (error) {
      console.error("Failed to complete reminder:", error);
      toast.error("Failed to complete reminder");
    }
  };

  async function handleDeleteReminder(id: string) {
    const confirmed = await confirm({
      title: "Delete Reminder",
      description: "Are you sure you want to delete this reminder?",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;
    try {
      await remindersApi.delete(id);
      toast.success("Reminder deleted successfully!");
      fetchReminders();
    } catch (error) {
      console.error("Failed to delete reminder:", error);
      toast.error("Failed to delete reminder");
    }
  };

  const handleEdit = (application: Application) => {
    setEditingApplication(application);
    setIsModalOpen(true);
  };

  const filteredApplications = filterApplications(applications, advancedFilters);

  return (
    <>
      {/* Header */}
      <PageHeader
        title="Job Applications"
        description="Track and manage your job hunt"
        actions={
          <Button
            onClick={() => {
              setEditingApplication(null);
              setIsModalOpen(true);
            }}
            size="md"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </Button>
        }
      />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <p className="section-label mb-3.5 flex items-center gap-1.5">
          <LayoutGrid className="w-3 h-3" />
          Overview
        </p>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCardSkeleton delay={0} />
            <StatsCardSkeleton delay={0.05} />
            <StatsCardSkeleton delay={0.1} />
            <StatsCardSkeleton delay={0.15} />
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Total Applications"
                value={stats.total}
                icon={Briefcase}
                color="bg-brand-soft text-primary border-primary/20"
                delay={0}
              />
              <StatsCard
                title="Interviews"
                value={stats.interviewScheduled + stats.interviewed}
                icon={Calendar}
                color="bg-status-info-soft text-status-info border-status-info/20"
                delay={0.05}
              />
              <StatsCard
                title="Offers"
                value={stats.offers}
                icon={CheckCircle}
                color="bg-status-success-soft text-status-success border-status-success/20"
                delay={0.1}
              />
              <StatsCard
                title="Rejected"
                value={stats.rejected}
                icon={XCircle}
                color="bg-status-danger-soft text-status-danger border-status-danger/20"
                delay={0.15}
              />
            </div>
          )
        )}
      </motion.div>

      {/* Reminders */}
      <RemindersWidget
        pendingReminders={pendingReminders}
        completedReminders={completedReminders}
        onAddReminder={() => {
          setEditingReminder(null);
          setIsReminderModalOpen(true);
        }}
        onCompleteReminder={handleCompleteReminder}
        onEditReminder={(r) => {
          setEditingReminder(r);
          setIsReminderModalOpen(true);
        }}
        onDeleteReminder={handleDeleteReminder}
      />

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <p className="section-label mb-3.5">
          Search & Filter
        </p>
        <div className="ui-panel p-4">
          <AdvancedFilters
            onFilterChange={setAdvancedFilters}
            tags={allTags}
          />
        </div>
      </motion.div>

      {/* Bulk Actions */}
      {bulkSelection.selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-brand-soft/80 border border-primary/20 rounded-lg flex items-center gap-3"
        >
          <input
            type="checkbox"
            checked={
              bulkSelection.selectedCount === filteredApplications.length
            }
            onChange={() => bulkSelection.toggleAll(filteredApplications)}
            className="w-4 h-4 rounded border-border cursor-pointer"
          />
          <span className="text-xs font-medium flex-1">
            {bulkSelection.selectedCount === filteredApplications.length
              ? `All ${filteredApplications.length} selected`
              : `${bulkSelection.selectedCount} of ${filteredApplications.length} selected`}
          </span>
        </motion.div>
      )}

      {/* Applications */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        {filteredApplications.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <p className="section-label">
              Applications ({filteredApplications.length})
            </p>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border/60 bg-muted/30">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Horizontal List View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2.5"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ApplicationCardSkeleton key={i} index={i - 1} />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <WelcomeScreen onGetStarted={() => setIsModalOpen(true)} />
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No matching applications"
            description="Try adjusting your search or filters to find what you're looking for."
            actionLabel="Clear Filters"
            onAction={() =>
              setAdvancedFilters({
                searchQuery: "",
                status: [],
                company: "",
                location: "",
                salaryMin: null,
                salaryMax: null,
                tags: [],
                dateFrom: "",
                dateTo: "",
              })
            }
            secondaryActionLabel="Add Application"
            onSecondaryAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2.5"}>
            {filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onEdit={handleEdit}
                onDelete={handleDelete}
                index={index}
                isSelected={bulkSelection.isSelected(application.id)}
                onSelect={() => bulkSelection.toggleSelect(application.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* AI Assistant */}
      <AiAssistantButton
        variant="floating"
        onClick={() => setIsAiModalOpen(true)}
      />

      <AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        applications={applications}
      />

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={bulkSelection.selectedCount}
        selectedIds={bulkSelection.selectedIds}
        onDelete={() => {
          bulkSelection.deselectAll();
          fetchApplications();
          fetchStats();
        }}
        onStatusChange={() => {
          bulkSelection.deselectAll();
          fetchApplications();
          fetchStats();
        }}
        onTagChange={() => {
          bulkSelection.deselectAll();
          fetchApplications();
          fetchStats();
        }}
      />

      {/* Modals */}
      <ApplicationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApplication(null);
        }}
        onSubmit={handleAddApplication}
        application={editingApplication}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setEditingReminder(null);
        }}
        onSubmit={handleAddReminder}
        reminder={editingReminder}
        applications={applications}
      />

      <ConfirmationDialog />
      <ShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNewApplication={() => {
          setIsModalOpen(true);
          setShowCommandPalette(false);
        }}
      />
    </>
  );
}
