import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

const AdvancedSearch = ({ onSearch, placeholder = 'Search...', suggestions = [] }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('recentSearches');
        return saved ? JSON.parse(saved) : [];
    });
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (query.length > 0) {
            const filtered = suggestions.filter(item =>
                item.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredSuggestions(filtered.slice(0, 5));
            setIsOpen(true);
        } else {
            setFilteredSuggestions([]);
            setIsOpen(false);
        }
    }, [query, suggestions]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !inputRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery) => {
        if (searchQuery.trim()) {
            // Add to recent searches
            const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
            setRecentSearches(updated);
            localStorage.setItem('recentSearches', JSON.stringify(updated));

            onSearch(searchQuery);
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(query);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-md">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-12 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (filteredSuggestions.length > 0 || recentSearches.length > 0) && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 w-full glass-strong rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden z-50"
                    >
                        {filteredSuggestions.length > 0 && (
                            <div className="p-2">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <TrendingUp className="w-3 h-3" />
                                    Suggestions
                                </div>
                                {filteredSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(suggestion);
                                            handleSearch(suggestion);
                                        }}
                                        className="w-full px-3 py-2 rounded-lg text-left text-white hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}

                        {query === '' && recentSearches.length > 0 && (
                            <div className="p-2 border-t border-slate-700/50">
                                <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <Clock className="w-3 h-3" />
                                    Recent
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(search);
                                            handleSearch(search);
                                        }}
                                        className="w-full px-3 py-2 rounded-lg text-left text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdvancedSearch;
