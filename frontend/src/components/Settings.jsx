import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, Bell, Shield, Users, Database, Smartphone } from 'lucide-react';
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
            const response = await axios.get('http://localhost:5000/api/settings');
            if (response.data.success && response.data.data) {
                // Parse values where necessary
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
            await axios.post('http://localhost:5000/api/settings', settings);
            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Error saving settings:', error);
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-3">
                        <SettingsIcon className="w-8 h-8 text-emerald-400" />
                        System Configuration
                    </h2>
                    <p className="text-slate-400 mt-1 text-lg">Manage farm parameters and system preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong p-8 rounded-3xl border border-slate-700/50"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Database className="w-5 h-5 text-blue-400" />
                        General Settings
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Farm Name</label>
                            <input
                                type="text"
                                value={settings.farm_name}
                                onChange={(e) => setSettings({ ...settings, farm_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Data Retention (Days)</label>
                            <input
                                type="number"
                                value={settings.data_retention_days}
                                onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Alert Configuration */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-strong p-8 rounded-3xl border border-slate-700/50"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-orange-400" />
                        Alert Thresholds
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-slate-400">Health Score Threshold</label>
                                <span className="text-sm font-bold text-emerald-400">{settings.health_threshold}%</span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={settings.health_threshold}
                                onChange={(e) => setSettings({ ...settings, health_threshold: parseInt(e.target.value) })}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <p className="text-xs text-slate-500 mt-2">Alerts will be triggered if health score falls below this value.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Alert Notification Email</label>
                            <input
                                type="email"
                                value={settings.alert_email}
                                onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Security & Access */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong p-8 rounded-3xl border border-slate-700/50"
                >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-400" />
                        Security & Access
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-bold text-white">Admin Access</p>
                                    <p className="text-xs text-slate-500">Manage system administrators</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 text-sm font-bold text-slate-300 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700 hover:text-white transition-colors">Manage</button>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-slate-400" />
                                <div>
                                    <p className="font-bold text-white">Mobile Notifications</p>
                                    <p className="text-xs text-slate-500">Push alerts to mobile app</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.mobile_notifications}
                                    onChange={(e) => setSettings({ ...settings, mobile_notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;
