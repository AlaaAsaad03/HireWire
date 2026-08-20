import { motion } from "framer-motion";
import { User, Mail, Phone, Edit, Trash2, Building2 } from "lucide-react";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import type { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  index: number;
  showApplication?: boolean;
}

const roleConfig = {
  recruiter: { label: "Recruiter", variant: "info" as const },
  hiring_manager: { label: "Hiring Manager", variant: "purple" as const },
  hr: { label: "HR", variant: "success" as const },
  team_member: { label: "Team Member", variant: "warning" as const },
  other: { label: "Other", variant: "outline" as const },
};

export default function ContactCard({
  contact,
  onEdit,
  onDelete,
  index,
  showApplication = false,
}: ContactCardProps) {
  const role = roleConfig[contact.role] || roleConfig.other;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      className="group rounded-xl border border-border/60 bg-card/90 backdrop-blur-sm hover:-translate-y-1 hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 flex flex-col h-full overflow-hidden"
    >
      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-soft border border-primary/20 text-primary flex items-center justify-center text-sm font-extrabold flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              {contact.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {contact.name}
              </h3>
              <Badge variant={role.variant} dot className="mt-1.5 text-xs">
                {role.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Application Info */}
        {showApplication && contact.application && (
          <div className="mb-4 p-2.5 rounded-lg bg-muted/40 border border-border/40">
            <div className="flex items-center gap-2 text-xs">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
              <div className="flex-1 min-w-0 flex items-center gap-1.5 truncate">
                <span className="font-bold text-foreground truncate">{contact.application.company}</span>
                <span className="text-muted-foreground/50">•</span>
                <span className="text-muted-foreground truncate">{contact.application.position}</span>
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}
        <div className="space-y-2 mb-4">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all group/link"
            >
              <Mail className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/link:text-primary flex-shrink-0" />
              <span className="truncate font-medium">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all group/link"
            >
              <Phone className="w-3.5 h-3.5 text-muted-foreground/70 group-hover/link:text-primary flex-shrink-0" />
              <span className="font-medium">{contact.phone}</span>
            </a>
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="pt-3 border-t border-border/40">
            <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 italic">
              "{contact.notes}"
            </p>
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="px-4 py-2.5 bg-muted/20 border-t border-border/40 flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(contact)}
          className="flex-1 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
        >
          <Edit className="w-3 h-3" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(contact.id)}
          className="text-muted-foreground/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-lg"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}
