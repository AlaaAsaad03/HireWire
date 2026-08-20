import type { FilterOptions } from '../components/AdvancedFilters';
import type { Application } from '../types';

export function filterApplications(
    applications: Application[],
    filters: FilterOptions,
): Application[] {
    return applications.filter((app) => {
        // Search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesSearch =
                app.company.toLowerCase().includes(query) ||
                app.position.toLowerCase().includes(query) ||
                (app.notes && app.notes.toLowerCase().includes(query));

            if (!matchesSearch) return false;
        }

        // Status filter
        if (filters.status.length > 0 && !filters.status.includes(app.status)) {
            return false;
        }

        // Company filter
        if (
            filters.company &&
            !app.company.toLowerCase().includes(filters.company.toLowerCase())
        ) {
            return false;
        }

        // Location filter
        if (
            filters.location &&
            !app.location?.toLowerCase().includes(filters.location.toLowerCase())
        ) {
            return false;
        }

        // Salary range filter
        if (filters.salaryMin && app.salary && app.salary < filters.salaryMin) {
            return false;
        }

        if (filters.salaryMax && app.salary && app.salary > filters.salaryMax) {
            return false;
        }

        // Date range filter
        if (filters.dateFrom) {
            const appDate = new Date(app.appliedDate);
            const fromDate = new Date(filters.dateFrom);
            if (appDate < fromDate) return false;
        }

        if (filters.dateTo) {
            const appDate = new Date(app.appliedDate);
            const toDate = new Date(filters.dateTo);
            if (appDate > toDate) return false;
        }

        // Tags filter
        if (filters.tags.length > 0) {
            const appTagIds = (app.tags || []).map((t) => t.id);
            const hasAllTags = filters.tags.every((tagId) =>
                appTagIds.includes(tagId),
            );
            if (!hasAllTags) return false;
        }

        return true;
    });
}