import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import Button from "./ui/Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmDialogProps) {
  const variantStyles = {
    danger: "text-destructive",
    warning: "text-orange-500",
    info: "text-primary",
  };

  function handleConfirm() {
    onConfirm();
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 pb-4">
                <div
                  className={`p-3 rounded-full bg-${variant === "danger" ? "destructive" : variant === "warning" ? "orange-500" : "primary"}/10`}
                >
                  <AlertTriangle
                    className={`w-6 h-6 ${variantStyles[variant]}`}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{title}</h2>
                  <p className="text-muted-foreground text-sm">{description}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 p-6 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  {cancelText}
                </Button>
                <Button
                  type="button"
                  variant={variant === "danger" ? "danger" : "primary"}
                  onClick={handleConfirm}
                  className="flex-1"
                >
                  {confirmText}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
