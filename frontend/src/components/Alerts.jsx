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
            const response = await axios.get('http://localhost:5000/api/alerts');
            const data = response.data.data ? response.data.data.alerts : (response.data.alerts || response.data);
            if (data) {
                setAlerts(Array.isArray(data) ? data : []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching alerts:', error);
            setLoading(false);
        }
    };

    const resolveAlert = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/alerts/${id}`);
            // Remove from local state
            setAlerts(prev => prev.filter(a => a.event_id !== id));
        } catch (error) {
            console.error('Error resolving alert:', error);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'Critical': return 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]';
            case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    const filteredAlerts = filter === 'All'
        ? alerts
        : alerts.filter(a => a.severity === filter);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Bell className="w-8 h-8 text-emerald-400" />
                        System Alerts
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">Real-time notifications and incident reports</p>
                </div>
                <div className="flex items-center gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                    {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${filter === f
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts Grid */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="spinner mx-auto mb-6" />
                            <p className="text-slate-400 text-lg">Syncing alert data...</p>
                        </div>
                    ) : filteredAlerts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20 glass rounded-3xl border border-slate-700/50"
                        >
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">All Systems Nominal</h3>
                            <p className="text-slate-400">No active alerts found for the selected filter.</p>
                        </motion.div>
                    ) : (
                        filteredAlerts.map((alert, index) => (
                            <motion.div
                                key={alert.event_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative glass-strong hover:bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 transition-all hover:shadow-2xl hover:border-emerald-500/30 hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`p-4 rounded-2xl ${getSeverityColor(alert.severity)}`}>
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {alert.title}
                                            </h3>
                                            <span className="text-sm font-medium text-slate-500 flex items-center gap-2 bg-slate-950/30 px-3 py-1 rounded-lg border border-slate-800/50">
                                                <Clock className="w-4 h-4" />
                                                {new Date(alert.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-base mb-4 leading-relaxed">{alert.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-950/50 text-slate-400 border border-slate-800">
                                                ID: #{alert.event_id}
                                            </span>
                                            {alert.ear_tag && (
                                                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    Goat: {alert.ear_tag}
                                                </span>
                                            )}
                                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                                                {alert.severity} Priority
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => resolveAlert(alert.event_id)}
                                        className="p-3 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-emerald-500 transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                                        title="Mark as Resolved"
                                    >
                                        <Check className="w-6 h-6" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Alerts;
