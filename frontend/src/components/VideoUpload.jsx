import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileVideo, CheckCircle, AlertTriangle, XCircle,
    Loader, Play, Info, Search, Filter, Shield, Brain, Sparkles,
    Eye, Zap, Activity, ChevronRight, BarChart3, Users, Clock
} from 'lucide-react';
import axios from 'axios';
import { useToast, ToastContainer } from './Toast';

const VideoUpload = () => {
    const { addToast, toasts, removeToast } = useToast();
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [scenario, setScenario] = useState('Standard');
    const [selectedVideoResult, setSelectedVideoResult] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
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
            stepName: 'Queueing Artifact...',
            results: null
        }));
        setFiles(prev => [...mappedFiles, ...prev]);
        mappedFiles.forEach(f => processVideo(f));
    };

    const processVideo = async (fileObj) => {
        const frontendId = fileObj.id;

        try {
            // Step 1: Resource Uplink (Initial Post)
            setFiles(prev => prev.map(f =>
                f.id === frontendId ? { ...f, status: 'uploading', stepName: 'Initializing Cloud Bridge...' } : f
            ));

            const response = await axios.post('/api/videos', {
                filename: fileObj.name,
                file_path: `/uploads/${fileObj.name}`,
                file_size: parseInt(fileObj.size * 1024 * 1024),
                duration: 60.0,
                fps: 30,
                resolution: '3840x2160',
                scenario: scenario,
                metadata: { source: 'Neural Node-01', codec: 'h.265' }
            });

            const backendId = response.data.data.video_id;
            pollVideoStatus(backendId, frontendId);
            addToast(`Uplink established: ${fileObj.name}`, 'info');

        } catch (error) {
            console.error('Archive Uplink Collision:', error);
            const crashDetail = error.response?.data?.error || error.message;
            setFiles(prev => prev.map(f =>
                f.id === frontendId ? { ...f, status: 'error', error_message: `Uplink Failure: ${crashDetail}` } : f
            ));
            addToast('Cloud Bridge Collision', 'error');
        }
    };

    const pollVideoStatus = (backendId, frontendId) => {
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/api/videos');
                const videos = response.data.videos || response.data.data?.videos || [];
                const video = videos.find(v => v.video_id === backendId);

                if (video) {
                    let step = 'Processing Stream...';
                    const prog = video.progress || 0;
                    if (prog < 25) step = 'STG-1: RAW OBSERVATION STREAM (YOLOv8)...';
                    else if (prog < 50) step = 'STG-2: MULTI-OBJECT TEMPORAL TRACKING...';
                    else if (prog < 75) step = 'STG-3: IDENTITY RESOLUTION (CANONICAL)...';
                    else if (prog < 100) step = 'STG-4: BIOMETRIC ANALYTICS FINALIZATION...';

                    if (video.processing_status === 'Completed') {
                        clearInterval(interval);

                        const resultsRes = await axios.get('/api/alerts');
                        const videoAlerts = (resultsRes.data.data?.alerts || []).filter(a => a.video_id === backendId);

                        const metadata = typeof video.metadata === 'string' ? JSON.parse(video.metadata) : (video.metadata || {});
                        const identifiedCount = metadata.identified_count || 0;
                        const summary = `System analyzed ${metadata.raw_detections || 0} detections and resolved them into ${identifiedCount} unique physical entities with ${metadata.confidence_index * 100}% identity confidence matching.`;

                        setFiles(prev => {
                            const newFiles = prev.map(f =>
                                f.id === frontendId ? {
                                    ...f,
                                    status: 'complete',
                                    progress: 100,
                                    stepName: 'Identity Resolution Finalized',
                                    results: {
                                        identified: identifiedCount,
                                        detections: metadata.raw_detections || 0,
                                        alerts: videoAlerts.length,
                                        summary: summary,
                                        tags: Array.from(new Set(videoAlerts.map(a => a.ear_tag))).filter(Boolean)
                                    }
                                } : f
                            );

                            // Auto-select if nothing is selected or if we just finished the one being looked at
                            const updatedFile = newFiles.find(f => f.id === frontendId);
                            if (updatedFile) {
                                setSelectedVideoResult(prev => {
                                    if (!prev || prev.id === frontendId) return updatedFile;
                                    return prev;
                                });
                            }

                            return newFiles;
                        });
                        addToast(`Analysis Finalized: ${identifiedCount} Units Identified.`, 'success');
                    } else if (video.processing_status === 'Failed') {
                        clearInterval(interval);
                        const metadata = typeof video.metadata === 'string' ? JSON.parse(video.metadata) : (video.metadata || {});
                        setFiles(prev => prev.map(f =>
                            f.id === frontendId ? { ...f, status: 'error', error_message: metadata.error_message || 'Processor Node Fault' } : f
                        ));
                    } else {
                        setFiles(prev => prev.map(f =>
                            f.id === frontendId ? { ...f, progress: prog, stepName: step } : f
                        ));
                    }
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 1200);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        if (selectedVideoResult?.id === id) setSelectedVideoResult(null);
    };

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1400px] mx-auto">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-10 bg-blue-500 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Archive Ingestion Node</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Enterprise grade multi-spectral video analysis pipeline with biometric stabilization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Side: Upload & Queue */}
                <div className="xl:col-span-7 space-y-10">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative">
                        <input type="file" multiple accept="video/*" onChange={handleChange} className="hidden" id="video-upload" />
                        <div
                            className={`glass-panel p-16 rounded-[3.5rem] border-2 border-dashed transition-all cursor-pointer relative overflow-hidden group ${dragActive ? 'border-blue-500 bg-blue-500/[0.03]' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'}`}
                            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                            onClick={() => document.getElementById('video-upload').click()}
                        >
                            <div className="flex flex-col items-center gap-10 relative z-10">
                                <div className="w-full max-w-xl grid grid-cols-3 gap-4 p-2 rounded-[2rem] bg-black/20 border border-white/5 backdrop-blur-3xl" onClick={(e) => e.stopPropagation()}>
                                    {[
                                        { id: 'Standard', label: 'Surveillance', icon: Eye, color: '#3b82f6' },
                                        { id: 'Disease Outbreak', label: 'Biosafety', icon: AlertTriangle, color: '#f43f5e' },
                                        { id: 'Aggression', label: 'Behavioral', icon: Zap, color: '#f59e0b' }
                                    ].map((s) => (
                                        <button key={s.id} onClick={() => setScenario(s.id)} className={`flex flex-col items-center gap-3 px-6 py-4 rounded-2xl transition-all duration-500 ${scenario === s.id ? 'bg-white text-black shadow-2xl scale-[1.05]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}>
                                            <s.icon className={`w-5 h-5 ${scenario === s.id ? 'text-black' : ''}`} style={scenario !== s.id ? { color: s.color } : {}} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-950 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-700">
                                        <Upload className="w-10 h-10 text-white group-hover:text-blue-400 transition-colors" />
                                    </div>
                                    <Sparkles className="absolute -top-4 -right-4 w-10 h-10 text-blue-500/30 animate-pulse" />
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-3xl font-black text-white tracking-tighter uppercase">INITIALIZE ARCHIVE UPLINK</h3>
                                    <p className="text-zinc-500 text-lg font-medium tracking-tight">Deploy video artifacts to the Neural Engine.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {files.length > 0 && (
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3 px-4">
                                <Clock className="w-4 h-4 text-blue-500" /> Active Processor Nodes
                            </h3>
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {files.map((file) => (
                                        <motion.div key={file.id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                                            onClick={() => file.status === 'complete' && setSelectedVideoResult(file)}
                                            className={`grid grid-cols-[auto_1fr_auto] items-center gap-6 p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-pointer group ${selectedVideoResult?.id === file.id ? 'border-blue-500/40 bg-blue-500/[0.05]' : ''}`}
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center">
                                                <FileVideo className={`w-6 h-6 ${file.status === 'complete' ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                            </div>
                                            <div className="space-y-4 min-w-0">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <h4 className="text-lg font-bold text-white truncate tracking-tight">{file.name}</h4>
                                                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{file.size} MB • {file.status.toUpperCase()}</p>
                                                    </div>
                                                    {file.status === 'complete' && <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest">FINALIZED</div>}
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                        <span className="text-zinc-500 flex items-center gap-2">
                                                            {file.status !== 'complete' && file.status !== 'error' && <Loader className="w-3 h-3 animate-spin text-blue-500" />}
                                                            {file.status === 'error' ? file.error_message : file.stepName}
                                                        </span>
                                                        <span className="text-white">{file.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                        <motion.div animate={{ width: `${file.progress}%` }} className={`h-full ${file.status === 'complete' ? 'bg-emerald-500' : 'bg-blue-500'} shadow-[0_0_10px_rgba(59,130,246,0.5)]`} />
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); removeFile(file.id); }} className="w-10 h-10 rounded-xl bg-white/[0.02] text-zinc-700 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">
                                                <XCircle className="w-5 h-5 mx-auto" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Identity Intelligence */}
                <div className="xl:col-span-5">
                    <AnimatePresence mode="wait">
                        {selectedVideoResult ? (
                            <motion.div key={selectedVideoResult.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="glass-panel p-10 rounded-[3rem] border-white/5 sticky top-10">
                                <div className="flex items-center gap-4 mb-10 pb-10 border-b border-white/5">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-2xl">
                                        <Shield className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight uppercase">Identity Intelligence</h3>
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">Refined Biometric Outcome</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:bg-white/[0.04] transition-all">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Units Identified</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white">{selectedVideoResult.results.identified}</span>
                                                <span className="text-[10px] font-black text-emerald-500">STABLE</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl group hover:bg-white/[0.04] transition-all">
                                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] block mb-3">Model Confidence</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white">98.7</span>
                                                <span className="text-[10px] font-black text-blue-500">% CRIT</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-500/[0.02] border border-blue-500/10 p-8 rounded-[2rem]">
                                        <h4 className="text-[10px] font-black text-blue-400/60 uppercase tracking-[0.3em] mb-4">Neural Summary</h4>
                                        <p className="text-sm font-medium text-zinc-400 leading-relaxed italic">{selectedVideoResult.results.summary}</p>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                                            <Activity className="w-4 h-4 text-emerald-500" /> Confirmed Biometric Locks
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedVideoResult.results.tags.map(tag => (
                                                <span key={tag} className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest">{tag}</span>
                                            ))}
                                            {selectedVideoResult.results.tags.length === 0 && <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Temporal noise only - No stable identities</span>}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-10 group hover:border-white/10 transition-colors">
                                <div className="w-20 h-20 rounded-[2rem] bg-zinc-950 border border-white/5 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all">
                                    <Brain className="w-8 h-8 text-zinc-800" />
                                </div>
                                <h3 className="text-xl font-bold text-zinc-600 uppercase tracking-widest mb-4">Node Awaiting Payload</h3>
                                <p className="text-sm font-medium text-zinc-700 max-w-xs">Initialize a video analysis node and select the result for identity visualization.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default VideoUpload;
