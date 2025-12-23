import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Brain, TrendingUp, AlertTriangle, DollarSign,
    ChevronRight, ArrowUpRight, ShieldCheck,
    Activity, Zap, Syringe, Sprout, Upload
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';

const PredictiveAnalytics = () => {
    // Mock data based on user request
    const diseaseRiskData = [
        { day: 'Today', risk: 12 },
        { day: '+1d', risk: 15 },
        { day: '+2d', risk: 18 },
        { day: '+3d', risk: 14 },
        { day: '+4d', risk: 22 },
        { day: '+5d', risk: 28 },
        { day: '+6d', risk: 35 },
    ];

    const recommendations = [
        {
            id: 1,
            title: 'Adjust Feed Composition',
            type: 'High Impact',
            description: 'Increase protein intake by 2.5% for Group A to maximize growth.',
            icon: Zap,
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20'
        },
        {
            id: 2,
            title: 'Schedule Vet Visit',
            type: 'Medium Impact',
            description: 'Predicted immune dip in 3 days. Preventive checkup recommended.',
            icon: Syringe,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            id: 3,
            title: 'Rotate Pasture',
            type: 'Low Impact',
            description: 'Soil nutrient depletion detected in Zone 3.',
            icon: Sprout,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20'
        }
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-emerald-400" />
                        Predictive Intelligence
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">AI-driven forecasts and optimization models</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Video
                    </button>
                    <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20">
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Confidence */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                            <Brain className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            OPTIMAL
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Model Confidence</p>
                    <p className="text-3xl font-black text-white mt-1">94.2%</p>
                </motion.div>

                {/* Projected Yield */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> 12.5%
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Projected Yield (30d)</p>
                    <p className="text-3xl font-black text-white mt-1">+12.5% <span className="text-sm font-medium text-slate-500">vs last month</span></p>
                </motion.div>

                {/* Disease Risk */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-slate-700 text-slate-300 border border-slate-600">
                            STABLE
                        </span>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Disease Risk Index</p>
                    <p className="text-3xl font-black text-white mt-1">Low</p>
                </motion.div>

                {/* Cost Savings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Est. Cost Savings</p>
                    <p className="text-3xl font-black text-white mt-1">$2,450</p>
                    <p className="text-xs text-amber-500/80 font-bold mt-1">Optimized feed strategy</p>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                7-Day Disease Risk Forecast
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">AI-predicted health anomalies per day</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Acceptable
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                Elevating
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Critical
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={diseaseRiskData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    stroke="#94A3B8"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#94A3B8"
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0F172A',
                                        border: '1px solid #334155',
                                        borderRadius: '12px'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="risk"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRisk)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Recommendations List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl flex flex-col"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Optimization Recommendations
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">Actionable AI insights</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {recommendations.map((rec) => (
                            <div key={rec.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-colors group cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-lg ${rec.bgColor} ${rec.color}`}>
                                        <rec.icon className="w-4 h-4" />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${rec.borderColor} ${rec.color} ${rec.bgColor}`}>
                                        {rec.type}
                                    </span>
                                </div>
                                <h4 className="font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{rec.title}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{rec.description}</p>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold text-sm hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-2">
                        View All Insights
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PredictiveAnalytics;
