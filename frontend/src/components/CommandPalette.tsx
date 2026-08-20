import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Command {
  id: string;
  label: string;
  description: string;
  action: () => void;
  category: string;
  icon?: React.ReactNode;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNewApplication: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNewApplication,
}: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: Command[] = [
    {
      id: "new-app",
      label: "New Application",
      description: "Create a new job application • Ctrl+Shift+N",
      action: onNewApplication,
      category: "Application",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Go to main dashboard",
      action: () => {
        navigate("/dashboard");
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "contacts",
      label: "Contacts",
      description: "View all contacts",
      action: () => {
        navigate("/contacts");
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "analytics",
      label: "Analytics",
      description: "View analytics dashboard",
      action: () => {
        navigate("/analytics");
        onClose();
      },
      category: "Navigation",
    },
    {
      id: "settings",
      label: "Settings",
      description: "Go to settings",
      action: () => {
        navigate("/settings");
        onClose();
      },
      category: "Navigation",
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      filteredCommands[selectedIndex]?.action();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-md overflow-hidden"
            >
              {/* SEARCH INPUT */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search commands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-secondary rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* COMMANDS LIST */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors border-b border-border last:border-0 ${
                        idx === selectedIndex
                          ? "bg-primary/10 text-foreground"
                          : "hover:bg-secondary/50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {cmd.description}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {cmd.category}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No commands found
                  </div>
                )}
              </div>

              {/* FOOTER HELP */}
              <div className="px-4 py-2 border-t border-border bg-secondary/30 text-xs text-muted-foreground flex items-center justify-between">
                <div className="flex gap-2">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                    ↑↓
                  </kbd>
                  <span>to navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded ml-2">
                    Enter
                  </kbd>
                  <span>to select</span>
                </div>
                <kbd className="px-1.5 py-0.5 bg-background border border-border rounded">
                  Esc
                </kbd>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
