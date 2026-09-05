import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  Rocket, 
  Gamepad2, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Users,
  Play,
  ArrowUp,
  Heart,
  Volume2,
  Mail,
  ShieldCheck,
  Gift,
  Download
} from 'lucide-react';
import { GameCategory } from '../../types';
import { soundService } from '../../services/sound';

interface LobbyTabProps {
  onSelectGame: (gameId: string) => void;
  onOpenDeposit: () => void;
  onOpenSupport?: () => void;
  onOpenDownload?: () => void;
  onOpenInvite?: () => void;
  onOpenSpinWheel?: () => void;
  onOpenRoomModal?: () => void;
  onOpenFreeCoins?: () => void;
  onOpenRules?: () => void;
  language: 'en' | 'ur' | 'hi';
}

interface WinnerRecord {
  id: string;
  game: string;
  userMasked: string;
  amount: number;
  avatar: string;
}

const WINNERS: WinnerRecord[] = [
  { id: 'w1', game: 'SPRIBE Aviator', userMasked: '4***12win', amount: 20608.0, avatar: '✈️' },
  { id: 'w2', game: 'PG Bull (Fortune OX)', userMasked: '4***26win', amount: 20000.0, avatar: '🐂' },
  { id: 'w3', game: 'PG Fortune Tiger', userMasked: '4***26win', amount: 34800.0, avatar: '🐯' },
  { id: 'w4', game: 'WX Aviator', userMasked: '4***24win', amount: 21445.0, avatar: '🚀' },
  { id: 'w5', game: 'JILI Super Ace', userMasked: '9***88win', amount: 68900.0, avatar: '♠️' },
  { id: 'w6', game: 'JILI Fortune Gems', userMasked: '1***54win', amount: 34200.0, avatar: '💎' },
  { id: 'w7', game: 'Money Coming', userMasked: '8***31win', amount: 52100.0, avatar: '💰' },
  { id: 'w8', game: '9Wickets Sports', userMasked: '5***09win', amount: 31000.0, avatar: '🏏' },
];

