import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';

const AIChatAssistant = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hello! I\'m FarmGenie AI. I can analyze your herd, check health records, and spot trends. How can I assist you today?',
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
        'How many goats are sick?',
        'Analyze recent alerts',
        'Show herd health summary',
        'Predict meat yield'
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
            console.error("Chat error:", error);
            const errorMessage = {
                id: messages.length + 2,
                type: 'bot',
                text: "I'm having trouble connecting to the Farm Brain. Please check your connection or API key.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    // Use portal to ensure it breaks out of any overflow hiding containers
    return (
        <div className="h-full w-full flex flex-col bg-slate-900/95 backdrop-blur-xl border-l border-emerald-500/30 overflow-hidden font-sans">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-emerald-900/50 to-slate-900 border-b border-emerald-500/20 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-lg tracking-tight">FarmGenie AI</h3>
                        <p className="text-emerald-400/80 text-xs font-medium">Enterprise Assistant</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-emerald-500/20 scrollbar-track-transparent">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'bot'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            }`}>
                            {message.type === 'bot' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>

                        <div className={`max-w-[80%] space-y-1 ${message.type === 'user' ? 'items-end flex flex-col' : ''}`}>
                            <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${message.type === 'bot'
                                ? 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-none'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-emerald-900/20 rounded-tr-none'
                                }`}>
                                {message.text}
                            </div>
                            <span className="text-[10px] text-slate-500 px-1 opacity-70">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-slate-800/80 border border-slate-700/50 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions & Input */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-3 flex-shrink-0">
                {messages.length < 3 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-right">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(action)}
                                className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 text-xs text-slate-300 hover:text-emerald-400 transition-all cursor-pointer"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                )}

                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask FarmGenie anything..."
                        className="flex-1 bg-slate-950/50 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        disabled={isTyping}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
                <div className="text-center">
                    <p className="text-[10px] text-slate-600">
                        Powered by OpenAI & Real-time Farm Data
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;
