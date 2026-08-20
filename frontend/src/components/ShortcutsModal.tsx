import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GLOBAL_SHORTCUTS } from "../hooks/useKeyboardShortcuts";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({
  isOpen,
  onClose,
}: ShortcutsModalProps) {
  const getShortcutDisplay = (
    shortcut: (typeof GLOBAL_SHORTCUTS)[0],
  ): string => {
    const parts = [];
    if (shortcut.ctrl) parts.push("Ctrl");
    if (shortcut.shift) parts.push("Shift");
    if (shortcut.alt) parts.push("Alt");
    if (shortcut.key && shortcut.key !== "Escape") {
      parts.push(shortcut.key.toUpperCase());
    } else if (shortcut.key === "Escape") {
      parts.push("ESC");
    }
    return parts.join(" + ");
  };

  const appShortcuts = GLOBAL_SHORTCUTS.slice(0, 4);
  const navShortcuts = GLOBAL_SHORTCUTS.slice(4);

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

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-lg"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* CONTENT */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Application Shortcuts */}
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">
                    Application
                  </h3>
                  <div className="space-y-2">
                    {appShortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2.5 py-1 text-xs font-semibold bg-secondary border border-border rounded">
                          {getShortcutDisplay(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Shortcuts */}
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-3">
                    Navigation
                  </h3>
                  <div className="space-y-2">
                    {navShortcuts.map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded hover:bg-secondary/50 transition-colors"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.description}
                        </span>
                        <kbd className="px-2.5 py-1 text-xs font-semibold bg-secondary border border-border rounded">
                          {getShortcutDisplay(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-secondary/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Tip:</strong> Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs bg-secondary border border-border rounded">
                      Ctrl + /
                    </kbd>{" "}
                    anytime to see this again.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
