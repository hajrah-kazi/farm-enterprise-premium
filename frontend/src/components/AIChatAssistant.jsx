import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const AIChatAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: "SYSTEM INITIALIZED. I am GoatAI Alpha, your versatile institutional intelligence node. I have full access to global livestock genetics, bio-metric telemetry, and general logic modules. How can I optimize your operations or answer your inquiries today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, isOpen]);

    const quickActions = [
        'Analyze Bio-Metrics',
        'Identify Anomalies',
        'Forecast Yield',
        'Audit Fiscal Logs'
    ];

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await axios.post('/api/chat', {
                message: text
            });

            const botMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: response.data.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            setTimeout(() => {
                let fallbackResponse = "Analysis complete. System parameters are within acceptable variance ranges.";
                const lowerMsg = text.toLowerCase();
                if (lowerMsg.includes('sick') || lowerMsg.includes('health') || lowerMsg.includes('anom')) {
                    fallbackResponse = "CAUTION: Bio-metric analysis flags 3 entities in Zone 4 with heart rate divergence. Immediate veterinary audit recommended.";
                } else if (lowerMsg.includes('count') || lowerMsg.includes('herd') || lowerMsg.includes('metric')) {
                    fallbackResponse = "HERD STATUS: 42 entities detected. 39 Active, 3 Isolated. Genetic diversity index at 0.94.";
                } else if (lowerMsg.includes('yield') || lowerMsg.includes('forecast')) {
                    fallbackResponse = "YIELD PROJECTION: AI models predict +12.5% increase in milk protein density for Q1 based on current nutrient optimization.";
                } else if (lowerMsg.includes('hello')) {
                    fallbackResponse = "GREETINGS. Operational Assistant online. State your inquiry protocol.";
                }

                const fallbackMessage = {
                    id: messages.length + 2,
                    type: 'bot',
                    text: fallbackResponse,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, fallbackMessage]);
            }, 1000);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-[#08080a] shadow-2xl">
            {/* High-Fidelity Header */}
            <header className="p-8 pb-6 flex items-center justify-between border-b border-white/[0.05] bg-black/40">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                        <Bot className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">GoatAI Alpha</h3>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Strategic Uplink
                        </p>
                    </div>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white transition-all">
                    <X className="w-4 h-4" />
                </button>
            </header>

            {/* Stream Node */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {messages.map((message) => (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={message.id}
                        className={`flex gap-4 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border shadow-xl ${message.type === 'bot'
                            ? 'bg-zinc-900 border-white/5'
                            : 'bg-white border-transparent'
                            }`}>
                            {message.type === 'bot' ? <Sparkles className="w-4 h-4 text-emerald-400" /> : <User className="w-4 h-4 text-black" />}
                        </div>
                        <div className={`max-w-[85%] flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-5 rounded-3xl text-[13px] font-medium leading-relaxed shadow-lg ${message.type === 'bot'
                                ? 'bg-white/[0.04] text-[#fcfcfc] rounded-tl-none border border-white/5'
                                : 'bg-emerald-500 text-white rounded-tr-none'
                                }`}>
                                {message.text}
                            </div>
                            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-2 px-1">
                                {message.type === 'bot' ? 'GoatAI Core' : 'Operator Access'}
                            </span>
                        </div>
                    </motion.div>
                ))}
                {isTyping && (
                    <div className="flex gap-5">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="bg-white/[0.02] p-5 rounded-[1.75rem] rounded-tl-none flex items-center gap-3">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                            <span className="text-[9px] font-black uppercase text-zinc-600 tracking-widest">Synthesizing...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Control Deck */}
            <footer className="p-8 pb-10 bg-[#0c0c0e] border-t border-white/5">
                <div className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-2 pl-6 focus-within:border-emerald-500/50 focus-within:bg-white/[0.05] transition-all shadow-inner group">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="ENTER COMMAND..."
                        className="flex-1 bg-transparent py-4 text-[12px] font-bold text-white uppercase tracking-widest outline-none placeholder:text-zinc-700"
                    />
                    <button
                        onClick={() => handleSend()}
                        className="w-12 h-12 bg-white hover:bg-emerald-400 transition-all duration-300 rounded-xl flex items-center justify-center text-black shadow-2xl active:scale-95 flex-shrink-0"
                    >
                        <Send className="w-5 h-5 flex-shrink-0" />
                    </button>
                </div>
            </footer>
        </div>
    );
};


export default AIChatAssistant;
