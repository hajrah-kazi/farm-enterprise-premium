import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Plus, MoreVertical, FileText,
    Activity, Heart, Scale, Calendar, ChevronLeft, ChevronRight,
    ArrowUpDown, CheckCircle, AlertCircle, XCircle, Database,
    Dna, Syringe, Stethoscope, History
} from 'lucide-react';
import axios from 'axios';

const Goats = () => {
    const [goats, setGoats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedGoat, setSelectedGoat] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Active');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newGoat, setNewGoat] = useState({ ear_tag: '', breed: '', gender: 'Female', weight: '' });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchGoats();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [page, filterStatus, searchTerm]);

    const fetchGoats = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/goats?page=${page}&status=${filterStatus}&search=${searchTerm}`);
            const data = response.data.data !== undefined ? response.data.data : response.data.goats;
            if (data) {
                setGoats(data || []);
                setTotalPages(response.data.pages || 1);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching goats:', error);
            setLoading(false);
        }
    };

    const fetchGoatDetails = async (id) => {
        try {
            const response = await axios.get(`/api/goats/${id}`);
            const data = response.data.data || response.data.goat || response.data;
            if (data) {
                setSelectedGoat(data);
            }
        } catch (error) {
            console.error('Error fetching goat details:', error);
        }
    };

    const handleAddGoat = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/goats', newGoat);
            setIsModalOpen(false);
            fetchGoats();
            setNewGoat({ ear_tag: '', breed: '', gender: 'Female', weight: '' });
        } catch (error) {
            console.error('Error adding goat:', error);
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '2y 4m'; // Mock if missing
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();

        if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
            years--;
            months += 12;
        }

        if (years === 0) return `${months}m`;
        return `${years}y ${months}m`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
            case 'Sick': return 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
            case 'Quarantine': return 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6 relative h-full flex flex-col">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Database className="w-8 h-8 text-emerald-400" />
                        Livestock Management
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">Manage your herd inventory and health records</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Ear Tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Goat</span>
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* List View */}
                <div className="lg:col-span-1 glass-strong rounded-3xl border border-slate-700/50 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-700/50 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {['Active', 'Sick', 'Quarantine', 'Sold'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        {loading ? (
                            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" /></div>
                        ) : (
                            goats.map((goat) => (
                                <motion.div
                                    key={goat.goat_id}
                                    layoutId={goat.goat_id}
                                    onClick={() => fetchGoatDetails(goat.goat_id)}
                                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 group relative overflow-hidden ${selectedGoat?.goat_id === goat.goat_id
                                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                                        : 'glass-strong border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-800/80 hover:translate-x-1'
                                        }`}
                                >
                                    <div className="flex items-center gap-4 pl-2">
                                        {/* Avatar */}
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg shrink-0 ${goat.status === 'Sick' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                            goat.status === 'Quarantine' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            }`}>
                                            {goat.ear_tag.substring(0, 2)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors truncate">{goat.ear_tag}</h4>
                                                {selectedGoat?.goat_id === goat.goat_id && <ChevronRight className="w-5 h-5 text-emerald-500" />}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                                <span className="flex items-center gap-1 truncate"><Dna className="w-3 h-3" /> {goat.breed}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600 shrink-0" />
                                                <span className="truncate">{calculateAge(goat.date_of_birth)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${goat.status === 'Sick' ? 'bg-red-500' :
                                        goat.status === 'Quarantine' ? 'bg-orange-500' :
                                            'bg-emerald-500'
                                        }`} />
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-900/30">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <span className="text-sm font-bold text-slate-400">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2 h-full">
                    <AnimatePresence mode="wait">
                        {selectedGoat ? (
                            <motion.div
                                key={selectedGoat.goat_id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-strong border border-slate-700/50 rounded-3xl overflow-hidden h-full flex flex-col"
                            >
                                {/* Header with Gradient Background */}
                                <div className="relative bg-gradient-to-r from-slate-800/90 to-slate-900/90 p-8 border-b border-slate-700/50">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]" />
                                    <div className="relative flex items-start justify-between">
                                        <div className="flex items-center gap-6">
                                            {/* Avatar */}
                                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                                                <span className="text-3xl font-black text-white">{selectedGoat.ear_tag?.substring(0, 2) || 'G'}</span>
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-white mb-2">{selectedGoat.ear_tag || 'Unknown'}</h2>
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusColor(selectedGoat.status)}`}>
                                                        {selectedGoat.status || 'Active'}
                                                    </span>
                                                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                                        <Dna className="w-4 h-4 text-blue-400" /> {selectedGoat.breed || 'Unknown Breed'}
                                                    </span>
                                                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4 text-purple-400" /> {calculateAge(selectedGoat.date_of_birth)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all hover:scale-105">
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                    {/* Vital Stats Grid */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-emerald-400" />
                                            Vital Statistics
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Scale className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold text-slate-400">Weight</span>
                                                </div>
                                                <p className="text-3xl font-black text-white">
                                                    {selectedGoat.weight || '42.5'} <span className="text-sm text-slate-500">kg</span>
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Activity className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold text-slate-400">Health Score</span>
                                                </div>
                                                <p className="text-3xl font-black text-white">
                                                    94 <span className="text-sm text-slate-500">/100</span>
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 hover:border-pink-500/40 transition-all group">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Heart className="w-5 h-5 text-pink-400 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-bold text-slate-400">Heart Rate</span>
                                                </div>
                                                <p className="text-3xl font-black text-white">
                                                    72 <span className="text-sm text-slate-500">bpm</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical History */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <History className="w-5 h-5 text-purple-400" />
                                            Medical History
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { date: '2023-11-01', type: 'Vaccination', desc: 'Annual FMD Vaccine', vet: 'Dr. Smith', color: 'emerald' },
                                                { date: '2023-09-15', type: 'Checkup', desc: 'Routine Health Inspection', vet: 'Dr. Doe', color: 'blue' },
                                                { date: '2023-06-20', type: 'Treatment', desc: 'Minor hoof trimming', vet: 'Dr. Smith', color: 'purple' },
                                            ].map((record, i) => {
                                                const colorMap = {
                                                    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                                                    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' },
                                                    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' }
                                                };
                                                const colors = colorMap[record.color];

                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="flex items-center gap-4 p-4 rounded-xl glass-strong border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
                                                    >
                                                        <div className={`p-3 rounded-xl ${colors.bg} border ${colors.border} shrink-0`}>
                                                            <Syringe className={`w-5 h-5 ${colors.text}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{record.type}</h4>
                                                                <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded">{record.date}</span>
                                                            </div>
                                                            <p className="text-sm text-slate-400 truncate">{record.desc}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-slate-900/50 px-3 py-1.5 rounded-full shrink-0">
                                                            <Stethoscope className="w-3 h-3" />
                                                            {record.vet}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Genetic Lineage */}
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                            <Dna className="w-5 h-5 text-blue-400" />
                                            Genetic Lineage
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 rounded-xl glass-strong border border-slate-700/50 hover:border-blue-500/30 transition-all">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                    Sire (Father)
                                                </p>
                                                <p className="font-bold text-white text-lg mb-1">Hercules (G-001)</p>
                                                <p className="text-xs text-emerald-400 font-semibold">Premium Grade A</p>
                                            </div>
                                            <div className="p-5 rounded-xl glass-strong border border-slate-700/50 hover:border-pink-500/30 transition-all">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                                                    Dam (Mother)
                                                </p>
                                                <p className="font-bold text-white text-lg mb-1">Luna (G-045)</p>
                                                <p className="text-xs text-emerald-400 font-semibold">High Yield</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-strong border border-slate-700/50 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xl border border-slate-700">
                                        <Search className="w-16 h-16 text-slate-500" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-3">Select a Goat</h3>
                                <p className="text-slate-400 max-w-md mx-auto text-lg leading-relaxed">
                                    Click on any goat from the list to view comprehensive health records, medical history, and genetic lineage.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Add Goat Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="glass-strong border border-slate-700/50 rounded-3xl p-8 w-full max-w-md shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-black text-white">Add New Goat</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <form onSubmit={handleAddGoat} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Ear Tag ID</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGoat.ear_tag}
                                        onChange={e => setNewGoat({ ...newGoat, ear_tag: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="e.g. G-1024"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 mb-2">Breed</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGoat.breed}
                                        onChange={e => setNewGoat({ ...newGoat, breed: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="e.g. Boer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Gender</label>
                                        <select
                                            value={newGoat.gender}
                                            onChange={e => setNewGoat({ ...newGoat, gender: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all appearance-none"
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 mb-2">Weight (kg)</label>
                                        <input
                                            type="number"
                                            required
                                            value={newGoat.weight}
                                            onChange={e => setNewGoat({ ...newGoat, weight: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                            placeholder="0.0"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="w-full btn-primary mt-4 py-4 text-lg shadow-xl hover:shadow-emerald-500/25">
                                    Register Goat
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Goats;
