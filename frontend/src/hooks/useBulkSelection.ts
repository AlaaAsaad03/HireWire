import { useState } from 'react';

export function useBulkSelection<T extends { id: string }>() {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const selectAll = (items: T[]) => {
        setSelectedIds(new Set(items.map(item => item.id)));
    };

    function deselectAll() {
        setSelectedIds(new Set());
    };

    const toggleAll = (items: T[]) => {
        if (selectedIds.size === items.length) {
            deselectAll();
        } else {
            selectAll(items);
        }
    };

    const isSelected = (id: string) => selectedIds.has(id);

    return {
        selectedIds: Array.from(selectedIds),
        selectedCount: selectedIds.size,
        toggleSelect,
        selectAll,
        deselectAll,
        toggleAll,
        isSelected,
    };
}