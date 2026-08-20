import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Button from "./ui/Button";

interface AiAssistantButtonProps {
  onClick: () => void;
  variant?: "default" | "floating";
}

export default function AiAssistantButton({
  onClick,
  variant = "default",
}: AiAssistantButtonProps) {
  if (variant === "floating") {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClick}
          className="relative p-4 bg-primary text-primary-foreground rounded-lg shadow-soft-lg hover:shadow-primary/25 transition-all group"
        >
          <Sparkles className="w-6 h-6" />

          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-lg bg-primary animate-ping opacity-20" />

          {/* Tooltip */}
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-foreground text-background text-sm rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            AI Assistant
          </span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <Button
      onClick={onClick}
      className="gap-2"
    >
      <Sparkles className="w-4 h-4" />
      AI Assistant
    </Button>
  );
}
