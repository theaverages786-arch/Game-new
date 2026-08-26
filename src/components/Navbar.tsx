import React from 'react';
import { 
  Gamepad2, 
  Gift, 
  Users2, 
  WalletCards, 
  UserCircle 
} from 'lucide-react';
import { soundService } from '../services/sound';

export type MainTab = 'lobby' | 'activity' | 'agent' | 'wallet' | 'profile';

interface NavbarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  language: 'en' | 'ur' | 'hi';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, language }) => {
  const tabs = [
    {
      id: 'lobby' as MainTab,
      labelEn: 'Lobby',
      labelUr: 'گیمز لابی',
      labelHi: 'गेम्स लॉबी',
      icon: Gamepad2,
      badge: 'HOT',
    },
    {
      id: 'activity' as MainTab,
      labelEn: 'Activity',
      labelUr: 'انعامات',
      labelHi: 'इनाम',
      icon: Gift,
      badge: 'FREE',
    },
    {
      id: 'agent' as MainTab,
      labelEn: 'Promotion',
      labelUr: 'ایجنٹ ٹیم',
      labelHi: 'एजेंट टीम',
      icon: Users2,
      highlight: true,
    },
    {
      id: 'wallet' as MainTab,
      labelEn: 'Wallet',
      labelUr: 'والیٹ',
      labelHi: 'वॉलेट',
      icon: WalletCards,
    },
    {
      id: 'profile' as MainTab,
      labelEn: 'Mine',
      labelUr: 'پروفائل',
      labelHi: 'प्रोफ़ाइल',
      icon: UserCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 border-t border-amber-500/20 backdrop-blur-xl px-2 py-1.5 shadow-2xl max-w-xl mx-auto md:max-w-none">
      <div className="max-w-md md:max-w-3xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          let label = tab.labelEn;
          if (language === 'ur') label = tab.labelUr;
          if (language === 'hi') label = tab.labelHi;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundService.playClick();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* Highlight Glow for Promotion / Center tabs */}
              {tab.highlight && !isActive && (
                <span className="absolute -top-1 w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`absolute -top-2 -right-3 text-[8px] font-black px-1 rounded-full leading-tight uppercase shadow-sm ${
                      tab.badge === 'HOT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-1 whitespace-nowrap ${
                  isActive ? 'font-bold text-amber-300' : 'font-medium'
                }`}
              >
                {label}
              </span>

              {isActive && (
                <div className="w-4 h-0.5 bg-amber-400 rounded-full mt-0.5 shadow-sm shadow-amber-400/80"></div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
