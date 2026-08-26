import React, { useState } from 'react';
import { Headphones, Send, X, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  text: string;
  time: string;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose, userId = '193623200' }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'agent',
      text: `Welcome to P999 24/7 Official VIP Customer Support! 🌟\nYour Account ID: ${userId}\nHow can we help you with deposits, withdrawals, or bonuses today?`,
      time: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    soundService.playClick();
    const userMsg: ChatMessage = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Automated agent response
    setTimeout(() => {
      soundService.playCoin();
      const botReply: ChatMessage = {
        id: 'a_' + Date.now(),
        sender: 'agent',
        text: 'Thank you for reaching out! A dedicated P999 customer service specialist has received your inquiry and is processing it right away. If you have a deposit/withdrawal screenshot, please note your 12-digit TID number.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botReply]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-[#091526] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[500px] max-h-[85vh] animate-in zoom-in-95">
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-[#0e223d] to-[#08172b] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900"></span>
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>P999 VIP Specialist (Ayla)</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 rounded font-mono">
                  Active
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Response speed: ~15 seconds</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#070f1a] text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line shadow ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-medium rounded-br-none'
                    : 'bg-[#10243e] text-slate-100 border border-slate-700/60 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        {/* Quick Question Buttons */}
        <div className="px-3 py-1.5 bg-[#091526] border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            'How to Deposit +5% Bonus?',
            'Withdrawal Status Check',
            'Claim Mystery Red Envelope',
            'Download APK Rs 999',
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputMessage(q);
              }}
              className="px-2.5 py-1 rounded-full bg-[#10243e] text-slate-300 hover:text-amber-300 text-[10px] whitespace-nowrap border border-slate-700 transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="p-3 bg-[#0e223d] border-t border-slate-700/80 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message to VIP support..."
            className="flex-1 bg-[#07111e] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSendMessage}
            className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold shadow hover:from-amber-300 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