export const LobbyTab: React.FC<LobbyTabProps> = ({
  onSelectGame,
  onOpenDeposit,
  onOpenSupport,
  onOpenDownload,
  onOpenInvite,
  onOpenSpinWheel,
  onOpenRoomModal,
  onOpenFreeCoins,
  onOpenRules,
  language,
}) => {
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    'spribe_aviator': true,
    'wg_aviator': true,
    'inout_chicken_road': true,
    'jdb_piggy_bank': true,
    '9wickets_sports': true,
    'wg_crazy777': true,
    'spribe_mines': true,
    'jili_fortune_garuda': true,
  });

  const toggleFavorite = (gameId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    setFavorites(prev => ({ ...prev, [gameId]: !prev[gameId] }));
  };

  const banners = [
    {
      id: 1,
      title: 'MYSTERIOUS RED ENVELOPE',
      subtitle: 'Daily maximum amount to be received is Rs 100,000',
      tag: 'DAILY DRAW',
      gradient: 'from-[#8b151b] via-[#a32226] to-[#590e11]',
      badge: 'Rs 100,000',
      action: 'Claim Red Envelope',
      icon: '🧧',
    },
    {
      id: 2,
      title: 'DAILY DEPOSIT GAME NEXT DAY BONUS',
      subtitle: 'Deposit with JazzCash / EasyPaisa - Up to Rs 99,999 next day!',
      tag: 'NEXT DAY 24H',
      gradient: 'from-[#124d85] via-[#1b5ea3] to-[#0a2f54]',
      badge: 'Up to Rs 99,999',
      action: 'Deposit Now',
      icon: '⚡',
    },
    {
      id: 3,
      title: 'FIRST DEPOSIT MAXIMUM REWARD',
      subtitle: 'Get 100% Instant Match Bonus + Rs 5,000 Welcome Cash',
      tag: 'NEW MEMBER',
      gradient: 'from-[#0e5c30] via-[#167840] to-[#07361c]',
      badge: 'Max Rs 5,000',
      action: 'Get Reward',
      icon: '🎁',
    },
    {
      id: 4,
      title: 'INVITATION BONUS UP TO 3.0%',
      subtitle: 'Daily commission rebate on all turnover - Share code 193623200',
      tag: 'AGENT 3%',
      gradient: 'from-[#734309] via-[#8c520a] to-[#452703]',
      badge: '3.0% Daily',
      action: 'Invite Friends',
      icon: '👥',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const categories = [
    { id: 'all', label: 'Hot', icon: '🔥' },
    { id: 'slots', label: 'Slot', icon: '🎰' },
    { id: 'cards', label: 'Cards', icon: '🃏' },
    { id: 'fishing', label: 'Fishing', icon: '🦈' },
    { id: 'live', label: 'Live', icon: '💃' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'mini', label: 'Mini Games', icon: '🕹️' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-4 pb-24 text-slate-100 max-w-7xl mx-auto">
      {/* 1. Hero Carousel Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/80 shadow-2xl transition-all duration-500">
        <div className={`bg-gradient-to-r ${banners[activeBanner].gradient} p-4 sm:p-5 flex flex-col justify-between min-h-[140px] sm:min-h-[160px]`}>
          <div className="flex items-start justify-between">
            <div className="space-y-1 max-w-md">
              <span className="inline-block bg-black/40 backdrop-blur-md text-amber-300 border border-amber-400/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {banners[activeBanner].tag}
              </span>
              <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wide leading-tight drop-shadow-md">
                {banners[activeBanner].title}
              </h2>
              <p className="text-[11px] sm:text-xs text-yellow-100 font-medium">
                {banners[activeBanner].subtitle}
              </p>
            </div>
            <div className="text-4xl sm:text-5xl drop-shadow animate-bounce">
              {banners[activeBanner].icon}
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
            <span className="text-xs sm:text-sm font-black text-amber-300 font-mono drop-shadow">
              {banners[activeBanner].badge}
            </span>
            <button
              onClick={() => {
                soundService.playClick();
                onOpenDeposit();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow-lg hover:from-amber-300 transition cursor-pointer flex items-center gap-1"
            >
              <span>{banners[activeBanner].action}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {banners.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeBanner === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Broadcast / Notice Ticker */}
      <div className="bg-[#0b1728] border border-slate-700/60 rounded-xl px-3 py-2 flex items-center gap-2 shadow text-xs">
        <span className="text-amber-400 font-bold shrink-0 flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Notice:</span>
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full text-slate-300 text-[11px]">
          <div className="inline-block animate-marquee">
            📢 Welcome to P999! Daily recharge bonus up to Rs 99,999 next day! JazzCash &amp; EasyPaisa auto deposit instant credited in 10 seconds. Certified 999/JAZ gaming platform.
          </div>
        </div>
      </div>

      {/* 2.5 Quick Multiplayer & Practice Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenRoomModal) onOpenRoomModal();
            else onSelectGame('arcade_ludo');
          }}
          className="bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 hover:to-yellow-500 border border-amber-400/60 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg transition cursor-pointer group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
            🎮
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-white leading-tight block truncate">Multiplayer Rooms</span>
              <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded animate-pulse">LIVE</span>
            </div>
            <span className="text-[9px] text-amber-100 font-medium block truncate">Ludo • Teen Patti • Rummy</span>
          </div>
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenFreeCoins) onOpenFreeCoins();
            else onOpenDeposit();
          }}
          className="bg-gradient-to-r from-emerald-700/80 to-teal-700/80 hover:from-emerald-600 hover:to-teal-600 border border-emerald-400/50 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg transition cursor-pointer group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
            🪙
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-black text-white leading-tight block truncate">Free Practice Coins</span>
            <span className="text-[9px] text-emerald-200 font-medium block truncate">Faucet &amp; Lucky Spin</span>
          </div>
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenRules) onOpenRules();
          }}
          className="bg-gradient-to-r from-blue-700/80 to-indigo-700/80 hover:from-blue-600 hover:to-indigo-600 border border-blue-400/50 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg transition cursor-pointer group text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition">
            📜
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-black text-white leading-tight block truncate">Game Rules</span>
            <span className="text-[9px] text-blue-200 font-medium block truncate">How to Play &amp; Win</span>
          </div>
        </button>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="relative flex items-center bg-[#071322] p-1 rounded-2xl border border-slate-800 shadow-inner">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 px-0.5 w-full">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundService.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 border-amber-300 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border-transparent'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 🔥 HOT SECTION (Screenshots 1 & 2 - 15 exact cards) */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'hot') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black text-amber-400">🔥 Hot</span>
            </div>
            <button 
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
            >
              <span>&lt; All &gt;</span>
            </button>
          </div>

          {/* 3-Column Grid for Mobile, 6-Column for Large */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {/* 1. SPRIBE Aviator */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('spribe_aviator');
              }}
              className="group relative bg-gradient-to-b from-[#8f161b] to-[#45090b] border border-red-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('spribe_aviator', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['spribe_aviator'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  ✈️
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Aviator</span>
                <span className="text-[8px] text-red-200 font-bold block">SPRIBE</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                100x Max
              </div>
            </div>

            {/* 2. WG Aviator */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_aviator');
              }}
              className="group relative bg-gradient-to-b from-[#7a1014] to-[#3a0608] border border-red-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('wg_aviator', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['wg_aviator'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🚀
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Aviator</span>
                <span className="text-[8px] text-red-300 font-bold block">WG</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Fast Crash
              </div>
            </div>

            {/* 3. 2J Aviator */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('2j_aviator');
              }}
              className="group relative bg-gradient-to-b from-[#8f3a14] to-[#421706] border border-orange-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('2j_aviator', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['2j_aviator'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🛩️
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Aviator</span>
                <span className="text-[8px] text-orange-200 font-bold block">2J</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                500x Boost
              </div>
            </div>

            {/* 4. INOUT Chicken Road 2.0 */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('inout_chicken_road');
              }}
              className="group relative bg-gradient-to-b from-[#1b4a2e] to-[#0a2415] border border-emerald-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('inout_chicken_road', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['inout_chicken_road'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🐔
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Chicken Road 2.0</span>
                <span className="text-[8px] text-emerald-300 font-bold block">INOUT</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                22.0x Cashout
              </div>
            </div>

            {/* 5. JDB Piggy Bank */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jdb_piggy_bank');
              }}
              className="group relative bg-gradient-to-b from-[#6b1e5a] to-[#360a2c] border border-pink-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-yellow-500 text-slate-950 text-[8px] font-black">
                  13000x BUY
                </span>
                <span className="text-[8px] text-amber-300 font-bold">JDB</span>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🐷
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Piggy Bank</span>
                <span className="text-[8px] text-pink-200 font-bold block">Hammer Smash</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Bonus Buy
              </div>
            </div>

            {/* 6. 9Wickets Sports */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('9wickets_sports');
              }}
              className="group relative bg-gradient-to-b from-[#14325a] to-[#0a1b33] border border-blue-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-black">
                  LIVE
                </span>
                <button
                  onClick={(e) => toggleFavorite('9wickets_sports', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['9wickets_sports'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🏏
                </div>
                <span className="text-[10px] font-black text-white block mt-1">9Wickets Sports</span>
                <span className="text-[8px] text-blue-300 font-bold block">Cricket PSL</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-emerald-300 py-0.5 rounded font-mono font-bold">
                Live Exchange
              </div>
            </div>

            {/* 7. JILI Slot */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_super_ace');
              }}
              className="group relative bg-gradient-to-b from-[#172c4a] to-[#0c1a2d] border border-slate-600 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[8px] font-black">
                  👍 JILI
                </span>
              </div>
              <div className="text-center my-auto">
                <div className="text-2xl sm:text-3xl">🎰 💎 ♠️</div>
                <span className="text-[10px] font-black text-amber-300 block mt-1">JILI Slot</span>
                <span className="text-[8px] text-slate-400 block">Fortune Gems / Ace</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Top Provider
              </div>
            </div>

            {/* 8. PG Slot */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('pg_slot');
              }}
              className="group relative bg-gradient-to-b from-[#29174a] to-[#140c26] border border-purple-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-purple-600 text-white text-[8px] font-black">
                  👍 PG
                </span>
              </div>
              <div className="text-center my-auto">
                <div className="text-2xl sm:text-3xl">🐯 🐰 🐂</div>
                <span className="text-[10px] font-black text-purple-300 block mt-1">PG Slot</span>
                <span className="text-[8px] text-slate-400 block">Fortune Tiger/Ox</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-purple-300 py-0.5 rounded font-mono font-bold">
                10x Respin
              </div>
            </div>

            {/* 9. JILI Cards */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jili_cards');
              }}
              className="group relative bg-gradient-to-b from-[#12382e] to-[#081e18] border border-emerald-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-emerald-600 text-white text-[8px] font-black">
                  👍 JILI
                </span>
              </div>
              <div className="text-center my-auto">
                <div className="text-2xl sm:text-3xl">🎲 🎴 🃏</div>
                <span className="text-[10px] font-black text-emerald-300 block mt-1">JILI Cards</span>
                <span className="text-[8px] text-slate-400 block">7Up 7Down / SicBo</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-emerald-300 py-0.5 rounded font-mono font-bold">
                Table Games
              </div>
            </div>

            {/* 10. WG Slot */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_crazy777');
              }}
              className="group relative bg-gradient-to-b from-[#3d1852] to-[#1c0829] border border-purple-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 text-[8px] font-black">
                  WG
                </span>
              </div>
              <div className="text-center my-auto">
                <div className="text-2xl sm:text-3xl">🎰 🤠 💎</div>
                <span className="text-[10px] font-black text-white block mt-1">WG Slot</span>
                <span className="text-[8px] text-purple-200 block">Wild Bounty Showdown</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                10000x
              </div>
            </div>

            {/* 11. WG Crash */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_aviator');
              }}
              className="group relative bg-gradient-to-b from-[#173059] to-[#0a1830] border border-cyan-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('wg_crash', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['wg_crash'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🚀
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Crash</span>
                <span className="text-[8px] text-cyan-300 font-bold block">WG</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-cyan-300 py-0.5 rounded font-mono font-bold">
                Rocket Flight
              </div>
            </div>

            {/* 12. WG Dragon Tiger (International) */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('dragon_tiger');
              }}
              className="group relative bg-gradient-to-b from-[#5c1c0a] to-[#2b0c03] border border-orange-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🐉⚡🐯
                </div>
                <span className="text-[9px] font-black text-white block mt-1 leading-tight">Dragon Tiger</span>
                <span className="text-[7px] text-orange-300 block">International WG</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Live Duel
              </div>
            </div>

            {/* 13. WG Crazy777 */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_crazy777');
              }}
              className="group relative bg-gradient-to-b from-[#381154] to-[#1a0529] border border-purple-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('wg_crazy777', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['wg_crazy777'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🎰
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Crazy777</span>
                <span className="text-[8px] text-purple-300 font-bold block">WG 10000x</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Special Reel
              </div>
            </div>

            {/* 14. SPRIBE Mines */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('spribe_mines');
              }}
              className="group relative bg-gradient-to-b from-[#1b3d6e] to-[#0c1f3d] border border-blue-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('spribe_mines', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['spribe_mines'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  💣
                </div>
                <span className="text-[10px] font-black text-white block mt-1">Mines</span>
                <span className="text-[8px] text-blue-300 font-bold block">SPRIBE</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                Custom Grid
              </div>
            </div>

            {/* 15. JILI Fortune Garuda 500 */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jili_fortune_garuda');
              }}
              className="group relative bg-gradient-to-b from-[#5c3708] to-[#261502] border border-amber-500/40 rounded-2xl p-2 flex flex-col justify-between aspect-[3/4] shadow-lg hover:border-amber-400 transition cursor-pointer overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <span className="px-1 py-0.2 rounded bg-rose-600 text-white text-[8px] font-black">
                  HOT
                </span>
                <button
                  onClick={(e) => toggleFavorite('jili_fortune_garuda', e)}
                  className="text-amber-400 hover:scale-110 transition"
                >
                  <Star className={`w-3.5 h-3.5 ${favorites['jili_fortune_garuda'] ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
              <div className="text-center my-auto">
                <div className="text-3xl sm:text-4xl transform group-hover:scale-110 transition">
                  🦅
                </div>
                <span className="text-[9px] font-black text-amber-300 block mt-1 leading-tight">Fortune Garuda</span>
                <span className="text-[7px] text-yellow-200 block">JILI 500x Nudge</span>
              </div>
              <div className="text-[8px] text-center bg-black/40 text-amber-300 py-0.5 rounded font-mono font-bold">
                500x Nudge
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. 🕹️ MINI GAMES SECTION (Screenshot 3) */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'mini') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-white">🕹️ Mini Games</span>
            <button 
              onClick={() => setSelectedCategory('mini')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All &gt;
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {/* 1. Spribe Mini Games */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('spribe_aviator');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🚀</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Spribe Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">SPRIBE</span>
              </div>
            </div>

            {/* 2. WG WG Mini Games */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('spribe_mines');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">⛏️</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">WG Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">WG Miner</span>
              </div>
            </div>

            {/* 3. INOUT INOUT Mini Games */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('inout_chicken_road');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🐔</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">INOUT Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">IN</span>
              </div>
            </div>

            {/* 4. 2J 2J Mini Games */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('2j_aviator');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🛸</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">2J Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">2J Space</span>
              </div>
            </div>

            {/* 5. JILI JILI Mini Games */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_aviator');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🚀</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">JILI Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">JILI Rocket</span>
              </div>
            </div>

            {/* 6. MG MG Mini Games (FlyX) */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('mg_flyx');
              }}
              className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">👨‍🚀</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">MG Mini Games</span>
                <span className="text-[8px] text-slate-400 block font-bold">FlyX™ MG</span>
              </div>
            </div>

            {/* 7. Hi-Lo Master */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('hilo_game');
              }}
              className="bg-[#121c33] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🃏</div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 block truncate">Hi-Lo Master</span>
                <span className="text-[8px] text-slate-400 block font-bold">Higher or Lower</span>
              </div>
            </div>

            {/* 8. Spribe Plinko */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('arcade_plinko');
              }}
              className="bg-[#121c33] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🔴</div>
              <div>
                <span className="text-[10px] font-bold text-amber-300 block truncate">Plinko Master</span>
                <span className="text-[8px] text-slate-400 block font-bold">1000x Drops</span>
              </div>
            </div>

            {/* 9. Lucky Wheel */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('lucky_wheel');
              }}
              className="bg-[#1e1030] border border-slate-700/60 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🎡</div>
              <div>
                <span className="text-[10px] font-bold text-pink-300 block truncate">Lucky Spin</span>
                <span className="text-[8px] text-slate-400 block font-bold">Prize Wheel</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. 🎰 SLOT SECTION */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'slots') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-amber-400">🎰 Slot Games</span>
            <button 
              onClick={() => setSelectedCategory('slots')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All Slots &gt;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {/* 1. Super Ace */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_super_ace');
              }}
              className="bg-[#0d1e33] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">♠️ 👑</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">Super Ace</span>
                <span className="text-[9px] text-slate-400 block">JILI Elimination Multipliers</span>
              </div>
            </div>

            {/* 2. Fortune Gems */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_fortune_gems');
              }}
              className="bg-[#1e1030] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">💎 🔮</div>
              <div>
                <span className="text-xs font-black text-purple-300 block">Fortune Gems</span>
                <span className="text-[9px] text-slate-400 block">15x Extra Multiplier Reel</span>
              </div>
            </div>

            {/* 3. Money Coming */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_money_coming');
              }}
              className="bg-[#24123b] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">💰 🎰</div>
              <div>
                <span className="text-xs font-black text-yellow-300 block">Money Coming</span>
                <span className="text-[9px] text-slate-400 block">10,000x Lucky Wheel</span>
              </div>
            </div>

            {/* 4. Roma Slots */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_roma');
              }}
              className="bg-[#2d1b06] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">⚔️ 🏛️</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">Roma Slots</span>
                <span className="text-[9px] text-slate-400 block">Colosseum Lion Bonus</span>
              </div>
            </div>

            {/* 5. Fruit Party Classic */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_fruit_party');
              }}
              className="bg-[#2e1026] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🍓 🍉</div>
              <div>
                <span className="text-xs font-black text-pink-300 block">Fruit Party</span>
                <span className="text-[9px] text-slate-400 block">256x Cluster Tumbling</span>
              </div>
            </div>

            {/* 6. Aztec Gems Gold */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_aztec_gems');
              }}
              className="bg-[#301c05] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🗿 🪙</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">Aztec Gems</span>
                <span className="text-[9px] text-slate-400 block">Ancient Totem Multipliers</span>
              </div>
            </div>

            {/* 7. Mega Win Slots */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_mega_win');
              }}
              className="bg-[#21092e] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">👑 ⚡</div>
              <div>
                <span className="text-xs font-black text-purple-300 block">Mega Win Slots</span>
                <span className="text-[9px] text-slate-400 block">Triple Diamond 777</span>
              </div>
            </div>

            {/* 8. Golden Empire */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_golden_empire');
              }}
              className="bg-[#241703] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">👑 ☀️</div>
              <div>
                <span className="text-xs font-black text-yellow-300 block">Golden Empire</span>
                <span className="text-[9px] text-slate-400 block">32,400 Megaways</span>
              </div>
            </div>

            {/* 9. Fortune Tree */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_fortune_tree');
              }}
              className="bg-[#240a0c] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🌳 🧧</div>
              <div>
                <span className="text-xs font-black text-red-300 block">Fortune Tree</span>
                <span className="text-[9px] text-slate-400 block">88x Money Tree Wilds</span>
              </div>
            </div>

            {/* 10. Boxing King Slots */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_boxing_king');
              }}
              className="bg-[#1f0b07] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🥊 🏆</div>
              <div>
                <span className="text-xs font-black text-orange-300 block">Boxing King</span>
                <span className="text-[9px] text-slate-400 block">KO Free Spin Combos</span>
              </div>
            </div>

            {/* 11. Crazy 777 */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_crazy777');
              }}
              className="bg-[#2e1503] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🎰 🔥</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">Crazy 777</span>
                <span className="text-[9px] text-slate-400 block">Classic 3-Reel Jackpot</span>
              </div>
            </div>

            {/* 12. 777 Classic Slots */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_777');
              }}
              className="bg-[#0b1b30] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">💎 🍒</div>
              <div>
                <span className="text-xs font-black text-sky-300 block">777 Classic</span>
                <span className="text-[9px] text-slate-400 block">Las Vegas Retro 777</span>
              </div>
            </div>

            {/* 13. Three Little Pigs */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('fc_three_pigs');
              }}
              className="bg-[#2a0e20] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🐷 🐺</div>
              <div>
                <span className="text-xs font-black text-pink-300 block">Three Little Pigs</span>
                <span className="text-[9px] text-slate-400 block">FC House Blow Multipliers</span>
              </div>
            </div>

            {/* 14. PP Cleopatra */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('pp_cleopatra');
              }}
              className="bg-[#291e05] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">👑 🪲</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">PP Cleopatra</span>
                <span className="text-[9px] text-slate-400 block">Pharaoh Golden Scarab</span>
              </div>
            </div>

            {/* 15. PG Fortune Ox & Tiger */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('slots_fortune_pg');
              }}
              className="bg-[#241305] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🐂 🐯</div>
              <div>
                <span className="text-xs font-black text-yellow-300 block">Fortune Ox &amp; Tiger</span>
                <span className="text-[9px] text-slate-400 block">PG Soft 10x Respin</span>
              </div>
            </div>

            {/* 16. Fortune Garuda */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jili_fortune_garuda');
              }}
              className="bg-[#2e1d08] border border-slate-700/80 rounded-2xl p-3 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-[4/5]"
            >
              <div className="text-3xl my-auto">🦅 ⚡</div>
              <div>
                <span className="text-xs font-black text-amber-300 block">Fortune Garuda</span>
                <span className="text-[9px] text-slate-400 block">JILI 500x Gold Wilds</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. 🃏 CARDS & MULTIPLAYER SECTION */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'cards') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-emerald-400">🃏 Card &amp; Multiplayer Games</span>
            <button 
              onClick={() => setSelectedCategory('cards')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All Cards &gt;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {/* 1. Teen Patti Classic */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_teen_patti');
              }}
              className="bg-gradient-to-r from-[#12382e] to-[#081e18] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-emerald-300">Teen Patti</span>
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">HOT</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Classic 3 Patti Flash</span>
              </div>
              <span className="text-3xl">🎴</span>
            </div>

            {/* 2. Teen Patti 20-20 */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('teen_patti_2020');
              }}
              className="bg-gradient-to-r from-[#1b4226] to-[#0a2414] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-emerald-300">Teen Patti 20-20</span>
                  <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">LIVE</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Player A vs Player B</span>
              </div>
              <span className="text-3xl">⚡</span>
            </div>

            {/* 3. Dragon vs Tiger */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('dragon_tiger');
              }}
              className="bg-gradient-to-r from-[#3d120a] to-[#1c0804] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-orange-300">Dragon vs Tiger</span>
                  <span className="text-[9px] bg-orange-700 text-white px-1.5 py-0.2 rounded font-bold">FAST</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Single Card War 8x Tie</span>
              </div>
              <span className="text-3xl">🐉</span>
            </div>

            {/* 4. Andar Bahar */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_andar_bahar');
              }}
              className="bg-gradient-to-r from-[#172d42] to-[#071724] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-blue-300">Andar Bahar</span>
                  <span className="text-[9px] bg-blue-700 text-white px-1.5 py-0.2 rounded font-bold">DESI</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Joker Match Spot Bet</span>
              </div>
              <span className="text-3xl">🃏</span>
            </div>

            {/* 5. Rummy */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_rummy');
              }}
              className="bg-gradient-to-r from-[#2c133b] to-[#12061a] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-purple-300">Indian Rummy</span>
                  <span className="text-[9px] bg-purple-700 text-white px-1.5 py-0.2 rounded font-bold">13 CARD</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Sequences &amp; Sets</span>
              </div>
              <span className="text-3xl">🂡</span>
            </div>

            {/* 6. Texas Hold'em Poker */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_texas_holdem');
              }}
              className="bg-gradient-to-r from-[#132c38] to-[#05131a] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-cyan-300">Texas Hold'em</span>
                  <span className="text-[9px] bg-cyan-700 text-white px-1.5 py-0.2 rounded font-bold">POKER</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Flop, Turn, River</span>
              </div>
              <span className="text-3xl">♠️</span>
            </div>

            {/* 7. Blackjack */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_blackjack');
              }}
              className="bg-gradient-to-r from-[#102e1c] to-[#04140a] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-emerald-300">Blackjack 21</span>
                  <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">3:2 PAY</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Hit, Stand, Double</span>
              </div>
              <span className="text-3xl">🎯</span>
            </div>

            {/* 8. Baccarat */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('cards_baccarat');
              }}
              className="bg-gradient-to-r from-[#3b0d2d] to-[#1f0517] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-pink-300">Baccarat VIP</span>
                  <span className="text-[9px] bg-pink-700 text-white px-1.5 py-0.2 rounded font-bold">MACAU</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Player, Banker, 8x Tie</span>
              </div>
              <span className="text-3xl">👑</span>
            </div>

            {/* 9. Ludo */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('arcade_ludo');
              }}
              className="bg-gradient-to-r from-[#38260b] to-[#1c1203] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-amber-300">Ludo Supreme</span>
                  <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">MULTIPLAYER</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Quick &amp; Classic Board</span>
              </div>
              <span className="text-3xl">🎲</span>
            </div>

            {/* 10. JILI Cards / 7 Up */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jili_cards');
              }}
              className="bg-gradient-to-r from-[#20183b] to-[#0d0a1c] border border-slate-700/60 rounded-2xl p-3 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-purple-300">JILI Cards 7UP</span>
                  <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.2 rounded font-bold">JILI</span>
                </div>
                <span className="text-[9px] text-slate-300 block mt-0.5">Gold Table Cards</span>
              </div>
              <span className="text-3xl">🃏</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7.5. 🎯 TABLE, ROULETTE & DICE SECTION */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'cards' || selectedCategory === 'mini') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-amber-400">🎲 Table, Roulette &amp; Dice Games</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {/* 1. European Roulette */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('casino_roulette');
              }}
              className="bg-[#172338] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🎡</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">European Roulette</span>
                <span className="text-[8px] text-amber-300 block font-bold">36x Single Zero</span>
              </div>
            </div>

            {/* 2. Zoo Roulette */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('zoo_roulette');
              }}
              className="bg-[#071d15] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🦁</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Zoo Roulette</span>
                <span className="text-[8px] text-emerald-300 block font-bold">Birds vs Beasts 24x</span>
              </div>
            </div>

            {/* 3. Car Roulette */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('car_roulette');
              }}
              className="bg-[#091524] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🏎️</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Car Roulette</span>
                <span className="text-[8px] text-blue-300 block font-bold">Ferrari 40x Supercar</span>
              </div>
            </div>

            {/* 4. 7 Up Down */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('seven_up_down');
              }}
              className="bg-[#170c02] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🎲</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">7 Up 7 Down</span>
                <span className="text-[8px] text-amber-300 block font-bold">5.8x Lucky 7</span>
              </div>
            </div>

            {/* 5. Dice Master 99x */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('dice_master');
              }}
              className="bg-[#071321] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🎯</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Dice Master</span>
                <span className="text-[8px] text-cyan-300 block font-bold">Over/Under 99x</span>
              </div>
            </div>

            {/* 6. Red vs Black */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('red_vs_black');
              }}
              className="bg-[#1a080a] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">⚔️</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Red vs Black</span>
                <span className="text-[8px] text-rose-300 block font-bold">10x Lucky Strike</span>
              </div>
            </div>

            {/* 7. Macau Sic Bo */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('sic_bo');
              }}
              className="bg-[#170505] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">🎲</div>
              <div>
                <span className="text-[10px] font-bold text-white block truncate">Macau Sic Bo</span>
                <span className="text-[8px] text-red-300 block font-bold">180x Triples</span>
              </div>
            </div>

            {/* 8. Hi-Lo Dice & Cards */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('hi_lo');
              }}
              className="bg-[#1b1706] border border-slate-700/80 rounded-2xl p-2.5 text-center hover:border-amber-400 transition cursor-pointer flex flex-col justify-between aspect-square"
            >
              <div className="text-3xl my-auto">📈 📉</div>
              <div>
                <span className="text-[10px] font-bold text-yellow-300 block truncate">Hi-Lo Predictor</span>
                <span className="text-[8px] text-amber-300 block font-bold">High / Low 12x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. 🦈 FISHING SECTION (Screenshot 5) */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'fishing') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-cyan-400">🦈 Fishing</span>
            <button 
              onClick={() => setSelectedCategory('fishing')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. JILI Happy Fishing */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('jili_happy_fishing');
              }}
              className="bg-gradient-to-r from-[#0d2a45] to-[#041626] border border-cyan-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-cyan-300">JILI Fishing</span>
                  <span className="text-[9px] bg-cyan-700 text-white px-1.5 py-0.2 rounded font-bold">JILI</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Happy Blue Shark &amp; Cash Bundles</span>
              </div>
              <span className="text-4xl">🦈</span>
            </div>

            {/* 2. WG Fishing (Cai Shen) */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_caishen_fishing');
              }}
              className="bg-gradient-to-r from-[#0b3336] to-[#031c1e] border border-teal-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-teal-300">WG Fishing</span>
                  <span className="text-[9px] bg-teal-700 text-white px-1.5 py-0.2 rounded font-bold">WG</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Cai Shen God of Wealth Underwater</span>
              </div>
              <span className="text-4xl">🔱</span>
            </div>

            {/* 3. YGR Fishing */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('ygr_fishing');
              }}
              className="bg-gradient-to-r from-[#0d3642] to-[#041d24] border border-sky-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-sky-300">YGR Fishing</span>
                  <span className="text-[9px] bg-sky-700 text-white px-1.5 py-0.2 rounded font-bold">YGR</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Party Shark Sunglasses &amp; Cocktails</span>
              </div>
              <span className="text-4xl">🍹</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. 💃 LIVE SECTION (Screenshot 6) */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'live') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-pink-400">💃 Live</span>
            <button 
              onClick={() => setSelectedCategory('live')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. TG Live */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('tg_live');
              }}
              className="bg-gradient-to-r from-[#3b2308] to-[#1c1003] border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300">TG Live</span>
                  <span className="text-[9px] bg-amber-600 text-white px-1.5 py-0.2 rounded font-bold">VIP 4K</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Gold Sequin Baccarat &amp; Roulette</span>
              </div>
              <span className="text-4xl">💃</span>
            </div>

            {/* 2. PP Live (Pragmatic Play) */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('pp_live');
              }}
              className="bg-gradient-to-r from-[#172338] to-[#070e1a] border border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-blue-300">PP Live</span>
                  <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">PP PLAY</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Speed Roulette &amp; Blackjack Studio</span>
              </div>
              <span className="text-4xl">💎</span>
            </div>

            {/* 3. Sexy Live */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('sexy_live');
              }}
              className="bg-gradient-to-r from-[#381026] to-[#14040d] border border-pink-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-pink-300">Sexy Live</span>
                  <span className="text-[9px] bg-pink-600 text-white px-1.5 py-0.2 rounded font-bold">SEXY</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Sexy Baccarat &amp; Dragon Tiger Dealers</span>
              </div>
              <span className="text-4xl">💋</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. ⚽ SPORTS SECTION (Screenshot 6) */}
      {/* ========================================================================= */}
      {(selectedCategory === 'all' || selectedCategory === 'sports') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-base font-black text-blue-400">⚽ Sports</span>
            <button 
              onClick={() => setSelectedCategory('sports')}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              &lt; All &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 1. 9Wickets Sports */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('9wickets_sports');
              }}
              className="bg-gradient-to-r from-[#0d2a45] to-[#041626] border border-blue-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-300">9Wickets Sports</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">LIVE CRICKET</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">PSL, ICC Champions Trophy &amp; IPL</span>
              </div>
              <span className="text-4xl">🏏</span>
            </div>

            {/* 2. SABA Sports */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('saba_sports');
              }}
              className="bg-gradient-to-r from-[#173820] to-[#071c0e] border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-emerald-300">SABA Sports</span>
                  <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">SABA</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">Messi Football, UEFA &amp; FIFA World Cup</span>
              </div>
              <span className="text-4xl">⚽</span>
            </div>

            {/* 3. WG Sports */}
            <div
              onClick={() => {
                soundService.playClick();
                onSelectGame('wg_sports');
              }}
              className="bg-gradient-to-r from-[#212347] to-[#0b0c1f] border border-indigo-500/40 rounded-2xl p-3.5 flex items-center justify-between shadow hover:border-amber-400 transition cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-indigo-300">WG Sports</span>
                  <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-bold">WG</span>
                </div>
                <span className="text-[10px] text-slate-300 block mt-1">NHL Ice Hockey, NBA &amp; Tennis Odds</span>
              </div>
              <span className="text-4xl">🏒</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. 🏆 GRAND PRIZE RECORD MARQUEE (Screenshot 6) */}
      {/* ========================================================================= */}
      <div className="bg-[#081524] border border-slate-700/60 rounded-2xl p-3 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              🏆 Grand Prize Record
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">Real-time update</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WINNERS.slice(0, 4).map((w) => (
            <div
              key={w.id}
              className="p-2 rounded-xl bg-[#0e223d] border border-slate-700/40 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-base">{w.avatar}</span>
                <div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{w.game}</div>
                  <div className="text-[10px] text-slate-300 font-mono">{w.userMasked}</div>
                </div>
              </div>
              <span className="text-xs font-black text-amber-300 font-mono">
                ₨ {w.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 12. FLOATING ACTION WIDGETS (Red Envelope, Spin Wheel, WhatsApp, App Download) */}
      {/* ========================================================================= */}
      <div className="fixed right-3 bottom-24 z-30 flex flex-col gap-2 pointer-events-auto">
        {/* Floating Spin Wheel */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenSpinWheel) onOpenSpinWheel();
            else onSelectGame('lucky_wheel');
          }}
          className="relative group p-2 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xl hover:scale-110 transition cursor-pointer border border-purple-300"
          title="Spin Wheel Rs 500"
        >
          <span className="text-2xl animate-spin">🎡</span>
          <span className="absolute -top-2 -left-2 bg-amber-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow">
            Rs 500
          </span>
        </button>

        {/* Floating Red Envelope */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenInvite) onOpenInvite();
            else onOpenDeposit();
          }}
          className="relative group p-2 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 text-white shadow-xl hover:scale-110 transition cursor-pointer border border-rose-300"
          title="Invite 1 Person Rs 600"
        >
          <span className="text-2xl animate-bounce">🧧</span>
          <span className="absolute -top-2 -left-2 bg-yellow-400 text-slate-950 text-[8px] font-black px-1.5 py-0.2 rounded-full shadow">
            Rs 600
          </span>
        </button>

        {/* Floating WhatsApp Live Help with Hand pointer */}
        <button
          onClick={() => window.open('https://wa.me/923001234567', '_blank')}
          className="relative group p-2 rounded-2xl bg-emerald-600 text-white shadow-xl hover:scale-110 transition cursor-pointer border border-emerald-300"
          title="WhatsApp Support"
        >
          <span className="text-2xl">📱</span>
          <span className="absolute -left-6 top-1 text-sm animate-pulse">👉</span>
        </button>

        {/* Floating TOP Scroll Button */}
        <button
          onClick={scrollToTop}
          className="p-2 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-xl hover:scale-110 transition cursor-pointer"
          title="Back to Top"
        >
          <ArrowUp className="w-4 h-4 font-black stroke-[3]" />
        </button>
      </div>

      {/* 13. Footer Links, Compliance & Channels */}
      <footer className="bg-[#06101c] border-t border-slate-800 rounded-3xl p-4 sm:p-6 space-y-4 text-xs text-slate-400">
        <div className="grid grid-cols-3 gap-3 border-b border-slate-800 pb-4">
          <div>
            <h5 className="font-bold text-white mb-2">Casino</h5>
            <ul className="space-y-1 text-[11px]">
              <li className="hover:text-amber-300 cursor-pointer">Unclaimed</li>
              <li className="hover:text-amber-300 cursor-pointer">Rebate 3%</li>
              <li className="hover:text-amber-300 cursor-pointer">VIP Club</li>
              <li className="hover:text-amber-300 cursor-pointer">Invite Friends</li>
              <li className="hover:text-amber-300 cursor-pointer">Mission &amp; Events</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2">Games</h5>
            <ul className="space-y-1 text-[11px]">
              <li className="hover:text-amber-300 cursor-pointer">SPRIBE Aviator</li>
              <li className="hover:text-amber-300 cursor-pointer">INOUT Chicken Road</li>
              <li className="hover:text-amber-300 cursor-pointer">JDB Piggy Bank</li>
              <li className="hover:text-amber-300 cursor-pointer">9Wickets Sports</li>
              <li className="hover:text-amber-300 cursor-pointer">WG Crazy 777</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-2">Support</h5>
            <ul className="space-y-1 text-[11px]">
              <li 
                onClick={onOpenSupport} 
                className="hover:text-amber-300 cursor-pointer"
              >
                Online Support
              </li>
              <li 
                onClick={onOpenSupport} 
                className="hover:text-amber-300 cursor-pointer"
              >
                Help Center
              </li>
              <li 
                onClick={onOpenSupport} 
                className="hover:text-amber-300 cursor-pointer"
              >
                Reward Feedback
              </li>
              <li className="hover:text-amber-300 cursor-pointer">Anti-Fraud Guide</li>
            </ul>
          </div>
        </div>

        {/* 18+ Badge & Social Icons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full border-2 border-rose-500 text-rose-400 flex items-center justify-center font-black text-xs">
              18+
            </span>
            <span className="text-[11px] text-slate-400">
              Only for players aged 18 and above. Please play responsibly.
            </span>
          </div>

          {/* Social Channels */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-300 font-bold">Official:</span>
            <button
              onClick={() => window.open('https://wa.me/923001234567', '_blank')}
              className="w-7 h-7 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center text-xs shadow transition cursor-pointer"
              title="WhatsApp"
            >
              📱
            </button>
            <button
              onClick={() => window.open('https://t.me/P999_Official', '_blank')}
              className="w-7 h-7 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center text-xs shadow transition cursor-pointer"
              title="Telegram"
            >
              ✈️
            </button>
            <button
              onClick={() => window.open('https://facebook.com', '_blank')}
              className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-xs shadow transition cursor-pointer"
              title="Facebook"
            >
              📘
            </button>
          </div>
        </div>

        {/* P999 Disclaimer Paragraph */}
        <p className="text-[10px] text-slate-500 leading-relaxed text-center sm:text-left">
          P999 Group is one of the most famous international online casino operators, providing exciting entertainment options including slots, live casino, sports betting, cards, fishing, and multiplier crash games under certified gaming license 999/JAZ.
        </p>

        {/* Copyright */}
        <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
          P999.com | @Copyright 2002-2026 P999. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};
