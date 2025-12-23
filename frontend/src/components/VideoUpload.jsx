import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Video, CheckCircle, XCircle, Loader, FileVideo, Zap, Brain, Eye, Sparkles, Settings, AlertTriangle, Activity } from 'lucide-react';
import axios from 'axios';

const VideoUpload = () => {
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [scenario, setScenario] = useState('Standard');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, [scenario]); // Add scenario dependency

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = async (fileList) => {
        const newFiles = Array.from(fileList).map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9), // Temp ID
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2),
            status: 'pending',
            progress: 0,
            video_id: null // Backend ID
        }));

        setFiles(prev => [...prev, ...newFiles]);

        // Process each file
        for (const fileObj of newFiles) {
            await processVideo(fileObj);
        }
    };

    const processVideo = async (fileObj) => {
        try {
            // 1. Register with backend
            const response = await axios.post('http://localhost:5000/api/videos', {
                filename: fileObj.name,
                file_path: `/data/videos/${fileObj.name}`,
                file_size: parseFloat(fileObj.size),
                duration: 120,
                fps: 30,
                resolution: '1920x1080',
                metadata: { source: 'User Upload' },
                scenario: scenario
            });

            const backendVideoId = response.data.data.video_id;

            // Update file with backend ID and set to uploading
            setFiles(prev => prev.map(f =>
                f.id === fileObj.id ? { ...f, status: 'uploading', video_id: backendVideoId } : f
            ));

            // 2. Start Polling for Status
            pollStatus(fileObj.id, backendVideoId);

        } catch (error) {
            console.error('Error uploading video:', error);
            setFiles(prev => prev.map(f =>
                f.id === fileObj.id ? { ...f, status: 'error' } : f
            ));
        }
    };

    const pollStatus = (frontendId, backendId) => {
        const interval = setInterval(async () => {
            try {
                // Fetch all videos (simplest way since we don't have get_video_by_id)
                const response = await axios.get('http://localhost:5000/api/videos');
                const videos = response.data.data.videos || [];
                const video = videos.find(v => v.video_id === backendId);

                if (video) {
                    if (video.processing_status === 'Completed') {
                        clearInterval(interval);
                        setFiles(prev => prev.map(f =>
                            f.id === frontendId ? { ...f, status: 'complete', progress: 100 } : f
                        ));
                    } else if (video.processing_status === 'Failed') {
                        clearInterval(interval);
                        setFiles(prev => prev.map(f =>
                            f.id === frontendId ? { ...f, status: 'error' } : f
                        ));
                    } else {
                        // Simulate progress if processing
                        setFiles(prev => prev.map(f =>
                            f.id === frontendId ? { ...f, progress: Math.min(f.progress + 5, 90) } : f
                        ));
                    }
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 1000);
    };

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <Video className="w-8 h-8 text-emerald-400" />
                        Video Ingestion
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">Upload CCTV footage for AI analysis</p>
                </div>
            </div>

            {/* Upload Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleChange}
                    className="hidden"
                    id="video-upload"
                />
                <div
                    className={`glass-strong rounded-3xl p-12 border-2 border-dashed transition-all text-center cursor-pointer relative overflow-hidden group ${dragActive ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('video-upload').click()}
                >
                    <div className="flex flex-col items-center gap-6 relative z-10">

                        {/* Scenario Selector */}
                        <div className="w-full max-w-lg grid grid-cols-3 gap-3 mb-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50" onClick={(e) => e.stopPropagation()}>
                            {[
                                { id: 'Standard', label: 'Standard', icon: Activity },
                                { id: 'Disease Outbreak', label: 'Outbreak', icon: AlertTriangle },
                                { id: 'Aggression', label: 'Aggression', icon: Zap }
                            ].map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setScenario(s.id)}
                                    className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-bold border transition-all ${scenario === s.id
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10'
                                        : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                        }`}
                                >
                                    <s.icon className="w-4 h-4" />
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative mt-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                <Upload className="w-12 h-12 text-white" />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-2 -right-2"
                            >
                                <Sparkles className="w-8 h-8 text-yellow-400" />
                            </motion.div>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black mb-2 text-white">
                                Drop your CCTV videos here
                            </h3>
                            <p className="text-slate-400 text-lg mb-4">
                                or click to browse from your computer
                            </p>
                            <p className="text-sm text-slate-500 font-mono bg-slate-900/50 px-3 py-1 rounded-full inline-block">
                                Supports: MP4, AVI, MOV • Max: 2GB
                            </p>
                        </div>

                        <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-xl hover:scale-105 transition-transform">
                            Select Files
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Processing Pipeline Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-strong rounded-3xl p-8 border border-slate-700/50"
            >
                <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-white">
                    <Brain className="w-7 h-7 text-purple-400" />
                    AI Processing Pipeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { step: '1', title: 'Frame Extraction', desc: 'Extract frames from video', color: 'emerald' },
                        { step: '2', title: 'YOLOv8 Detection', desc: 'Identify goats in frames', color: 'blue' },
                        { step: '3', title: 'EasyOCR Reading', desc: 'Read ear tag numbers', color: 'purple' },
                        { step: '4', title: 'Data Analysis', desc: 'Generate insights', color: 'pink' },
                    ].map((item, index) => {
                        const pipelineColors = {
                            emerald: 'from-emerald-500 to-emerald-600',
                            blue: 'from-blue-500 to-blue-600',
                            purple: 'from-purple-500 to-purple-600',
                            pink: 'from-pink-500 to-pink-600'
                        };
                        return (
                            <div key={index} className="relative">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pipelineColors[item.color]} flex items-center justify-center font-black text-white shadow-xl shrink-0`}>
                                        {item.step}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                        <p className="text-sm text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-6 -right-3 w-6 h-0.5 bg-gradient-to-r from-slate-600 to-transparent" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Uploaded Files List */}
            {files.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl p-8 border border-slate-700/50"
                >
                    <h3 className="text-2xl font-black mb-6 text-white">Upload Queue</h3>
                    <div className="space-y-4">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                            >
                                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                                    <FileVideo className="w-6 h-6 text-white" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-white">{file.name}</h4>
                                        <span className="text-sm text-slate-400">{file.size} MB</span>
                                    </div>

                                    {file.status === 'pending' && (
                                        <span className="text-sm text-slate-400">Waiting...</span>
                                    )}

                                    {file.status === 'error' && (
                                        <span className="text-sm text-red-400">Upload Failed</span>
                                    )}

                                    {file.status === 'uploading' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-blue-400 font-semibold">Processing... {file.progress}%</span>
                                                <Loader className="w-4 h-4 animate-spin text-blue-400" />
                                            </div>
                                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    style={{ width: `${file.progress}%` }}
                                                    className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {file.status === 'complete' && (
                                        <div className="flex items-center gap-2 text-emerald-400">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="font-semibold text-sm">Processing Complete</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                >
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default VideoUpload;
