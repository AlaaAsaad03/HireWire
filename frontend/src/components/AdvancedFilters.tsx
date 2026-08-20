import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import Button from "./ui/Button";
import { type Tag } from "../api/tags";

export interface FilterOptions {
  searchQuery: string;
  status: string[];
  company: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[];
  dateFrom: string;
  dateTo: string;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  tags: Tag[];
}

const STATUS_OPTIONS = [
  { value: "applied", label: "Applied" },
  { value: "interview_scheduled", label: "Interview Scheduled" },
  { value: "interviewed", label: "Interviewed" },
  { value: "offer", label: "Offer" },
  { value: "rejected", label: "Rejected" },
];

export default function AdvancedFilters({
  onFilterChange,
  tags,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: [],
    company: "",
    location: "",
    salaryMin: null,
    salaryMax: null,
    tags: [],
    dateFrom: "",
    dateTo: "",
  });

  const activeFilterCount = [
    filters.searchQuery,
    filters.company,
    filters.location,
    filters.salaryMin,
    filters.salaryMax,
    filters.dateFrom,
    filters.dateTo,
    ...filters.status,
    ...filters.tags,
  ].filter(Boolean).length;

  const handleSearchChange = (query: string) => {
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tagId: string) => {
    const newTags = filters.tags.includes(tagId)
      ? filters.tags.filter((t) => t !== tagId)
      : [...filters.tags, tagId];
    const newFilters = { ...filters, tags: newTags };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  function handleApplyFilters() {
    onFilterChange(filters);
    setIsOpen(false);
  };

  function handleClearFilters() {
    const newFilters: FilterOptions = {
      searchQuery: "",
      status: [],
      company: "",
      location: "",
      salaryMin: null,
      salaryMax: null,
      tags: [],
      dateFrom: "",
      dateTo: "",
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by company, position, or notes..."
          className="w-full h-10 rounded-lg border border-border bg-background px-10 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Filter Button */}
      <div className="flex gap-2">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="ui-panel p-6 space-y-6"
          >
            {/* Status Filter */}
            <div>
              <h3 className="font-semibold mb-3">Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusToggle(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      filters.status.includes(status.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Company</label>
              <input
                type="text"
                value={filters.company}
                onChange={(e) => {
                  const newFilters = { ...filters, company: e.target.value };
                  setFilters(newFilters);
                }}
                placeholder="e.g., Google, Microsoft..."
                className="w-full h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => {
                  const newFilters = { ...filters, location: e.target.value };
                  setFilters(newFilters);
                }}
                placeholder="e.g., New York, Remote..."
                className="w-full h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Salary Range Filter */}
            <div>
              <h3 className="font-semibold mb-3">Salary Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  value={filters.salaryMin ?? ""}
                  onChange={(e) => {
                    const newFilters = {
                      ...filters,
                      salaryMin: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    };
                    setFilters(newFilters);
                  }}
                  placeholder="Min ($)"
                  className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={filters.salaryMax ?? ""}
                  onChange={(e) => {
                    const newFilters = {
                      ...filters,
                      salaryMax: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    };
                    setFilters(newFilters);
                  }}
                  placeholder="Max ($)"
                  className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <h3 className="font-semibold mb-3">Applied Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    const newFilters = { ...filters, dateFrom: e.target.value };
                    setFilters(newFilters);
                  }}
                  className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => {
                    const newFilters = { ...filters, dateTo: e.target.value };
                    setFilters(newFilters);
                  }}
                  className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                        filters.tags.includes(tag.id)
                          ? "bg-primary/20 border border-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                      {filters.tags.includes(tag.id) && (
                        <span className="ml-auto text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t hairline">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
