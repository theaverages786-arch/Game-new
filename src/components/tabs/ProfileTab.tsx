import React, { useState } from 'react';
import { 
  UserCircle, 
  ShieldCheck, 
  History, 
  Headphones, 
  Lock, 
  LogOut, 
  Globe, 
  Coins, 
  Trophy, 
  ChevronRight,
  Sparkles,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { UserAccount, BetRecord } from '../../types';
import { soundService } from '../../services/sound';

interface ProfileTabProps {
  user: UserAccount;
  bets: BetRecord[];
  onOpenAdmin: () => void;
  onOpenDeposit: () => void;
  onResetDemoBalance: () => void;
  onOpenSupport: () => void;
  language: 'en' | 'ur' | 'hi';
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  bets,
  onOpenAdmin,
  onOpenDeposit,
  onResetDemoBalance,
  onOpenSupport,
  language,
}) => {
  const [showBetHistory, setShowBetHistory] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'agent'; text: string; time: string }[]>([
    {
      sender: 'agent',
      text: 'Hello! Welcome to 777 Official 24/7 VIP Customer Support. How can we assist your deposits, withdrawals, or gameplay today?',
      time: 'Just now',
    },
  ]);

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    soundService.playClick();
    const newMsg = {
      sender: 'user' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatLog((prev) => [...prev, newMsg]);
    setChatMessage('');

    setTimeout(() => {
      soundService.playBeep(700);
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Thank you for reaching out! Your query has been logged. All withdrawal/deposit channels (JazzCash & EasyPaisa) are running smoothly at 100% speed.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-[#121828] via-[#1a233b] to-[#121828] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 flex items-center justify-center text-3xl shadow-lg border border-amber-300">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">{user.username}</h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  VIP {user.vipLevel}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.phone}</span>
                <span className="text-slate-600">&bull;</span>
                <span>ID: {user.id}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playCoin();
              onResetDemoBalance();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>+2,000 Demo Refill</span>
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center font-mono">
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Total Balance</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">₨ {user.balance.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Total Bet Volume</span>
            <span className="text-xs sm:text-sm font-black text-slate-200">₨ {user.totalBetAmount.toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 block font-sans">Total Winnings</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400">₨ {user.totalWonAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Menu Options List */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-3 shadow-xl divide-y divide-slate-800/80">
        {/* Bet History */}
        <button
          onClick={() => {
            soundService.playClick();
            setShowBetHistory(!showBetHistory);
          }}
          className="w-full px-3 py-3 flex items-center justify-between text-left hover:bg-slate-900/40 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white">Betting Records &amp; History</div>
              <div className="text-[10px] text-slate-400">View past slot spins, crash multipliers, and wingo bets</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* 24/7 Support */}
        <button
          onClick={() => {
            soundService.playClick();
            setShowSupportModal(true);
          }}
          className="w-full px-3 py-3 flex items-center justify-between text-left hover:bg-slate-900/40 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white">24/7 Live Customer Service</div>
              <div className="text-[10px] text-slate-400">Instant agent chat for payment &amp; game queries</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        {/* Admin System Panel Trigger */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenAdmin();
          }}
          className="w-full px-3 py-3 flex items-center justify-between text-left hover:bg-slate-900/40 rounded-2xl transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-300">Admin Control Panel (Odds &amp; Logic)</div>
              <div className="text-[10px] text-slate-400">Manage RTP payout rates, simulated approvals, and balance</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Bet History Modal / Accordion */}
      {showBetHistory && (
        <div className="bg-[#0b101c] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Recent Game Bets ({bets.length} Rounds)
            </h4>
            <button onClick={() => setShowBetHistory(false)} className="text-xs text-slate-400 hover:text-white">
              ✕ Close
            </button>
          </div>

          {bets.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No recent bets placed yet. Play a game to record!</p>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto font-mono text-xs">
              {bets.map((b) => (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    b.winAmount > 0
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <div className="font-bold text-white text-xs">{b.gameTitle}</div>
                    <div className="text-[10px] text-slate-400">{b.details}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-300">Bet: ₨ {b.betAmount}</div>
                    <div className={b.winAmount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {b.winAmount > 0 ? `+₨ ${b.winAmount}` : 'Lost'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 24/7 Live Support Chat Dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#0e1424] border border-amber-500/40 rounded-3xl p-4 shadow-2xl flex flex-col h-[480px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <h4 className="text-xs font-black text-white">777 VIP Customer Care</h4>
                  <span className="text-[10px] text-emerald-400">Online &bull; Instant Response</span>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs">
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 px-1 mt-0.5">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSendMessage}
                className="bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow hover:bg-amber-300 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
