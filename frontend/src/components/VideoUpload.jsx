import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileVideo, CheckCircle, AlertTriangle, XCircle,
    Loader, Play, Info, Search, Filter, Shield, Brain, Sparkles,
    Eye, Zap, Activity, ChevronRight, BarChart3, Users, Clock, Scan, Camera, Map, AlertCircle, Database, Cpu, Network
} from 'lucide-react';
import axios from 'axios';
import { useToast, ToastContainer } from './Toast';

const NeuralProgressBar = ({ progress, status, stepName }) => {
    const isError = status === 'error';
    const isComplete = status === 'complete';

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isError ? 'text-rose-400' : isComplete ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {isError ? <AlertCircle className="w-3 h-3" /> : isComplete ? <CheckCircle className="w-3 h-3" /> : <Cpu className="w-3 h-3 animate-pulse" />}
                        {stepName}
                    </span>
                </div>
                <span className="text-xl font-black tabular-nums tracking-tighter text-white">
                    {progress}<span className="text-[10px] opacity-40 ml-0.5">%</span>
                </span>
            </div>

            <div className="relative h-2 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                {/* Background pulse for active state */}
                {!isComplete && !isError && (
                    <motion.div
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-indigo-500/10"
                    />
                )}

                {/* Main Progress Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 50, damping: 20 }}
                    className={`absolute inset-y-0 left-0 rounded-full ${isError ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' :
                        isComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                            'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                        }`}
                >
                    {/* Glossy overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                </motion.div>

                {/* Scanning Light Effect */}
                {!isComplete && !isError && (
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                )}
            </div>
        </div>
    );
};

