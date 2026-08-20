import { motion } from "framer-motion";
import { Briefcase, Users, Clock, Bell, TrendingUp } from "lucide-react";
import Button from "./ui/Button";
import Logo from "./ui/Logo";

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  const capabilities = [
    {
      icon: Briefcase,
      title: "Pipeline Ledger",
      description: "Manage applications in a high-fidelity workspace with real-time logs.",
    },
    {
      icon: Users,
      title: "Recruiter Directory",
      description: "Consolidate contacts, references, and recruiter correspondence history.",
    },
    {
      icon: Clock,
      title: "Correspondence Logs",
      description: "Track dates, times, and methods of interview interaction points.",
    },
    {
      icon: Bell,
      title: "Smart Reminders",
      description: "Automate thank-you note queues and follow-up prompts.",
    },
    {
      icon: TrendingUp,
      title: "Velocity Analytics",
      description: "Gain structural insights on application status ratios and cycle times.",
    },
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 relative overflow-hidden bg-grid-pattern rounded border border-border/60 bg-card">
      <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-12">
        
        {/* Brand/Typography Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex justify-center"
          >
            <Logo size="lg" />
          </motion.div>

          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-3xl sm:text-4xl font-light tracking-tight text-foreground"
            >
              Welcome to the <span className="font-semibold">HireWire Workspace</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-xs text-muted-foreground uppercase tracking-widest max-w-lg mx-auto"
            >
              The premium command center for your professional recruitment lifecycle.
            </motion.p>
          </div>
        </div>

        {/* Structured Capabilities Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left"
        >
          {capabilities.map((item, idx) => (
            <div
              key={idx}
              className="p-4 border border-border/80 bg-background/50 rounded-sm flex items-start gap-3.5 hover:border-foreground/20 transition-all"
            >
              <div className="p-2 bg-secondary text-foreground rounded-sm">
                <item.icon className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-foreground">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Deploy Workspace Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-center"
        >
          <Button
            onClick={onGetStarted}
            className="h-10 px-8 text-xs font-bold uppercase tracking-wider bg-foreground text-background hover:bg-foreground/90 border-0 rounded-sm shadow-none transition-all"
          >
            Deploy Workspace
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
