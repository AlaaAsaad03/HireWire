import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, TrendingUp } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { toast } from "sonner";
import type { Application, CreateApplicationDto } from "../types";
import { matchApi } from "../api/match";
import MatchScoreCard from "./MatchScoreCard";
import { tagsApi, type Tag } from "../api/tags";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateApplicationDto, selectedTagsIds: string[]) => void;
  application?: Application | null;
}

export default function ApplicationModal({
  isOpen,
  onClose,
  onSubmit,
  application,
}: ApplicationModalProps) {
  const [formData, setFormData] = useState<CreateApplicationDto>({
    company: "",
    position: "",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "applied",
    location: "",
    salary: undefined,
    jobUrl: "",
    notes: "",
    jobDescription: "",
    resumeVersion: "",
    interviewDate: "", // ⭐ ADD INTERVIEW DATE
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [showMatch, setShowMatch] = useState(false);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const [activeTab, setActiveTab] = useState<"job" | "details" | "additional">(
    "job",
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    try {
      const tags = await tagsApi.getAll();
      setAllTags(tags);
      if (application?.tags) {
        setSelectedTags(application.tags);
      }
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        position: application.position,
        appliedDate: application.appliedDate,
        status: application.status,
        location: application.location || "",
        salary: application.salary,
        jobUrl: application.jobUrl || "",
        notes: application.notes || "",
        jobDescription: application.jobDescription || "",
        resumeVersion: application.resumeVersion || "",
        interviewDate: application.interviewDate || "",
      });
      setSelectedTags(application.tags || []);
      setActiveTab("details");
    } else {
      setFormData({
        company: "",
        position: "",
        appliedDate: new Date().toISOString().split("T")[0],
        status: "applied",
        location: "",
        salary: undefined,
        jobUrl: "",
        notes: "",
        jobDescription: "",
        resumeVersion: "",
        interviewDate: "",
      });
      setSelectedTags([]);
      setActiveTab("job");
    }
    setErrors({});
  }, [application, isOpen]);

  function validateForm() {
    const newErrors: { [key: string]: string } = {};
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.position.trim()) newErrors.position = "Position is required";
    if (!formData.appliedDate)
      newErrors.appliedDate = "Applied date is required";
    if (!formData.status) newErrors.status = "Status is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const dataToSubmit = {
      ...formData,
      interviewDate: formData.interviewDate?.trim()
        ? formData.interviewDate
        : null,
    };

    onSubmit(
      dataToSubmit as CreateApplicationDto,
      selectedTags.map((t) => t.id),
    );
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? (value ? Number(value) : undefined) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  async function handleParseJobDescription() {
    if (!formData.jobDescription?.trim()) {
      toast.error("Please paste the job description first");
      return;
    }
    setAiLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(
        `${apiUrl}/ai/parse-job-description`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            jobDescription: formData.jobDescription,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("AI extraction failed");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        company: data.company || prev.company,
        position: data.position || prev.position,
        location: data.location || prev.location,
        salary: data.salary || prev.salary,
      }));

      toast.success("Job details extracted successfully");
      setActiveTab("details");
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to extract job details");
    } finally {
      setAiLoading(false);
    }
  };

  async function handleCalculateMatch() {
    if (!formData.jobDescription?.trim()) {
      toast.error("Please paste the job description first");
      return;
    }

    setAiLoading(true);
    try {
      const result = await matchApi.calculateMatch(formData.jobDescription);
      setMatchResult(result);
      setShowMatch(true);
      toast.success("Match score calculated");
    } catch (error) {
      console.error("Match calculation error:", error);
      toast.error("Failed to calculate match score");
    } finally {
      setAiLoading(false);
    }
  };

  const tabs = [
    { id: "job" as const, label: "Job Description" },
    { id: "details" as const, label: "Job Details" },
    { id: "additional" as const, label: "Additional Info" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-lg shadow-xl border border-border w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* ========== HEADER ========== */}
              <div className="px-8 py-6 border-b border-border/50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {application ? "Edit Application" : "New Application"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {application
                      ? `Update entry for ${application.company}`
                      : "Create a new job application entry"}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ========== TABS ========== */}
              <div className="border-b border-border/50 bg-secondary/30 px-8 flex gap-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ========== MATCH SCORE ========== */}
              {showMatch && matchResult && (
                <div className="px-8 pt-6">
                  <MatchScoreCard
                    matchScore={matchResult.matchScore}
                    matchingSkills={matchResult.matchingSkills}
                    missingSkills={matchResult.missingSkills}
                    recommendation={matchResult.recommendation}
                  />
                </div>
              )}

              {/* ========== FORM ========== */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* TAB 1: JOB DESCRIPTION */}
                  {activeTab === "job" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Job Description
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Paste the full job description to auto-fill job
                          details
                        </p>
                      </div>

                      <textarea
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleChange}
                        rows={8}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card resize-none"
                        placeholder="Paste job description here..."
                      />

                      {formData.jobDescription && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleParseJobDescription}
                            disabled={aiLoading}
                            className="flex-1 gap-2"
                            size="sm"
                          >
                            {aiLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Extracting...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4" />
                                Auto-fill Details
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCalculateMatch}
                            disabled={aiLoading}
                            variant="outline"
                            className="flex-1 gap-2"
                            size="sm"
                          >
                            {aiLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Calculating...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4" />
                                Calculate Match
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 2: JOB DETAILS */}
                  {activeTab === "details" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Company & Position */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            label="Company"
                            name="company"
                            placeholder="Google"
                            value={formData.company}
                            onChange={handleChange}
                            required
                            error={errors.company}
                          />
                        </div>
                        <div>
                          <Input
                            label="Position"
                            name="position"
                            placeholder="Senior Frontend Developer"
                            value={formData.position}
                            onChange={handleChange}
                            required
                            error={errors.position}
                          />
                        </div>
                      </div>

                      {/* Location & Salary */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Location"
                          name="location"
                          placeholder="San Francisco, CA"
                          value={formData.location}
                          onChange={handleChange}
                        />
                        <Input
                          label="Salary"
                          name="salary"
                          type="number"
                          placeholder="150000"
                          value={formData.salary || ""}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Date & Status */}
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Applied Date"
                          name="appliedDate"
                          type="date"
                          value={formData.appliedDate}
                          onChange={handleChange}
                          required
                          error={errors.appliedDate}
                        />
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
                            required
                          >
                            <option value="applied">Applied</option>
                            <option value="interview_scheduled">
                              Interview Scheduled
                            </option>
                            <option value="interviewed">Interviewed</option>
                            <option value="offer">Offer Received</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </div>
                      </div>

                      {/* ⭐ INTERVIEW DATE FIELD */}
                      {(formData.status === "interview_scheduled" ||
                        formData.status === "interviewed" ||
                        formData.status === "offer") && (
                        <div>
                          <Input
                            label="Interview Date"
                            name="interviewDate"
                            type="date"
                            placeholder="YYYY-MM-DD"
                            value={formData.interviewDate}
                            onChange={handleChange}
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            ⭐ Set this to auto-create interview prep reminder
                            (1 day before)
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* TAB 3: ADDITIONAL INFO */}
                  {activeTab === "additional" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* URLs & Files */}
                      <div className="space-y-4">
                        <Input
                          label="Job Posting URL"
                          name="jobUrl"
                          type="url"
                          placeholder="https://careers.company.com/jobs/12345"
                          value={formData.jobUrl}
                          onChange={handleChange}
                        />
                        <Input
                          label="Resume Version"
                          name="resumeVersion"
                          placeholder="Resume_v2.pdf"
                          value={formData.resumeVersion}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Notes
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          rows={4}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card resize-none"
                          placeholder="Any additional notes about this application..."
                        />
                      </div>

                      {/* Tags */}
                      {allTags.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium mb-3">
                            Tags
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {allTags.map((tag) => (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                  if (
                                    selectedTags.find((t) => t.id === tag.id)
                                  ) {
                                    setSelectedTags(
                                      selectedTags.filter(
                                        (t) => t.id !== tag.id,
                                      ),
                                    );
                                  } else {
                                    setSelectedTags([...selectedTags, tag]);
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedTags.find((t) => t.id === tag.id)
                                    ? "ring-2 ring-offset-2 ring-offset-card shadow-sm"
                                    : "opacity-70 hover:opacity-100"
                                }`}
                                style={{
                                  backgroundColor: tag.color,
                                  color: "white",
                                }}
                              >
                                {tag.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </form>
              </div>

              {/* ========== FOOTER ========== */}
              <div className="border-t border-border/50 bg-secondary/30 px-8 py-4 flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} size="sm">
                  {application ? "Update" : "Create"}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
