import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, CloudSnow, CloudDrizzle, Zap } from 'lucide-react';

const WeatherDashboard = () => {
    const [weather, setWeather] = useState({
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
            { day: 'Mon', high: 30, low: 22, condition: 'sunny', rain: 10 },
            { day: 'Tue', high: 28, low: 21, condition: 'cloudy', rain: 30 },
            { day: 'Wed', high: 26, low: 20, condition: 'rainy', rain: 70 },
            { day: 'Thu', high: 27, low: 21, condition: 'cloudy', rain: 40 },
            { day: 'Fri', high: 29, low: 22, condition: 'sunny', rain: 15 },
        ],
        alerts: [
            { type: 'warning', message: 'High UV Index expected today', severity: 'medium' },
            { type: 'info', message: 'Rain expected Wednesday', severity: 'low' }
        ]
    });

    const getWeatherIcon = (condition) => {
        const icons = {
            sunny: <Sun className="w-full h-full text-yellow-400" />,
            cloudy: <Cloud className="w-full h-full text-slate-400" />,
            rainy: <CloudRain className="w-full h-full text-blue-400" />,
            drizzle: <CloudDrizzle className="w-full h-full text-blue-300" />,
            snow: <CloudSnow className="w-full h-full text-cyan-300" />,
            storm: <Zap className="w-full h-full text-purple-400" />
        };
        return icons[condition] || icons.cloudy;
    };

    const getUVLevel = (index) => {
        if (index <= 2) return { level: 'Low', color: 'emerald' };
        if (index <= 5) return { level: 'Moderate', color: 'yellow' };
        if (index <= 7) return { level: 'High', color: 'orange' };
        return { level: 'Very High', color: 'red' };
    };

    const uvInfo = getUVLevel(weather.current.uv_index);

    return (
        <div className="space-y-6">
            {/* Current Weather */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-strong rounded-3xl p-8 border border-slate-700/50 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />

                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Main Weather */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Cloud className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-bold text-white">Current Weather</h3>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24">
                                {getWeatherIcon(weather.current.icon)}
                            </div>
                            <div>
                                <p className="text-6xl font-black text-white">{weather.current.temp}°</p>
                                <p className="text-slate-400">Feels like {weather.current.feels_like}°</p>
                                <p className="text-emerald-400 font-semibold mt-1">{weather.current.condition}</p>
                            </div>
                        </div>

                        {/* Weather Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplets className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-slate-500 font-semibold">Humidity</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{weather.current.humidity}%</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wind className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-slate-500 font-semibold">Wind</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{weather.current.wind_speed} km/h</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gauge className="w-4 h-4 text-purple-400" />
                                    <span className="text-xs text-slate-500 font-semibold">Pressure</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{weather.current.pressure} mb</p>
                            </div>

                            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <Eye className="w-4 h-4 text-cyan-400" />
                                    <span className="text-xs text-slate-500 font-semibold">Visibility</span>
                                </div>
                                <p className="text-2xl font-bold text-white">{weather.current.visibility} km</p>
                            </div>
                        </div>
                    </div>

                    {/* UV Index & Alerts */}
                    <div className="space-y-4">
                        {/* UV Index */}
                        <div className={`p-6 rounded-2xl bg-gradient-to-br from-${uvInfo.color}-500/10 to-${uvInfo.color}-600/5 border border-${uvInfo.color}-500/20`}>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-slate-400 font-semibold">UV Index</p>
                                    <p className={`text-3xl font-black text-${uvInfo.color}-400`}>{weather.current.uv_index}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl bg-${uvInfo.color}-500/20 border border-${uvInfo.color}-500/30`}>
                                    <p className={`text-sm font-bold text-${uvInfo.color}-400`}>{uvInfo.level}</p>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r from-${uvInfo.color}-500 to-${uvInfo.color}-600`}
                                    style={{ width: `${(weather.current.uv_index / 11) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Weather Alerts */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-white mb-3">Weather Alerts</h4>
                            {weather.alerts.map((alert, i) => (
                                <div
                                    key={i}
                                    className={`p-4 rounded-xl border ${alert.severity === 'high'
                                            ? 'bg-red-500/10 border-red-500/30'
                                            : alert.severity === 'medium'
                                                ? 'bg-orange-500/10 border-orange-500/30'
                                                : 'bg-blue-500/10 border-blue-500/30'
                                        }`}
                                >
                                    <p className="text-sm text-white font-medium">{alert.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Farm Impact */}
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <h4 className="text-sm font-bold text-emerald-400 mb-2">Farm Impact</h4>
                            <p className="text-xs text-slate-300">
                                ✓ Good conditions for outdoor activities<br />
                                ✓ Adequate hydration recommended<br />
                                ⚠ Monitor UV exposure
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 5-Day Forecast */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-strong rounded-3xl p-6 border border-slate-700/50"
            >
                <h3 className="text-lg font-bold text-white mb-6">5-Day Forecast</h3>
                <div className="grid grid-cols-5 gap-4">
                    {weather.forecast.map((day, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/30 hover:border-emerald-500/30 transition-all text-center group"
                        >
                            <p className="text-sm font-bold text-slate-400 mb-3">{day.day}</p>
                            <div className="w-12 h-12 mx-auto mb-3 group-hover:scale-110 transition-transform">
                                {getWeatherIcon(day.condition)}
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold text-white">{day.high}°</p>
                                <p className="text-sm text-slate-500">{day.low}°</p>
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    <Droplets className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs text-blue-400">{day.rain}%</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default WeatherDashboard;
