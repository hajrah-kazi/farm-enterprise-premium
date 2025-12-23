import { useEffect } from 'react';

/**
 * Keyboard Shortcuts Hook
 * Provides power user keyboard navigation
 */

export const useKeyboardShortcuts = (shortcuts) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey || event.metaKey;
            const shift = event.shiftKey;
            const alt = event.altKey;

            // Build shortcut string
            let shortcut = '';
            if (ctrl) shortcut += 'ctrl+';
            if (shift) shortcut += 'shift+';
            if (alt) shortcut += 'alt+';
            shortcut += key;

            // Check if shortcut exists
            if (shortcuts[shortcut]) {
                event.preventDefault();
                shortcuts[shortcut]();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
};

/**
 * Default Application Shortcuts
 */
export const getDefaultShortcuts = (setActiveTab, addToast) => ({
    // Navigation
    'ctrl+1': () => setActiveTab('dashboard'),
    'ctrl+2': () => setActiveTab('livestock'),
    'ctrl+3': () => setActiveTab('analytics'),
    'ctrl+4': () => setActiveTab('predictions'),
    'ctrl+5': () => setActiveTab('upload'),
    'ctrl+6': () => setActiveTab('live'),
    'ctrl+7': () => setActiveTab('alerts'),
    'ctrl+8': () => setActiveTab('reports'),
    'ctrl+9': () => setActiveTab('settings'),

    // Actions
    'ctrl+n': () => addToast?.('New item shortcut', 'info'),
    'ctrl+s': () => addToast?.('Save shortcut', 'success'),
    'ctrl+p': () => window.print(),
    'ctrl+f': () => document.querySelector('input[type="text"]')?.focus(),

    // Help
    'ctrl+/': () => addToast?.('Keyboard shortcuts: Ctrl+1-9 for navigation, Ctrl+N for new, Ctrl+S to save', 'info'),
    '?': () => addToast?.('Press Ctrl+/ for keyboard shortcuts help', 'info'),
});

/**
 * Keyboard Shortcuts Help Modal Component
 */
export const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { keys: 'Ctrl + 1-9', description: 'Navigate between tabs' },
        { keys: 'Ctrl + N', description: 'Create new item' },
        { keys: 'Ctrl + S', description: 'Save current form' },
        { keys: 'Ctrl + P', description: 'Print current page' },
        { keys: 'Ctrl + F', description: 'Focus search' },
        { keys: 'Ctrl + /', description: 'Show this help' },
        { keys: 'Esc', description: 'Close modals' },
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="glass-strong rounded-3xl p-8 max-w-2xl w-full mx-4 border border-slate-700/50">
                <h2 className="text-2xl font-black text-white mb-6">Keyboard Shortcuts</h2>
                <div className="space-y-3">
                    {shortcuts.map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
                            <span className="text-slate-300">{shortcut.description}</span>
                            <kbd className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm">
                                {shortcut.keys}
                            </kbd>
                        </div>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full btn-primary"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
};
