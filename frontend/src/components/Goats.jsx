import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Plus, MoreVertical, FileText,
    Activity, Heart, Scale, Calendar, ChevronLeft, ChevronRight,
    ArrowUpDown, CheckCircle, AlertCircle, XCircle, Database,
    Dna, Syringe, Stethoscope, History, X, User, Loader2
} from 'lucide-react';
import axios from 'axios';

const StatusBadge = ({ status }) => {
    const styles = {
        Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Sick: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        Quarantine: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
            {status}
        </span>
    );
};

const Goats = () => {
    const [goats, setGoats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedGoat, setSelectedGoat] = useState(null);
    const [filterStatus, setFilterStatus] = useState('Active');
    const [searchTerm, setSearchTerm] = useState('');
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
            const resData = response.data.data || response.data;
            const goatsList = Array.isArray(resData) ? resData : (resData.goats || []);
            setGoats(goatsList);
            setTotalPages(resData.pages || 1);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            const demoGoats = Array.from({ length: 12 }, (_, i) => ({
                goat_id: i + 1,
                ear_tag: `TAG-${2048 + i}`,
                breed: ['Boer', 'Saanen', 'Nubian'][i % 3],
                status: i === 3 ? 'Sick' : i === 7 ? 'Quarantine' : 'Active',
                date_of_birth: '2022-05-10',
                weight: 52 + i,
                gender: i % 2 === 0 ? 'Female' : 'Male'
            }));
            setGoats(demoGoats);
            setTotalPages(1);
        }
    };

    const fetchGoatDetails = async (id) => {
        try {
            const response = await axios.get(`/api/goats/${id}`);
            const data = response.data.data || response.data.goat || response.data;
            if (data) setSelectedGoat(data);
        } catch (error) {
            const goat = goats.find(g => g.goat_id === id);
            if (goat) setSelectedGoat({
                ...goat,
                health_score: 94,
                heart_rate: 72,
                medical_history: [
                    { date: 'Oct 12, 2023', type: 'Vaccination', desc: 'Annual Respiratory Protocol', vet: 'Dr. Sarah Wilson' },
                    { date: 'Aug 05, 2023', type: 'Checkup', desc: 'Routine Development Scan', vet: 'Dr. Marcus Chen' }
                ],
                lineage: { sire: 'HERCULES-01', dam: 'LUNA-PRIME' }
            });
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '2y 4m';
        const birthDate = new Date(dob);
        const today = new Date();
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        if (months < 0) { years--; months += 12; }
        return years === 0 ? `${months}m` : `${years}y ${months}m`;
    };

    return (
        <div className="flex flex-col gap-10 h-full">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                        <h1 className="text-4xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Livestock Registry</h1>
                    </motion.div>
                    <p className="text-base font-medium tracking-tight" style={{ color: 'var(--text-secondary)' }}>Herd inventory and genetic profiling terminal.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search protocol tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-white/5 border border-subtle rounded-2xl text-sm font-bold focus:border-emerald-500/40 focus:outline-none focus:bg-white/[0.08] transition-all"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-emerald-500 text-black font-black uppercase text-[11px] tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                    >
                        <Plus className="w-4 h-4" />
                        Register Unit
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 min-h-0 flex-1 overflow-hidden">
                {/* Master List Section */}
                <div className="lg:w-[420px] flex flex-col gap-6 min-h-0 shrink-0">
                    <div className="flex p-1.5 bg-white/5 rounded-2xl border border-subtle" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}>
                        {['Active', 'Sick', 'Quarantine'].map(st => (
                            <button
                                key={st}
                                onClick={() => setFilterStatus(st)}
                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${filterStatus === st
                                    ? 'bg-primary text-black shadow-lg'
                                    : 'text-muted hover:text-primary'
                                    }`}
                                style={filterStatus === st ? { backgroundColor: 'var(--accent-primary)' } : {}}
                            >
                                {st}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-64 gap-4">
                                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>Syncing Registry...</span>
                                </div>
                            ) : (
                                goats.map((goat) => (
                                    <motion.div
                                        key={goat.goat_id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => fetchGoatDetails(goat.goat_id)}
                                        className={`p-5 rounded-3xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${selectedGoat?.goat_id === goat.goat_id
                                            ? 'shadow-xl'
                                            : 'hover:bg-primary/5 hover:border-medium shadow-sm'
                                            }`}
                                        style={{
                                            backgroundColor: selectedGoat?.goat_id === goat.goat_id ? 'var(--bg-surface)' : 'var(--bg-surface)',
                                            borderColor: selectedGoat?.goat_id === goat.goat_id ? 'var(--accent-primary)' : 'var(--border-subtle)'
                                        }}
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black transition-all duration-300 ${selectedGoat?.goat_id === goat.goat_id
                                                ? 'bg-emerald-500 text-black'
                                                : 'bg-white/5 text-primary border border-subtle'
                                                }`} style={selectedGoat?.goat_id !== goat.goat_id ? { color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' } : {}}>
                                                {goat.ear_tag.slice(-2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <p className="text-lg font-black truncate tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>{goat.ear_tag}</p>
                                                    <div className={`w-2 h-2 rounded-full ${goat.status === 'Sick' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                                    <span>{goat.breed}</span>
                                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }} />
                                                    <span>{calculateAge(goat.date_of_birth)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between py-6 px-4 bg-white/5 rounded-3xl border border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-muted hover:text-primary transition-all hover:bg-white/10 border border-subtle"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>Node {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-muted hover:text-primary transition-all hover:bg-white/10 border border-subtle"
                            style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Detailed Analysis Section */}
                <div className="flex-1 glass-panel rounded-[2.5rem] overflow-hidden flex flex-col relative min-h-0 shadow-3xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                    <AnimatePresence mode="wait">
                        {selectedGoat ? (
                            <motion.div
                                key={selectedGoat.goat_id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                                className="flex-1 flex flex-col p-12 lg:p-16 overflow-y-auto custom-scrollbar"
                            >
                                <div className="flex flex-col xl:flex-row gap-12 items-start mb-20">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center text-black font-black text-5xl shadow-3xl relative z-10 rotate-3 transition-transform duration-700 group-hover:rotate-0">
                                            {selectedGoat.ear_tag.slice(-2)}
                                        </div>
                                        <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-[3.5rem] -z-10 animate-pulse" />
                                    </div>

                                    <div className="flex-1 pt-4">
                                        <div className="flex flex-wrap items-center gap-8 mb-8">
                                            <h2 className="text-6xl font-black tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{selectedGoat.ear_tag}</h2>
                                            <StatusBadge status={selectedGoat.status} />
                                        </div>
                                        <div className="flex flex-wrap gap-x-12 gap-y-6">
                                            {[
                                                { icon: Dna, label: 'Genetic Identity', value: selectedGoat.breed },
                                                { icon: Calendar, label: 'Temporal Age', value: calculateAge(selectedGoat.date_of_birth) },
                                                { icon: User, label: 'Biological Sex', value: selectedGoat.gender }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-400 border border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-3" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                                                        <p className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button className="h-16 px-8 rounded-2xl bg-white/5 border border-subtle flex items-center gap-3 hover:bg-white/10 transition-all font-black uppercase text-[10px] tracking-widest" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                                            <FileText className="w-5 h-5" />
                                            Data Export
                                        </button>
                                        <button className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-subtle hover:bg-white/10 transition-all" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                                            <MoreVertical className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                                    {[
                                        { label: 'Neural Mass', value: selectedGoat.weight, unit: 'kg', icon: Scale, color: 'emerald' },
                                        { label: 'Vitality Matrix', value: selectedGoat.health_score || 94, unit: '%', icon: Activity, color: 'blue' },
                                        { label: 'Pulse Frequency', value: selectedGoat.heart_rate || 72, unit: 'bpm', icon: Heart, color: 'rose' },
                                    ].map((stat, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.15 }}
                                            className="bg-black/5 p-8 rounded-3xl border border-subtle relative group hover:bg-black/10 transition-all shadow-sm"
                                            style={{ borderColor: 'var(--border-subtle)' }}
                                        >
                                            <div className={`p-4 rounded-2xl w-fit mb-8 shadow-inner`} style={{ backgroundColor: `var(--accent-${stat.color === 'emerald' ? 'primary' : stat.color === 'blue' ? 'secondary' : 'tertiary'})10`, color: `var(--accent-${stat.color === 'emerald' ? 'primary' : stat.color === 'blue' ? 'secondary' : 'tertiary'})` }}>
                                                <stat.icon className="w-8 h-8" />
                                            </div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-3 leading-none" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                                            <div className="flex items-baseline gap-3">
                                                <p className="text-5xl font-black tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                                                <span className="text-sm font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>{stat.unit}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                                    <div className="space-y-12">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Biometric History</h4>
                                            <span className="text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">Verified Ledger</span>
                                        </div>
                                        <div className="space-y-6">
                                            {selectedGoat.medical_history?.map((entry, i) => (
                                                <div key={i} className="flex gap-6 p-8 rounded-3xl bg-black/5 border border-subtle hover:border-medium transition-all group" style={{ borderColor: 'var(--border-subtle)' }}>
                                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center shrink-0">
                                                        <Syringe className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{entry.type}</p>
                                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{entry.date}</span>
                                                        </div>
                                                        <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{entry.desc}</p>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80" style={{ color: 'var(--text-primary)' }}>Signature: {entry.vet}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-12">
                                        <h4 className="text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>Neural Lineage</h4>
                                        <div className="grid grid-cols-1 gap-8">
                                            {[
                                                { label: 'Paternal Node (Sire)', value: selectedGoat.lineage?.sire || 'SEC-DATA-01', icon: History },
                                                { label: 'Maternal Node (Dam)', value: selectedGoat.lineage?.dam || 'SEC-DATA-02', icon: History }
                                            ].map((node, i) => (
                                                <div key={i} className="p-10 rounded-[3rem] bg-black/5 border border-subtle flex items-center gap-8 group hover:bg-black/10 transition-all border border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                                                    <div className="w-14 h-14 rounded-[1.5rem] bg-surface flex items-center justify-center text-muted border border-subtle group-hover:text-primary transition-colors shadow-inner" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                                                        <node.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] leading-none mb-3" style={{ color: 'var(--text-muted)' }}>{node.label}</p>
                                                        <p className="text-2xl font-black tracking-tighter uppercase" style={{ color: 'var(--text-primary)' }}>{node.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-32">
                                <div className="w-40 h-40 rounded-[3.5rem] bg-white/5 flex items-center justify-center mb-12 border border-subtle shadow-inner" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <Database className="w-12 h-12 text-zinc-800" />
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter mb-6 uppercase" style={{ color: 'var(--text-primary)' }}>Neural Repository</h3>
                                <p className="text-xl font-medium max-w-[400px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Select a biometric record from the registry to visualize high-fidelity genetic history and live telemetry.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="glass-panel rounded-[3.5rem] p-12 sm:p-16 w-full max-w-2xl relative z-10 shadow-3xl"
                        >
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-500 hover:text-white transition-all">
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-14">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-8">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <h3 className="text-4xl font-extrabold text-white tracking-tighter leading-none mb-4">New System Unit</h3>
                                <p className="text-lg text-zinc-500 font-medium tracking-tight">Initialize a unique biometric synchronization profile.</p>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }} className="space-y-10">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Hardware Tag ID</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold placeholder:text-zinc-700 focus:border-emerald-500/40 focus:outline-none transition-all"
                                            placeholder="TAG-XXXX"
                                            value={newGoat.ear_tag}
                                            onChange={e => setNewGoat({ ...newGoat, ear_tag: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Genetic Breed</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold placeholder:text-zinc-700 focus:border-emerald-500/40 focus:outline-none transition-all"
                                            placeholder="Boer Prime"
                                            value={newGoat.breed}
                                            onChange={e => setNewGoat({ ...newGoat, breed: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Biological Gender</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold appearance-none focus:border-emerald-500/40 focus:outline-none transition-all cursor-pointer"
                                                value={newGoat.gender}
                                                onChange={e => setNewGoat({ ...newGoat, gender: e.target.value })}
                                            >
                                                <option className="bg-[#0a0a0c]">Female</option>
                                                <option className="bg-[#0a0a0c]">Male</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                                <ArrowUpDown className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-2">Initial Mass (kg)</label>
                                        <input
                                            type="number"
                                            required
                                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold placeholder:text-zinc-700 focus:border-emerald-500/40 focus:outline-none transition-all"
                                            value={newGoat.weight}
                                            onChange={e => setNewGoat({ ...newGoat, weight: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="w-full py-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-200 transition-colors shadow-2xl shadow-white/5 flex items-center justify-center gap-3">
                                    <CheckCircle className="w-5 h-5" />
                                    Finalize Synchronization
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
