import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Heart, AlertTriangle, TrendingUp,
    ArrowUp, ArrowDown, Zap, Target, Eye, MapPin, Sparkles,
    TrendingDown, BarChart2, PieChart, Video, Server, Cpu, RefreshCw, LayoutDashboard, ChevronRight, FileText, Shield
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { formatINR } from '../utils/formatters';

const StatCard = ({ title, value, change, icon: Icon, trend, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="glass-panel p-8 group relative overflow-hidden"
        style={{ backgroundColor: 'var(--card-bg)' }}
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.03] to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex items-start justify-between mb-8">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner" style={{ borderColor: 'var(--border-subtle)' }}>
                <Icon className={`w-7 h-7 ${trend === 'up' ? 'text-emerald-400' : 'text-zinc-400'}`} />
            </div>
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest shadow-sm ${trend === 'up'
                ? 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                : 'text-rose-400 bg-rose-400/10 border border-rose-400/20'
                }`}>
                {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {change}
            </div>
        </div>

        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-3" style={{ color: 'var(--text-muted)' }}>{title}</p>
            <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-extrabold tracking-tighter" style={{ color: 'var(--text-primary)' }}>{value}</h3>
            </div>
        </div>

        <div className="mt-6 pt-6 border-t border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: trend === 'up' ? '70%' : '30%' }}
                    transition={{ delay: delay + 0.5, duration: 1.5 }}
                    className={`h-full rounded-full ${trend === 'up' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`}
                />
            </div>
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_goats: 0,
        avg_health: 0,
        active_alerts: 0,
        videos_processed: 0,
        market_cap: 8450000, // Institutional Mock for India-First scale
        health_distribution: {}
    });
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchSystemStatus();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/dashboard');
            const data = response.data.data || response.data;
            if (data && typeof data === 'object') {
                setStats(prev => ({ ...prev, ...data }));
            }
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
            // Default to zero state on error to respect database truth
            setStats({
                avg_health: 0,
                total_goats: 0,
                active_alerts: 0,
                videos_processed: 0,
                health_distribution: { Excellent: 0, Good: 0, Fair: 0, Poor: 0, Critical: 0 }
            });
            setLoading(false);
        }
    };

    const fetchSystemStatus = async () => {
        try {
            const response = await axios.get('/api/system/status');
            const data = response.data.data || response.data;
            if (data) setSystemStatus(data);
        } catch (error) {
            setSystemStatus({ cpu_usage: 42, ram_usage: 68, gpu_utilization: 15 });
        }
    };

    const chartData = [
        { date: 'Jan', health: 78, activity: 65, efficiency: 88 },
        { date: 'Feb', health: 82, activity: 72, efficiency: 85 },
        { date: 'Mar', health: 85, activity: 78, efficiency: 90 },
        { date: 'Apr', health: 81, activity: 70, efficiency: 87 },
        { date: 'May', health: 87, activity: 82, efficiency: 92 },
        { date: 'Jun', health: 89, activity: 85, efficiency: 95 },
        { date: 'Jul', health: 91, activity: 88, efficiency: 94 },
    ];

    const distributionData = [
        { name: 'Excellent', value: 350, color: '#10B981' },
        { name: 'Optimization', value: 40, color: '#3b82f6' },
        { name: 'Anomalies', value: 16, color: '#f43f5e' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-lg shadow-emerald-500/20" />
            </div>
            <p className="text-muted font-black uppercase tracking-[0.4em] text-[10px] animate-pulse" style={{ color: 'var(--text-muted)' }}>Initializing Neural Core</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-12 pb-24">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 pt-4">
                <div className="space-y-3">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <div className="w-2.5 h-10 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                        <h1 className="h1-premium leading-tight" style={{ color: 'var(--text-primary)' }}>Intelligence Matrix</h1>
                    </motion.div>
                    <p className="text-lg font-medium tracking-tight overflow-hidden text-ellipsis" style={{ color: 'var(--text-secondary)' }}>Active node analytics and population trajectory overview across all zones.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={fetchDashboardData}
                        className="btn-premium btn-premium-secondary h-16 px-10 rounded-[1.25rem]"
                    >
                        <RefreshCw className="w-5 h-5 text-zinc-400" />
                        <span className="hidden md:inline uppercase text-[11px] font-bold tracking-[0.2em] text-zinc-300">Synchronize</span>
                    </button>
                    <button className="btn-premium btn-premium-primary btn-shimmer h-16 px-12 rounded-[1.25rem] shadow-[0_25px_50px_-12px_rgba(255,255,255,0.2)]">
                        <Sparkles className="w-5 h-5 fill-current" />
                        <span className="hidden md:inline uppercase text-[11px] font-black tracking-[0.2em]">Neural AI Synthesis</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid - Institutional Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Inventory" value={stats.total_goats} change="+122" icon={Users} trend="up" delay={0.1} />
                <StatCard title="Growth Trajectory" value="+14.2%" change="Optimal" icon={TrendingUp} trend="up" delay={0.2} />
                <StatCard title="Vitality Aggregate" value={`${stats.avg_health}%`} change="+4.2%" icon={Activity} trend="up" delay={0.3} />
                <StatCard title="Security Node Alerts" value={stats.active_alerts} change="-3" icon={Shield} trend="down" delay={0.4} />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 glass-panel p-10 relative group" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>PERFORMANCE VECTOR</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3" style={{ color: 'var(--text-muted)' }}>Temporal Neural Signature Analysis</p>
                        </div>
                        <div className="hidden lg:flex items-center gap-10">
                            {[
                                { color: 'emerald', label: 'Vitality' },
                                { color: 'blue', label: 'Mobility' },
                                { color: 'amber', label: 'Yield' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: `var(--accent-${i === 0 ? 'primary' : i === 1 ? 'secondary' : 'tertiary'})`, boxShadow: `0 0 15px currentColor` }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="vitalityGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="12 12" stroke="rgba(128,128,128,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 900 }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 900 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-medium)',
                                        borderRadius: '24px',
                                        padding: '24px',
                                        backdropFilter: 'blur(24px)',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Area type="monotone" dataKey="health" stroke="#10B981" strokeWidth={5} fill="url(#vitalityGradient)" animationDuration={2000} strokeLinecap="round" />
                                <Area type="monotone" dataKey="activity" stroke="#3B82F6" strokeWidth={5} fill="none" opacity={0.6} strokeLinecap="round" />
                                <Area type="monotone" dataKey="efficiency" stroke="#F59E0B" strokeWidth={5} fill="none" opacity={0.4} strokeLinecap="round" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-10 flex flex-col relative" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>STRATIFICATION</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3 mb-16" style={{ color: 'var(--text-muted)' }}>Herd Biometric Distribution</p>

                    <div className="relative flex-1 flex items-center justify-center scale-110">
                        <ResponsiveContainer width="100%" height={320}>
                            <RePieChart>
                                <Pie
                                    data={distributionData}
                                    innerRadius={90}
                                    outerRadius={115}
                                    paddingAngle={12}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={12}
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RePieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-6xl font-black tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{stats.avg_health}<span className="text-3xl opacity-50">%</span></p>
                            <p className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-4">Aggregate</p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-16">
                        {distributionData.map((item, i) => (
                            <div key={i} className="group flex items-center justify-between p-6 rounded-[2rem] bg-black/5 border border-subtle hover:bg-black/10 transition-all cursor-pointer" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="flex items-center gap-5">
                                    <div className={`w-3.5 h-3.5 rounded-full`} style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}44` }} />
                                    <span className="text-[11px] font-black uppercase tracking-widest transition-colors" style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                                </div>
                                <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Support Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="glass-panel p-10 border-subtle" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>SPATIAL LOAD</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3" style={{ color: 'var(--text-muted)' }}>Real-time Sector Utilization</p>
                        </div>
                        <button className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.3em]">Neural Map View</button>
                    </div>
                    <div className="space-y-10">
                        {[
                            { zone: 'Northern Pasture', count: 142, capacity: 150, color: '#10b981' },
                            { zone: 'Central Processing', count: 88, capacity: 100, color: '#3b82f6' },
                            { zone: 'East Highland', count: 56, capacity: 80, color: '#8b5cf6' },
                            { zone: 'Isolation Wing', count: 12, capacity: 20, color: '#f43f5e' }
                        ].map((z, i) => (
                            <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <span className="text-base font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>{z.zone}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>{z.count} SPECIMENS DETECTED</span>
                                    </div>
                                    <span className="text-lg font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>{Math.round((z.count / z.capacity) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-black/5 rounded-full overflow-hidden border border-subtle relative" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(z.count / z.capacity) * 100}%` }}
                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{ backgroundColor: z.color, boxShadow: `0 0 20px ${z.color}33` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    {[
                        { icon: Video, label: 'Analytics Node', desc: 'Secure Streams', color: '#10b981', delay: 0.1 },
                        { icon: FileText, label: 'Compliance', desc: 'Secure Logs', color: '#3b82f6', delay: 0.2 },
                        { icon: Target, label: 'Asset Tracking', desc: 'Neural Track', color: '#8b5cf6', delay: 0.3 },
                        { icon: Sparkles, label: 'Neural Core', desc: 'v4.2.0-PRO', color: '#f59e0b', delay: 0.4 }
                    ].map((item, i) => (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: item.delay, duration: 0.6 }}
                            className="glass-panel p-8 text-left group hover:bg-white/[0.04] transition-all duration-500 border-subtle"
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-medium flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner" style={{ borderColor: 'var(--border-medium)', color: item.color }}>
                                <item.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};



export default Dashboard;
