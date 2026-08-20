import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";
import ContactCard from "../components/ContactCard";
import ContactModal from "../components/ContactModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import PageHeader from "../components/ui/PageHeader";
import { contactsApi } from "../api/contacts";
import { applicationsApi } from "../api/applications";
import type { Application, Contact, CreateContactDto } from "../types";
import { toast } from "sonner";
import ContactCardSkeleton from "../components/skeletons/ContactCardSkeleton";
import { useConfirm } from "../hooks/useConfirm";
import EmptyState from "../components/EmptyState";

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const { confirm, ConfirmationDialog } = useConfirm();

  useEffect(() => {
    fetchContacts();
    fetchApplications();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  async function fetchContacts() {
    try {
      setLoading(true);
      const data = await contactsApi.getAll();
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  async function fetchApplications() {
    try {
      const data = await applicationsApi.getAll();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
    }
  };

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    try {
      const results = await contactsApi.search(query);
      setFilteredContacts(results);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  async function handleAddContact(data: CreateContactDto) {
    try {
      if (editingContact) {
        await contactsApi.update(editingContact.id, data);
        toast.success("Contact updated successfully!");
      } else {
        await contactsApi.create(data);
        toast.success("Contact created successfully!");
      }
      setIsModalOpen(false);
      setEditingContact(null);
      fetchContacts();
    } catch (error) {
      console.error("Failed to save contact:", error);
      toast.error("Failed to save contact");
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  async function handleDelete(id: string) {
    const confirmed = await confirm({
      title: "Delete Contact",
      description:
        "Are you sure you want to delete this contact? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await contactsApi.delete(id);
      toast.success("Contact deleted successfully!");
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  return (
    <>
      <PageHeader
        title="Contacts"
        description="Manage your recruiters and hiring managers"
        actions={
          <Button
            onClick={() => {
              setEditingContact(null);
              setIsModalOpen(true);
            }}
            size="md"
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        }
      />

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </motion.div>

      {/* Contacts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ContactCardSkeleton key={i} index={i - 1} />
          ))}
        </div>
      ) : filteredContacts.length === 0 ? (
        searchQuery ? (
          <EmptyState
            icon={Users}
            title="No contacts found"
            description={`We couldn't find any contacts matching "${searchQuery}". Try a different search term or add a new contact.`}
            actionLabel="Clear Search"
            onAction={() => setSearchQuery("")}
            secondaryActionLabel="Add Contact"
            onSecondaryAction={() => setIsModalOpen(true)}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Start building your network by adding recruiters, hiring managers, and other contacts."
            actionLabel="Add Your First Contact"
            onAction={() => setIsModalOpen(true)}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={handleDelete}
              index={index}
              showApplication={true}
            />
          ))}
        </div>
      )}

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }}
        onSubmit={handleAddContact}
        contact={editingContact}
        applications={applications}
      />
      <ConfirmationDialog />
    </>
  );
}
