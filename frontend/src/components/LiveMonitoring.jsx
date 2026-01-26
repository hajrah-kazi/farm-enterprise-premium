import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Play, Pause, Camera, Activity, MapPin, Clock } from 'lucide-react';

const LiveMonitoring = () => {
    const [isLive, setIsLive] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        let interval;
        if (isLive) {
            interval = setInterval(() => {
                setCurrentFrame(prev => (prev + 1) % 100);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isLive]);

    // Mock live detections
    const liveDetections = [
        { id: 1, tag: 'G015', activity: 'Grazing', health: 92, zone: 'Feeding Area', confidence: 0.98 },
        { id: 2, tag: 'A003', activity: 'Walking', health: 85, zone: 'Outdoor Paddock', confidence: 0.95 },
        { id: 3, tag: 'M007', activity: 'Resting', health: 78, zone: 'Shelter', confidence: 0.92 },
        { id: 4, tag: 'K010', activity: 'Standing', health: 88, zone: 'Water Zone', confidence: 0.96 },
    ];

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1400px] mx-auto">
            {/* Live Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-rose-500 rounded-full shadow-lg shadow-rose-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Live Neural Feed</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Real-time computer vision and behavioral telemetry streaming.</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLive(!isLive)}
                    className={`px-10 py-5 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 shadow-2xl ${isLive
                        ? 'bg-rose-500 text-white shadow-rose-500/20'
                        : 'bg-emerald-500 text-white shadow-emerald-500/20'
                        }`}
                >
                    {isLive ? (
                        <>
                            <Pause className="w-5 h-5 fill-current" />
                            Terminate Feed
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5 fill-current" />
                            Initialize Stream
                        </>
                    )}
                </motion.button>
            </div>

            {/* Video Feed Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Main Feed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="xl:col-span-8 glass-panel p-10 rounded-[3.5rem] border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden group"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Video className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">Primary Paddock Node</h3>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">AXIS-8200 IR THERMAL SENSOR</p>
                            </div>
                        </div>
                        <div className="px-5 py-2.5 rounded-full bg-black/40 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-rose-500 animate-pulse' : 'bg-zinc-800'}`} />
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Video Placeholder Visual */}
                    <div className="relative aspect-video bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-inner">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                <Camera className="w-24 h-24 text-zinc-900" />
                                <div className="absolute inset-0 animate-pulse bg-rose-500/5 blur-3xl rounded-full" />
                            </div>
                        </div>

                        {/* Artificial HUD Elements */}
                        <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
                            <div className="flex justify-between items-start opacity-40">
                                <div className="border-l-2 border-t-2 border-white/20 w-8 h-8 rounded-tl-lg" />
                                <div className="border-r-2 border-t-2 border-white/20 w-8 h-8 rounded-tr-lg" />
                            </div>

                            {isLive && (
                                <div className="flex flex-col gap-4">
                                    <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            animate={{ x: ['100%', '-100%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-1/2 h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"
                                        />
                                    </div>
                                    <div className="text-[10px] font-mono text-rose-500/60 uppercase tracking-widest">
                                        SCANNING FOR BIOMETRIC TAGS... [NODE_0x72]
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-end opacity-40">
                                <div className="border-l-2 border-b-2 border-white/20 w-8 h-8 rounded-bl-lg" />
                                <div className="border-r-2 border-b-2 border-white/20 w-8 h-8 rounded-br-lg" />
                            </div>
                        </div>

                        {isLive && (
                            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                                <div className="glass-panel px-6 py-4 rounded-2xl bg-black/60 border-white/10 backdrop-blur-3xl">
                                    <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-300">
                                        <div className="space-y-1">
                                            <p className="text-zinc-500">Node ID</p>
                                            <p className="text-white">CAM_A1_PRIM</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-500">Frame</p>
                                            <p className="text-rose-500 font-mono">#{currentFrame.toString().padStart(6, '0')}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-zinc-500">Latency</p>
                                            <p className="text-white">14ms</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-rose-500 text-white text-[9px] font-black tracking-[0.3em] rounded-lg shadow-lg shadow-rose-500/20">
                                    SECURE_ENCRYPTED_LINK
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Overlay */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                        <div className="glass-panel p-6 rounded-[2rem] bg-white/[0.02] border-white/5">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 leading-none">Global Entities Detected</p>
                            <p className="text-4xl font-black text-white leading-none">{isLive ? '14' : '0'}</p>
                        </div>
                        <div className="glass-panel p-6 rounded-[2rem] bg-white/[0.02] border-white/5">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-2 leading-none">Neural Inference Accuracy</p>
                            <p className="text-4xl font-black text-indigo-500 leading-none">{isLive ? '98.8%' : '0%'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Secondary Feeds Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    {['Feeding Sector B', 'Shelter Alpha', 'Birthing Suite'].map((name, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-panel p-6 rounded-[2.5rem] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-700 shadow-xl group"
                        >
                            <div className="flex gap-4">
                                <div className="relative w-32 h-20 bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                    <Camera className="w-6 h-6 text-zinc-900 transition-transform duration-500 group-hover:scale-110" />
                                    {isLive && (
                                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_5px_#f43f5e]" />
                                    )}
                                </div>
                                <div className="flex-1 py-1">
                                    <h4 className="font-bold text-white tracking-tight uppercase leading-none mb-2">{name}</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
                                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{isLive ? 'STREAMING ACTIVE' : 'CONNECTION IDLE'}</span>
                                        </div>
                                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">LINK_STABILITY: 100%</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-indigo-500/[0.03] shadow-2xl relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20" />
                        <Activity className="w-10 h-10 text-indigo-500/20 mb-6" />
                        <h4 className="text-xl font-bold text-white tracking-tight uppercase leading-none mb-4">Neural Analytics</h4>
                        <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            Parallel processing of 4 streams enabled. YOLOv8 model at full inference capacity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Live Identification Stream */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-12 rounded-[4rem] border-white/5 bg-white/[0.01] shadow-2xl"
            >
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Activity className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">Biometric Sequence Stream</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {isLive ? (
                        liveDetections.map((detection, index) => (
                            <motion.div
                                key={detection.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700 shadow-xl group"
                            >
                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-xl font-black text-white shadow-2xl">
                                        {detection.tag.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-white tracking-tighter leading-none mb-1">{detection.tag}</h4>
                                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{detection.activity}</p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Health Index</p>
                                        <p className="text-xl font-black text-emerald-500 leading-none">{detection.health}%</p>
                                    </div>
                                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500/50" style={{ width: `${detection.health}%` }} />
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Zone Location</p>
                                        <p className="text-[11px] font-bold text-white leading-none uppercase tracking-tight">{detection.zone}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
                            <Video className="w-20 h-20 mx-auto mb-6 opacity-10" />
                            <p className="text-zinc-600 font-black text-[11px] uppercase tracking-[0.4em]">Initialize stream for live biometric telemetry</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Hardware Telemetry */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { title: 'Neural Processor', label: 'YOLOv8 Dynamic', stats: [['Inference Time', isLive ? '12ms' : '0ms'], ['GPU Load', isLive ? '42%' : '0%'], ['Throughput', isLive ? '240 fps' : '0 fps']], icon: Activity, color: 'text-rose-500' },
                    { title: 'OCR Subsystem', label: 'EasyOCR Enterprise', stats: [['Accuracy', isLive ? '99.2%' : '0%'], ['Reads/Sec', isLive ? '3.4' : '0.0'], ['Cache Hit', '85%']], icon: Camera, color: 'text-indigo-500' },
                    { title: 'Cluster Status', label: 'Edge Node 0x82', stats: [['CPU Usage', isLive ? '31%' : '4%'], ['Memory', isLive ? '2.8 GB' : '0.6 GB'], ['Uptime', '12d 4h']], icon: MapPin, color: 'text-emerald-500' },
                ].map((node, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/[0.01] shadow-2xl relative overflow-hidden group"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className={`p-2 rounded-xl bg-white/5 ${node.color} border border-white/10`}>
                                <node.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white tracking-tight uppercase leading-none mb-1">{node.title}</h4>
                                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{node.label}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {node.stats.map(([label, val], idx) => (
                                <div key={idx} className="flex justify-between items-center group/stat">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest transition-colors group-hover/stat:text-zinc-400">{label}</span>
                                    <span className="text-xs font-bold text-white tracking-tight">{val}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};


export default LiveMonitoring;
