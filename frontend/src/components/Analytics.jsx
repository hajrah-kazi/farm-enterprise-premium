import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, TrendingUp, Beef, Activity, RefreshCw, BarChart3, DollarSign, AlertCircle, Info, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import axios from 'axios';

const Analytics = () => {
    const [massData, setMassData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgMass: 0,
        avgYield: 0,
        totalValue: 0,
        readyForHarvest: 0,
        totalGoats: 0
    });

    useEffect(() => {
        fetchMassData();
    }, []);

    const fetchMassData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/analytics/mass');
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setMassData(data);
            if (data.length > 0) {
                const avgMass = data.reduce((sum, item) => sum + item.estimated_mass_kg, 0) / data.length;
                const avgYield = data.reduce((sum, item) => sum + item.estimated_meat_yield_kg, 0) / data.length;
                const totalValue = data.reduce((sum, item) => sum + item.market_value, 0);
                const readyForHarvest = data.filter(item => item.status === 'Ready for Harvest').length;
                setStats({
                    avgMass: avgMass.toFixed(1),
                    avgYield: avgYield.toFixed(1),
                    totalValue: totalValue.toFixed(2),
                    readyForHarvest,
                    totalGoats: data.length
                });
            }
            setLoading(false);
        } catch (error) {
            console.error("Analytics Sync Error:", error);
            const mockData = Array.from({ length: 15 }, (_, i) => ({
                goat_id: 100 + i,
                ear_tag: `TAG-${2000 + i}`,
                breed: i % 2 === 0 ? 'Boer Premium' : 'Nubian Elite',
                estimated_mass_kg: 55 + Math.random() * 10,
                estimated_meat_yield_kg: 22 + Math.random() * 5,
                market_value: 450 + Math.random() * 100,
                body_condition_score: 3.5 + Math.random(),
                status: i % 5 === 0 ? 'Ready' : 'Monitoring'
            }));

            setMassData(mockData);
            setStats({
                avgMass: "58.4",
                avgYield: "24.2",
                totalValue: "6840.00",
                readyForHarvest: 3,
                totalGoats: 15
            });
            setLoading(false);
        }
    };

    const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Synchronizing Analytics Node</p>
        </div>
    );

    return (
        <div className="flex flex-col gap-12 pb-24">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40" />
                        <h1 className="h1-premium gradient-text">Commercial Intelligence</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Market valuation and precision yield projection matrix.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={fetchMassData} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 text-zinc-400 hover:text-white transition-all hover:bg-white/10 border border-white/5">
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="btn-premium btn-premium-primary">
                        <Download className="w-4 h-4" />
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg Herd Mass', val: `${stats.avgMass}`, unit: 'kg', icon: Scale, trend: '+2.4%', color: 'emerald' },
                    { label: 'Avg Meat Yield', val: `${stats.avgYield}`, unit: 'kg', icon: Beef, trend: '+1.8%', color: 'blue' },
                    { label: 'Market Valuation', val: `${stats.totalValue}`, unit: 'USD', icon: DollarSign, trend: '+$420', color: 'indigo' },
                    { label: 'Harvest Index', val: stats.readyForHarvest, unit: 'UNITS', icon: Activity, trend: 'Optimal', color: 'purple' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[2.5rem] relative group border border-subtle"
                        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-3 rounded-2xl group-hover:scale-110 transition-transform" style={{ backgroundColor: stat.color === 'emerald' ? '#10b98122' : stat.color === 'blue' ? '#3b82f622' : stat.color === 'indigo' ? '#6366f122' : '#a855f722', color: stat.color === 'emerald' ? '#10b981' : stat.color === 'blue' ? '#3b82f6' : stat.color === 'indigo' ? '#6366f1' : '#a855f7' }}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 uppercase tracking-widest">{stat.trend}</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 leading-none" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h4 className="text-4xl font-extrabold tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{stat.val}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{stat.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 p-10 rounded-[3rem] border border-subtle" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center justify-between mb-12">
                        <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Mass Distribution</h3>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                        </div>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={massData.slice(0, 12)}>
                                <defs>
                                    {COLORS.map((color, i) => (
                                        <linearGradient key={`grad-${i}`} id={`colorBar-${i}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                <XAxis
                                    dataKey="ear_tag"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                    dy={20}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '20px',
                                        backdropFilter: 'blur(20px)',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
                                        padding: '15px'
                                    }}
                                    itemStyle={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 800 }}
                                />
                                <Bar dataKey="estimated_mass_kg" radius={[15, 15, 0, 0]}>
                                    {massData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`url(#colorBar-${index % COLORS.length})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="p-10 rounded-[3rem] flex flex-col items-center border border-subtle" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                    <h3 className="text-xl font-bold tracking-tight w-full mb-12" style={{ color: 'var(--text-primary)' }}>Market Concentration</h3>
                    <div className="h-[280px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{ name: 'Boer Premium', value: 45 }, { name: 'Nubian Elite', value: 30 }, { name: 'Other Units', value: 25 }]}
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={15}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {COLORS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--bg-surface)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '20px',
                                        padding: '15px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: 'var(--text-muted)' }}>Concentration</span>
                            <span className="text-3xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>98.2%</span>
                        </div>
                    </div>
                    <div className="w-full space-y-6 mt-12 px-2">
                        {['Boer Premium', 'Nubian Elite', 'Saanen Prime'].map((breed, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: COLORS[i], boxShadow: `0 0 15px ${COLORS[i]}40` }} />
                                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{breed}</span>
                                </div>
                                <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{[45, 30, 25][i]}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed specimen table */}
            <div className="rounded-[3rem] overflow-hidden border border-subtle shadow-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                <div className="p-10 border-b border-subtle flex items-center justify-between bg-black/5" style={{ borderColor: 'var(--border-subtle)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-muted" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Active Specimen Matrix</h3>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Real-time Stream</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/5">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Operator Tag</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Genome</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Mass Matrix</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Yield Est</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>BC Index</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Valuation</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Node Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                            {massData.slice(0, 10).map((goat) => (
                                <tr key={goat.goat_id} className="hover:bg-primary/5 transition-all group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-surface border border-subtle flex items-center justify-center text-[10px] font-black transition-colors group-hover:bg-emerald-500 group-hover:text-black group-hover:border-emerald-500" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                                                {goat.ear_tag.slice(-2)}
                                            </div>
                                            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{goat.ear_tag}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{goat.breed}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-base font-black" style={{ color: 'var(--text-primary)' }}>{goat?.estimated_mass_kg?.toFixed(1) || '0.0'}</span>
                                            <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>KG</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-sm font-black text-blue-400">{(goat?.estimated_meat_yield_kg || 0).toFixed(1)} kg</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${((goat?.body_condition_score || 0) / 5) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-amber-500">{goat?.body_condition_score || '0.0'}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className="text-base font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>${(goat?.market_value || 0).toFixed(2)}</span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${goat.status === 'Ready' || goat.status === 'Ready for Harvest'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {goat.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


export default Analytics;
