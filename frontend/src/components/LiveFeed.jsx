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

    // Poll for live detections
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/live-feed');
                if (response.data.success && response.data.data) {
                    setDetections(response.data.data.detections || []);
                }
            } catch (error) {
                console.error("Error fetching live feed:", error);
            }
        }, 1000); // 1 FPS update for simulation

        return () => clearInterval(interval);
    }, [isPlaying]);

    // Draw detections on canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');

        // Resize canvas to match container
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each detection
        detections.forEach(det => {
            // Coordinates are normalized (0-1)
            const x = det.bounding_box_x * canvas.width;
            const y = det.bounding_box_y * canvas.height;
            const w = det.bounding_box_w * canvas.width;
            const h = det.bounding_box_h * canvas.height;

            // Draw Box
            ctx.strokeStyle = det.health_score < 70 ? '#EF4444' : '#10B981'; // Red if sick, Green if healthy
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, w, h);

            // Draw "Skeleton" (Simulated Pose Estimation)
            // This adds the "High Tech AI" feel
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;

            // Keypoints (Simulated relative to box)
            const head = { x: x + w / 2, y: y + h * 0.2 };
            const neck = { x: x + w / 2, y: y + h * 0.35 };
            const body = { x: x + w / 2, y: y + h * 0.6 };
            const legFL = { x: x + w * 0.3, y: y + h * 0.9 }; // Front Left
            const legFR = { x: x + w * 0.7, y: y + h * 0.9 }; // Front Right

            // Draw Connections
            ctx.moveTo(head.x, head.y); ctx.lineTo(neck.x, neck.y); // Head to Neck
            ctx.lineTo(body.x, body.y); // Neck to Body
            ctx.lineTo(legFL.x, legFL.y); // Body to Front Left
            ctx.moveTo(body.x, body.y); ctx.lineTo(legFR.x, legFR.y); // Body to Front Right

            ctx.stroke();

            // Draw Joints
            ctx.fillStyle = '#34D399';
            [head, neck, body, legFL, legFR].forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Background for Label
            ctx.fillStyle = det.health_score < 70 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(16, 185, 129, 0.8)';
            ctx.fillRect(x, y - 25, w, 25);

            // Draw Label Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 12px "JetBrains Mono", monospace'; // Tech font
            ctx.fillText(`${det.ear_tag} [${Math.round(det.confidence_score * 100)}%]`, x + 5, y - 7);

            // Draw Health Score Bar
            const healthWidth = (det.health_score / 100) * w;
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y + h + 5, w, 4);
            ctx.fillStyle = det.health_score < 70 ? '#EF4444' : '#10B981';
            ctx.fillRect(x, y + h + 5, healthWidth, 4);
        });

    }, [detections]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
            {/* Main Feed Area */}
            <div className="lg:col-span-2 space-y-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-3xl overflow-hidden border border-slate-700/50 relative aspect-video group"
                    ref={containerRef}
                >
                    {/* Simulated Video Background */}
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                        <div className="text-slate-400 flex flex-col items-center">
                            <Camera className="w-16 h-16 mb-4 opacity-20" />
                            <p className="font-mono text-sm opacity-70">LIVE FEED SIGNAL: CAM-{activeCamera.toString().padStart(2, '0')}</p>
                        </div>
                        {/* Grid lines simulation */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>

                    {/* AI Overlay Canvas */}
                    <canvas
                        ref={canvasRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {/* Live Indicator */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-bold text-red-400 tracking-wider">LIVE AI ANALYSIS</span>
                    </div>

                    {/* Controls Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>
                                <div className="flex items-center gap-2 text-white/80">
                                    <Volume2 className="w-5 h-5" />
                                    <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="w-2/3 h-full bg-emerald-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-white/80 hover:text-white"><Settings className="w-5 h-5" /></button>
                                <button className="p-2 text-white/80 hover:text-white"><Maximize className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Camera Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((cam) => (
                        <button
                            key={cam}
                            onClick={() => setActiveCamera(cam)}
                            className={`aspect-video rounded-xl border-2 transition-all relative overflow-hidden group ${activeCamera === cam
                                ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                                : 'border-slate-700/50 hover:border-slate-500'
                                }`}
                        >
                            <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-slate-600" />
                            </div>
                            <div className="absolute bottom-2 left-2 text-xs font-bold text-slate-400 bg-black/50 px-2 py-1 rounded">
                                CAM {cam}
                            </div>
                            {activeCamera === cam && (
                                <div className="absolute inset-0 bg-emerald-500/10" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-strong rounded-3xl p-6 border border-slate-700/50 h-full"
                >
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-emerald-400" />
                        Live Insights
                    </h3>

                    <div className="space-y-6">
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">Active Detections</span>
                                <Users className="w-5 h-5 text-blue-400" />
                            </div>
                            <p className="text-3xl font-black text-white">{detections.length}</p>
                            <p className="text-xs text-emerald-400 mt-1">● Real-time tracking</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-400 text-sm">System Status</span>
                                <Radio className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-xl font-bold text-white">Online</p>
                            <p className="text-xs text-slate-500 mt-1">Latency: 24ms</p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Recent Alerts</h4>
                            <div className="space-y-3">
                                {detections.filter(d => d.health_score < 70).slice(0, 3).map((det, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-white">Low Health Detected</p>
                                            <p className="text-xs text-red-300">ID: {det.ear_tag} • Score: {det.health_score}</p>
                                        </div>
                                    </div>
                                ))}
                                {detections.filter(d => d.health_score >= 70).length > 0 && (
                                    <div className="text-center text-sm text-slate-500 py-2">
                                        Herd behavior normal
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveFeed;
