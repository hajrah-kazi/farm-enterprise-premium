import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <XCircle className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />
    };

    const config = {
        success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'SUCCESS' },
        error: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'ERROR' },
        warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'WARNING' },
        info: { color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', label: 'INFORMATION' }
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.3 } }}
            className={`glass-panel rounded-[1.5rem] p-5 shadow-3xl min-w-[380px] max-w-md ${config[type].bg} ${config[type].border} border backdrop-blur-3xl`}
        >
            <div className="flex items-start gap-5">
                <div className={`w-12 h-12 rounded-2xl ${config[type].bg} ${config[type].color} border border-white/5 flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-500 hover:rotate-6`}>
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${config[type].color}`}>
                            {config[type].label}
                        </span>
                        <div className="h-px flex-1 bg-white/5" />
                    </div>
                    <p className="text-zinc-200 font-bold text-[13px] leading-relaxed tracking-tight">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-all duration-300 shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Auto-dismiss progress bar */}
            <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-0.5 rounded-full ${config[type].color.replace('text', 'bg')} opacity-20`}
            />
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-10 right-10 z-[10000] flex flex-col gap-4">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};


// Hook for using toasts
export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return { toasts, addToast, removeToast };
};

export default Toast;
