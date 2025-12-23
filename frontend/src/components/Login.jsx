import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, User, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simulated delay for effect if almost instant
            await new Promise(r => setTimeout(r, 800));

            const response = await axios.post('http://localhost:5000/api/login', {
                username,
                password
            });

            const responseData = response.data;
            const userData = responseData.data?.user || responseData.user;

            if (userData) {
                onLogin(userData);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex relative overflow-hidden font-sans">
            {/* Dynamic Background Mesh */}
            <div className="absolute inset-0 z-0 bg-slate-950">
                <div
                    className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"
                    style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}
                />
                <div
                    className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen"
                    style={{ transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)` }}
                />
            </div>

            {/* Visual Side (Desktop) */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 z-10">
                <div className="max-w-xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-700/50 text-emerald-400 text-sm font-semibold">
                            <Zap className="w-4 h-4" />
                            <span>Enterprise Version 2.4</span>
                        </div>
                        <h1 className="text-6xl font-black text-white tracking-tight mb-6 leading-tight">
                            The Future of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                                Farm Intelligence
                            </span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-12">
                            Manage your herd with military-grade precision. AI-driven analytics, biometric tracking, and predictive yield modeling in one premium dashboard.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                                <ShieldCheck className="w-8 h-8 text-emerald-500 mb-4" />
                                <h3 className="text-white font-bold mb-2">Secure Data</h3>
                                <p className="text-sm text-slate-500">End-to-end encrypted biometrics database.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
                                <Globe className="w-8 h-8 text-cyan-500 mb-4" />
                                <h3 className="text-white font-bold mb-2">Global Access</h3>
                                <p className="text-sm text-slate-500">Real-time monitoring from anywhere on Earth.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Login Form Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden group">

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />

                        <div className="mb-10 text-center">
                            <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 rotate-3 group-hover:rotate-6 transition-transform duration-300">
                                <Activity className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-slate-400">Enter your credentials to access the terminal.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Username</label>
                                <div className="relative group/input">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-300"
                                        placeholder="admin"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-slate-700 rounded-2xl text-white placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all duration-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold text-lg shadow-xl shadow-emerald-900/20 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group/btn"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Access Dashboard
                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
