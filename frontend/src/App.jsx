import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, TrendingUp, Users, Video,
  Bell, Settings, Moon, Sun, Menu, X, BarChart3,
  Heart, MapPin, Calendar, Download, Filter, Search,
  Zap, Shield, Target, Layers, ChevronRight, Upload,
  ClipboardList, LayoutDashboard, Database, FileText, LogOut, Brain, MessageCircle
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Alerts from './components/Alerts';
import Reports from './components/Reports';
import LiveFeed from './components/LiveFeed';
import VideoUpload from './components/VideoUpload';
import Goats from './components/Goats';
import SettingsPage from './components/Settings';
import Login from './components/Login';
import PredictiveAnalytics from './components/PredictiveAnalytics';
import AIChatAssistant from './components/AIChatAssistant';
import BreedGuide from './components/BreedGuide';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const storedUser = localStorage.getItem('goat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('goat_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('goat_user');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'livestock', label: 'Livestock', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'predictions', label: 'Predictions', icon: Brain }, // New Tab
    { id: 'upload', label: 'Upload Video', icon: Upload },
    { id: 'live', label: 'Live Feed', icon: Video },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'breed-guide', label: 'Breed Guide', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="flex h-screen bg-slate-950 overflow-hidden">
        {/* Sidebar - Flex Item */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="h-full glass-strong border-r border-slate-700/50 shadow-2xl flex flex-col flex-shrink-0 overflow-hidden whitespace-nowrap"
            >
              <div className="p-6 space-y-8">
                {/* Brand Header */}
                <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-black text-white tracking-tight">GoatAI</h1>
                      <span className="px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-orange-500 text-[10px] font-bold text-black shadow-sm">PRO</span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">Enterprise Edition</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {tabs.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      className={`glass-nav-btn ${activeTab === item.id ? 'active' : ''}`}
                    >
                      <item.icon className={`w-5 h-5 relative z-10 transition-colors ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                        }`} />
                      <span className="font-bold text-sm relative z-10">{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* User Profile */}
              <div className="mt-auto p-6 border-t border-slate-800/50">
                <div className="glass-nav-btn group relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shadow-lg group-hover:scale-105 transition-transform">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors truncate">{user.full_name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right Side Wrapper */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 flex-shrink-0">
            <div className="flex items-center justify-between px-8 py-5">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="btn-icon"
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <p className="text-sm text-slate-400 font-medium">Real-time AI-powered farm intelligence</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* AI Chat Toggle */}
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`btn-icon ${isChatOpen ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/50' : ''}`}
                  title="AI Assistant"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="btn-icon group relative">
                  <Bell className="w-5 h-5 group-hover:animate-swing" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse"></span>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="btn-icon"
                >
                  {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-400" />}
                </button>

                {/* Settings */}
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`btn-icon ${activeTab === 'settings' ? 'text-emerald-400 bg-emerald-500/10' : ''}`}
                >
                  <Settings className="w-5 h-5" />
                </button>

                <div className="h-8 w-px bg-slate-800 mx-2"></div>

                {/* CTA Button */}
                <button
                  onClick={() => setActiveTab('upload')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Video</span>
                </button>
              </div>
            </div>
          </header>

          {/* Content Area + Chat Split */}
          <div className="flex-1 flex overflow-hidden">
            {/* Scrollable Page Content */}
            <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="min-h-full"
                >
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'livestock' && <Goats />}
                  {activeTab === 'analytics' && <Analytics />}
                  {activeTab === 'predictions' && <PredictiveAnalytics />}
                  {activeTab === 'upload' && <VideoUpload />}
                  {activeTab === 'live' && <LiveFeed />}
                  {activeTab === 'alerts' && <Alerts />}
                  {activeTab === 'alerts' && <Alerts />}
                  {activeTab === 'reports' && <Reports />}
                  {activeTab === 'breed-guide' && <BreedGuide />}
                  {activeTab === 'settings' && <SettingsPage />}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Chat Sidebar Area */}
            <AnimatePresence>
              {isChatOpen && (
                <div className="w-[400px] border-l border-slate-800/50 bg-slate-950/50 backdrop-blur-sm h-full flex flex-col shadow-2xl z-30">
                  <AIChatAssistant isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
