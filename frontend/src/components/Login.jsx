import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            // Simulate login or call API
            if ((username === 'admin' && password === 'admin123') || (username === 'demo' && password === 'demo123')) {
                onLogin({
                    id: 1,
                    username: username,
                    role: 'Admin',
                    full_name: username === 'admin' ? 'System Administrator' : 'Demo User'
                });
            } else {
                const response = await axios.post('/api/login', { username, password });
                onLogin(response.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Neural link synchronization failed. Verify protocol credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-card-container relative overflow-hidden bg-black min-h-screen">
            <div className="mesh-bg opacity-30" />

            {/* Ambient Background Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-panel p-10 rounded-[2.5rem] border-white/10 shadow-2xl relative group overflow-hidden">
                    {/* Subtle Top Glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <div className="flex flex-col items-center mb-10 text-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-24 h-24 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                        >
                            <Activity className="w-12 h-12 text-black" />
                        </motion.div>
                        <h1 className="text-5xl font-black tracking-tighter text-white mb-2 uppercase">GoatAI</h1>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Enterprise Intelligence System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Operator ID</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-emerald-500 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-700"
                                    placeholder="Enter username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Access Key</label>
                            <div className="relative group/input">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-500 group-focus-within/input:text-blue-500 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium placeholder:text-zinc-700"
                                    placeholder="Enter password"
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
                                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-3"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-premium btn-premium-primary btn-shimmer h-15 text-[15px] font-bold tracking-[0.1em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>SYNCHRONIZING...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>INITIATE PROTOCOL</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-white/[0.03] text-center">
                        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] leading-relaxed">
                            Secured by Neural Guardian v4.2<br />
                            Authorized Terminal: Alpha-1 Sector India
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
