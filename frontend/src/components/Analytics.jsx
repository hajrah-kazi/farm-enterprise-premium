import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, TrendingUp, Beef, Activity, RefreshCw, BarChart3, DollarSign, AlertCircle, Info } from 'lucide-react';
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
            // Backend returns: { success: true, data: [...] } OR just [...] 
            // My successful curl showed a raw array? No, wait. 
            // Invok-RestMethod usually parses JSON automatically. 
            // The chunk view showed `text:"[\n  {\n ...` which is a RAW JSON ARRAY.
            // So response.data IS the array.
            const data = Array.isArray(response.data) ? response.data : (response.data.data || []);

            if (response.data.error) throw new Error(response.data.error);

            setMassData(data);

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
            console.error('Error fetching mass data:', error);
            setLoading(false);
        }
    };

    // Get breed distribution
    const getBreedDistribution = () => {
        const breedCounts = {};
        massData.forEach(item => {
            breedCounts[item.breed] = (breedCounts[item.breed] || 0) + 1;
        });
        return Object.entries(breedCounts).map(([breed, count]) => ({
            name: breed,
            value: count,
            percentage: ((count / massData.length) * 100).toFixed(1)
        }));
    };

    // Get status distribution
    const getStatusDistribution = () => {
        const statusCounts = {};
        massData.forEach(item => {
            statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
        });
        return Object.entries(statusCounts).map(([status, count]) => ({
            name: status,
            value: count,
            percentage: ((count / massData.length) * 100).toFixed(1)
        }));
    };

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

    // Get body dimension distribution
    const getBodyDimensionDistribution = () => {
        const dimensionRanges = {
            'Small (< 0.7m)': 0,
            'Medium (0.7-0.9m)': 0,
            'Large (> 0.9m)': 0
        };

        massData.forEach(item => {
            const length = item.body_length_m || 0;
            if (length < 0.7) dimensionRanges['Small (< 0.7m)']++;
            else if (length < 0.9) dimensionRanges['Medium (0.7-0.9m)']++;
            else dimensionRanges['Large (> 0.9m)']++;
        });

        return Object.entries(dimensionRanges).map(([range, count]) => ({
            name: range,
            count: count
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ready for Harvest': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Optimal': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Underweight': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'Exceeding': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-lg">Loading analytics data...</p>
                </div>
            </div>
        );
    }

    if (massData.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">No data available. Please refresh.</p>
                    <button
                        onClick={fetchMassData}
                        className="mt-4 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        Refresh Data
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-emerald-400" />
                        Mass & Yield Predictions
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">Video-based morphometric analysis using allometric scaling</p>
                </div>
                <button
                    onClick={fetchMassData}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refresh Data
                </button>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                            <Scale className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Avg Mass</p>
                            <p className="text-3xl font-black text-white">{stats.avgMass} <span className="text-sm text-slate-500">kg</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg w-fit border border-emerald-500/20">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-bold">Herd Average</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20">
                            <Beef className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Avg Meat Yield</p>
                            <p className="text-3xl font-black text-white">{stats.avgYield} <span className="text-sm text-slate-500">kg</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg w-fit border border-blue-500/20">
                        <Beef className="w-4 h-4" />
                        <span className="text-sm font-bold">Per Animal</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
                            <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Total Value</p>
                            <p className="text-3xl font-black text-white">${stats.totalValue}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-purple-400 bg-purple-500/10 px-3 py-1.5 rounded-lg w-fit border border-purple-500/20">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm font-bold">Market Projection</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 shadow-xl"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
                            <Activity className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider">Ready to Harvest</p>
                            <p className="text-3xl font-black text-white">{stats.readyForHarvest} <span className="text-sm text-slate-500">heads</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-lg w-fit border border-amber-500/20">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm font-bold">Mature Stock</span>
                    </div>
                </motion.div>
            </div>

            {/* Main Chart - Mass Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
            >
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        Top 15 Goats - Mass Distribution
                        <Info className="w-5 h-5 text-slate-400" />
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">Estimated mass by individual goat (sorted by weight)</p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={massData.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis
                            dataKey="ear_tag"
                            stroke="#94A3B8"
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            stroke="#94A3B8"
                            tick={{ fontSize: 12, fill: '#94A3B8' }}
                            tickLine={false}
                            axisLine={false}
                            label={{ value: 'Mass (kg)', angle: -90, position: 'insideLeft', fill: '#94A3B8' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                            contentStyle={{
                                backgroundColor: '#0F172A',
                                border: '1px solid #334155',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                            }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                            formatter={(value, name) => {
                                if (name === 'Mass') return [`${value} kg`, 'Estimated Mass'];
                                return [value, name];
                            }}
                        />
                        <Bar
                            dataKey="estimated_mass_kg"
                            fill="url(#colorMass)"
                            name="Mass"
                            radius={[8, 8, 0, 0]}
                            maxBarSize={60}
                        />
                        <defs>
                            <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                                <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Secondary Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Breed Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white">Breed Distribution</h3>
                        <p className="text-sm text-slate-400">Herd composition</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={getBreedDistribution()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getBreedDistribution().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0F172A',
                                    border: '1px solid #334155',
                                    borderRadius: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white">Status Distribution</h3>
                        <p className="text-sm text-slate-400">Health classification</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={getStatusDistribution()}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {getStatusDistribution().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0F172A',
                                    border: '1px solid #334155',
                                    borderRadius: '12px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Body Dimension Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
                >
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-white">Body Size Distribution</h3>
                        <p className="text-sm text-slate-400">From video measurements</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getBodyDimensionDistribution()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94A3B8" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0F172A',
                                    border: '1px solid #334155',
                                    borderRadius: '12px'
                                }}
                            />
                            <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Detailed Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="glass-strong rounded-3xl p-8 border border-slate-700/50 shadow-xl"
            >
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white">Individual Mass Analysis</h3>
                    <p className="text-sm text-slate-400 mt-1">Detailed breakdown with confidence intervals (Top 20)</p>
                    <p className="text-xs text-slate-500 mt-2">Total Records: {stats.totalGoats} | All measurements from video analysis</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Ear Tag</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Breed</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Dimensions</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">BCS</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Est. Mass</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Confidence</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Meat Yield</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Quality</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Value</th>
                                <th className="text-left py-4 px-4 text-sm font-bold text-slate-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {massData.slice(0, 20).map((goat, index) => (
                                <tr key={goat.goat_id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="py-4 px-4 text-white font-mono font-bold">{goat.ear_tag}</td>
                                    <td className="py-4 px-4 text-slate-300">{goat.breed}</td>
                                    <td className="py-4 px-4 text-slate-300 text-sm">
                                        {goat.body_length_m ? `${goat.body_length_m}m × ${goat.body_height_m}m` : 'N/A'}
                                    </td>
                                    <td className="py-4 px-4 text-amber-400 font-bold">{goat.body_condition_score || 'N/A'}</td>
                                    <td className="py-4 px-4 text-emerald-400 font-bold">{goat.estimated_mass_kg} kg</td>
                                    <td className="py-4 px-4 text-slate-400 text-sm">{goat.mass_ci_lower} - {goat.mass_ci_upper} kg</td>
                                    <td className="py-4 px-4 text-blue-400 font-bold">{goat.estimated_meat_yield_kg} kg</td>
                                    <td className="py-4 px-4 text-purple-400 text-sm">
                                        {goat.measurement_quality ? `${(goat.measurement_quality * 100).toFixed(0)}%` : 'N/A'}
                                        <span className="text-xs text-slate-500 block">({goat.observations_count || 0} obs)</span>
                                    </td>
                                    <td className="py-4 px-4 text-purple-400 font-bold">${goat.market_value}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(goat.status)}`}>
                                            {goat.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default Analytics;
