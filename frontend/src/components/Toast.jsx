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

    const colors = {
        success: 'from-emerald-500 to-teal-500',
        error: 'from-red-500 to-pink-500',
        warning: 'from-orange-500 to-yellow-500',
        info: 'from-blue-500 to-cyan-500'
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="glass-strong rounded-2xl p-4 border border-slate-700/50 shadow-2xl min-w-[320px] max-w-md"
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${colors[type]} text-white shrink-0`}>
                    {icons[type]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
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

    return { toasts, addToast, removeToast, ToastContainer };
};

export default Toast;
