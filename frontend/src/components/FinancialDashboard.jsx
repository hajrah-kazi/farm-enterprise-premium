import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Download, Printer } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, printData } from '../utils/exportUtils';
import { useToast } from './Toast';

const FinancialDashboard = () => {
    const [period, setPeriod] = useState('month');
    const { addToast, ToastContainer } = useToast();

    const financialData = {
        summary: {
            revenue: 1425000,
            expenses: 678000,
            profit: 747000,
            profitMargin: 52.4,
            growth: 14.8
        },
        monthlyData: [
            { month: 'JAN', revenue: 295000, expenses: 162000, profit: 133000 },
            { month: 'FEB', revenue: 302000, expenses: 168000, profit: 134000 },
            { month: 'MAR', revenue: 315000, expenses: 172000, profit: 143000 },
            { month: 'APR', revenue: 325000, expenses: 178000, profit: 147000 },
            { month: 'MAY', revenue: 380000, expenses: 185000, profit: 195000 },
            { month: 'JUN', revenue: 410000, expenses: 190000, profit: 220000 },
        ],
        expenseBreakdown: [
            { name: 'Feed & Nutrition', value: 350000, color: '#10B981' },
            { name: 'Veterinary Oversight', value: 180000, color: '#6366F1' },
            { name: 'Operational Labor', value: 150000, color: '#F59E0B' },
            { name: 'Tech Infrastructure', value: 60000, color: '#EC4899' },
            { name: 'Strategic Logistics', value: 40000, color: '#64748B' },
        ],
        transactions: [
            { id: 'TX-9021', entity: 'Elite Breed Co.', type: 'Revenue', amount: 45000, date: '2023-11-12', status: 'Completed' },
            { id: 'TX-9022', entity: 'BioFeed Logistics', type: 'Expense', amount: 12500, date: '2023-11-11', status: 'Processing' },
            { id: 'TX-9023', entity: 'VetCare Systems', type: 'Expense', amount: 2800, date: '2023-11-10', status: 'Completed' },
            { id: 'TX-9024', entity: 'Global Milk Dist.', type: 'Revenue', amount: 8200, date: '2023-11-09', status: 'Completed' },
        ]
    };

    const handleExport = () => {
        try {
            exportToCSV(financialData.monthlyData, `financial_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
            addToast('Financial Intelligence Exported', 'success');
        } catch (error) {
            addToast('Export System Fault', 'error');
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, trend, delay }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-panel p-8 rounded-[2.5rem] border-white/5 hover:bg-white/[0.04] transition-all group overflow-hidden relative"
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                <Icon className="w-24 h-24 text-white" />
            </div>
            <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5 transition-all duration-500 shadow-2xl ${trend === 'up' ? 'bg-emerald-500/5 text-emerald-500 shadow-emerald-500/10' : 'bg-rose-500/5 text-rose-500 shadow-rose-500/10'}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest leading-none border border-white/5 ${trend === 'up' ? 'bg-emerald-500/5 text-emerald-500' : 'bg-rose-500/5 text-rose-500'}`}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {change}%
                </div>
            </div>
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span className="text-lg font-medium text-zinc-700 tracking-normal">₹</span>
                {value.toLocaleString()}
            </p>
        </motion.div>
    );

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1400px] mx-auto">
            <ToastContainer />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Fiscal Intelligence</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Enterprise financial modeling and transactional auditing.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-white/[0.02] rounded-2xl p-1.5 border border-white/5 backdrop-blur-3xl shadow-2xl">
                        {['week', 'month', 'year'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${period === p ? 'bg-white text-black shadow-2xl' : 'text-zinc-600 hover:text-white'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleExport} className="btn-premium btn-premium-primary px-6 py-4 rounded-xl shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
                        <Download className="w-4 h-4" /> EXPORT LEDGER
                    </button>
                </div>
            </div>

            {/* Performance Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Annual Revenue" value={financialData.summary.revenue} change={14.8} icon={DollarSign} trend="up" delay={0} />
                <StatCard title="Annual OpEx" value={financialData.summary.expenses} change={5.2} icon={TrendingDown} trend="down" delay={0.1} />
                <StatCard title="Net Profit" value={financialData.summary.profit} change={22.4} icon={TrendingUp} trend="up" delay={0.2} />
                <StatCard title="Profit Margin" value={financialData.summary.profitMargin} change={4.1} icon={PieChart} trend="up" delay={0.3} />
            </div>

            {/* Deep Analysis Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Revenue Growth Graph */}
                <div className="xl:col-span-8 glass-panel p-10 rounded-[3rem] border-white/5 relative overflow-hidden group bg-white/[0.01]">
                    <div className="flex justify-between items-center mb-12 relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">Fiscal Growth Trajectory</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mt-3">Monthly Revenue vs OpEx Performance Matrix</p>
                        </div>
                    </div>

                    <div className="h-[400px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialData.monthlyData} barGap={8}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: '900', fill: '#52525b' }} />
                                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} tick={{ fontWeight: '900', fill: '#52525b' }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', backdropBlur: '12px' }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Bar dataKey="revenue" fill="url(#revGrad)" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="expenses" fill="url(#expGrad)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Vertical Allocation Node */}
                <div className="xl:col-span-4 h-full">
                    <div className="glass-panel p-10 rounded-[3rem] border-white/5 flex flex-col h-full bg-black/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                        <div className="mb-10 relative z-10">
                            <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Expense Allocation</h3>
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-3">Strategic Resource Distribution</p>
                        </div>

                        <div className="h-[280px] mb-12 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie data={financialData.expenseBreakdown} innerRadius={85} outerRadius={110} paddingAngle={12} dataKey="value">
                                        {financialData.expenseBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.95)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '1.5rem', backdropBlur: '12px' }}
                                    />
                                </RePieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Total OpEx</p>
                                <p className="text-2xl font-black text-white tracking-tighter">₹{(financialData.summary.expenses / 1000).toFixed(0)}k</p>
                            </div>
                        </div>

                        <div className="space-y-6 relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                            {financialData.expenseBreakdown.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-default">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-transform group-hover:scale-125 duration-500" style={{ backgroundColor: item.color }} />
                                        <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest transition-colors group-hover:text-zinc-200">{item.name}</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-white tracking-tight">₹{(item.value / 1000).toFixed(0)}k</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tactical Transaction Node */}
            <div className="glass-panel border-white/5 rounded-[3.5rem] overflow-hidden bg-white/[0.01] shadow-2xl">
                <div className="p-12 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h3 className="text-2xl font-bold text-white tracking-tight uppercase leading-none">Global Ledger</h3>
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Real-time encrypted settlement stream</p>
                    </div>
                    <button className="btn-premium btn-premium-secondary px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                        FULL STATEMENTS
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                                <th className="px-12 py-8">Reference</th>
                                <th className="px-12 py-8">Merchant / Entity</th>
                                <th className="px-12 py-8">Dynamic Protocol</th>
                                <th className="px-12 py-8">Settlement Amount</th>
                                <th className="px-12 py-8 text-right">Sequence Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {financialData.transactions.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-white/[0.03] transition-all duration-700">
                                    <td className="px-12 py-10 text-[12px] font-black text-zinc-500 group-hover:text-white transition-colors uppercase tracking-widest leading-none">{tx.id}</td>
                                    <td className="px-12 py-10 text-[15px] font-bold text-white tracking-tight">{tx.entity}</td>
                                    <td className="px-12 py-10">
                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border transition-all duration-700 shadow-2xl ${tx.type === 'Revenue' ? 'text-emerald-500 border-emerald-500/10 bg-emerald-500/5 group-hover:bg-emerald-500/10' : 'text-indigo-400 border-indigo-500/10 bg-indigo-500/5 group-hover:bg-indigo-500/10'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-12 py-10 text-xl font-black text-white tracking-tighter">
                                        <span className="text-xs font-medium text-zinc-700 mr-2">₹</span>
                                        {tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-12 py-10">
                                        <div className="flex items-center justify-end gap-3 text-right">
                                            <div className={`w-2 h-2 rounded-full ${tx.status === 'Completed' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors">{tx.status}</span>
                                        </div>
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


export default FinancialDashboard;
