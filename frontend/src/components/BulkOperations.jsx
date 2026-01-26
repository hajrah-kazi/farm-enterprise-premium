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
        { id: 'delete', label: 'Delete', icon: Trash2, color: 'rose' },
        { id: 'export', label: 'Export', icon: Download, color: 'blue' },
        { id: 'edit', label: 'Edit', icon: Edit, color: 'emerald' },
    ];

    const availableActions = actions.length > 0 ? actions : defaultActions;

    const colorMap = {
        rose: 'text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 hover:border-rose-500/30',
        blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30',
        emerald: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30',
        indigo: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30',
    };

    return (
        <div className="space-y-6">
            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="glass-panel rounded-[2rem] p-6 border-indigo-500/30 shadow-3xl bg-black/40 backdrop-blur-3xl"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-8">
                                <span className="text-white font-black text-[11px] uppercase tracking-[0.3em] leading-none">
                                    {selectedItems.size} Entity Selection active
                                </span>
                                <div className="h-6 w-px bg-white/5" />
                                <div className="flex items-center gap-3">
                                    {availableActions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleBulkAction(action.id)}
                                            className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-500 text-[10px] font-black uppercase tracking-widest ${colorMap[action.color] || colorMap.indigo}`}
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
                                className="p-3 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-all duration-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Select All Checkbox */}
            <div className="flex items-center gap-4 px-6 py-4 glass-panel rounded-[1.5rem] border-white/5 bg-white/[0.01]">
                <button
                    onClick={toggleAll}
                    className="flex items-center gap-3 text-zinc-500 hover:text-white transition-all duration-500 group"
                >
                    {selectedItems.size === items.length && items.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                    ) : (
                        <Square className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                        {selectedItems.size === items.length && items.length > 0 ? 'Deselect Global Node' : 'Select Global Node'}
                    </span>
                </button>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                    ({items.length} TOTAL SEQUENCES)
                </span>
            </div>

            {/* Items List */}
            <div className="space-y-4">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        initial={false}
                        animate={{
                            backgroundColor: selectedItems.has(item.id) ? 'rgba(99, 102, 241, 0.05)' : 'rgba(255, 255, 255, 0.01)',
                            borderColor: selectedItems.has(item.id) ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                        }}
                        className={`flex items-center gap-6 p-6 rounded-[2rem] border transition-all cursor-pointer group hover:bg-white/[0.03] shadow-lg`}
                        onClick={() => toggleItem(item.id)}
                    >
                        <div className="shrink-0">
                            {selectedItems.has(item.id) ? (
                                <CheckSquare className="w-6 h-6 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]" />
                            ) : (
                                <Square className="w-6 h-6 text-zinc-800 transition-colors group-hover:text-zinc-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            {item.render ? item.render() : (
                                <span className="text-white font-bold tracking-tight text-lg">{item.label || item.name}</span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


export default BulkOperations;
