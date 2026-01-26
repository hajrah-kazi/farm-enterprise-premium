import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Maximize, Volume2, Settings, Activity, Users, AlertTriangle, Camera, Radio } from 'lucide-react';
import axios from 'axios';

const LiveFeed = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [activeCamera, setActiveCamera] = useState(1);
    const [detections, setDetections] = useState([]);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(async () => {
            try {
                const response = await axios.get('/api/live-feed');
                if (response.data.success && response.data.data && response.data.data.detections && response.data.data.detections.length > 0) {
                    setDetections(response.data.data.detections);
                } else {
                    simulateDetections();
                }
            } catch (error) {
                simulateDetections();
            }
        }, 150);
        return () => clearInterval(interval);
    }, [isPlaying]);

    function simulateDetections() {
        const time = Date.now() / 1000;
        const mockDetections = [
            { ear_tag: 'G-101', bounding_box_x: 0.2 + Math.sin(time * 0.5) * 0.1, bounding_box_y: 0.3 + Math.cos(time * 0.3) * 0.05, bounding_box_w: 0.15, bounding_box_h: 0.25, confidence_score: 0.98, health_score: 95 },
            { ear_tag: 'G-204', bounding_box_x: 0.6 + Math.cos(time * 0.4) * 0.1, bounding_box_y: 0.4 + Math.sin(time * 0.6) * 0.05, bounding_box_w: 0.12, bounding_box_h: 0.22, confidence_score: 0.92, health_score: 88 },
            { ear_tag: 'G-339', bounding_box_x: 0.4 + Math.sin(time * 0.7) * 0.15, bounding_box_y: 0.6, bounding_box_w: 0.14, bounding_box_h: 0.24, confidence_score: 0.85, health_score: 65 }
        ];
        setDetections(mockDetections);
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        detections.forEach(det => {
            const x = det.bounding_box_x * canvas.width;
            const y = det.bounding_box_y * canvas.height;
            const w = det.bounding_box_w * canvas.width;
            const h = det.bounding_box_h * canvas.height;

            const color = det.health_score < 70 ? '#f43f5e' : '#10b981';
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(x, y, w, h);
            ctx.setLineDash([]);

            // Skeleton pose
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            const points = [
                { x: x + w / 2, y: y + h * 0.2 },
                { x: x + w / 2, y: y + h * 0.4 },
                { x: x + w * 0.3, y: y + h * 0.9 },
                { x: x + w * 0.7, y: y + h * 0.9 }
            ];
            ctx.moveTo(points[0].x, points[0].y);
            ctx.lineTo(points[1].x, points[1].y);
            ctx.lineTo(points[2].x, points[2].y);
            ctx.moveTo(points[1].x, points[1].y);
            ctx.lineTo(points[3].x, points[3].y);
            ctx.stroke();

            ctx.fillStyle = color;
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = color;
            ctx.font = 'bold 12px Plus Jakarta Sans';
            const label = `${det.ear_tag} [${Math.round(det.confidence_score * 100)}%]`;
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(x, y - 28, textWidth + 16, 24);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(label, x + 8, y - 11);
        });
    }, [detections]);

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10 pb-32">
            <div className="xl:col-span-3 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-8 bg-rose-500 rounded-full shadow-lg shadow-rose-500/40" />
                            <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Live Signal Analysis</h1>
                        </div>
                        <p className="text-lg font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis" style={{ color: 'var(--text-secondary)' }}>Active spatial telemetry and neural detection matrix.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-2xl">
                        <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none">Transmission Active</span>
                    </div>
                </div>

                {/* Main Viewport */}
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="aspect-video rounded-[3rem] border relative overflow-hidden group shadow-2xl"
                    style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                >
                    <div className="absolute inset-0 bg-[#020617] dark:bg-black">
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)]" />
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,_rgba(0,0,0,.5)_50%),linear-gradient(90deg,rgba(16,185,129,.05),rgba(59,130,246,0.02),rgba(244,63,94,.05))] bg-[size:100%_2px,3px_100%]" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-5">
                            <Camera className="w-48 h-48 text-white" />
                        </div>
                    </div>

                    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

                    {/* HUD Overlays */}
                    <div className="absolute inset-0 pointer-events-none p-12 z-20">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl px-6 py-3 rounded-2xl border border-white/10 pointer-events-auto shadow-2xl">
                                <Radio className="w-4 h-4 text-emerald-500" />
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">NODE: ALPHA-01</span>
                                <div className="w-[1px] h-4 bg-white/20" />
                                <span className="text-[10px] font-black text-white/50 tracking-widest">38.44° N, 122.00° W</span>
                            </div>
                            <div className="text-right p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl">
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 leading-none">Processing Latency</p>
                                <p className="text-2xl font-black text-emerald-400 italic">22.4ms</p>
                            </div>
                        </div>

                        <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between pointer-events-auto">
                            <div className="flex items-center gap-6 bg-black/60 backdrop-blur-2xl px-8 py-5 rounded-[2rem] border border-white/5 shadow-2xl">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Detected Subjects</p>
                                    <p className="text-2xl font-black text-white">{detections.length}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white text-black hover:scale-110 transition-all shadow-2xl active:scale-95"
                                >
                                    {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
                                </button>
                                <button className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all shadow-2xl active:scale-95">
                                    <Maximize className="w-7 h-7" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Multicam Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(id => (
                        <button
                            key={id}
                            onClick={() => setActiveCamera(id)}
                            className={`aspect-video rounded-3xl border transition-all overflow-hidden relative group ${activeCamera === id ? 'border-primary ring-4 ring-primary/20 scale-[1.03]' : 'border-subtle hover:border-medium opacity-60 hover:opacity-100'}`}
                            style={{ backgroundColor: 'var(--card-bg)', borderColor: activeCamera === id ? 'var(--accent-primary)' : 'var(--border-subtle)' }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: 'var(--text-muted)' }}>CAM-{id} SOURCE</span>
                            </div>
                            <div className="absolute top-4 right-4">
                                <div className={`w-2.5 h-2.5 rounded-full ${activeCamera === id ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-black/10'}`} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar Feed Intel */}
            <div className="space-y-8 h-full">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-10 rounded-[3rem] border border-subtle h-full flex flex-col shadow-2xl"
                    style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-subtle)' }}
                >
                    <div className="flex items-center gap-3 mb-10 pb-6 border-b border-subtle" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-xl font-bold tracking-tight uppercase leading-none" style={{ color: 'var(--text-primary)' }}>Stream Logic</h3>
                    </div>

                    <div className="flex-1 space-y-10 overflow-y-auto pr-2 scrollbar-hide">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] ml-1" style={{ color: 'var(--text-muted)' }}>Live Metadata</h4>
                            <div className="flex flex-col gap-4">
                                {detections.map((det, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-5 rounded-2xl bg-surface border border-subtle flex items-center justify-between group hover:bg-primary/5 transition-all"
                                        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${det.health_score < 70 ? 'bg-rose-500 shadow-lg shadow-rose-500/40' : 'bg-emerald-500 shadow-lg shadow-emerald-500/40'}`} />
                                            <div>
                                                <p className="text-base font-bold tracking-tight leading-none mb-1" style={{ color: 'var(--text-primary)' }}>{det.ear_tag}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Conf: {Math.round(det.confidence_score * 100)}%</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${det.health_score < 70 ? 'text-rose-400' : 'text-emerald-400'}`}>{det.health_score}%</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>VITALITY</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-surface/50 border border-subtle shadow-xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
                            <div className="flex items-center gap-3 mb-4">
                                <Activity className="w-5 h-5 text-blue-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>Neural Scanning</h4>
                            </div>
                            <div className="h-1.5 bg-black/10 rounded-full overflow-hidden mb-3">
                                <motion.div
                                    animate={{ width: ['20%', '60%', '40%', '80%', '30%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                />
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Analyzing movement vectors for anomalies.</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] ml-1" style={{ color: 'var(--text-muted)' }}>Recent Neural Events</h4>
                            <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Anomaly Warning • 12:44</p>
                                </div>
                                <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Specimen <span style={{ color: 'var(--text-primary)' }}>G-339</span> displaying irregular gait patterns in Sector-04.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};


export default LiveFeed;
