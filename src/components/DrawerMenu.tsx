import React from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Gamepad2, 
  Fish, 
  HeartHandshake, 
  Trophy, 
  Gift, 
  Users, 
  Crown, 
  Headphones, 
  Smartphone, 
  ShieldCheck, 
  Globe, 
  LogOut,
  ChevronRight,
  PlusCircle,
  Copy
} from 'lucide-react';
import { UserAccount } from '../types';
import { soundService } from '../services/sound';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onSelectTab: (tab: 'lobby' | 'activity' | 'agent' | 'support' | 'profile') => void;
  onSelectCategory?: (category: string) => void;
  onOpenDeposit: () => void;
  onOpenAdmin: () => void;
  onOpenDownload: () => void;
  onOpenAuth: () => void;
  language: 'en' | 'ur' | 'hi';
  onLanguageChange: (lang: 'en' | 'ur' | 'hi') => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  user,
  onSelectTab,
  onSelectCategory,
  onOpenDeposit,
  onOpenAdmin,
  onOpenDownload,
  onOpenAuth,
  language,
  onLanguageChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] bg-[#071322] border-r border-slate-700/80 h-full overflow-y-auto flex flex-col z-10 shadow-2xl animate-in slide-in-from-left duration-300">
        {/* Drawer Header with user info */}
        <div className="p-4 bg-gradient-to-b from-[#0e223d] to-[#08172b] border-b border-slate-700/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-xs shadow">
                P999
              </div>
              <span className="font-bold text-white text-sm tracking-wide">P999 Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="mt-3.5 bg-[#0a1b30] border border-slate-700/60 rounded-2xl p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl shadow">
                  {user.avatar || '👤'}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span>{user.username || '3wtq5zhs'}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">
                      VIP {user.vipLevel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">ID: {user.id || '193623200'}</div>
                </div>
              </div>
            </div>

            {/* Balance & Deposit */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 uppercase block">My Balance</span>
                <span className="text-xs font-black text-amber-300 font-mono">
                  ₨ {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                onClick={() => {
                  soundService.playClick();
                  onClose();
                  onOpenDeposit();
                }}
                className="relative bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow flex items-center gap-1 cursor-pointer"
              >
                <span>Deposit</span>
                <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[8px] bg-rose-600 text-white font-black">
                  +5%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 py-2 px-3 space-y-1 text-xs">
          {/* Game Categories */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Game Categories
          </div>

          {[
            { id: 'hot', label: '🔥 Hot Games', cat: 'all', badge: 'HOT' },
            { id: 'slots', label: '🎰 Slot (JILI / PG / WG)', cat: 'slots' },
            { id: 'cards', label: '🃏 Cards & 3-Card', cat: 'cards' },
            { id: 'fishing', label: '🦈 Fishing Hunter', cat: 'mini' },
            { id: 'live', label: '💃 Live Casino', cat: 'cards' },
            { id: 'sports', label: '⚽ Sports & Cricket', cat: 'all' },
            { id: 'mini', label: '🕹️ Mini Games (Aviator / Chicken)', cat: 'crash' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundService.playClick();
                onClose();
                onSelectTab('lobby');
                if (onSelectCategory) onSelectCategory(item.cat);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#10243e] hover:text-amber-300 transition cursor-pointer"
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-rose-600 text-white font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* System Services */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-3 pb-1">
            Portal &amp; Rewards
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onSelectTab('activity');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#10243e] hover:text-amber-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Promotions &amp; Events</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400 text-slate-950 font-bold">
              4 Events
            </span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onSelectTab('agent');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#10243e] hover:text-amber-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Invitation &amp; 3% Agent</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold">Earn ₨ 200/day</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onSelectTab('support');
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:bg-[#10243e] hover:text-amber-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-sky-400" />
              <span>24/7 Message &amp; Support</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onOpenDownload();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/50 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">Download Official APK</span>
            </div>
            <span className="text-[10px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.5 rounded">
              +₨ 999
            </span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onOpenAdmin();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#10243e] hover:text-amber-300 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Odds &amp; Logic Panel</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Footer Language & Logout */}
        <div className="p-3 border-t border-slate-700/80 bg-[#081524] space-y-2">
          {/* Language Selector */}
          <div className="flex items-center justify-between bg-[#0b1b30] p-1.5 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-300 font-bold px-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              Language
            </span>
            <div className="flex items-center gap-1">
              {(['en', 'ur', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                    language === l
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onClose();
              onOpenAuth();
            }}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch User / Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
