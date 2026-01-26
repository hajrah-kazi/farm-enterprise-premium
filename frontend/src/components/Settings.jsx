import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Bell, Shield, Users, Database, Smartphone, Loader2, Globe, ShieldCheck, HardDrive } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [settings, setSettings] = useState({
        farm_name: 'GoatAI Enterprise',
        health_threshold: 70,
        alert_email: 'admin@goatai.com',
        data_retention_days: 30,
        mobile_notifications: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/settings');
            if (response.data.success && response.data.data) {
                const parsed = { ...response.data.data };
                if (parsed.health_threshold) parsed.health_threshold = parseInt(parsed.health_threshold);
                if (parsed.data_retention_days) parsed.data_retention_days = parseInt(parsed.data_retention_days);
                if (parsed.mobile_notifications) parsed.mobile_notifications = parsed.mobile_notifications === 'true';
                setSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/api/settings', settings);
            setTimeout(() => setSaving(false), 800);
        } catch (error) {
            setSaving(false);
        }
    };

    const SettingGroup = ({ title, icon: Icon, children }) => (
        <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
                <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <Icon className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em]">{title}</h3>
            </div>
            <div className="glass-panel p-8 rounded-[2.5rem] space-y-10">
                {children}
            </div>
        </section>
    );

    return (
        <div className="flex flex-col gap-12 max-w-[900px] mx-auto pb-32 pt-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/40" />
                        <h1 className="h1-premium gradient-text">System Protocols</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Configure enterprise node parameters and security matrices.</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-premium btn-premium-primary min-w-[180px] h-14 text-base font-bold active:scale-[0.98] shadow-2xl shadow-white/5"
                >
                    {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{saving ? 'Synchronizing...' : 'Commit Changes'}</span>
                </button>
            </header>

            <div className="space-y-12">
                {/* General Settings */}
                <SettingGroup title="Identity Node" icon={Globe}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Enterprise Designation</label>
                            <input
                                type="text"
                                value={settings.farm_name}
                                onChange={(e) => setSettings({ ...settings, farm_name: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-800"
                                placeholder="Enter designation"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Superuser Communication</label>
                            <input
                                type="email"
                                value={settings.alert_email}
                                onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })}
                                className="w-full bg-white/[0.03] border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-800"
                                placeholder="admin@protocol.io"
                            />
                        </div>
                    </div>
                </SettingGroup>

                {/* System Parameters */}
                <SettingGroup title="Neural Parameters" icon={HardDrive}>
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Vitality Alert Threshold</label>
                                <span className="text-2xl font-black text-white tracking-tighter">{settings.health_threshold}%</span>
                            </div>
                            <div className="relative pt-2">
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={settings.health_threshold}
                                    onChange={(e) => setSettings({ ...settings, health_threshold: parseInt(e.target.value) })}
                                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-emerald-500 rounded-full pointer-events-none transition-all" style={{ width: `${settings.health_threshold}%` }} />
                            </div>
                            <p className="text-xs text-zinc-500 font-medium italic">Autonomous alerts trigger when population vitality index drops below critical vector.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-white/5">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Archive Lifecycle</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={settings.data_retention_days}
                                        onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                                        className="w-full bg-white/[0.03] border border-white/10 text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-800 pr-20"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase tracking-widest">Cycles</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingGroup>

                {/* Notifications & Privacy */}
                <SettingGroup title="Security Matrix" icon={ShieldCheck}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-emerald-500 transition-colors">
                                    <Smartphone className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white tracking-tight">Peripheral Flux</p>
                                    <p className="text-sm text-zinc-500 font-medium">Transmit critical telemetry to verified external nodes.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.mobile_notifications}
                                    onChange={(e) => setSettings({ ...settings, mobile_notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-zinc-400 after:rounded-full after:h-[20px] after:w-[22px] after:transition-all peer-checked:bg-emerald-500 peer-checked:after:bg-black" />
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.01] hover:bg-white/[0.03] transition-all border border-transparent hover:border-white/5 border-t border-white/5 group mt-4">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-400 group-hover:text-amber-500 transition-colors">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-white tracking-tight">Neural Encryption</p>
                                    <p className="text-sm text-zinc-500 font-medium">Activate multi-vector terminal authentication protocols.</p>
                                </div>
                            </div>
                            <button className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.2em] transition-colors py-2 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20">Configure</button>
                        </div>
                    </div>
                </SettingGroup>
            </div>
        </div>
    );
};


export default Settings;
