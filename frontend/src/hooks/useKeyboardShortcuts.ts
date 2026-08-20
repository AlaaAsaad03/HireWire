import { useEffect } from 'react';

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    callback: () => void;
    description: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger shortcuts in input fields (except for special cases)
            const target = e.target as HTMLElement;
            const isInput =
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.contentEditable === 'true';

            for (const shortcut of shortcuts) {
                const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
                const ctrlMatch =
                    shortcut.ctrl === undefined || shortcut.ctrl === (e.ctrlKey || e.metaKey);
                const shiftMatch =
                    shortcut.shift === undefined || shortcut.shift === e.shiftKey;
                const altMatch =
                    shortcut.alt === undefined || shortcut.alt === e.altKey;

                if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                    // Allow shortcuts in inputs for some cases (like Escape)
                    if (isInput && shortcut.key !== 'Escape') {
                        continue;
                    }
                    e.preventDefault();
                    shortcut.callback();
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}

export const GLOBAL_SHORTCUTS: ShortcutConfig[] = [
    {
        key: 'k',
        ctrl: true,
        shift: false,
        alt: false,
        description: 'Quick search / Command palette',
        callback: () => { },
    },
    {
        key: 'n',
        ctrl: true,
        shift: true,  // ⭐ ADD THIS
        alt: false,
        description: 'New application',
        callback: () => { },
    },
    {
        key: '/',
        ctrl: true,
        shift: false,
        alt: false,
        description: 'Show keyboard shortcuts',
        callback: () => { },
    },
    {
        key: 'Escape',
        ctrl: false,
        shift: false,
        alt: false,
        description: 'Close modals / Cancel',
        callback: () => { },
    },
    {
        key: 'd',
        ctrl: false,
        shift: false,
        alt: true,
        description: 'Go to Dashboard',
        callback: () => { },
    },
    {
        key: 'c',
        ctrl: false,
        shift: false,
        alt: true,
        description: 'Go to Contacts',
        callback: () => { },
    },
    {
        key: 'a',
        ctrl: false,
        shift: false,
        alt: true,
        description: 'Go to Analytics',
        callback: () => { },
    },
    {
        key: 's',
        ctrl: false,
        shift: false,
        alt: true,
        description: 'Go to Settings',
        callback: () => { },
    },
];