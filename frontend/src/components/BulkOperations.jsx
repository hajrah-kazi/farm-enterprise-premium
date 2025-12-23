import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Square, Trash2, Edit, Download, Upload, X } from 'lucide-react';

const BulkOperations = ({ items, onBulkAction, actions = [] }) => {
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [showActions, setShowActions] = useState(false);

    const toggleItem = (id) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
        setShowActions(newSelected.size > 0);
    };

    const toggleAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set());
            setShowActions(false);
        } else {
            setSelectedItems(new Set(items.map(item => item.id)));
            setShowActions(true);
        }
    };

    const handleBulkAction = (action) => {
        const selectedIds = Array.from(selectedItems);
        onBulkAction(action, selectedIds);
        setSelectedItems(new Set());
        setShowActions(false);
    };

    const defaultActions = [
        { id: 'delete', label: 'Delete', icon: Trash2, color: 'red' },
        { id: 'export', label: 'Export', icon: Download, color: 'blue' },
        { id: 'edit', label: 'Edit', icon: Edit, color: 'emerald' },
    ];

    const availableActions = actions.length > 0 ? actions : defaultActions;

    return (
        <div className="space-y-4">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="glass-strong rounded-2xl p-4 border border-emerald-500/30 shadow-xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-white font-bold">
                                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                                </span>
                                <div className="h-6 w-px bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    {availableActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleBulkAction(action.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-${action.color}-500/10 border border-${action.color}-500/20 text-${action.color}-400 hover:bg-${action.color}-500/20 transition-all font-semibold`}
                                        >
                                            <action.icon className="w-4 h-4" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedItems(new Set());
                                    setShowActions(false);
                                }}
                                className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 px-4 py-2 glass-strong rounded-xl border border-slate-700/50">
                <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                    {selectedItems.size === items.length && items.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <Square className="w-5 h-5" />
                    )}
                    <span className="text-sm font-semibold">
                        {selectedItems.size === items.length && items.length > 0 ? 'Deselect All' : 'Select All'}
                    </span>
                </button>
                <span className="text-xs text-slate-500">
                    ({items.length} total items)
                </span>
            </div>

            {/* Items List */}
            <div className="space-y-2">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${selectedItems.has(item.id)
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'glass-strong border-slate-700/50 hover:border-slate-600'
                            }`}
                        onClick={() => toggleItem(item.id)}
                    >
                        <div className="shrink-0">
                            {selectedItems.has(item.id) ? (
                                <CheckSquare className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <Square className="w-5 h-5 text-slate-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            {item.render ? item.render() : (
                                <span className="text-white font-medium">{item.label || item.name}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BulkOperations;
