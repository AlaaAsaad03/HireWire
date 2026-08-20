import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, X, Save } from "lucide-react";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import { matchApi } from "../api/match";
import { toast } from "sonner";

export default function Skills() {
  const [skills, setSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  async function fetchSkills() {
    try {
      setLoading(true);
      const data = await matchApi.getUserSkills();
      setSkills(data.skills || []);
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      toast.error("Failed to load your skills");
    } finally {
      setLoading(false);
    }
  };

  function handleAddSkill() {
    if (!inputValue.trim()) {
      toast.error("Please enter a skill");
      return;
    }

    if (skills.includes(inputValue.trim())) {
      toast.error("This skill is already added");
      return;
    }

    setSkills([...skills, inputValue.trim()]);
    setInputValue("");
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  async function handleSaveSkills() {
    try {
      setSaving(true);
      await matchApi.updateUserSkills(skills);
      toast.success("Skills saved successfully!");
    } catch (error) {
      console.error("Failed to save skills:", error);
      toast.error("Failed to save skills");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddSkill();
    }
  };

  return (
    <>
      <PageHeader
        title="Your Skills"
        description="Add your skills to see job match scores"
      />

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="ui-panel-muted p-5 mb-6"
      >
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">
          <span className="text-primary font-bold mr-1.5">💡 How it works:</span> 
          Add your technical skills below. When you paste a job description, we'll automatically calculate how well you match the role and show you which skills you already have vs. need to learn.
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="ui-panel-strong p-6"
      >
        {/* Add Skill Input */}
        <div className="mb-8">
          <label className="block section-label mb-2.5">
            Add a Skill
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., React, TypeScript, Node.js..."
              className="flex-1 h-9 rounded-md border border-border bg-background px-3 py-1.5 text-sm transition-colors placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <Button onClick={handleAddSkill} className="gap-1.5" size="md">
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>
        </div>

        {/* Skills Grid */}
        <div className="mb-8">
          <p className="section-label mb-3.5">
            Your Skills ({skills.length})
          </p>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-9 bg-muted rounded-md skeleton-shimmer"
                />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-10">
              <div className="p-3 bg-muted rounded-lg w-fit mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No skills added yet. Add your first skill above!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between bg-brand-soft border border-primary/15 rounded-md px-3 py-1.5 group hover:border-primary/30 transition-colors"
                >
                  <span className="text-sm font-medium">{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(index)}
                    className="p-0.5 rounded hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Suggested Skills */}
        {skills.length < 10 && (
          <div className="mb-8 p-4 ui-panel-muted">
            <p className="section-label mb-3">
              Popular skills to add
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "JavaScript", "TypeScript", "React", "Node.js", "Python",
                "AWS", "Docker", "PostgreSQL", "Git", "Agile",
              ].map(
                (skill) =>
                  !skills.includes(skill) && (
                    <button
                      key={skill}
                      onClick={() => setSkills([...skills, skill])}
                      className="text-xs px-2.5 py-1 bg-background border border-border rounded-md hover:border-primary/30 hover:bg-brand-soft transition-colors"
                    >
                      + {skill}
                    </button>
                  ),
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        {skills.length > 0 && (
          <Button
            onClick={handleSaveSkills}
            loading={saving}
            className="w-full gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Skills
          </Button>
        )}
      </motion.div>
    </>
  );
}
