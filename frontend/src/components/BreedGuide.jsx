import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, Globe, ChevronRight, Filter, Info } from 'lucide-react';
import axios from 'axios';

const BreedGuide = () => {
    const [breeds, setBreeds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreeds = async () => {
            try {
                const response = await axios.get('/api/breeds');
                setBreeds(response.data.data.breeds || []);
            } catch (e) {
                console.error("Breed fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchBreeds();
    }, []);

    const filteredBreeds = breeds.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.origin.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center p-40">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="flex flex-col gap-12 pb-32">
            <div className="flex items-end justify-between gap-8 pt-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                        <h1 className="h1-premium text-white leading-none">Global Registry</h1>
                    </div>
                    <p className="text-zinc-500 text-lg font-medium tracking-tight">Institutional knowledge base of worldwide caprine genetics.</p>
                </div>

                <div className="relative w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="SCAN REGISTRY..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-2xl pl-16 pr-8 py-5 text-[11px] font-black uppercase tracking-[0.2em] focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Breed Scroll Surface */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredBreeds.map((breed) => (
                        <motion.div
                            layout
                            key={breed.id}
                            onClick={() => setSelectedBreed(breed)}
                            className={`p-8 rounded-3xl cursor-pointer border transition-all duration-500 ${selectedBreed?.id === breed.id
                                ? 'bg-white/[0.04] border-emerald-500/40 shadow-[0_12px_30px_rgba(0,0,0,0.4)]'
                                : 'bg-white/[0.01] border-white/[0.05] hover:bg-white/[0.02] hover:border-white/[0.1] hover:-translate-y-1'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center border border-white/5">
                                    <Globe className="w-8 h-8 text-zinc-600" />
                                </div>
                                <span className="px-5 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-full">
                                    {breed.category}
                                </span>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{breed.name}</h3>
                            <p className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">{breed.origin}</p>

                            <div className="mt-10 flex items-center gap-3 text-emerald-500 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Access Dossier <ChevronRight className="w-4 h-4" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Intelligence Dossier Side Panel */}
                <div className="lg:col-span-4 sticky top-32">
                    <AnimatePresence mode="wait">
                        {selectedBreed ? (
                            <motion.div
                                key={selectedBreed.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-10 rounded-3xl bg-[#0a0a0c] border border-white/[0.05] shadow-2xl relative overflow-y-auto max-h-[80vh] custom-scrollbar group"
                            >
                                <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                <h2 className="text-4xl font-black text-white mb-8 tracking-tighter leading-none">{selectedBreed.name}</h2>

                                <div className="space-y-10">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Genetic Lineage</label>
                                        <p className="text-base text-zinc-400 mt-2 font-medium leading-relaxed">{selectedBreed.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Productivity</label>
                                            <p className="text-base text-emerald-500 mt-2 font-black uppercase tracking-widest">{selectedBreed.productivity}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Adaptability</label>
                                            <p className="text-base text-blue-500 mt-2 font-black uppercase tracking-widest">{selectedBreed.adaptability}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Key Attributes</label>
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {selectedBreed.traits.map((t, i) => (
                                                <span key={i} className={`px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${i % 2 === 0 ? 'text-emerald-500/80' : 'text-blue-500/80'}`}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Advanced Operational Metrics */}
                                    <div className="space-y-8 pt-8 border-t border-white/5">
                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-amber-500" /> DIETARY MATRIX
                                            </label>
                                            <p className="text-sm text-zinc-300 mt-2 font-medium leading-relaxed">{selectedBreed.eating_habits || 'Accessing protocol...'}</p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-blue-500" /> SLEEP CYCLES
                                            </label>
                                            <p className="text-sm text-zinc-300 mt-2 font-medium leading-relaxed">{selectedBreed.sleeping_habits || 'Analyzing sensor logs...'}</p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" /> BIO-NUTRIENT PROTOCOL
                                            </label>
                                            <p className="text-sm text-zinc-300 mt-2 font-medium leading-relaxed">{selectedBreed.nutrition || 'Compiling nutritional data...'}</p>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-purple-500" /> ENVIRONMENTAL VARIANCE
                                            </label>
                                            <p className="text-sm text-zinc-300 mt-2 font-medium leading-relaxed">{selectedBreed.env_conditions || 'Calculating adaptive index...'}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="p-20 text-center rounded-[3.5rem] border border-dashed border-white/10 opacity-30">
                                <Info className="w-12 h-12 mx-auto mb-6 text-zinc-500" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 leading-loose">Select genotype for<br />institutional briefing</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BreedGuide;
