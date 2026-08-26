import React from 'react';
import { 
  Home, 
  Gift, 
  Users2, 
  Headphones, 
  UserCircle 
} from 'lucide-react';
import { soundService } from '../services/sound';

export type MainTab = 'lobby' | 'activity' | 'agent' | 'support' | 'profile';

interface NavbarProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  language: 'en' | 'ur' | 'hi';
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, language }) => {
  const tabs = [
    {
      id: 'lobby' as MainTab,
      labelEn: 'Home',
      labelUr: 'ہوم',
      labelHi: 'होम',
      icon: Home,
    },
    {
      id: 'activity' as MainTab,
      labelEn: 'Promo',
      labelUr: 'پروموشنز',
      labelHi: 'प्रोमो',
      icon: Gift,
      badge: '6',
    },
    {
      id: 'agent' as MainTab,
      labelEn: 'Invite',
      labelUr: 'انوائٹ',
      labelHi: 'इनवाइट',
      icon: Users2,
      highlight: true,
    },
    {
      id: 'support' as MainTab,
      labelEn: 'Support',
      labelUr: 'سپورٹ',
      labelHi: 'सपोर्ट',
      icon: Headphones,
    },
    {
      id: 'profile' as MainTab,
      labelEn: 'Profile',
      labelUr: 'پروفائل',
      labelHi: 'प्रोफ़ाइल',
      icon: UserCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#081524]/98 border-t border-slate-700/80 backdrop-blur-xl px-2 py-1 shadow-2xl max-w-xl mx-auto md:max-w-none">
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
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 text-[9px] font-black px-1 rounded-full bg-rose-600 text-white leading-tight shadow">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${
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
