import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Tag, Loader2 } from "lucide-react";
import Button from "./ui/Button";
import { bulkApi } from "../api/bulk";
import type { Tag as TagType } from "../api/tags";
import { tagsApi } from "../api/tags";
import { toast } from "sonner";

interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  onDelete?: () => void;
  onStatusChange?: () => void;
  onTagChange?: () => void;
}

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function BulkActionsToolbar({
  selectedCount,
  selectedIds,
  onDelete,
  onStatusChange,
  onTagChange,
}: BulkActionsToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tags, setTags] = useState<TagType[]>([]);

  async function handleDelete() {
    if (!window.confirm(`Delete ${selectedCount} applications?`)) return;

    setLoading(true);
    try {
      await bulkApi.deleteMultiple(selectedIds);
      toast.success(`Deleted ${selectedCount} applications!`);
      onDelete?.();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete applications");
    } finally {
      setLoading(false);
    }
  };

  async function handleStatusChange(status: string) {
    setLoading(true);
    try {
      await bulkApi.updateStatus(selectedIds, status);
      toast.success(`Updated status for ${selectedCount} applications!`);
      setShowStatusMenu(false);
      onStatusChange?.();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  async function handleTagClick() {
    if (tags.length === 0) {
      try {
        const allTags = await tagsApi.getAll();
        setTags(allTags);
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    }
    setShowTagMenu(!showTagMenu);
  };

  async function handleAddTag(tagId: string) {
    setLoading(true);
    try {
      await bulkApi.addTag(selectedIds, tagId);
      toast.success(`Added tag to ${selectedCount} applications!`);
      onTagChange?.();
      setShowTagMenu(false);
    } catch (error) {
      console.error("Failed to add tag:", error);
      toast.error("Failed to add tag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="ui-panel-strong p-4 shadow-soft-lg flex items-center gap-4">
            {/* Count */}
            <span className="text-sm font-medium">
              {selectedCount} selected
            </span>

            {/* Divider */}
            <div className="w-px h-6 bg-border" />

            {/* Bulk Add Tag */}
            <div className="relative">
              <Button
                onClick={handleTagClick}
                variant="outline"
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                <Tag className="w-4 h-4" />
                Add Tag
              </Button>

              <AnimatePresence>
                {showTagMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full mb-2 left-0 ui-panel py-1 min-w-[200px]"
                  >
                    {tags.length === 0 ? (
                      <p className="px-4 py-2 text-xs text-muted-foreground">
                        No tags yet
                      </p>
                    ) : (
                      tags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.id)}
                          className="w-full text-left px-4 py-2 hover:bg-secondary text-sm transition-colors flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bulk Status Change */}
            <div className="relative">
              <Button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                variant="outline"
                size="sm"
                disabled={loading}
                className="gap-2"
              >
                Status
              </Button>

              <AnimatePresence>
                {showStatusMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute bottom-full mb-2 left-0 ui-panel py-1 min-w-[200px]"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleStatusChange(option.value)}
                        className="w-full text-left px-4 py-2 hover:bg-secondary text-sm transition-colors"
                      >
                        {option.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delete Button */}
            <Button
              onClick={handleDelete}
              variant="danger"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
