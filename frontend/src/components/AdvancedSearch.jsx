import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';

const AdvancedSearch = ({ onSearch, placeholder = 'Search Neural Database...', suggestions = [] }) => {
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
        <div className="relative w-full">
            <div className="relative group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-indigo-400 group-focus-within:scale-110 transition-all duration-500" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-14 pr-12 py-4 rounded-[1.5rem] border focus:outline-none transition-all duration-500 backdrop-blur-3xl font-medium tracking-tight"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-all duration-500"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (filteredSuggestions.length > 0 || (query === '' && recentSearches.length > 0)) && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full mt-4 w-full rounded-[2rem] border shadow-3xl overflow-hidden z-[100] backdrop-blur-3xl"
                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-medium)' }}
                    >
                        {filteredSuggestions.length > 0 && (
                            <div className="p-3">
                                <div className="flex items-center gap-3 px-4 py-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mb-1">
                                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                                    Neural Suggestions
                                </div>
                                {filteredSuggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(suggestion);
                                            handleSearch(suggestion);
                                        }}
                                        className="w-full px-4 py-3.5 rounded-xl text-left hover:bg-primary/5 transition-all duration-300 font-medium tracking-tight flex items-center justify-between group/item"
                                        style={{ color: 'var(--text-secondary)' }}
                                    >
                                        <span className="group-hover/item:text-primary transition-colors">{suggestion}</span>
                                        <Search className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-primary" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {query === '' && recentSearches.length > 0 && (
                            <div className="p-3">
                                <div className="flex items-center gap-3 px-4 py-3 text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] leading-none mb-1">
                                    <Clock className="w-3 h-3 text-indigo-400" />
                                    Recent Queries
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setQuery(search);
                                            handleSearch(search);
                                        }}
                                        className="w-full px-4 py-3.5 rounded-xl text-left hover:bg-primary/5 transition-all duration-300 font-medium tracking-tight flex items-center justify-between group/item"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        <span className="group-hover/item:text-primary transition-colors">{search}</span>
                                        <Clock className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-primary" />
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
