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
        <div className="space-y-6">
            {/* Live Status Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-4 border border-slate-700 flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 pulse-glow' : 'bg-slate-500'}`} />
                    <div>
                        <h3 className="font-bold">{isLive ? 'LIVE MONITORING' : 'MONITORING PAUSED'}</h3>
                        <p className="text-sm text-slate-400">
                            {isLive ? 'Real-time video analysis active' : 'Click play to start monitoring'}
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLive(!isLive)}
                    className={`p-4 rounded-xl ${isLive
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-emerald-500 hover:bg-emerald-600'
                        } transition-colors`}
                >
                    {isLive ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </motion.button>
            </motion.div>

            {/* Video Feed Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Feed */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass rounded-2xl p-6 border border-slate-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Video className="w-5 h-5 text-emerald-500" />
                            <h3 className="font-bold">Camera 1 - Main Paddock</h3>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <Clock className="w-4 h-4" />
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Video Placeholder */}
                    <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden mb-4">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Camera className="w-16 h-16 text-slate-700" />
                        </div>
                        {isLive && (
                            <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 rounded-lg flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white pulse-glow" />
                                <span className="text-sm font-semibold">LIVE</span>
                            </div>
                        )}
                        {isLive && (
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="glass rounded-lg p-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Frame: {currentFrame}</span>
                                        <span>FPS: 30</span>
                                        <span>Resolution: 1920x1080</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Detection Overlay */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="glass rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">Objects Detected</p>
                            <p className="text-2xl font-bold text-emerald-400">{isLive ? '4' : '0'}</p>
                        </div>
                        <div className="glass rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">Avg Confidence</p>
                            <p className="text-2xl font-bold text-blue-400">{isLive ? '95.2%' : '0%'}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Secondary Feeds */}
                <div className="space-y-4">
                    {['Camera 2 - Feeding Area', 'Camera 3 - Shelter', 'Camera 4 - Water Zone'].map((camera, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-xl p-4 border border-slate-700"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative w-32 h-20 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                                    <Camera className="w-8 h-8 text-slate-700" />
                                    {isLive && (
                                        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-red-500 pulse-glow" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold mb-1">{camera}</h4>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span>Status: {isLive ? 'Active' : 'Inactive'}</span>
                                        <span>Objects: {isLive ? Math.floor(Math.random() * 5) : 0}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Live Detections */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6 border border-slate-700"
            >
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-xl font-bold">Real-Time Detections</h3>
                </div>

                <div className="space-y-3">
                    {isLive ? (
                        liveDetections.map((detection, index) => (
                            <motion.div
                                key={detection.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass rounded-xl p-4 border border-slate-700 hover:border-emerald-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center font-bold">
                                            {detection.tag}
                                        </div>
                                        <div>
                                            <h4 className="font-bold">{detection.tag}</h4>
                                            <p className="text-sm text-slate-400">{detection.activity}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs text-slate-400">Health</p>
                                            <p className="font-bold text-emerald-400">{detection.health}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Zone</p>
                                            <p className="font-medium">{detection.zone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400">Confidence</p>
                                            <p className="font-bold text-blue-400">{(detection.confidence * 100).toFixed(0)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-400">
                            <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Start live monitoring to see real-time detections</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Processing Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-xl p-6 border border-slate-700"
                >
                    <h4 className="font-bold mb-4">YOLOv8 Detection</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Model:</span>
                            <span className="font-medium">YOLOv8n</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Inference Time:</span>
                            <span className="font-medium">{isLive ? '12ms' : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">GPU Utilization:</span>
                            <span className="font-medium">{isLive ? '45%' : '0%'}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-xl p-6 border border-slate-700"
                >
                    <h4 className="font-bold mb-4">EasyOCR Processing</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Tags Read:</span>
                            <span className="font-medium">{isLive ? '4/4' : '0/0'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Accuracy:</span>
                            <span className="font-medium">{isLive ? '98.5%' : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Processing Time:</span>
                            <span className="font-medium">{isLive ? '45ms' : 'N/A'}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-xl p-6 border border-slate-700"
                >
                    <h4 className="font-bold mb-4">System Status</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">CPU Usage:</span>
                            <span className="font-medium">{isLive ? '32%' : '5%'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Memory:</span>
                            <span className="font-medium">{isLive ? '2.4GB' : '0.8GB'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Uptime:</span>
                            <span className="font-medium">2h 34m</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LiveMonitoring;
