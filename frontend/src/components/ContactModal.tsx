import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import type { Application, Contact, CreateContactDto } from "../types";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateContactDto) => void;
  contact?: Contact | null;
  applications: Application[];
  preSelectedApplicationId?: string;
}

export default function ContactModal({
  isOpen,
  onClose,
  onSubmit,
  contact,
  applications,
  preSelectedApplicationId,
}: ContactModalProps) {
  const [formData, setFormData] = useState<CreateContactDto>({
    name: "",
    email: "",
    phone: "",
    role: "recruiter",
    notes: "",
    applicationId: preSelectedApplicationId || "",
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email || "",
        phone: contact.phone || "",
        role: contact.role,
        notes: contact.notes || "",
        applicationId: contact.applicationId,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "recruiter",
        notes: "",
        applicationId: preSelectedApplicationId || "",
      });
    }
  }, [contact, isOpen, preSelectedApplicationId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                <h2 className="text-2xl font-bold">
                  {contact ? "Edit Contact" : "Add New Contact"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <Input
                  label="Name *"
                  name="name"
                  placeholder="Sarah Johnson"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="sarah@company.com"
                  value={formData.email}
                  onChange={handleChange}
                />

                <Input
                  label="Phone"
                  name="phone"
                  type="tel"
                  placeholder="+1-555-0123"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Role *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="recruiter">Recruiter</option>
                    <option value="hiring_manager">Hiring Manager</option>
                    <option value="hr">HR</option>
                    <option value="team_member">Team Member</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Application *
                  </label>
                  <select
                    name="applicationId"
                    value={formData.applicationId}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={!!contact}
                  >
                    <option value="">Select an application</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.company} - {app.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="flex w-full rounded-lg border border-border bg-background px-4 py-2 text-base transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Initial contact via LinkedIn..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {contact ? "Update Contact" : "Add Contact"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
