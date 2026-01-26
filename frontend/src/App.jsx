import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, TrendingUp, Users, Video,
  Bell, Settings, Moon, Sun, Menu, X, BarChart3,
  Heart, MapPin, Calendar, Download, Filter, Search,
  Zap, Shield, Target, Layers, ChevronRight, Upload, Camera,
  ClipboardList, LayoutDashboard, Database, FileText, LogOut, Brain, MessageSquare, Sparkles
} from 'lucide-react';

import { useToast, ToastContainer } from './components/Toast';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Reports from './components/Reports';
import VideoUpload from './components/VideoUpload';
import Goats from './components/Goats';
import SettingsPage from './components/Settings';
import Login from './components/Login';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import AIChatAssistant from './components/AIChatAssistant';
import BreedGuide from './components/BreedGuide';
import './light-theme.css';

const App = () => {
  const { toasts, addToast, removeToast } = useToast();
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('goat_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Auth state parse error", e);
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('goat_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('goat_user');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'livestock', label: 'Livestock Intelligence', icon: Database },
    { id: 'analytics', label: 'Bio-Metric Analytics', icon: BarChart3 },
    { id: 'predictions', label: 'Predictive Outcomes', icon: Brain },
    { id: 'upload', label: 'Ingestion Node', icon: Upload },
    { id: 'reports', label: 'Institutional Reports', icon: FileText },
    { id: 'alerts', label: 'Security & alerts', icon: AlertTriangle },
    { id: 'breed-guide', label: 'Global Breed Guide', icon: Heart },
    { id: 'settings', label: 'System Configuration', icon: Settings },
  ];

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden relative font-sans" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="mesh-bg" />

      {/* FIXED Sidebar Infrastructure */}
      <aside
        className={`sidebar-container transition-all duration-700 ease-[0.16,1,0.3,1] flex flex-col bg-[#050505] border-r border-white/[0.03] ${sidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-20'}`}
        style={{ width: sidebarOpen ? 'var(--sidebar-width)' : '80px' }}
      >
        {/* Institutional Branding */}
        <div className="h-32 shrink-0 flex items-center px-10">
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-white flex items-center justify-center elevation-premium shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              <Activity className="w-7 h-7 text-black" />
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
                <span className="font-bold text-2xl tracking-tight text-white uppercase leading-none">GoatAI</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                  PRO VERSION
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Global Navigation Engine */}
        <nav className="flex-1 px-5 space-y-1.5 overflow-y-auto scrollbar-hide py-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-lg transition-all duration-400 group relative ${activeTab === item.id
                ? 'bg-white/[0.04] text-white border border-white/[0.1] shadow-2xl'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02] border border-transparent'
                }`}
            >
              {activeTab === item.id && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/[0.03] -z-10 rounded-2xl" />
              )}

              <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-500 ${activeTab === item.id ? 'text-white scale-110' : 'group-hover:scale-110'}`} />

              {sidebarOpen && (
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-400 whitespace-nowrap ${activeTab === item.id ? 'text-white' : 'text-zinc-500'}`}>
                  {item.label}
                </span>
              )}

              {activeTab === item.id && (
                <motion.div layoutId="nav-acc" className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
              )}
            </button>
          ))}
        </nav>

        {/* Operator Profile */}
        <div className="p-8 border-t border-white/[0.03] bg-black/20">
          <div className="flex items-center gap-5">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-[10px] font-black pointer-events-none uppercase">
              {user?.username?.substring(0, 2) || 'OP'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{user?.full_name || 'Operator'}</p>
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mt-1">Admin Node</p>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500 transition-all">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Intelligent Node orchestrated by MARS (Main App Routing System) */}
      <main className={`transition-all duration-700 ease-[0.16,1,0.3,1] ${sidebarOpen ? 'main-content' : 'main-content-fluid'}`}>
        {/* Universal Institutional Header */}
        <header className="h-[var(--header-height)] shrink-0 flex items-center justify-between px-12 bg-black/40 backdrop-blur-3xl border-b border-white/[0.03] sticky top-0 z-[60]">
          <div className="flex items-center gap-10 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 hover:text-white transition-all shadow-inner"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-white/[0.05]" />
            <div className="flex flex-col">
              <h2 className="text-lg font-bold tracking-tight uppercase text-white leading-none">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/[0.03] shadow-inner">
              <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-lg transition-all text-zinc-500 hover:text-white hover:bg-white/5">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg transition-all text-zinc-500 hover:text-white hover:bg-white/5 relative">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full border-2 border-[#050505]" />
              </button>
            </div>

            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`btn-premium h-11 px-6 font-bold text-[10px] tracking-[0.2em] shadow-xl ${isChatOpen
                ? 'bg-white text-black'
                : 'bg-white/[0.03] border-white/[0.04] text-zinc-400 hover:text-white'
                }`}
            >
              <Sparkles className="w-4 h-4" />
              INTELLIGENCE
            </button>
          </div>
        </header>

        {/* Core Payload Surface */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1440px] mx-auto w-full"
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'livestock' && <Goats />}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'predictions' && <PredictiveAnalytics />}
              {activeTab === 'upload' && <VideoUpload />}
              {activeTab === 'alerts' && <Alerts />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'breed-guide' && <BreedGuide />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* AI Assistant - Absolute Fixed Anchor */}
      {/* AI Assistant - Right Anchor Institutional Drawer */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsChatOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="fixed inset-y-0 right-0 left-auto w-[480px] h-full z-[100] shadow-[-10px_0_50px_rgba(0,0,0,0.5)] border-l border-white/5 flex flex-col bg-[#08080a]"
              style={{ left: 'auto', right: 0 }}
            >
              <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;
