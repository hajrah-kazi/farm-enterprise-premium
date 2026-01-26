import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, TrendingUp, AlertTriangle, DollarSign,
    ChevronRight, ArrowUpRight, ShieldCheck,
    Activity, Zap, Syringe, Sprout, Upload, Loader2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { useToast, ToastContainer } from './Toast';

const PredictiveAnalytics = () => {
    const { addToast, toasts, removeToast } = useToast();
    const [isSimulating, setIsSimulating] = useState(false);
    // Advanced Mock data for Premium feel
    const diseaseRiskData = [
        { day: 'MON', risk: 12, confidence: 98 },
        { day: 'TUE', risk: 15, confidence: 97 },
        { day: 'WED', risk: 18, confidence: 95 },
        { day: 'THU', risk: 14, confidence: 96 },
        { day: 'FRI', risk: 22, confidence: 94 },
        { day: 'SAT', risk: 28, confidence: 92 },
        { day: 'SUN', risk: 35, confidence: 90 },
    ];

    const weightProjectionData = [
        { week: 'W1', weight: 42 },
        { week: 'W2', weight: 45 },
        { week: 'W3', weight: 48 },
        { week: 'W4', weight: 52 },
        { week: 'W5', weight: 55 },
        { week: 'W6', weight: 60 },
    ];

    const recommendations = [
        {
            id: 1,
            title: 'Nutritional Optimization',
            type: 'CRITICAL',
            description: 'Increase protein intake by 2.5% for Sector A to maximize lean mass growth detected by AI trajectory.',
            icon: Zap,
            color: '#f59e0b',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            id: 2,
            title: 'Bio-Security Alert',
            type: 'MITIGATION',
            description: 'Predicted immune dip in 48h. Deploy preventive vitamin complex V-04 to main water supply.',
            icon: Syringe,
            color: '#8b5cf6',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20'
        },
        {
            id: 3,
            title: 'Resource Allocation',
            type: 'EFFICIENCY',
            description: 'Soil nutrient depletion detected in Sector 07. Rotate herd to Zone B immediately.',
            icon: Sprout,
            color: '#10b981',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Neural Forecasting</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">AI-driven predictive modeling for livestock optimization.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            setIsSimulating(true);
                            setTimeout(() => setIsSimulating(false), 3000);
                        }}
                        disabled={isSimulating}
                        className="btn-premium btn-premium-secondary px-6 py-3 rounded-xl flex items-center gap-2"
                    >
                        {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isSimulating ? 'PROCESSING...' : 'RE-TRAIN MODEL'}
                    </button>
                    <button className="btn-premium btn-premium-primary px-6 py-3 rounded-xl shadow-2xl shadow-indigo-500/20">
                        DEPLOY PROTOCOLS
                    </button>
                </div>
            </div>

            {/* AI Intelligence Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Model Confidence', val: '98.4%', icon: Brain, color: '#6366f1', bg: 'bg-indigo-500/10', detail: 'High Precision' },
                    { label: 'Projected Growth', val: '+14.2%', icon: TrendingUp, color: '#10b981', bg: 'bg-emerald-500/10', detail: '+2.1% vs Avg' },
                    { label: 'Anomaly Risk', val: 'LOW', icon: ShieldCheck, color: '#3b82f6', bg: 'bg-blue-500/10', detail: 'Sector 07 Monitored' },
                    { label: 'Market Opportunity', val: '$12,450', icon: DollarSign, color: '#f59e0b', bg: 'bg-amber-500/10', detail: 'Q1 Forecast' }
                ].map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-8 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} flex items-center justify-center border border-white/5`}>
                                <kpi.icon className="w-6 h-6" style={{ color: kpi.color }} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">v4.2 Analysis</span>
                        </div>
                        <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-1">{kpi.label}</p>
                        <p className="text-4xl font-black text-white tracking-tight">{kpi.val}</p>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kpi.color }} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{kpi.detail}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Deep Analysis Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Visual Intelligence Node */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    <div className="glass-panel p-10 rounded-[3rem] border-white/5 relative overflow-hidden group h-full">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                            <Activity className="w-64 h-64 text-indigo-500" />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Anomaly Projection Matrix</h3>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-1">7-Day Bio-Security Variance Index</p>
                            </div>
                            <div className="px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-lg shadow-rose-500/50" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">CRITICAL THRESHOLD MONITORING</span>
                            </div>
                        </div>

                        <div className="h-[400px] relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={diseaseRiskData}>
                                    <defs>
                                        <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                    <XAxis
                                        dataKey="day"
                                        stroke="rgba(255,255,255,0.2)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontWeight: '900', fill: '#52525b' }}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.2)"
                                        fontSize={10}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(v) => `${v}%`}
                                        tick={{ fontWeight: '900', fill: '#52525b' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1rem', backdropBlur: '12px' }}
                                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="risk"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fill="url(#riskGradient)"
                                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#000' }}
                                        activeDot={{ r: 8, strokeWidth: 0, shadow: '0 0 20px rgba(99,102,241,0.5)' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <Activity className="w-4 h-4 text-emerald-500" /> SENSOR INTEGRITY AUDIT
                            </h4>
                            <div className="space-y-8">
                                {[
                                    { name: 'Thermal Nodes', status: 'Optimal', val: 98, color: '#10b981' },
                                    { name: 'Motion Resolvers', status: 'Stable', val: 94, color: '#3b82f6' },
                                    { name: 'UAV Feeds', status: 'Inquiry', val: 72, color: '#f59e0b' }
                                ].map((node, idx) => (
                                    <div key={idx} className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest leading-none">
                                            <span className="text-zinc-600">{node.name}</span>
                                            <span style={{ color: node.color }}>{node.status}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/[0.02] rounded-full overflow-hidden border border-white/5">
                                            <div
                                                className="h-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                                                style={{ width: `${node.val}%`, backgroundColor: node.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 flex flex-col justify-center items-center text-center gap-6 group hover:bg-white/[0.03] transition-all">
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-700">
                                <Zap className="w-8 h-8 text-indigo-500 shadow-lg shadow-indigo-500/20" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Strategy Engine</h4>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-3">Node Release v2.4a</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsSimulating(true);
                                    addToast('Initializing Strategy Simulation...', 'success');
                                    setTimeout(() => {
                                        setIsSimulating(false);
                                        addToast('Simulation Complete. Tactics Optimized.', 'success');
                                    }, 5000);
                                }}
                                disabled={isSimulating}
                                className="btn-premium btn-premium-secondary px-8 py-4 rounded-xl shadow-2xl"
                            >
                                {isSimulating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'RUN SIMULATION'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tactical Protocols Node */}
                <div className="xl:col-span-4 h-full">
                    <div className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                        <div className="mb-10 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mb-6 shadow-2xl">
                                <Zap className="w-5 h-5 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">Tactical Protocols</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-3">Dynamic Synthesis Output</p>
                        </div>

                        <div className="flex-1 space-y-4 relative z-10 mb-8 overflow-y-auto pr-2 scrollbar-hide">
                            {recommendations.map((rec) => (
                                <motion.div
                                    key={rec.id}
                                    className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-pointer"
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className={`p-3 rounded-xl border border-white/5 shrink-0`} style={{ backgroundColor: `${rec.color}11` }}>
                                            <rec.icon className="w-5 h-5" style={{ color: rec.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-60`} style={{ color: rec.color }}>{rec.type}</span>
                                            <h4 className="font-bold text-white text-lg tracking-tight group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                                        </div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-medium leading-relaxed mb-4">{rec.description}</p>
                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">
                                        DEPLOY ANALYTICS <ChevronRight className="w-3 h-3" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <button className="w-full py-5 rounded-2xl bg-white/[0.03] border border-white/5 text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/5 transition-all group shrink-0">
                            VIEW HISTORICAL LOGS <ChevronRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
};


export default PredictiveAnalytics;