const QueueItem = ({ file, isSelected, onClick }) => {
    const [duration, setDuration] = useState('0s');

    useEffect(() => {
        if (file.status === 'complete' || file.status === 'error') return;

        const interval = setInterval(() => {
            const diff = Math.floor((new Date() - file.uploadStartedAt) / 1000);
            const m = Math.floor(diff / 60);
            const s = diff % 60;
            setDuration(m > 0 ? `${m}m ${s}s` : `${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [file.status, file.uploadStartedAt]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`p-6 rounded-[2.5rem] glass-panel cursor-pointer group transition-all relative overflow-hidden border-white/5 ${isSelected ? 'bg-indigo-500/[0.08] border-indigo-500/40' : 'hover:bg-white/[0.02]'}`}
        >
            <div className="flex items-start gap-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${file.status === 'complete' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-black/40 border-white/5 text-zinc-600'}`}>
                    <FileVideo className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-3">
                        <div className="pr-4">
                            <h5 className="text-sm font-black text-white truncate tracking-tight mb-1">{file.name}</h5>
                            <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{file.size}MB</span>
                                <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{duration}</span>
                            </div>
                        </div>
                        {file.status === 'complete' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                    </div>

                    <NeuralProgressBar progress={file.progress} status={file.status} stepName={file.stepName} />
                </div>
            </div>
        </motion.div>
    );
};

const VideoUpload = () => {
    const { addToast, toasts, removeToast } = useToast();
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [scenario, setScenario] = useState('Standard');
    const [selectedVideoResult, setSelectedVideoResult] = useState(null);
    const [diagnosticData, setDiagnosticData] = useState(null);
    const [galleryData, setGalleryData] = useState([]);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (selectedVideoResult && selectedVideoResult.status === 'complete') {
            loadDeepAnalysis(selectedVideoResult.results.video_id);
            loadGallery(selectedVideoResult.results.video_id);
        }
    }, [selectedVideoResult]);

    const loadDeepAnalysis = async (videoId) => {
        if (!videoId) return;
        setLoadingAnalysis(true);
        try {
            const res = await axios.get(`/api/diagnostics/manifest/${videoId}`);
            setDiagnosticData(res.data);
        } catch (err) {
            console.error("Diagnostic load failure", err);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    const loadGallery = async (videoId) => {
        try {
            const res = await axios.get(`/api/diagnostics/gallery/${videoId}`);
            setGalleryData(res.data);
        } catch (err) {
            setGalleryData([]);
        }
    };

    const handleFiles = (newFiles) => {
        const fileList = Array.from(newFiles);
        const mappedFiles = fileList.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            name: f.name,
            size: (f.size / (1024 * 1024)).toFixed(1),
            status: 'pending',
            progress: 0,
            stepName: 'Queueing...',
            results: null,
            uploadStartedAt: new Date()
        }));
        setFiles(prev => [...mappedFiles, ...prev]);
        mappedFiles.forEach(f => processVideo(f));
    };

    const processVideo = async (fileObj) => {
        const frontendId = fileObj.id;
        try {
            setFiles(prev => prev.map(f => f.id === frontendId ? { ...f, status: 'uploading', stepName: 'Initializing Uplink...' } : f));

            // Create Multi-part Form Data for REAL UPLOAD
            const formData = new FormData();
            formData.append('video', fileObj.file);
            formData.append('scenario', scenario);
            formData.append('file_size', fileObj.size);

            const response = await axios.post('/api/videos', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setFiles(prev => prev.map(f => f.id === frontendId ? { ...f, progress: percent * 0.1, stepName: 'Transferring Bytes...' } : f));
                }
            });

            addToast(`Uplink Success: ${fileObj.name}`, 'info');
            pollVideoStatus(response.data.data.video_id, frontendId);
        } catch (error) {
            console.error("Upload error", error);
            setFiles(prev => prev.map(f => f.id === frontendId ? { ...f, status: 'error', stepName: 'Uplink Severed' } : f));
            addToast(`Uplink Failed: ${fileObj.name}`, 'error');
        }
    };

    const pollVideoStatus = (backendId, frontendId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/api/videos');
                const videos = response.data.videos || response.data.data?.videos || [];
                const video = videos.find(v => v.video_id === backendId);

                if (video) {
                    const meta = typeof video.metadata === 'string' ? JSON.parse(video.metadata) : (video.metadata || {});
                    const currentRealTimeData = {
                        video_id: backendId,
                        identified: video.detections_count || meta.estimated_count || 0,
                        count_range: meta.count_range || "Calculating...",
                        reliability: meta.confidence_score || 0,
                        reason: meta.uncertainty_reason || "Analying Content...",
                        summary: video.expert_analysis || "Processing stream data...",
                        unique_tracked: video.detections_count || meta.unique_goats_tracked || 0
                    };

                    if (video.processing_status === 'Completed') {
                        clearInterval(interval);
                        setFiles(prev => prev.map(f => f.id === frontendId ? { ...f, status: 'complete', progress: 100, stepName: 'Stabilized', results: currentRealTimeData } : f));
                        addToast(`Analysis Finalized: ${currentRealTimeData.identified} Units`, 'success');
                    } else if (video.processing_status === 'Failed') {
                        clearInterval(interval);
                        setFiles(prev => prev.map(f => f.id === frontendId ? { ...f, status: 'error', stepName: 'Analysis Failed' } : f));
                    } else {
                        // Real-time update of results object so UI doesn't show 0
                        setFiles(prev => prev.map(f => f.id === frontendId ? {
                            ...f,
                            progress: Math.max(f.progress, video.progress || 0),
                            stepName: video.error_message || 'Neural Processing...',
                            results: currentRealTimeData
                        } : f));
                    }
                }
            } catch (err) { console.error("Poll error", err); }
        }, 1500);
    };

    return (
        <div className="main-scroll-view custom-scrollbar animate-in" ref={scrollRef}>
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <header className="mb-16">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl relative group">
                            <div className="absolute inset-0 rounded-3xl bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-all" />
                            <Network className="w-10 h-10 text-indigo-500 relative z-10" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                                Neural <span className="text-indigo-500">Archive</span> Ingestion
                            </h1>
                            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">Enterprise-Grade Population Tracking Node</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-2 rounded-2xl backdrop-blur-md">
                        <div className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Active Scenario</span>
                            <div className="flex items-center gap-2">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span className="text-xs font-bold text-white uppercase">{scenario}</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-white/5" />
                        <div className="px-6 py-3">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Node Status</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="content-grid">
                {/* UPLOAD PANEL */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-4 space-y-8">
                    <section className="glass-panel p-2 rounded-[3.5rem] relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <input type="file" accept="video/*" onChange={(e) => handleFiles(e.target.files)} className="hidden" id="video-upload" />
                        <div
                            className={`p-10 border-2 border-dashed rounded-[3rem] text-center transition-all cursor-pointer relative z-10 ${dragActive ? 'border-indigo-500 bg-indigo-500/[0.08] scale-[0.98]' : 'border-white/5 hover:border-white/10 bg-black/20'}`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFiles(e.dataTransfer.files); }}
                            onClick={() => document.getElementById('video-upload').click()}
                        >
                            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] border border-white/5 flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Upload className="w-8 h-8 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Deploy Archive</h3>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em]">High-Resolution Ingestion Agent</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Neural Queue</h4>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{files.length} Modules</span>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {files.map((file) => (
                                    <QueueItem
                                        key={file.id}
                                        file={file}
                                        isSelected={selectedVideoResult?.id === file.id}
                                        onClick={() => file.status === 'complete' && setSelectedVideoResult(file)}
                                    />
                                ))}
                            </AnimatePresence>
                            {files.length === 0 && (
                                <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                                    <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Queue Vacuum</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* RESULTS PANEL */}
                <div className="col-span-12 lg:col-span-12 xl:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedVideoResult ? (
                            <motion.div
                                key={selectedVideoResult.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* METRICS HEADER */}
                                <section className="glass-panel p-12 rounded-[4rem] border-white/5 bg-gradient-to-br from-indigo-500/[0.03] to-transparent relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-12 border-b border-white/5 pb-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Neural Verified</span>
                                                </div>
                                                <span className="text-zinc-700 font-mono text-[10px]">ID: {selectedVideoResult.results.video_id}</span>
                                            </div>
                                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">Analysis manifest</h2>
                                            <p className="text-sm text-zinc-500 font-medium">Population metrics synchronized with database.</p>
                                        </div>
                                        <div className="flex gap-6">
                                            <div className="px-10 py-6 rounded-[2rem] bg-black/40 border border-white/5 text-center shadow-inner group hover:border-indigo-500/30 transition-all">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Population</span>
                                                <span className="text-5xl font-black text-white tabular-nums tracking-tighter">{selectedVideoResult.results.identified}</span>
                                            </div>
                                            <div className="px-10 py-6 rounded-[2rem] bg-black/40 border border-white/5 text-center shadow-inner group hover:border-indigo-500/30 transition-all">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-2">Unique IDs</span>
                                                <span className="text-5xl font-black text-indigo-400 tabular-nums tracking-tighter">{selectedVideoResult.results.unique_tracked}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* PEAK EXHIBITS GALLERY */}
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                                                <Camera className="w-5 h-5 text-indigo-500" /> Ground truth exhibits
                                            </h4>
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Neural Tiling Active</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {loadingAnalysis ? (
                                                [1, 2, 3].map(i => <div key={i} className="aspect-video rounded-3xl skeleton" />)
                                            ) : (
                                                diagnosticData?.evidence_frames?.map((_, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        whileHover={{ scale: 1.02 }}
                                                        className="aspect-video rounded-3xl overflow-hidden glass-panel border-white/5 group relative bg-black/40 shadow-2xl"
                                                    >
                                                        <img
                                                            src={`/api/diagnostics/frame/${selectedVideoResult.results.video_id}/${idx}`}
                                                            className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700"
                                                            alt="Exhibit"
                                                        />
                                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 backdrop-blur-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">FRAME-{idx + 1}</span>
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* INDIVIDUAL LOG */}
                                    <section className="glass-panel p-10 rounded-[3.5rem] border-white/5 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Brain className="w-4 h-4 text-indigo-400" /> Neural Audit Manifest
                                            </h4>
                                            <button className="p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/10 transition-all">
                                                <Search className="w-4 h-4 text-zinc-600" />
                                            </button>
                                        </div>
                                        <div className="flex-1 bg-black/60 p-8 rounded-[2.5rem] border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar relative">
                                            <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                                            <pre className="text-[11px] font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap">
                                                {selectedVideoResult.results.summary}
                                            </pre>
                                        </div>
                                    </section>

                                    {/* INDIVIDUAL GOAT PROFILES */}
                                    <section className="glass-panel p-10 rounded-[3.5rem] border-white/5 flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-8">
                                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Biometric profiles
                                            </h4>
                                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{galleryData.length} Tracked</span>
                                        </div>
                                        <div className="flex-1 bg-black/60 p-8 rounded-[2.5rem] border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                                            {galleryData.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {galleryData.map((goat, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="group cursor-pointer"
                                                        >
                                                            <div className="aspect-square rounded-2xl overflow-hidden glass-panel border-white/5 bg-zinc-950 relative shadow-lg">
                                                                <img
                                                                    src={goat.image_url}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[50%] group-hover:grayscale-0"
                                                                    alt={goat.tag}
                                                                />
                                                                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-black/60 backdrop-blur-sm transform translate-y-full group-hover:translate-y-0 transition-transform">
                                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest block text-center">DET-98%</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2 text-center group-hover:text-indigo-400 transition-colors">
                                                                {goat.tag}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center opacity-40">
                                                    <Users className="w-12 h-12 mb-4 text-zinc-600" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">No Profiles Found</p>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[800px] border-2 border-dashed border-white/5 rounded-[5rem] flex flex-col items-center justify-center text-center p-20 glass-panel shadow-inner relative overflow-hidden group">
                                {/* Decorative Background Elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent pointer-events-none" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full group-hover:bg-indigo-500/10 transition-all duration-1000" />

                                <div className="relative z-10">
                                    <div className="w-32 h-32 rounded-[3rem] bg-zinc-950 border border-white/5 flex items-center justify-center mb-12 mx-auto shadow-2xl relative">
                                        <div className="absolute inset-0 rounded-[3rem] bg-indigo-500/5 animate-ping opacity-20" />
                                        <Activity className="w-12 h-12 text-zinc-800 animate-pulse relative z-10" />
                                    </div>
                                    <h3 className="text-4xl font-black text-zinc-700 uppercase tracking-[0.2em] mb-6">Neural Node <span className="text-zinc-800">Standby</span></h3>
                                    <p className="text-zinc-700 text-sm max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest opacity-60">
                                        Initiate archive ingestion to activate high-precision population analytics and biometric identification.
                                    </p>
                                    <div className="mt-12 flex items-center justify-center gap-10 opacity-20 filter grayscale">
                                        <Database className="w-8 h-8" />
                                        <Network className="w-8 h-8" />
                                        <Shield className="w-8 h-8" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VideoUpload;
