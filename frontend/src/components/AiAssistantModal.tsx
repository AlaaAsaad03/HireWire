import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, FileText, Briefcase, Mail, Loader2 } from "lucide-react";
import Button from "./ui/Button";
import { aiApi, type EmailLength, type EmailTone } from "../api/ai";
import { toast } from "sonner";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeDataExtracted?: (data: any) => void;
  applications?: any[];
}

type AiTool = "resume" | "job" | "email" | null;

export default function AiAssistantModal({
  isOpen,
  onClose,
  onResumeDataExtracted,
  applications = [],
}: AiAssistantModalProps) {
  const [selectedTool, setSelectedTool] = useState<AiTool>(null);
  const [loading, setLoading] = useState(false);

  // Resume Parser State
  const [resumeText, setResumeText] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);

  // Job Analyzer State
  const [jobDescription, setJobDescription] = useState("");
  const [userSkills, setUserSkills] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState<any>(null);

  // Email Generator State
  const [emailType, setEmailType] = useState<"followup" | "thankyou">(
    "followup",
  );
  const [selectedApp, setSelectedApp] = useState("");
  const [contactName, setContactName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [emailTone, setEmailTone] = useState<EmailTone>("professional");
  const [emailLength, setEmailLength] = useState<EmailLength>("medium");
  const [interviewDate, setInterviewDate] = useState("");
  const [keyTopics, setKeyTopics] = useState("");
  const [highlights, setHighlights] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [generatedSubject, setGeneratedSubject] = useState("");
  const [emailProvider, setEmailProvider] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");

  async function handleParseResume() {
    if (!resumeText.trim()) {
      toast.error("Please paste your resume text");
      return;
    }

    setLoading(true);
    try {
      const data = await aiApi.parseResume(resumeText);
      setParsedData(data);
      toast.success("Resume parsed successfully!");

      if (onResumeDataExtracted) {
        onResumeDataExtracted(data);
      }
    } catch (error) {
      toast.error("Failed to parse resume");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleAnalyzeJob() {
    if (!jobDescription.trim()) {
      toast.error("Please paste the job description");
      return;
    }

    const skills = userSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) {
      toast.error("Please enter your skills");
      return;
    }

    setLoading(true);
    try {
      const analysis = await aiApi.analyzeJob(jobDescription, skills);
      setJobAnalysis(analysis);
      toast.success("Job analyzed successfully!");
    } catch (error) {
      toast.error("Failed to analyze job");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  async function handleGenerateEmail() {
    if (!selectedApp) {
      toast.error("Please select an application");
      return;
    }

    const app = applications.find((a) => a.id === selectedApp);
    if (!app) return;

    setLoading(true);
    try {
      let result;
      if (emailType === "followup") {
        result = await aiApi.generateFollowUp({
          company: app.company,
          position: app.position,
          appliedDate: app.appliedDate,
          contactName: contactName || undefined,
          candidateName: candidateName || undefined,
          tone: emailTone,
          length: emailLength,
          highlights: highlights || undefined,
          extraContext: extraContext || undefined,
          nextStep: nextStep || undefined,
          jobDescription: app.jobDescription || undefined,
        });
      } else {
        if (!interviewDate) {
          toast.error("Please enter interview date");
          setLoading(false);
          return;
        }
        result = await aiApi.generateThankYou({
          company: app.company,
          position: app.position,
          interviewerName: contactName || undefined,
          interviewDate,
          keyTopics: keyTopics || undefined,
          candidateName: candidateName || undefined,
          tone: emailTone,
          length: emailLength,
          highlights: highlights || undefined,
          extraContext: extraContext || undefined,
          nextStep: nextStep || undefined,
          jobDescription: app.jobDescription || undefined,
        });
      }
      setGeneratedSubject(result.subject || "");
      setGeneratedEmail(result.body || result.email);
      setEmailProvider(result.provider || "");
      toast.success("Email generated successfully!");
    } catch (error) {
      toast.error("Failed to generate email");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function resetState() {
    setSelectedTool(null);
    setResumeText("");
    setParsedData(null);
    setJobDescription("");
    setUserSkills("");
    setJobAnalysis(null);
    setSelectedApp("");
    setContactName("");
    setCandidateName("");
    setEmailTone("professional");
    setEmailLength("medium");
    setInterviewDate("");
    setKeyTopics("");
    setHighlights("");
    setExtraContext("");
    setNextStep("");
    setGeneratedSubject("");
    setEmailProvider("");
    setGeneratedEmail("");
  };

  function handleClose() {
    resetState();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border bg-brand-soft/70 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Assistant</h2>
                    <p className="text-sm text-muted-foreground">
                      Powered by free AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto">
                {!selectedTool ? (
                  // Tool Selection
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setSelectedTool("resume")}
                      className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <FileText className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Parse Resume</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload your resume and auto-extract info
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedTool("job")}
                      className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <Briefcase className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Analyze Job</h3>
                      <p className="text-sm text-muted-foreground">
                        Get match score and insights on job postings
                      </p>
                    </button>

                    <button
                      onClick={() => setSelectedTool("email")}
                      className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                    >
                      <Mail className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">Generate Email</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-powered follow-ups and thank-you notes
                      </p>
                    </button>
                  </div>
                ) : selectedTool === "resume" ? (
                  // Resume Parser
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTool(null)}
                    >
                      ← Back
                    </Button>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Paste Your Resume Text
                      </label>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={10}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Paste your resume text here (you can copy from PDF/Word)..."
                      />
                    </div>

                    <Button
                      onClick={handleParseResume}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Parse Resume
                        </>
                      )}
                    </Button>

                    {parsedData && (
                      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <h4 className="font-semibold mb-2">
                          Extracted Information:
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <strong>Name:</strong> {parsedData.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {parsedData.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {parsedData.phone}
                          </p>
                          <p>
                            <strong>Skills:</strong>{" "}
                            {parsedData.skills?.join(", ")}
                          </p>
                          {parsedData.experience?.length > 0 && (
                            <div>
                              <strong>Experience:</strong>
                              {parsedData.experience.map(
                                (exp: any, i: number) => (
                                  <div key={i} className="ml-4 mt-1">
                                    • {exp.company} - {exp.position}
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedTool === "job" ? (
                  // Job Analyzer
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTool(null)}
                    >
                      ← Back
                    </Button>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Skills (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={userSkills}
                        onChange={(e) => setUserSkills(e.target.value)}
                        className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="React, TypeScript, Node.js, PostgreSQL..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Job Description
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={10}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Paste the job description here..."
                      />
                    </div>

                    <Button
                      onClick={handleAnalyzeJob}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze Job Match
                        </>
                      )}
                    </Button>

                    {jobAnalysis && (
                      <div className="mt-4 space-y-4">
                        {/* Match Score */}
                        <div className="p-6 bg-brand-soft/70 border border-primary/20 rounded-lg">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-primary mb-2">
                              {jobAnalysis.matchScore}%
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Match Score
                            </p>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 ui-panel">
                            <h5 className="font-semibold mb-2 text-green-600">
                              Matching Skills
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {jobAnalysis.matchingSkills?.map(
                                (skill: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-status-success-soft text-status-success rounded-md text-xs"
                                  >
                                    {skill}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>

                          <div className="p-4 ui-panel">
                            <h5 className="font-semibold mb-2 text-orange-600">
                              Missing Skills
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {jobAnalysis.missingSkills?.map(
                                (skill: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded text-xs"
                                  >
                                    {skill}
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="p-4 bg-status-info-soft/55 border border-status-info/20 rounded-lg">
                          <h5 className="font-semibold mb-2">
                            💡 Recommendations
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            {jobAnalysis.recommendations}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Email Generator
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTool(null)}
                    >
                      ← Back
                    </Button>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Email Type
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEmailType("followup")}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            emailType === "followup"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          Follow-up Email
                        </button>
                        <button
                          onClick={() => setEmailType("thankyou")}
                          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                            emailType === "thankyou"
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          Thank You Email
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Select Application
                      </label>
                      <select
                        value={selectedApp}
                        onChange={(e) => setSelectedApp(e.target.value)}
                        className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Choose an application...</option>
                        {applications.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.company} - {app.position}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {emailType === "followup"
                          ? "Contact Name (optional)"
                          : "Interviewer Name (optional)"}
                      </label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Sarah Johnson"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Tone
                        </label>
                        <select
                          value={emailTone}
                          onChange={(e) =>
                            setEmailTone(e.target.value as EmailTone)
                          }
                          className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="professional">Professional</option>
                          <option value="warm">Warm</option>
                          <option value="enthusiastic">Enthusiastic</option>
                          <option value="concise">Concise</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Length
                        </label>
                        <select
                          value={emailLength}
                          onChange={(e) =>
                            setEmailLength(e.target.value as EmailLength)
                          }
                          className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="short">Short</option>
                          <option value="medium">Medium</option>
                          <option value="detailed">Detailed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Optional"
                        />
                      </div>
                    </div>

                    {emailType === "thankyou" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Interview Date
                          </label>
                          <input
                            type="date"
                            value={interviewDate}
                            onChange={(e) => setInterviewDate(e.target.value)}
                            className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Key Topics Discussed (optional)
                          </label>
                          <input
                            type="text"
                            value={keyTopics}
                            onChange={(e) => setKeyTopics(e.target.value)}
                            className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="React architecture, team collaboration..."
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Highlights (optional)
                      </label>
                      <textarea
                        value={highlights}
                        onChange={(e) => setHighlights(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Skills, projects, or experience to mention..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Extra Context (optional)
                      </label>
                      <textarea
                        value={extraContext}
                        onChange={(e) => setExtraContext(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Anything specific you want included..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Next Step (optional)
                      </label>
                      <input
                        type="text"
                        value={nextStep}
                        onChange={(e) => setNextStep(e.target.value)}
                        className="w-full h-11 rounded-lg border border-border bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="hearing about next steps"
                      />
                    </div>

                    <Button
                      onClick={handleGenerateEmail}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Email
                        </>
                      )}
                    </Button>

                    {generatedEmail && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <label className="text-sm font-medium">
                              Generated Email:
                            </label>
                            {emailProvider && (
                              <p className="text-xs text-muted-foreground">
                                Source: {emailProvider}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                generatedSubject
                                  ? `Subject: ${generatedSubject}\n\n${generatedEmail}`
                                  : generatedEmail,
                              );
                              toast.success("Email copied to clipboard!");
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        {generatedSubject && (
                          <div className="p-3 bg-background border border-border rounded-lg rounded-b-none text-sm font-medium">
                            Subject: {generatedSubject}
                          </div>
                        )}
                        <div className="p-4 bg-muted rounded-lg border border-border whitespace-pre-wrap text-sm">
                          {generatedEmail}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
