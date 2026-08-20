import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";

interface MatchScoreCardProps {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  recommendation: string;
}

export default function MatchScoreCard({
  matchScore,
  matchingSkills,
  missingSkills,
  recommendation,
}: MatchScoreCardProps) {
  // Determine score color & styling
  let scoreColor = "text-status-danger";
  let scoreBorder = "border-status-danger/30";
  let scoreBg = "bg-status-danger-soft/40";
  let scoreGradient = "from-red-500 to-rose-400";

  if (matchScore >= 80) {
    scoreColor = "text-status-success";
    scoreBorder = "border-status-success/30";
    scoreBg = "bg-status-success-soft/40";
    scoreGradient = "from-emerald-500 to-teal-400";
  } else if (matchScore >= 60) {
    scoreColor = "text-status-warning";
    scoreBorder = "border-status-warning/30";
    scoreBg = "bg-status-warning-soft/40";
    scoreGradient = "from-amber-500 to-yellow-400";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-border/60 ${scoreBg} p-6 backdrop-blur-sm shadow-soft`}
    >
      {/* Score Header */}
      <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-card border border-border/60 shadow-xs">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground leading-tight">Job Match Analysis</h3>
            <p className="text-xs text-muted-foreground mt-0.5">AI powered resume vs job compatibility score</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border ${scoreBorder} bg-card shadow-xs text-right`}>
            <span className={`text-3xl font-black tabular-nums tracking-tight ${scoreColor}`}>
              {matchScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden mb-5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${scoreGradient} transition-all duration-700`}
          style={{ width: `${matchScore}%` }}
        />
      </div>

      {/* Recommendation */}
      <p className="text-xs leading-relaxed text-foreground/90 font-medium mb-6 p-3 rounded-lg bg-card/60 border border-border/40">
        {recommendation}
      </p>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <h4 className="text-[11px] font-bold text-status-success uppercase tracking-wider">
                Matching Skills ({matchingSkills.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2.5 py-1 bg-status-success-soft text-status-success rounded-md border border-status-success/20 font-semibold"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-status-warning" />
              <h4 className="text-[11px] font-bold text-status-warning uppercase tracking-wider">
                Missing Skills ({missingSkills.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2.5 py-1 bg-status-warning-soft text-status-warning rounded-md border border-status-warning/20 font-semibold"
                >
                  ○ {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
