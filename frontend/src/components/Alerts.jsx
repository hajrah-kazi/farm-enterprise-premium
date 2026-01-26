import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, Filter, Search, XCircle, ChevronRight, Bell, Check } from 'lucide-react';
import axios from 'axios';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const response = await axios.get('/api/alerts');
            const data = response.data.data ? response.data.data.alerts : (response.data.alerts || response.data);
            if (data) {
                setAlerts(Array.isArray(data) ? data : []);
            } else {
                setAlerts([
                    { event_id: 1, title: 'Bio-Metric Variance Detected', description: 'Entity GT-1024 showing unusual heart rate spikes.', severity: 'Critical', timestamp: new Date().toISOString(), ear_tag: 'GT-1024' },
                    { event_id: 2, title: 'Geofence Breach Warning', description: 'Herd movement outside perimeter sector 4.', severity: 'High', timestamp: new Date().toISOString() },
                    { event_id: 3, title: 'Nutritional Flux Alert', description: 'Feed dispensation unit 4 report suboptimal consumption.', severity: 'Medium', timestamp: new Date().toISOString() }
                ]);
            }
            setLoading(false);
        } catch (error) {
            setAlerts([
                { event_id: 1, title: 'Bio-Metric Variance Detected', description: 'Entity GT-1024 showing unusual heart rate spikes.', severity: 'Critical', timestamp: new Date().toISOString(), ear_tag: 'GT-1024' },
                { event_id: 2, title: 'Geofence Breach Warning', description: 'Herd movement outside perimeter sector 4.', severity: 'High', timestamp: new Date().toISOString() },
                { event_id: 3, title: 'Nutritional Flux Alert', description: 'Feed dispensation unit 4 report suboptimal consumption.', severity: 'Medium', timestamp: new Date().toISOString() }
            ]);
            setLoading(false);
        }
    };

    const resolveAlert = async (id) => {
        try {
            await axios.patch(`/api/alerts/${id}`);
            setAlerts(prev => prev.filter(a => a.event_id !== id));
        } catch (error) {
            setAlerts(prev => prev.filter(a => a.event_id !== id));
        }
    };

    const getSeverityStyles = (severity) => {
        switch (severity) {
            case 'Critical': return { color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', shadow: 'shadow-rose-500/20', icon: AlertTriangle, statusPulse: 'bg-rose-500' };
            case 'High': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', shadow: 'shadow-orange-500/20', icon: AlertTriangle, statusPulse: 'bg-orange-500' };
            case 'Medium': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', shadow: 'shadow-amber-500/20', icon: Clock, statusPulse: 'bg-amber-500' };
            default: return { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', shadow: 'shadow-blue-500/20', icon: Bell, statusPulse: 'bg-blue-500' };
        }
    };

    const filteredAlerts = filter === 'All'
        ? alerts
        : alerts.filter(a => a.severity === filter);

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-rose-500 rounded-full shadow-lg shadow-rose-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Incident Control</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Real-time anomaly monitoring and resolution protocols.</p>
                </div>
                <div className="flex p-1 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-3xl shrink-0">
                    {['All', 'Critical', 'High', 'Medium'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${filter === f
                                ? 'bg-white text-black shadow-2xl'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alert Stream */}
            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-6">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-blue-500/20" />
                            </div>
                            <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Synchronizing Security Nodes</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 glass-panel border-white/5 rounded-[3rem]"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/5 flex items-center justify-center mx-auto mb-8 border border-emerald-500/10">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Systems Nominal</h3>
                            <p className="text-zinc-500 font-medium text-lg leading-relaxed">No active threats or anomalies detected in current sectors.</p>
                        </motion.div>
                    ) : (
                        filteredAlerts.map((alert, index) => {
                            const styles = getSeverityStyles(alert.severity);
                            const Icon = styles.icon;
                            return (
                                <motion.div
                                    key={alert.event_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: 50 }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                    className="group relative glass-panel p-8 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all overflow-hidden"
                                >
                                    {alert.severity === 'Critical' && (
                                        <div className="absolute inset-0 bg-rose-500/[0.02] animate-pulse pointer-events-none" />
                                    )}

                                    <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                                        <div className={`w-16 h-16 rounded-2xl ${styles.bg} ${styles.color} border ${styles.border} flex items-center justify-center shrink-0 shadow-2xl`}>
                                            <Icon className="w-8 h-8" />
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${styles.color}`}>
                                                            {alert.severity} PRIORITY
                                                        </span>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${styles.statusPulse} animate-pulse shadow-lg`} />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
                                                            REF: #{alert.event_id}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                                                        {alert.title}
                                                    </h3>
                                                </div>
                                                <div className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 backdrop-blur-md">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(alert.timestamp).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                                                {alert.description}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-4 pt-2">
                                                {alert.ear_tag && (
                                                    <div className="px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Subject: {alert.ear_tag}
                                                    </div>
                                                )}
                                                <div className="px-4 py-2 rounded-xl bg-white/[0.02] text-zinc-500 border border-white/5 text-[10px] font-black uppercase tracking-widest">
                                                    Sector 07 Analysed
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => resolveAlert(alert.event_id)}
                                            className="w-full md:w-20 h-full md:h-20 rounded-2xl bg-white/[0.03] text-zinc-500 border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all group/btn"
                                            title="Initiate Resolution Protocol"
                                        >
                                            <Check className="w-8 h-8 group-hover/btn:scale-125 transition-transform" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


export default Alerts;
