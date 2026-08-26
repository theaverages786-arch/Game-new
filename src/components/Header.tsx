import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  PlusCircle, 
  RotateCcw, 
  Globe,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserAccount } from '../types';
import { soundService } from '../services/sound';

interface HeaderProps {
  user: UserAccount;
  onOpenDeposit: () => void;
  onOpenAdmin: () => void;
  onResetDemoBalance: () => void;
  language: 'en' | 'ur' | 'hi';
  onLanguageChange: (lang: 'en' | 'ur' | 'hi') => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenAdmin,
  onResetDemoBalance,
  language,
  onLanguageChange,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundService.isEnabled());
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleToggleSound = () => {
    const newState = soundService.toggleSound();
    setSoundEnabled(newState);
    if (newState) soundService.playClick();
  };

  const translations = {
    en: { deposit: 'Deposit', reload: 'Reload Demo', admin: 'Admin Panel', vip: 'VIP' },
    ur: { deposit: 'جمع کریں', reload: 'بیلنس ریلوڈ', admin: 'ایڈمن پینل', vip: 'وی آئی پی' },
    hi: { deposit: 'जमा करें', reload: 'डेमो रीलोड', admin: 'एडमिन पैनल', vip: 'वीआईपी' },
  };

  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0d121c] via-[#161d2d] to-[#0d121c] border-b border-amber-500/20 px-3 py-2.5 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 shadow-md shadow-amber-500/20 border border-amber-300">
            <span className="font-black text-slate-950 text-xl tracking-tighter italic">777</span>
            <span className="absolute -top-1 -right-1 text-xs">👑</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent uppercase">
                777 Premier
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Official Portal &bull; 777p999</p>
          </div>
        </div>

        {/* User Balance & VIP */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Balance Pill */}
          <div className="flex items-center bg-[#090d16] border border-amber-500/30 rounded-full pl-2.5 pr-1 py-1 shadow-inner">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-xs font-bold shadow-sm">
                ₨
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-400/80 font-bold leading-none uppercase">
                  {user.currency}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300 leading-none">
                  {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Quick Deposit Button */}
            <button
              onClick={() => {
                soundService.playClick();
                onOpenDeposit();
              }}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-2.5 py-1 rounded-full text-xs font-black transition-all transform active:scale-95 shadow-md shadow-amber-500/30 cursor-pointer"
              title="Add Balance"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.deposit}</span>
            </button>
          </div>

          {/* Quick Reload Demo Balance */}
          <button
            onClick={() => {
              soundService.playCoin();
              onResetDemoBalance();
            }}
            className="hidden sm:flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Reload +PKR 2,000 Demo Balance"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>+2K Demo</span>
          </button>

          {/* VIP Badge */}
          <div className="hidden md:flex items-center gap-1 bg-gradient-to-r from-amber-600/30 to-purple-600/30 border border-amber-500/40 rounded-lg px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-xs font-bold text-amber-200">VIP {user.vipLevel}</span>
          </div>

          {/* Language Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold uppercase">{language}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-[#121826] border border-amber-500/30 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                <button
                  onClick={() => {
                    onLanguageChange('en');
                    setShowLangMenu(false);
                    soundService.playClick();
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between ${
                    language === 'en' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>English</span>
                  {language === 'en' && <span className="text-amber-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('ur');
                    setShowLangMenu(false);
                    soundService.playClick();
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between ${
                    language === 'ur' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>اردو (Urdu)</span>
                  {language === 'ur' && <span className="text-amber-400">✓</span>}
                </button>
                <button
                  onClick={() => {
                    onLanguageChange('hi');
                    setShowLangMenu(false);
                    soundService.playClick();
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between ${
                    language === 'hi' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>हिंदी (Hindi)</span>
                  {language === 'hi' && <span className="text-amber-400">✓</span>}
                </button>
              </div>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Admin Control Trigger */}
          <button
            onClick={() => {
              soundService.playClick();
              onOpenAdmin();
            }}
            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 transition-colors flex items-center gap-1 cursor-pointer"
            title="System & Game Logic Control Panel"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline text-xs font-bold text-amber-300">Admin Logic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
