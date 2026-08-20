import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import Button from "./ui/Button";
import { tagsApi, type Tag } from "../api/tags";
import { toast } from "sonner";

interface TagManagerProps {
  onTagsChange?: () => void;
}

const PRESET_COLORS = [
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#06b6d4", // cyan
  "#f97316", // orange
];

export default function TagManager({ onTagsChange }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const data = await tagsApi.getAll();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  async function handleCreateTag() {
    if (!tagName.trim()) {
      toast.error("Please enter a tag name");
      return;
    }

    setLoading(true);
    try {
      await tagsApi.create(tagName, tagColor);
      toast.success("Tag created!");
      setTagName("");
      setTagColor(PRESET_COLORS[0]);
      setShowForm(false);
      fetchTags();
      onTagsChange?.();
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setLoading(false);
    }
  };

  async function handleDeleteTag(id: string) {
    try {
      await tagsApi.delete(id);
      toast.success("Tag deleted!");
      fetchTags();
      onTagsChange?.();
    } catch (error) {
      console.error("Failed to delete tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Tags ({tags.length})</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="gap-2"
        >
          <Plus className="w-3 h-3" />
          New Tag
        </Button>
      </div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-secondary rounded-lg"
          >
            <input
              type="text"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="Tag name (e.g., 'Dream Company')"
              className="w-full h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Color
              </p>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTagColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      tagColor === color
                        ? "ring-2 ring-offset-2 ring-offset-card ring-foreground"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateTag}
                disabled={loading}
                size="sm"
                className="flex-1"
              >
                Create
              </Button>
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No tags yet. Create one to organize your applications!
          </p>
        ) : (
          tags.map((tag) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm font-medium">{tag.name}</span>
              </div>
              <button
                onClick={() => handleDeleteTag(tag.id)}
                className="p-1 rounded hover:bg-destructive/20 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4 text-destructive" />
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
