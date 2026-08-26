import React, { useState } from 'react';
import { 
  Flame, 
  Sparkles, 
  Trophy, 
  Rocket, 
  Gamepad2, 
  HelpCircle, 
  Coins, 
  Star, 
  TrendingUp, 
  Users, 
  Gift, 
  Play
} from 'lucide-react';
import { GameCategory } from '../../types';
import { soundService } from '../../services/sound';

interface LobbyTabProps {
  onSelectGame: (gameId: string) => void;
  onOpenDeposit: () => void;
  language: 'en' | 'ur' | 'hi';
}

interface GameCardItem {
  id: string;
  title: string;
  titleUr: string;
  category: GameCategory;
  tag?: 'HOT' | 'NEW' | 'JACKPOT' | 'POPULAR';
  imageGradient: string;
  icon: string;
  playersCount: number;
  multiplierText: string;
  description: string;
}

const GAMES: GameCardItem[] = [
  {
    id: 'slots_777',
    title: 'Lucky 777 Slots',
    titleUr: 'لکی 777 سلاٹس',
    category: 'slots',
    tag: 'JACKPOT',
    imageGradient: 'from-amber-600 via-yellow-600 to-amber-900',
    icon: '🎰',
    playersCount: 3420,
    multiplierText: 'Up to 500x + Grand Jackpot',
    description: 'Classic 3-Reel & 5-Reel fruit slot machine with Mega 777 wild jackpot.',
  },
  {
    id: 'crash_aviator',
    title: 'Aviator Crash 777',
    titleUr: 'ایوی ایٹر کریش',
    category: 'crash',
    tag: 'HOT',
    imageGradient: 'from-rose-600 via-red-700 to-rose-950',
    icon: '🚀',
    playersCount: 5190,
    multiplierText: 'Up to 100x Multiplier',
    description: 'Fly high with the rocket and cash out before it flies away!',
  },
  {
    id: 'color_wingo',
    title: 'WinGo Color Lottery',
    titleUr: 'ون گو کلر ٹریڈنگ',
    category: 'lottery',
    tag: 'POPULAR',
    imageGradient: 'from-emerald-600 via-teal-700 to-emerald-950',
    icon: '🎨',
    playersCount: 4210,
    multiplierText: '9x Number & 2x Color',
    description: 'Predict Red, Green, Violet or Numbers in fast 1M & 3M rounds.',
  },
  {
    id: 'mines_treasure',
    title: 'Mines Treasure',
    titleUr: 'مائنز خزانہ',
    category: 'mini',
    tag: 'HOT',
    imageGradient: 'from-cyan-600 via-blue-700 to-indigo-950',
    icon: '💎',
    playersCount: 2890,
    multiplierText: 'Cash Out Anytime',
    description: 'Uncover gems in 5x5 grid, avoid bombs and multiply your bet.',
  },
  {
    id: 'lucky_wheel',
    title: 'Lucky Spin Wheel',
    titleUr: 'لکی اسپن وہیل',
    category: 'mini',
    tag: 'NEW',
    imageGradient: 'from-purple-600 via-pink-700 to-purple-950',
    icon: '🎡',
    playersCount: 1850,
    multiplierText: 'Win up to ₨ 10,000',
    description: 'Spin the fortune wheel for instant cash prizes and bonuses.',
  },
  {
    id: 'dragon_tiger',
    title: 'Dragon vs Tiger',
    titleUr: 'ڈریگن ورسز ٹائیگر',
    category: 'cards',
    tag: 'POPULAR',
    imageGradient: 'from-amber-700 via-orange-800 to-stone-900',
    icon: '🐉',
    playersCount: 2150,
    multiplierText: 'Fast 2x & 9x Tie',
    description: 'Classic high-card casino battle between Dragon and Tiger.',
  },
];

