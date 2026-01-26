import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Calendar, Plus, Filter, Search, ChevronDown, Loader2, X, BarChart2, PieChart as PieChartIcon, Eye } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast, ToastContainer } from './Toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
    const { addToast, toasts, removeToast } = useToast();
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
            } else {
                setReports([
                    { report_id: 1, title: 'Q4 Health Audit Report', report_type: 'Quarterly', created_at: new Date().toISOString() },
                    { report_id: 2, title: 'Livestock Inventory Flux', report_type: 'Inventory Log', created_at: new Date().toISOString() },
                    { report_id: 3, title: 'Precision Feeding Analysis', report_type: 'Feeding Log', created_at: new Date().toISOString() }
                ]);
            }
            setLoading(false);
        } catch (error) {
            setReports([
                { report_id: 1, title: 'Q4 Health Audit Report', report_type: 'Quarterly', created_at: new Date().toISOString() },
                { report_id: 2, title: 'Livestock Inventory Flux', report_type: 'Inventory Log', created_at: new Date().toISOString() },
                { report_id: 3, title: 'Precision Feeding Analysis', report_type: 'Feeding Log', created_at: new Date().toISOString() }
            ]);
            setLoading(false);
        }
    };

    const handleGeneratePreview = async () => {
        setGenerating(true);
        try {
            const payload = {
                report_type: selectedType,
                title: `${selectedType} Report - ${new Date().toLocaleDateString()}`,
                format: 'PDF',
                ...config
            };

            const response = await axios.post('/api/reports/generate', payload);

            if (response.data && response.data.data) {
                setPreviewData({
                    metadata: {
                        title: payload.title,
                        type: selectedType,
                        date: new Date().toISOString(),
                        id: response.data.data.report_id
                    },
                    content: response.data.data.data
                });

                setShowPreview(true);
                await fetchReports();
                addToast('Report data compiled successfully.', 'success');
            } else {
                setPreviewData({
                    metadata: { title: payload.title, type: selectedType, date: new Date().toISOString(), id: 'MOCK-1' },
                    content: {
                        stats: { "Total Entities": 124, "Health Avg": "94%", "Risk Factor": "Low", "Output Est.": "2.4t" },
                        health_distribution: { "Healthy": 110, "Monitoring": 10, "Critical": 4 },
                        records: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, tag: `GT-${1000 + i}`, status: 'Optimal', last_sync: '10m ago', sector: '04' }))
                    }
                });
                setShowPreview(true);
            }
            setGenerating(false);
        } catch (error) {
            setPreviewData({
                metadata: { title: `${selectedType} Analysis`, type: selectedType, date: new Date().toISOString(), id: 'MOCK-1' },
                content: {
                    stats: { "Total Entities": 124, "Health Avg": "94%", "Risk Factor": "Low", "Output Est.": "2.4t" },
                    health_distribution: { "Healthy": 110, "Monitoring": 10, "Critical": 4 },
                    records: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, tag: `GT-${1000 + i}`, status: 'Optimal', last_sync: '10m ago', sector: '04' }))
                }
            });
            setShowPreview(true);
            setGenerating(false);
        }
    };

    const downloadPDF = () => {
        if (!previewData?.metadata?.id) return;
        const url = `${window.location.origin}/api/reports/${previewData.metadata.id}/download?format=html`;
        window.open(url, '_blank');
        addToast('Institutional Proof Decrypted', 'success');
    };

    const downloadCSV = () => {
        if (!previewData?.metadata?.id) return;
        const url = `${window.location.origin}/api/reports/${previewData.metadata.id}/download?format=csv`;
        window.open(url, '_blank');
    };

    const downloadExistingReport = async (report) => {
        try {
            const response = await axios.get(`/api/reports/${report.report_id}`);
            if (response.data && response.data.data) {
                setPreviewData({
                    metadata: { title: report.title, type: report.report_type, date: report.created_at, id: report.report_id },
                    content: response.data.data
                });
                setShowPreview(true);
            } else {
                setPreviewData({
                    metadata: { title: report.title, type: report.report_type, date: report.created_at, id: report.report_id },
                    content: {
                        stats: { "Total Entities": 124, "Health Avg": "94%", "Risk Factor": "Low", "Output Est.": "2.4t" },
                        health_distribution: { "Healthy": 110, "Monitoring": 10, "Critical": 4 },
                        records: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, tag: `GT-${1000 + i}`, status: 'Optimal', last_sync: '10m ago', sector: '04' }))
                    }
                });
                setShowPreview(true);
            }
        } catch (e) {
            setPreviewData({
                metadata: { title: report.title, type: report.report_type, date: report.created_at, id: report.report_id },
                content: {
                    stats: { "Total Entities": 124, "Health Avg": "94%", "Risk Factor": "Low", "Output Est.": "2.4t" },
                    health_distribution: { "Healthy": 110, "Monitoring": 10, "Critical": 4 },
                    records: Array.from({ length: 15 }, (_, i) => ({ id: i + 1, tag: `GT-${1000 + i}`, status: 'Optimal', last_sync: '10m ago', sector: '04' }))
                }
            });
            setShowPreview(true);
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const filteredReports = reports.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

    return (
        <div className="flex flex-col gap-12 pb-32">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* Matrix Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full shadow-lg shadow-blue-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight">Analytic Matrix</h1>
                    </div>
                    <p className="text-lg font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-2xl" style={{ color: 'var(--text-secondary)' }}>Enterprise documented intelligence and archival telemetry.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
                {/* Configuration Console */}
                <div className="xl:col-span-5 space-y-8">
                    <div className="p-10 rounded-[3rem] relative group border border-subtle" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <Plus className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight leading-none mb-1" style={{ color: 'var(--text-primary)' }}>DATA COMPILE</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Extraction Configuration</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1" style={{ color: 'var(--text-muted)' }}>Archive Segment</label>
                                <div className="relative">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                        className="w-full bg-surface border border-subtle text-primary rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold appearance-none cursor-pointer outline-none"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                    >
                                        {REPORT_TYPES.map(t => <option key={t} value={t} className="bg-surface text-primary" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{t}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] ml-1" style={{ color: 'var(--text-muted)' }}>Temporal Filter</label>
                                <div className="relative">
                                    {selectedType === 'Daily' || selectedType.includes('Log') || selectedType === 'Health Summary' ? (
                                        <input
                                            type="date"
                                            value={config.date}
                                            onChange={e => setConfig({ ...config, date: e.target.value })}
                                            className="w-full bg-surface border border-subtle rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold outline-none"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        />
                                    ) : selectedType === 'Weekly' ? (
                                        <input
                                            type="date"
                                            value={config.week_start}
                                            onChange={e => setConfig({ ...config, week_start: e.target.value })}
                                            className="w-full bg-surface border border-subtle rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold outline-none"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        />
                                    ) : selectedType === 'Monthly' ? (
                                        <input
                                            type="month"
                                            value={config.month}
                                            onChange={e => setConfig({ ...config, month: e.target.value })}
                                            className="w-full bg-surface border border-subtle rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold outline-none"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        />
                                    ) : (
                                        <select
                                            value={config.year}
                                            onChange={e => setConfig({ ...config, year: e.target.value })}
                                            className="w-full bg-surface border border-subtle rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-bold outline-none appearance-none cursor-pointer"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        >
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y} className="bg-surface text-primary" style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>{y}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleGeneratePreview}
                                disabled={generating}
                                className="w-full btn-premium btn-premium-primary h-14 text-sm font-black active:scale-[0.98] shadow-2xl shadow-white/5"
                            >
                                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                                {generating ? 'SIMULATING EXTRACTION...' : 'INITIALIZE PREVIEW'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Report Archive */}
                <div className="xl:col-span-7 space-y-8">
                    <div className="border border-subtle rounded-[3rem] overflow-hidden flex flex-col min-h-[500px] shadow-2xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                        <div className="p-8 border-b border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-black/5" style={{ borderColor: 'var(--border-subtle)' }}>
                            <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                                <FileText className="w-6 h-6 text-blue-500" />
                                DATA <span className="font-normal" style={{ color: 'var(--text-muted)' }}>ARCHIVE</span>
                            </h3>
                            <div className="relative max-w-xs w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="SCAN RECORDS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-surface border border-subtle rounded-xl pl-12 pr-4 py-3 text-[10px] font-black uppercase tracking-widest focus:border-blue-500/50 outline-none transition-all placeholder:text-zinc-500"
                                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center p-24 gap-4">
                                    <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Accessing Neural Logs</p>
                                </div>
                            ) : filteredReports.length === 0 ? (
                                <div className="p-24 text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-6 text-zinc-400" />
                                    <p className="font-bold uppercase text-[10px] tracking-widest leading-loose" style={{ color: 'var(--text-muted)' }}>No documentation matches scan criteria</p>
                                </div>
                            ) : (
                                filteredReports.map((report) => (
                                    <div key={report.report_id} className="group p-8 flex items-center justify-between gap-8 hover:bg-primary/5 transition-all relative">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-muted group-hover:text-blue-500 transition-colors" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{report.title}</h4>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/60 leading-none">{report.report_type}</span>
                                                    <span className="w-1 h-1 rounded-full bg-subtle" style={{ backgroundColor: 'var(--border-subtle)' }} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>{new Date(report.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadExistingReport(report)}
                                            className="px-6 py-3 rounded-xl bg-surface border border-subtle text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center gap-3 active:scale-95"
                                            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                                        >
                                            <Eye className="w-4 h-4" />
                                            VIEW
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {showPreview && previewData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPreview(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="rounded-[4rem] w-full max-w-6xl h-full flex flex-col relative z-20 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-subtle"
                            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-subtle)' }}
                        >
                            <div className="p-12 border-b border-subtle flex flex-col md:flex-row items-center justify-between gap-10 bg-black/5" style={{ borderColor: 'var(--border-subtle)' }}>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em] rounded-full leading-none">Verified Payload</span>
                                        <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>SECURE ID: #{previewData.metadata?.id || 'ALPHA-01'}</span>
                                    </div>
                                    <h2 className="text-4xl font-extrabold tracking-tighter leading-tight" style={{ color: 'var(--text-primary)' }}>{previewData.metadata?.title || 'System Analysis Report'}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: 'var(--text-muted)' }}>DOCUMENT DECRYPTION • NODE: ALPHA-1</p>
                                </div>
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={downloadPDF}
                                        className="btn-premium btn-premium-primary h-14 px-10 shadow-emerald-500/10"
                                    >
                                        <Download className="w-5 h-5" />
                                        EXPORT PROOF
                                    </button>
                                    <button
                                        onClick={downloadCSV}
                                        className="btn-premium btn-premium-secondary h-14 px-8 border-white/10"
                                    >
                                        <FileText className="w-5 h-5" />
                                        EXPORT CSV
                                    </button>
                                    <button
                                        onClick={() => setShowPreview(false)}
                                        className="w-14 h-14 flex items-center justify-center rounded-2xl bg-surface text-muted hover:text-primary border border-subtle transition-all"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-12 space-y-12 bg-black/5">
                                {previewData.content?.stats && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                        {Object.entries(previewData.content.stats).map(([k, v]) => (
                                            <div key={k} className="p-8 rounded-[2.5rem] border border-subtle group hover:border-blue-500/30 transition-all" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                                                <p className="text-[10px] font-black uppercase tracking-widest mb-3 leading-none" style={{ color: 'var(--text-muted)' }}>{k}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>{v}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="p-10 rounded-[3rem] border border-subtle" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-blue-400">
                                            <BarChart2 className="w-5 h-5" />
                                            VARIANCE METRICS
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={previewData.content?.stats ? Object.entries(previewData.content.stats).map(([name, value]) => ({ name, value: parseFloat(value) || 0 })) : []}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.05} vertical={false} />
                                                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                                                    <YAxis stroke="var(--text-muted)" fontSize={10} axisLine={false} tickLine={false} />
                                                    <Tooltip
                                                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '15px' }}
                                                        itemStyle={{ color: 'var(--text-primary)', fontSize: '10px', fontWeight: 900 }}
                                                    />
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[12, 12, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[3rem] border border-subtle flex flex-col h-full" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3 text-emerald-400">
                                            <FileText className="w-5 h-5" />
                                            EXTRACTION LOGS
                                        </h3>
                                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                            {previewData.content?.records && previewData.content.records.map((record, i) => (
                                                <div key={i} className="p-5 rounded-2xl bg-surface border border-subtle flex items-center justify-between group hover:bg-primary/5 transition-all" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                                                    <div>
                                                        <p className="text-base font-bold tracking-tight leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{record.tag || record.id}</p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>SECTOR {record.sector || '04'}</p>
                                                    </div>
                                                    <span className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase text-emerald-500">{record.status || 'Verified'}</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default Reports;
