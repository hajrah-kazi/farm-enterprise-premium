import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, Download, Printer } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { exportToCSV, printData } from '../utils/exportUtils';
import { useToast } from './Toast';

const FinancialDashboard = () => {
    const [period, setPeriod] = useState('month');
    const { addToast, ToastContainer } = useToast();

    // Data defined inside component relative to period (in a real app, this would change)
    const financialData = {
        summary: {
            revenue: 125000,
            expenses: 78000,
            profit: 47000,
            profitMargin: 37.6,
            growth: 12.5
        },
        monthlyData: [
            { month: 'Jan', revenue: 95000, expenses: 62000, profit: 33000 },
            { month: 'Feb', revenue: 102000, expenses: 68000, profit: 34000 },
            { month: 'Mar', revenue: 115000, expenses: 72000, profit: 43000 },
            { month: 'Apr', revenue: 125000, expenses: 78000, profit: 47000 },
        ],
        expenseBreakdown: [
            { name: 'Feed', value: 35000, color: '#10B981' },
            { name: 'Veterinary', value: 18000, color: '#3B82F6' },
            { name: 'Labor', value: 15000, color: '#8B5CF6' },
            { name: 'Utilities', value: 6000, color: '#F59E0B' },
            { name: 'Other', value: 4000, color: '#EF4444' },
        ],
        revenueStreams: [
            { source: 'Goat Sales', amount: 85000, percentage: 68 },
            { source: 'Milk Production', amount: 25000, percentage: 20 },
            { source: 'Breeding Services', amount: 10000, percentage: 8 },
            { source: 'Other', amount: 5000, percentage: 4 },
        ]
    };

    const handleExport = () => {
        try {
            exportToCSV(financialData.monthlyData, `financial_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
            addToast('Financial Report Exported Successfully', 'success');
        } catch (error) {
            addToast('Failed to export report', 'error');
        }
    };

    const handlePrint = () => {
        try {
            // Flatten data for printing
            const printContent = financialData.monthlyData.map(item => ({
                Month: item.month,
                Revenue: `₹${item.revenue.toLocaleString()}`,
                Expenses: `₹${item.expenses.toLocaleString()}`,
                Profit: `₹${item.profit.toLocaleString()}`
            }));
            printData(printContent, 'Monthly Financial Report');
            addToast('Printing Service Started', 'info');
        } catch (error) {
            addToast('Failed to initiate print', 'error');
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${trend === 'up' ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-purple-500'
                    }`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                    {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-bold">{change}%</span>
                </div>
            </div>
            <h3 className="text-sm text-slate-400 font-semibold mb-2">{title}</h3>
            <p className="text-3xl font-black text-white">₹{value.toLocaleString()}</p>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <ToastContainer />
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white mb-2">Financial Overview</h2>
                    <p className="text-slate-400">Track revenue, expenses, and profitability</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                    >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option>
                        <option value="year">This Year</option>
                    </select>

                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                        <Printer className="w-4 h-4" />
                        Print
                    </button>

                    <button
                        onClick={handleExport}
                        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={financialData.summary.revenue}
                    change={financialData.summary.growth}
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Total Expenses"
                    value={financialData.summary.expenses}
                    change={8.3}
                    icon={TrendingDown}
                    trend="down"
                />
                <StatCard
                    title="Net Profit"
                    value={financialData.summary.profit}
                    change={15.2}
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Profit Margin"
                    value={financialData.summary.profitMargin}
                    change={2.1}
                    icon={PieChart}
                    trend="up"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Revenue vs Expenses
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financialData.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Expense Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-blue-400" />
                        Expense Breakdown
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RePieChart>
                            <Pie
                                data={financialData.expenseBreakdown}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {financialData.expenseBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                        </RePieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Revenue Streams & Profit Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Streams */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50"
                >
                    <h3 className="text-lg font-bold text-white mb-6">Revenue Streams</h3>
                    <div className="space-y-4">
                        {financialData.revenueStreams.map((stream, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-300">{stream.source}</span>
                                    <span className="text-sm font-bold text-white">₹{stream.amount.toLocaleString()}</span>
                                </div>
                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                        style={{ width: `${stream.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Profit Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50"
                >
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Profit Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={financialData.monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    borderRadius: '12px',
                                    color: '#fff'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="profit"
                                stroke="#10B981"
                                strokeWidth={3}
                                dot={{ fill: '#10B981', r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );
};

export default FinancialDashboard;