export const LobbyTab: React.FC<LobbyTabProps> = ({
  onSelectGame,
  onOpenDeposit,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [activeBanner, setActiveBanner] = useState(0);

  const banners = [
    {
      title: 'FIRST DEPOSIT 100% MATCH BONUS',
      desc: 'Top-up with JazzCash / EasyPaisa and get instant bonus + free spins!',
      badge: 'PROMO',
      bg: 'from-amber-600 via-yellow-600 to-amber-800',
      action: 'Claim 100%',
    },
    {
      title: '777 GRAND JACKPOT POOL: ₨ 8,887,770',
      desc: 'Play Lucky 777 Slots & hit triple 7 on 5-Reel to take the whole pool!',
      badge: 'MEGA PRIZE',
      bg: 'from-purple-700 via-indigo-800 to-slate-900',
      action: 'Play Slots',
    },
    {
      title: 'INVITE AGENT REBATE UP TO 30%',
      desc: 'Share code 8khvdc with friends & receive lifetime commission on every bet!',
      badge: 'AGENT',
      bg: 'from-emerald-700 via-teal-800 to-slate-900',
      action: 'Invite Now',
    },
  ];

  const categories = [
    { id: 'all' as GameCategory, label: 'All Games', icon: Gamepad2 },
    { id: 'slots' as GameCategory, label: 'Slots 777', icon: Sparkles },
    { id: 'crash' as GameCategory, label: 'Crash / Aviator', icon: Rocket },
    { id: 'lottery' as GameCategory, label: 'WinGo Color', icon: Flame },
    { id: 'mini' as GameCategory, label: 'Mines & Wheel', icon: Gift },
    { id: 'cards' as GameCategory, label: 'Card Games', icon: Star },
  ];

  const filteredGames = selectedCategory === 'all'
    ? GAMES
    : GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="space-y-4 pb-20">
      {/* Promotional Hero Carousel Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-r p-4 sm:p-6 shadow-2xl transition-all duration-500">
        <div className={`absolute inset-0 bg-gradient-to-r ${banners[activeBanner].bg} opacity-90`}></div>
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-lg">
            <span className="inline-block bg-white/20 backdrop-blur-md text-yellow-200 border border-white/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {banners[activeBanner].badge}
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide uppercase leading-tight drop-shadow-md">
              {banners[activeBanner].title}
            </h3>
            <p className="text-xs sm:text-sm text-yellow-100/90 font-medium">
              {banners[activeBanner].desc}
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              if (activeBanner === 0) onOpenDeposit();
              else if (activeBanner === 1) onSelectGame('slots_777');
              else onSelectGame('crash_aviator');
            }}
            className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl shadow-xl shadow-amber-500/30 transition transform active:scale-95 whitespace-nowrap cursor-pointer"
          >
            {banners[activeBanner].action} &rarr;
          </button>
        </div>

        {/* Banner Dots */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeBanner === idx ? 'w-6 bg-amber-300' : 'w-2 bg-white/40'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                soundService.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border-amber-300 shadow-lg shadow-amber-500/20 font-black scale-105'
                  : 'bg-[#101726] text-slate-300 hover:bg-[#182238] border-slate-800'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              soundService.playClick();
              onSelectGame(game.id);
            }}
            className="group relative bg-[#0e1424] hover:bg-[#141c30] border border-amber-500/20 hover:border-amber-400/60 rounded-3xl p-4 shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Top Bar inside Card */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.imageGradient} flex items-center justify-center text-3xl shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                >
                  {game.icon}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                    {language === 'ur' ? game.titleUr : game.title}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-400 block font-mono">
                    {game.multiplierText}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                    <Users className="w-3 h-3 text-emerald-400" />
                    <span>{game.playersCount.toLocaleString()} Playing</span>
                  </div>
                </div>
              </div>

              {game.tag && (
                <span
                  className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow-md ${
                    game.tag === 'HOT'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : game.tag === 'JACKPOT'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-emerald-500 text-slate-950 font-bold'
                  }`}
                >
                  {game.tag}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-2 mb-3">
              {game.description}
            </p>

            {/* Play Button */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Official Server
              </span>

              <button className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 group-hover:from-amber-300 group-hover:to-yellow-300 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-transform active:scale-95">
                <Play className="w-3 h-3 fill-slate-950" />
                <span>PLAY NOW</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
