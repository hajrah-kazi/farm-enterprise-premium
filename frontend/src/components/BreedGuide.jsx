import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Ruler, Wheat, Droplets, Info, Heart, Home, ChevronDown, Search } from 'lucide-react';
import { GOAT_BREEDS } from '../data/breeds';

const BreedGuide = () => {
    const [selectedBreedId, setSelectedBreedId] = useState("");
    const [imageError, setImageError] = useState({});

    // Find the full breed object based on selection
    const selectedBreed = GOAT_BREEDS.find(b => b.id === selectedBreedId);

    const handleImageError = (id) => {
        setImageError(prev => ({ ...prev, [id]: true }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-white font-sans pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="relative pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" /> Genetic Database
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                        Breed <span className="text-indigo-600 dark:text-indigo-400">Encyclopedia</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-10">
                        Select a breed from the list below to view comprehensive genetic and nutritional data.
                    </p>
                </motion.div>

                {/* Dropdown Selection Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-xl mx-auto relative group"
                >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <select
                        value={selectedBreedId}
                        onChange={(e) => setSelectedBreedId(e.target.value)}
                        className="block w-full pl-11 pr-10 py-4 text-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer shadow-lg hover:shadow-xl text-slate-900 dark:text-white font-medium"
                    >
                        <option value="" disabled>Select a Breed...</option>
                        {GOAT_BREEDS.map((breed) => (
                            <option key={breed.id} value={breed.id}>
                                {breed.name} ({breed.category})
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                </motion.div>
            </div>

            {/* Detailed Content Display */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatePresence mode="wait">
                    {selectedBreed ? (
                        <motion.div
                            key={selectedBreed.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50"
                        >
                            <div className="flex flex-col lg:flex-row">
                                {/* Image Section */}
                                <div className="lg:w-2/5 relative h-96 lg:h-auto min-h-[500px]">
                                    <img
                                        src={imageError[selectedBreed.id] ? `https://placehold.co/800x1200/1e293b/cbd5e1?text=${encodeURIComponent(selectedBreed.name)}` : selectedBreed.image}
                                        onError={() => handleImageError(selectedBreed.id)}
                                        alt={selectedBreed.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent lg:bg-gradient-to-r" />

                                    <div className="absolute bottom-0 left-0 p-8 lg:p-12 text-white">
                                        <div className="inline-block px-3 py-1 mb-4 rounded-full bg-indigo-600/90 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/20">
                                            {selectedBreed.origin}
                                        </div>
                                        <h2 className="text-4xl lg:text-5xl font-black leading-tight mb-2 tracking-tight">
                                            {selectedBreed.name}
                                        </h2>
                                        <p className="text-lg text-slate-300 font-medium">{selectedBreed.category} Breed</p>
                                    </div>
                                </div>

                                {/* Data Section */}
                                <div className="lg:w-3/5 p-8 lg:p-12 bg-slate-50/50 dark:bg-slate-900/50">
                                    <div className="space-y-10">
                                        {/* Description */}
                                        <section>
                                            <h3 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white mb-4">
                                                <Info className="w-5 h-5 text-indigo-500" />
                                                Overview
                                            </h3>
                                            <p className="text-slate-600 dark:text-slate-300 leading-8 text-lg">
                                                {selectedBreed.description}
                                            </p>

                                            {/* Vital Stats Grid */}
                                            {selectedBreed.stats && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Male Weight</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{selectedBreed.stats.weight_male}</span>
                                                    </div>
                                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Female Weight</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{selectedBreed.stats.weight_female}</span>
                                                    </div>
                                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Avg Height</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{selectedBreed.stats.height}</span>
                                                    </div>
                                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-1">Lifespan</span>
                                                        <span className="text-lg font-black text-slate-900 dark:text-white">{selectedBreed.stats.lifespan}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </section>

                                        {/* Key Metrics Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
                                                    <Ruler className="w-4 h-4" /> Physical Traits
                                                </h4>
                                                <ul className="space-y-4">
                                                    {Object.entries(selectedBreed.traits).map(([k, v]) => (
                                                        <li key={k} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0 last:pb-0">
                                                            <span className="text-slate-500 capitalize font-medium">{k.replace(/_/g, ' ')}</span>
                                                            <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">
                                                    <Wheat className="w-4 h-4" /> Nutritional Needs
                                                </h4>
                                                <ul className="space-y-4">
                                                    {Object.entries(selectedBreed.nutrition).map(([k, v]) => (
                                                        <li key={k} className="flex justify-between items-center text-sm border-b border-slate-100 dark:border-slate-700/50 pb-2 last:border-0 last:pb-0">
                                                            <span className="text-slate-500 capitalize font-medium">{k.replace(/_/g, ' ')}</span>
                                                            <span className="font-bold text-slate-900 dark:text-white text-right pl-4">{v}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Secondary Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-orange-50 dark:bg-orange-950/30 p-6 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                                                <h4 className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm uppercase tracking-wider mb-3">
                                                    <Home className="w-4 h-4" /> Environment
                                                </h4>
                                                <p className="text-orange-900/80 dark:text-orange-200/80 leading-relaxed font-medium">
                                                    {selectedBreed.living_conditions}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm uppercase tracking-wider mb-4">
                                                    <Heart className="w-4 h-4" /> Favorite Foods
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedBreed.favorite_foods?.map(food => (
                                                        <span key={food} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                                            {food}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feeding Strategy */}
                                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                                                <Droplets className="w-5 h-5 text-blue-500" />
                                                Recommended Feeding Strategy
                                            </h3>
                                            <div className="grid md:grid-cols-3 gap-6">
                                                {Object.entries(selectedBreed.feeding_guide).map(([k, v]) => (
                                                    <div key={k} className="relative pl-6">
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                                                        <h5 className="font-bold text-slate-900 dark:text-white text-sm capitalize mb-2">{k.replace(/_/g, ' ')}</h5>
                                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{v}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 opacity-50"
                        >
                            <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                <Search className="w-12 h-12 text-slate-400" />
                            </div>
                            <p className="text-xl text-slate-500 font-medium">Use the dropdown above to view breed details</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default BreedGuide;
