import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, CloudSnow, CloudDrizzle, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';

const WeatherDashboard = () => {
    const [weather] = useState({
        current: {
            temp: 28,
            feels_like: 30,
            humidity: 65,
            wind_speed: 12,
            pressure: 1013,
            visibility: 10,
            uv_index: 6,
            condition: 'Partly Cloudy',
            icon: 'cloud'
        },
        forecast: [
            { day: 'MON', high: 30, low: 22, condition: 'sunny', rain: 10 },
            { day: 'TUE', high: 28, low: 21, condition: 'cloudy', rain: 30 },
            { day: 'WED', high: 26, low: 20, condition: 'rainy', rain: 70 },
            { day: 'THU', high: 27, low: 21, condition: 'cloudy', rain: 40 },
            { day: 'FRI', high: 29, low: 22, condition: 'sunny', rain: 15 },
        ],
        alerts: [
            { type: 'warning', message: 'High UV Index expected today', severity: 'medium' },
            { type: 'info', message: 'Rain expected Wednesday', severity: 'low' }
        ]
    });

    const getWeatherIcon = (condition) => {
        const icons = {
            sunny: <Sun className="w-full h-full text-amber-400" />,
            cloudy: <Cloud className="w-full h-full text-zinc-400" />,
            rainy: <CloudRain className="w-full h-full text-indigo-400" />,
            drizzle: <CloudDrizzle className="w-full h-full text-blue-300" />,
            snow: <CloudSnow className="w-full h-full text-cyan-300" />,
            storm: <Zap className="w-full h-full text-purple-400" />
        };
        return icons[condition] || icons.cloudy;
    };

    return (
        <div className="flex flex-col gap-10 pb-32 max-w-[1400px] mx-auto">
            {/* Meteorological Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-amber-500 rounded-full shadow-lg shadow-amber-500/40" />
                        <h1 className="h1-premium gradient-text leading-tight uppercase tracking-tighter">Atmospheric Node</h1>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium tracking-tight">Real-time planetary conditions and tactical climate modeling.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 text-zinc-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        SATELLITE LINK 0x82 ACTIVE
                    </div>
                </div>
            </div>

            {/* Main Environment Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Current Atmospheric Node */}
                <div className="xl:col-span-8 flex flex-col gap-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-16 rounded-[4rem] border-white/5 relative overflow-hidden group bg-white/[0.01] shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-16 text-amber-500/[0.03] animate-[spin_20s_linear_infinite] pointer-events-none">
                            <Sun className="w-[500px] h-[500px]" />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-20">
                            <div className="flex flex-col items-center lg:items-start">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 mb-8 leading-none">Local Atmosphere State</span>
                                <div className="flex items-center gap-10">
                                    <h2 className="text-[140px] font-black tracking-tighter text-white leading-none drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                        {weather.current.temp}<span className="text-zinc-800">°</span>
                                    </h2>
                                    <div className="space-y-3">
                                        <p className="text-3xl font-bold text-amber-500 uppercase tracking-tight leading-none">{weather.current.condition}</p>
                                        <p className="text-sm font-black text-zinc-600 uppercase tracking-widest leading-none">Feels like {weather.current.feels_like}°C</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-8">
                                {[
                                    { icon: Droplets, val: `${weather.current.humidity}%`, label: 'Humidity', color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                                    { icon: Wind, val: `${weather.current.wind_speed} km/h`, label: 'Wind Velocity', color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                                    { icon: Gauge, val: `${weather.current.pressure} hPa`, label: 'Barometric', color: 'text-rose-400', bg: 'bg-rose-500/5' },
                                    { icon: Eye, val: `${weather.current.visibility} km`, label: 'Visibility', color: 'text-cyan-400', bg: 'bg-cyan-500/5' }
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-5 group/stat hover:bg-white/[0.04] transition-all duration-700">
                                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-white/5 shadow-2xl transition-transform duration-500 group-hover/stat:rotate-12`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-white tracking-tight leading-none mb-1">{stat.val}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 leading-none">{stat.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Forecast Node */}
                    <div className="glass-panel p-12 rounded-[3.5rem] border-white/5 bg-white/[0.01] shadow-2xl">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                            <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-none">5-Day Meteorological Projection</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {weather.forecast.map((day, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-10 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 text-center transition-all duration-700 group hover:bg-zinc-900 shadow-2xl"
                                >
                                    <p className="text-[11px] font-black text-zinc-600 mb-8 tracking-[0.3em] uppercase">{day.day}</p>
                                    <div className="w-16 h-16 mx-auto mb-8 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6">
                                        {getWeatherIcon(day.condition)}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-3xl font-black text-white tracking-tighter leading-none">{day.high}°</p>
                                        <div className="flex items-center justify-center gap-2 text-zinc-700">
                                            <CloudRain className="w-3 h-3" />
                                            <span className="text-[10px] font-black tracking-widest">{day.rain}%</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tactical Advisory Node */}
                <div className="xl:col-span-4 h-full">
                    <div className="glass-panel p-12 rounded-[4rem] border-white/5 bg-indigo-500/[0.02] relative overflow-hidden h-full shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40" />

                        <div className="mb-12 relative z-10 text-white">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 flex items-center justify-center mb-8 shadow-2xl">
                                <Zap className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase leading-[0.9]">Tactical <br /> Advisory</h3>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-5">Protocol v82.4 • Dynamic Logic</p>
                        </div>

                        <div className="space-y-8 relative z-10 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                            {[
                                { title: 'Hydration Logic', desc: 'UV Index at 6. Calibrating water output +15% across priority sectors.', icon: Droplets, color: 'text-indigo-400', bg: 'bg-indigo-500/5' },
                                { title: 'Feed Shielding', desc: 'Sustained gusts detected. Activating north-facing structural locks.', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
                                { title: 'Health Matrix', desc: 'Barometric shift incoming. Monitor respiratory metrics in geriatric herds.', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5' }
                            ].map((adv, idx) => (
                                <div key={idx} className="p-8 rounded-[2.5rem] bg-zinc-950/50 border border-white/5 group hover:border-indigo-500/20 transition-all duration-700 shadow-xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`p-2.5 rounded-xl ${adv.bg} ${adv.color} border border-white/5`}>
                                            <adv.icon className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-black text-white text-[12px] uppercase tracking-widest">{adv.title}</h4>
                                    </div>
                                    <p className="text-[13px] text-zinc-500 font-medium leading-relaxed group-hover:text-zinc-300 transition-colors">{adv.desc}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 relative z-10 shadow-lg">
                            <span className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] mb-3 block leading-none">CRITICAL SETTLEMENT</span>
                            <p className="text-[13px] text-white font-bold italic leading-relaxed opacity-80">
                                "Extreme thermal localized pattern detected. Deploy Sector 07 cooling protocols by 14:00."
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default WeatherDashboard;
