import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Activity, Users, Heart, AlertTriangle, TrendingUp,
    ArrowUp, ArrowDown, Zap, Target, Eye, MapPin, Sparkles,
    TrendingDown, BarChart2, PieChart, Video, Server, Cpu
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
const StatCard = ({ title, value, change, icon: Icon, gradient, trend, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay, type: "spring", damping: 15 }}
        whileHover={{ y: -8, scale: 1.02 }}
        className="glass-strong rounded-3xl p-6 border border-slate-700/50 relative overflow-hidden group cursor-pointer shadow-xl"
    >
        <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradient} shadow-2xl float group-hover:scale-110 transition-transform duration-500`}>
                <Icon className="w-7 h-7 text-white" />
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm ${trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : trend === 'down'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : trend === 'down' ? <ArrowDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                <span>{change}%</span>
            </div>
        </div>

        <h3 className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">{title}</h3>
        <p className="text-4xl font-black text-white tracking-tight mb-4">
            {value}
        </p>

        <div className="w-full h-1 bg-slate-800/50 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(parseFloat(change) * 10, 100)}%` }}
                transition={{ delay: delay + 0.3, duration: 1.2, ease: "circOut" }}
                className={`h-full bg-gradient-to-r ${gradient}`}
            />
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        total_goats: 0,
        avg_health: 0,
        active_alerts: 0,
        videos_processed: 0,
        health_distribution: {}
    });
    const [systemStatus, setSystemStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        fetchSystemStatus();

        // Poll system status every 3 seconds for "Live" feel
        const interval = setInterval(fetchSystemStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/dashboard');
            // Support both wrapped and unwrapped data
            const data = response.data.data || response.data;
            if (data && typeof data === 'object') {
                setStats(prev => ({ ...prev, ...data }));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const fetchSystemStatus = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/system/status');
            const data = response.data.data || response.data;
            if (data) {
                setSystemStatus(data);
            }
        } catch (error) {
            console.error('Error fetching system status:', error);
        }
    };

    const healthTrendData = [
        { date: 'Nov 9', health: 78, activity: 65, target: 85 },
        { date: 'Nov 10', health: 82, activity: 72, target: 85 },
        { date: 'Nov 11', health: 85, activity: 78, target: 85 },
        { date: 'Nov 12', health: 81, activity: 70, target: 85 },
        { date: 'Nov 13', health: 87, activity: 82, target: 85 },
        { date: 'Nov 14', health: 89, activity: 85, target: 85 },
        { date: 'Nov 15', health: 91, activity: 88, target: 85 },
    ];

    // Transform health distribution for Pie Chart
    const healthDistributionData = [
        { name: 'Excellent', value: stats?.health_distribution?.Excellent || 0, color: '#10B981' },
        { name: 'Good', value: stats?.health_distribution?.Good || 0, color: '#3B82F6' },
        { name: 'Fair', value: stats?.health_distribution?.Fair || 0, color: '#F59E0B' },
        { name: 'Poor', value: stats?.health_distribution?.Poor || 0, color: '#F97316' },
        { name: 'Critical', value: stats?.health_distribution?.Critical || 0, color: '#EF4444' },
    ].filter(item => item.value > 0);

    const locationData = [
        { zone: 'Feeding Area', count: 320, color: '#10B981' },
        { zone: 'Outdoor Paddock', count: 280, color: '#3B82F6' },
        { zone: 'Shelter', count: 180, color: '#8B5CF6' },
        { zone: 'Rest Area', count: 120, color: '#F59E0B' },
        { zone: 'Water Zone', count: 100, color: '#EC4899' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
            </div>
        );
    }

    if (!stats) return null;

    return (
        <div className="space-y-8">
            {/* System Monitor Banner - LIVE DATA */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-3xl p-6 border border-slate-700/50 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 animate-pulse" />
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-emerald-500/50 flex items-center justify-center relative shrink-0">
                            <div className="w-full h-full absolute animate-ping rounded-full bg-emerald-500/20" />
                            <Activity className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">SYSTEM OPERATIONAL</h2>
                            <div className="flex items-center gap-2 text-sm text-emerald-400 font-mono">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {systemStatus ? (
                                    <span>
                                        CPU: {systemStatus.cpu_usage}% • RAM: {systemStatus.ram_usage}% • GPU: {systemStatus.gpu_utilization}%
                                    </span>
                                ) : (
                                    <span>INITIALIZING SYSTEMS...</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1 justify-end">
                                <Server className="w-3 h-3" /> Server Load
                            </p>
                            <div className="flex items-end gap-1 justify-end mt-1 h-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: systemStatus ? `${Math.random() * 100}%` : '20%' }}
                                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                                        className="w-1 bg-emerald-500 rounded-full"
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1 justify-end">
                                <Cpu className="w-3 h-3" /> AI Confidence
                            </p>
                            <p className="text-lg font-black text-white">98.4%</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Goats"
                    value={stats.total_goats?.toLocaleString() || '0'}
                    change="12.5"
                    icon={Users}
                    gradient="from-blue-500 via-cyan-500 to-teal-500"
                    trend="up"
                    delay={0}
                />
                <StatCard
                    title="Videos Processed"
                    value={stats.videos_processed?.toLocaleString() || '0'}
                    change="8.2"
                    icon={Video}
                    gradient="from-emerald-500 via-green-500 to-teal-500"
                    trend="up"
                    delay={0.1}
                />
                <StatCard
                    title="Avg Health Score"
                    value={stats.avg_health ? Number(stats.avg_health).toFixed(1) : '0.0'}
                    change="5.3"
                    icon={Heart}
                    gradient="from-purple-500 via-pink-500 to-rose-500"
                    trend="up"
                    delay={0.2}
                />
                <StatCard
                    title="Active Alerts"
                    value={stats.active_alerts?.toLocaleString() || '0'}
                    change="3.1"
                    icon={AlertTriangle}
                    gradient="from-orange-500 via-red-500 to-pink-500"
                    trend="down"
                    delay={0.3}
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Health Trend - Takes 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-strong rounded-3xl p-8 border border-slate-700/50 card-hover"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-2xl font-black">Health & Activity Trends</h3>
                            </div>
                            <p className="text-sm text-slate-400 font-medium">Last 7 days performance metrics</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                <span className="text-sm font-semibold text-slate-300">Health</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />
                                <span className="text-sm font-semibold text-slate-300">Activity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                                <span className="text-sm font-semibold text-slate-300">Target</span>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={healthTrendData}>
                            <defs>
                                <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#94A3B8" style={{ fontSize: '12px', fontWeight: 600 }} />
                            <YAxis stroke="#94A3B8" style={{ fontSize: '12px', fontWeight: 600 }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '16px',
                                    padding: '12px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                                }}
                            />
                            <Area type="monotone" dataKey="health" stroke="#10B981" fillOpacity={1} fill="url(#healthGradient)" strokeWidth={3} />
                            <Area type="monotone" dataKey="activity" stroke="#3B82F6" fillOpacity={1} fill="url(#activityGradient)" strokeWidth={3} />
                            <Line type="monotone" dataKey="target" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Health Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50 card-hover"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                            <PieChart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black">Health Status</h3>
                            <p className="text-xs text-slate-400 font-medium">Population breakdown</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RePieChart>
                            <Pie
                                data={healthDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                                stroke="none"
                            >
                                {healthDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '16px',
                                    padding: '12px'
                                }}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Location Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-strong rounded-3xl p-8 border border-slate-700/50 card-hover"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black">Location Distribution</h3>
                            <p className="text-sm text-slate-400 font-medium">Goat presence by zone</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-bold">Live Data</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={locationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="zone" stroke="#94A3B8" style={{ fontSize: '12px', fontWeight: 600 }} />
                        <YAxis stroke="#94A3B8" style={{ fontSize: '12px', fontWeight: 600 }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '16px',
                                padding: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                        <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                            {locationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Zap, title: 'Generate Report', desc: 'Create comprehensive analytics', gradient: 'from-emerald-500 to-teal-500', delay: 0.7 },
                    { icon: Target, title: 'Health Analysis', desc: 'Deep dive into health metrics', gradient: 'from-blue-500 to-cyan-500', delay: 0.8 },
                    { icon: Activity, title: 'Behavior Insights', desc: 'Analyze activity patterns', gradient: 'from-purple-500 to-pink-500', delay: 0.9 },
                ].map((action, index) => (
                    <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: action.delay }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className="glass-strong rounded-2xl p-6 border border-slate-700/50 text-left hover:border-slate-600 transition-all group"
                    >
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-4 shadow-2xl group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-lg mb-2">{action.title}</h4>
                        <p className="text-sm text-slate-400">{action.desc}</p>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
