import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Plus, Filter, Search, ChevronDown, Loader2, X, BarChart2, PieChart as PieChartIcon, Eye } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from './Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
    const { addToast, ToastContainer, toasts, removeToast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Preview State
    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    // Configuration State
    const [selectedType, setSelectedType] = useState('Daily');
    const [config, setConfig] = useState({
        date: new Date().toISOString().split('T')[0],
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        year: new Date().getFullYear().toString(),
        week_start: new Date().toISOString().split('T')[0]
    });

    const REPORT_TYPES = [
        'Daily', 'Weekly', 'Monthly', 'Yearly',
        'Health Summary', 'Inventory Log', 'Feeding Log', 'Activity Log'
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get('/api/reports');
            if (response.data.success && response.data.data) {
                setReports(response.data.data.reports || []);
            } else if (response.data.reports) {
                setReports(response.data.reports || []);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            setLoading(false);
        }
    };

    const handleGeneratePreview = async () => {
        setGenerating(true);
        try {
            // Fetch the data but don't save to DB yet (or use the generate endpoint which returns data)
            // The existing backend 'generate_report' SAVES automatically. 
            // For now, we will use the same endpoint, save it, but show the preview immediately.
            // Ideally we'd have a dry-run endpoint, but this works: generate -> show preview of RESULT -> allow download.

            const payload = {
                report_type: selectedType,
                title: `${selectedType} Report - ${new Date().toLocaleDateString()}`,
                format: 'PDF',
                ...config
            };

            const response = await axios.post('/api/reports/generate', payload);

            if (response.data && response.data.data) {
                // If the backend returns the generated data
                const reportRecord = {
                    ...response.data.data, // This is the 'content' of the report
                    title: payload.title,
                    report_type: selectedType,
                    created_at: new Date().toISOString(),
                    report_id: response.data.report_id // The ID of the saved report
                };

                // Backend 'data' field in response might be the metrics directly or nested
                // Based on app.py: return jsonify({ ..., data: report_data })
                // So response.data.data IS the report content object (stats, inventory etc)

                setPreviewData({
                    metadata: {
                        title: payload.title,
                        type: selectedType,
                        date: new Date().toISOString(),
                        id: response.data.report_id
                    },
                    content: response.data.data
                });

                setShowPreview(true);
                await fetchReports();
                addToast('Report generated. Showing preview.', 'success');
            }
            setGenerating(false);
        } catch (error) {
            console.error('Error generating report:', error);
            addToast('Failed to generate report. Please try again.', 'error');
            setGenerating(false);
        }
    };

    const downloadPDF = () => {
        if (!previewData) return;

        const { metadata, content } = previewData;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129); // Emerald-500
        doc.text("GoatAI Enterprise Report", 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(60);
        doc.text(metadata.title, 14, 32);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);
        doc.text(`Type: ${metadata.type}`, 14, 45);

        let startY = 55;

        // 1. Stats Table
        if (content.stats) {
            doc.text(`${content.period || 'General'} Statistics`, 14, startY);
            const statsBody = Object.entries(content.stats).map(([k, v]) => [k, String(v)]);

            autoTable(doc, {
                startY: startY + 5,
                head: [['Metric', 'Value']],
                body: statsBody,
                theme: 'striped',
                headStyles: { fillColor: [16, 185, 129] }
            });
            startY = doc.lastAutoTable.finalY + 15;
        }

        // 2. Health Distribution
        if (content.health_distribution) {
            doc.text("Health Status Distribution", 14, startY);
            const distBody = Object.entries(content.health_distribution).map(([k, v]) => [k, String(v)]);

            autoTable(doc, {
                startY: startY + 5,
                head: [['Status', 'Count']],
                body: distBody,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] }
            });
            startY = doc.lastAutoTable.finalY + 15;
        }

        // 3. Records List
        if (content.records && content.records.length > 0) {
            doc.text(`${metadata.type} Details (${content.records.length} records)`, 14, startY);
            const first = content.records[0];
            const columns = Object.keys(first).filter(k => typeof first[k] !== 'object' && k !== 'metadata').slice(0, 6);
            const rows = content.records.map(r => columns.map(c => r[c] !== null ? String(r[c]).substring(0, 40) : '-'));

            autoTable(doc, {
                startY: startY + 5,
                head: [columns.map(c => c.replace(/_/g, ' ').toUpperCase())],
                body: rows,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [249, 115, 22] }
            });
        }

        // 4. Production Details
        if (content.details && content.details.length > 0) {
            doc.text("Production Estimates", 14, startY);
            const columns = ['Ear Tag', 'Breed', 'Weight (kg)', 'Est. Meat (kg)'];
            const rows = content.details.map(item => [
                item.ear_tag,
                item.breed,
                item.weight_kg,
                item.projected_meat_kg
            ]);

            autoTable(doc, {
                startY: startY + 5,
                head: [columns],
                body: rows,
                headStyles: { fillColor: [139, 92, 246] }
            });
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Generated by GoatAI Enterprise System', 14, doc.internal.pageSize.height - 10);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
        }

        doc.save(`${metadata.title.replace(/[\s/]/g, '_')}.pdf`);
    };

    const downloadExistingReport = async (report) => {
        try {
            // First fetch full data
            const response = await axios.get(`/api/reports/${report.report_id}`);
            if (response.data) {
                // Reuse preview logic to set data, then download immediately? 
                // Or just reproduce the logic. Let's just set preview and show modal so they can see it first.
                setPreviewData({
                    metadata: {
                        title: report.title,
                        type: report.report_type,
                        date: report.created_at,
                        id: report.report_id
                    },
                    content: response.data.data
                });
                setShowPreview(true);
            }
        } catch (e) {
            console.error(e);
            addToast("Error fetching report details", "error");
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <FileText className="w-10 h-10 text-emerald-400" />
                        Reports Center
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg">Generate detailed analytics and compliance reports</p>
                </div>
            </div>

            {/* Configuration Panel */}
            <div className="bg-slate-900 border border-slate-700/50 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <div className="flex items-center gap-3 mb-8 border-b border-slate-700/50 pb-4">
                    <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                        <Filter className="w-5 h-5 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Configure New Report</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end relative z-10">
                    {/* Report Type */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Report Type</label>
                        <div className="relative group">
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full appearance-none bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-lg transition-all cursor-pointer hover:border-slate-500 shadow-inner"
                            >
                                {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-emerald-400 transition-colors" />
                        </div>
                    </div>

                    {/* Dynamic Filters */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Time Period</label>
                        {selectedType === 'Daily' || selectedType.includes('Log') || selectedType === 'Health Summary' ? (
                            <input
                                type="date"
                                value={config.date}
                                onChange={e => setConfig({ ...config, date: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-lg shadow-inner"
                            />
                        ) : selectedType === 'Weekly' ? (
                            <input
                                type="date"
                                value={config.week_start}
                                onChange={e => setConfig({ ...config, week_start: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-lg shadow-inner"
                            />
                        ) : selectedType === 'Monthly' ? (
                            <input
                                type="month"
                                value={config.month}
                                onChange={e => setConfig({ ...config, month: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-lg shadow-inner"
                            />
                        ) : selectedType === 'Yearly' ? (
                            <select
                                value={config.year}
                                onChange={e => setConfig({ ...config, year: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-bold text-lg shadow-inner"
                            >
                                {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        ) : (
                            <div className="w-full px-5 py-4 bg-slate-800/50 rounded-xl border border-slate-700/50 text-slate-500 italic font-medium">
                                No date filter required
                            </div>
                        )}
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={handleGeneratePreview}
                        disabled={generating}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-lg shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 border border-emerald-400/20"
                    >
                        {generating ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <Eye className="w-6 h-6" /> // Changed to Eye for Preview
                        )}
                        {generating ? 'GENERATING...' : 'GENERATE & PREVIEW'}
                    </button>
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/30">
                    <h3 className="text-lg font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        Generated Reports History
                    </h3>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by title or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-800">
                    {loading ? (
                        <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
                            <p>Loading reports history...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-6">
                            <FileText className="w-12 h-12 text-slate-600" />
                            <p>No reports generated yet.</p>
                        </div>
                    ) : (
                        filteredReports.map((report) => (
                            <div key={report.report_id} className="p-6 hover:bg-slate-800/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl shadow-lg ${report.report_type.includes('Health') ? 'bg-blue-500/10 text-blue-400' :
                                            report.report_type.includes('Log') ? 'bg-orange-500/10 text-orange-400' :
                                                'bg-emerald-500/10 text-emerald-400'
                                        }`}>
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-lg">{report.title}</h4>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 mt-2">
                                            <span className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(report.created_at).toLocaleString()}
                                            </span>
                                            <span className="bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 uppercase font-bold text-xs tracking-wider">
                                                {report.report_type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => downloadExistingReport(report)}
                                    className="px-6 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 font-bold shadow-sm hover:shadow-emerald-500/20"
                                >
                                    <Eye className="w-4 h-4" />
                                    View / Download
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {showPreview && previewData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPreview(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col relative z-10 shadow-3xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 rounded-t-3xl">
                                <div>
                                    <h2 className="text-2xl font-black text-white">{previewData.metadata.title}</h2>
                                    <p className="text-slate-400 text-sm mt-1">Generated: {new Date(previewData.metadata.date).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={downloadPDF}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </button>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Dynamic Content Rendering */}
                                {previewData.content.stats && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(previewData.content.stats).map(([k, v]) => (
                                            <div key={k} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">{k}</p>
                                                <p className="text-2xl font-black text-white">{v}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Charts */}
                                {previewData.content.health_distribution && (
                                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-blue-400" /> Health Distribution</h3>
                                        <div className="h-64 flex justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={Object.entries(previewData.content.health_distribution).map(([name, value]) => ({ name, value }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    >
                                                        {Object.entries(previewData.content.health_distribution).map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#fff' }} />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                )}

                                {/* Tables */}
                                {previewData.content.records && (
                                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-950/50 border-b border-slate-700">
                                                        {Object.keys(previewData.content.records[0]).slice(0, 6).map(key => (
                                                            <th key={key} className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                                {key.replace(/_/g, ' ')}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-700">
                                                    {previewData.content.records.slice(0, 50).map((record, i) => (
                                                        <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                                            {Object.keys(previewData.content.records[0]).slice(0, 6).map(key => (
                                                                <td key={key} className="p-4 text-sm text-slate-300 font-medium">
                                                                    {typeof record[key] === 'object' ? JSON.stringify(record[key]) : record[key]}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {previewData.content.records.length > 50 && (
                                            <div className="p-4 text-center text-slate-500 text-sm bg-slate-950/30">
                                                Showing top 50 records. Download PDF for full list.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Reports;
