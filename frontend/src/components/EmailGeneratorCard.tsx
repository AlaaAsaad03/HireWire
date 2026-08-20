import { useMemo, useState } from "react";
import type { Application } from "../types";
import {
  aiApi,
  type EmailLength,
  type EmailTone,
  type GeneratedEmailResponse,
} from "../api/ai";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import { Copy, Loader2, Mail, RefreshCw, Sparkles, Check } from "lucide-react";

interface EmailGeneratorCardProps {
  application: Application;
  type: "followUp" | "thankYou";
}

const toneOptions: { value: EmailTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "concise", label: "Concise" },
];

const lengthOptions: { value: EmailLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "detailed", label: "Detailed" },
];

export default function EmailGeneratorCard({
  application,
  type,
}: EmailGeneratorCardProps) {
  const [email, setEmail] = useState<GeneratedEmailResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState<EmailTone>("professional");
  const [length, setLength] = useState<EmailLength>("medium");
  const [contactName, setContactName] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [highlights, setHighlights] = useState("");
  const [extraContext, setExtraContext] = useState("");
  const [nextStep] = useState("");
  const [interviewDate, setInterviewDate] = useState(
    application.interviewDate || new Date().toISOString().split("T")[0],
  );
  const [keyTopics, setKeyTopics] = useState("");

  const contactOptions = useMemo(
    () => application.contacts?.filter((contact) => contact.name) || [],
    [application.contacts],
  );

  const isFollowUp = type === "followUp";
  const title = isFollowUp ? "Follow-up Email Assistant" : "Thank You Email Assistant";
  const description = isFollowUp
    ? "Generate a polished follow-up message tailored to your application."
    : "Send an executive thank you note after your interview.";

  async function handleGenerateEmail() {
    if (!isFollowUp && !interviewDate) {
      toast.error("Please enter the interview date");
      return;
    }

    setLoading(true);
    try {
      const shared = {
        company: application.company,
        position: application.position,
        contactName: contactName || undefined,
        tone,
        length,
        candidateName: candidateName || undefined,
        highlights: highlights || undefined,
        extraContext: extraContext || undefined,
        nextStep: nextStep || undefined,
        jobDescription: application.jobDescription || undefined,
      };

      const result = isFollowUp
        ? await aiApi.generateFollowUp({
            ...shared,
            appliedDate: application.appliedDate,
          })
        : await aiApi.generateThankYou({
            ...shared,
            interviewerName: contactName || undefined,
            interviewDate,
            keyTopics: keyTopics || undefined,
          });

      setEmail(result);
      toast.success(
        result.provider === "openai"
          ? "AI email generated!"
          : "Email generated with smart template fallback.",
      );
    } catch (error) {
      console.error("Failed to generate email:", error);
      toast.error("Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!email) return;
    navigator.clipboard.writeText(email.email);
    setCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-soft"
    >
      <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-border/40">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-soft text-primary border border-primary/20 shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-tight">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>
        {email && (
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary border border-primary/20 bg-brand-soft rounded-md px-2.5 py-1">
            {email.provider}
          </span>
        )}
      </div>

      <div className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-foreground/90">
            Tone
            <select
              value={tone}
              onChange={(event) => setTone(event.target.value as EmailTone)}
              className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold text-foreground/90">
            Length
            <select
              value={length}
              onChange={(event) => setLength(event.target.value as EmailLength)}
              className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
            >
              {lengthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="text-xs font-semibold text-foreground/90">
            Recipient
            <input
              type="text"
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
              list={`contacts-${application.id}-${type}`}
              className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              placeholder="Hiring manager or recruiter"
            />
            <datalist id={`contacts-${application.id}-${type}`}>
              {contactOptions.map((contact) => (
                <option key={contact.id} value={contact.name} />
              ))}
            </datalist>
          </label>

          <label className="text-xs font-semibold text-foreground/90">
            Your Sign-off Name
            <input
              type="text"
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              placeholder="Your full name"
            />
          </label>
        </div>

        {!isFollowUp && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold text-foreground/90">
              Interview date
              <input
                type="date"
                value={interviewDate}
                onChange={(event) => setInterviewDate(event.target.value)}
                className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
              />
            </label>

            <label className="text-xs font-semibold text-foreground/90">
              Topics discussed
              <input
                type="text"
                value={keyTopics}
                onChange={(event) => setKeyTopics(event.target.value)}
                className="mt-1 w-full h-9 rounded-lg border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
                placeholder="Team goals, architecture, etc."
              />
            </label>
          </div>
        )}

        <label className="text-xs font-semibold text-foreground/90 block">
          Highlights
          <textarea
            value={highlights}
            onChange={(event) => setHighlights(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium leading-relaxed"
            placeholder="Key skills, projects, or experience to emphasize"
          />
        </label>

        <label className="text-xs font-semibold text-foreground/90 block">
          Extra context
          <textarea
            value={extraContext}
            onChange={(event) => setExtraContext(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium leading-relaxed"
            placeholder="Any specific note or detail to include"
          />
        </label>

        <Button
          onClick={handleGenerateEmail}
          disabled={loading}
          className="w-full gap-2 py-2.5 rounded-lg shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Email...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              {email ? "Regenerate Email" : "Generate Draft"}
            </>
          )}
        </Button>
      </div>

      {email && (
        <div className="mt-5 space-y-3 pt-4 border-t border-border/40">
          <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden shadow-inner">
            <div className="px-4 py-2.5 border-b border-border/40 bg-background/80 flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Subject Line
              </p>
              <span className="text-xs font-semibold text-foreground truncate max-w-[280px]">
                {email.subject}
              </span>
            </div>
            <div className="p-4 min-h-[160px] max-h-[320px] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-foreground font-normal">
              {email.body}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex-1 gap-2 text-xs h-9 rounded-lg"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied to Clipboard" : "Copy Email"}
            </Button>
            <Button
              onClick={handleGenerateEmail}
              variant="outline"
              className="flex-1 gap-2 text-xs h-9 rounded-lg"
              disabled={loading}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
