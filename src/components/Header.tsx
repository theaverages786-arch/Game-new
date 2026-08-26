import React, { useState } from 'react';
import { 
  Menu, 
  RotateCcw, 
  ChevronDown, 
  Download, 
  X, 
  ShieldCheck, 
  Volume2, 
  VolumeX,
  Globe,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../types';
import { soundService } from '../services/sound';

interface HeaderProps {
  user: UserAccount;
  onOpenDeposit: () => void;
  onOpenAdmin: () => void;
  onResetDemoBalance: () => void;
  onOpenDownload: () => void;
  onOpenDrawer: () => void;
  language: 'en' | 'ur' | 'hi';
  onLanguageChange: (lang: 'en' | 'ur' | 'hi') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenAdmin,
  onResetDemoBalance,
  onOpenDownload,
  onOpenDrawer,
  language,
  onLanguageChange,
}) => {
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());

  const handleToggleSound = () => {
    const newState = soundService.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundService.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col shadow-md">
      {/* 1. Green Top App Download Banner */}
      {showTopBanner && (
        <div className="bg-[#126b38] text-white px-3 py-1.5 flex items-center justify-between text-xs font-medium border-b border-emerald-600/40">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTopBanner(false)}
              className="text-white/80 hover:text-white p-0.5 rounded transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px] shadow">
                P
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-yellow-100">
                P999 Download app bonus <strong className="text-amber-300 font-extrabold">Rs 999</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onOpenDownload();
            }}
            className="bg-[#24a159] hover:bg-[#2bc26c] text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow transition cursor-pointer"
          >
            Download now
          </button>
        </div>
      )}

      {/* 2. Main Navigation Header Bar */}
      <div className="bg-[#081726] border-b border-slate-700/80 px-2 sm:px-4 py-2 flex items-center justify-between gap-2 max-w-7xl w-full mx-auto">
        {/* Left: Drawer Hamburger with Badge 6 & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              soundService.playClick();
              onOpenDrawer();
            }}
            className="relative p-1.5 rounded-xl bg-[#0e223d] hover:bg-[#153259] text-slate-200 border border-slate-700/80 transition cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 text-slate-200" />
            {/* Notification Badge 6 */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow">
              6
            </span>
          </button>

          {/* P999 Brand Logo */}
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onOpenDrawer}>
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-amber-500 to-amber-300 flex items-center justify-center shadow-md border border-amber-300/40">
              <span className="font-black text-slate-950 text-xs italic tracking-tighter">P999</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-wider text-white uppercase italic leading-none drop-shadow">
                P999
              </span>
              <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest leading-none mt-0.5">
                Official Casino
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Balance Pill & Deposit Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Balance Pill [Pak Flag 0.00 🔄] */}
          <div className="flex items-center bg-[#06101c] border border-slate-700/80 rounded-full px-2 py-1 shadow-inner">
            <span className="text-xs mr-1.5" title="Pakistan Rupee">🇵🇰</span>
            <span className="text-xs font-black text-white font-mono mr-1.5">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => {
                soundService.playCoin();
                onResetDemoBalance();
              }}
              className="text-slate-400 hover:text-amber-300 p-0.5 transition cursor-pointer"
              title="Refresh / Reload Demo Balance"
            >
              <RotateCcw className="w-3 h-3 text-slate-400 hover:text-amber-300" />
            </button>
          </div>

          {/* Deposit Button with +5% Badge */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenDeposit();
            }}
            className="relative bg-gradient-to-b from-[#e8c67c] via-[#dfb661] to-[#ca9c42] hover:from-[#f0d494] hover:to-[#dfb661] text-slate-950 px-3 py-1.5 rounded-full text-xs font-black shadow-md flex items-center gap-1 transition-transform active:scale-95 cursor-pointer"
          >
            <span>Deposit</span>
            <ChevronDown className="w-3 h-3 text-slate-950" />

            {/* Red +5% Badge */}
            <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-rose-600 text-white shadow-sm border border-white/40 leading-tight">
              +5%
            </span>
          </button>

          {/* Admin Odds Trigger */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenAdmin();
            }}
            className="hidden sm:flex p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition cursor-pointer"
            title="Admin Logic Panel"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="hidden sm:flex p-1.5 rounded-xl bg-[#0e223d] hover:bg-[#153259] text-slate-300 border border-slate-700/80 transition cursor-pointer"
            title="Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
