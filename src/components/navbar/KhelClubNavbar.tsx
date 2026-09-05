import React, { useState } from 'react';
import { 
  Dices, 
  Coins, 
  Plus, 
  Sparkles, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  Users, 
  Radio, 
  Trophy, 
  Layers 
} from 'lucide-react';
import { soundService } from '../../services/sound';
import confetti from 'canvas-confetti';

interface KhelClubNavbarProps {
  userCoins: number;
  onAddFreeCoins: (amount: number) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenRules: () => void;
  onOpenRoomModal: () => void;
}

export const KhelClubNavbar: React.FC<KhelClubNavbarProps> = ({
  userCoins,
  onAddFreeCoins,
  activeTab,
  onSelectTab,
  onOpenRules,
  onOpenRoomModal,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleClaimFreeCoins = () => {
    soundService.playWin();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.15 },
    });
    onAddFreeCoins(5000);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.toggleSound(!next);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0f1d]/95 backdrop-blur-md border-b border-amber-500/20 shadow-xl px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onSelectTab('all')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition group-hover:scale-105">
            <div className="w-full h-full bg-[#0b1020] rounded-[14px] flex items-center justify-center">
              <Dices className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase">
                KhelClub
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-widest">
                Arena
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% Play-Money Multiplayer</span>
            </div>
          </div>
        </div>

        {/* Center Game Filters (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-2xl">
          {[
            { id: 'all', label: 'All Games' },
            { id: 'ludo', label: '🎲 Ludo 15×15' },
            { id: 'teen_patti', label: '🂡 Teen Patti' },
            { id: 'rummy', label: '🃏 Rummy 13-Card' },
            { id: 'arcade', label: '🚀 Mini Arcades' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundService.playClick();
                onSelectTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Action Controls: Free Coins Faucet, Wallet, Mute */}
        <div className="flex items-center gap-2">
          {/* Free Coin Faucet Button */}
          <button
            onClick={handleClaimFreeCoins}
            title="Claim 5,000 Free Practice Coins"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="hidden sm:inline">FREE COINS</span>
            <span className="sm:hidden">+5K</span>
          </button>

          {/* User Coins Display */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-amber-500/30 px-3 py-1.5 rounded-xl">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
              {userCoins.toLocaleString()}
            </span>
          </div>

          {/* Room Code Action */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenRoomModal();
            }}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 rounded-xl text-xs font-bold cursor-pointer transition"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Room Code</span>
          </button>

          {/* Rules Guide Button */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenRules();
            }}
            title="Game Rules & Mechanics"
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
