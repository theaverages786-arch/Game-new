import React from 'react';
import { 
  Dices, 
  Trophy, 
  Users, 
  Radio, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Flame, 
  Zap, 
  Play, 
  Clock 
} from 'lucide-react';
import { soundService } from '../../services/sound';

interface KhelClubLobbyProps {
  onSelectGame: (gameId: string) => void;
  onOpenRoomModal: () => void;
  onOpenFreeCoins: () => void;
  userCoins: number;
}

export const KhelClubLobby: React.FC<KhelClubLobbyProps> = ({
  onSelectGame,
  onOpenRoomModal,
  onOpenFreeCoins,
  userCoins,
}) => {
  const CORE_GAMES = [
    {
      id: 'ludo',
      title: 'Ludo Supreme 15×15',
      tagline: 'Multiplayer Real-time Board Game',
      category: '2-4 Players',
      badge: 'POPULAR #1',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: '🎲',
      gradient: 'from-rose-500/20 via-amber-500/10 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60',
      description: 'Official 15x15 board with 52-tile circuit, safe stars, knockout captures & home run pot.',
      stake: '500 - 10K Coins',
      playersOnline: 642,
    },
    {
      id: 'teen_patti',
      title: 'Teen Patti Classic VIP',
      tagline: '5-Seat 3-Card Table & Showdowns',
      category: '2-5 Players',
      badge: 'LIVE POTS',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      icon: '🂡',
      gradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      description: 'Trail, Pure Sequence & Flush hand ranks. Real-time Blind vs Chaal and table showdowns.',
      stake: '200 - 50K Coins',
      playersOnline: 489,
    },
    {
      id: 'rummy',
      title: '13-Card Indian Rummy',
      tagline: 'Pure & Impure Sequence Melds',
      category: '2-6 Players',
      badge: 'SKILL GAME',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      icon: '🃏',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60',
      description: '13-card sorting, Wild & Printed Jokers, Open Discard pile & valid declaration scoring.',
      stake: '1,000 - 25K Coins',
      playersOnline: 350,
    },
  ];

  const CASUAL_GAMES = [
    {
      id: 'arcade',
      title: 'Arcade VIP Suite',
      category: 'Aviator • Mines • Chicken • Plinko',
      icon: '⚡',
      desc: 'Unified arcade suite with live marquee, glassmorphic HUD & instant tab switching.',
    },
    {
      id: 'crash',
      title: 'Aviator / Crash Demo',
      category: 'Play-Money Multiplier',
      icon: '🚀',
      desc: 'Watch the rocket climb to 100x and cash out play coins before the crash.',
    },
    {
      id: 'slots',
      title: 'HTML5 3-Reel Slots',
      category: 'Web Animations Demo',
      icon: '🎰',
      desc: 'Pure CSS & JS animated mechanical reels with free coin jackpots.',
    },
    {
      id: 'plinko',
      title: 'Plinko Physics Pegs',
      category: 'Physics Simulator',
      icon: '⚪',
      desc: 'Matter.js gravity pins with high risk & low risk multipliers.',
    },
    {
      id: 'roulette',
      title: 'European Roulette 36',
      category: 'Wheel Demo',
      icon: '🎡',
      desc: 'Inside and outside bets, red/black splits, and clean wheel spin.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Showcase Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0e162e] via-[#101b38] to-[#080d1c] border border-amber-500/30 p-5 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -top-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Open Source Multiplayer Game Engine</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">Ludo, Teen Patti & Rummy</span> with Friends.
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
            Real-time multiplayer card and board gaming engine powered by <strong>Node.js</strong>, <strong>Socket.IO</strong>, and <strong>React</strong>. 100% free practice coins with zero real money or gambling.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                soundService.playClick();
                onSelectGame('ludo');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Quick Play Ludo</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onOpenRoomModal();
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Multiplayer Rooms</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onOpenFreeCoins();
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Free Coins</span>
            </button>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-200 font-bold">1,480 Active Players</span>
            <span>&bull;</span>
            <span className="text-amber-400 font-bold">34 Live Rooms</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Play Money (Virtual Tokens Only)</span>
          </div>
        </div>
      </div>

      {/* Featured Core Games Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              Featured Multiplayer Arenas
            </h2>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onOpenRoomModal();
            }}
            className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse All Tables</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CORE_GAMES.map((game) => (
            <div
              key={game.id}
              className={`relative overflow-hidden rounded-3xl bg-slate-900/90 border ${game.borderColor} p-5 flex flex-col justify-between shadow-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
                    {game.icon}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wider uppercase ${game.badgeColor}`}>
                    {game.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-white group-hover:text-amber-300 transition">
                    {game.title}
                  </h3>
                  <span className="text-[11px] font-medium text-amber-400/90 block">
                    {game.tagline}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {game.description}
                </p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" />
                    {game.category}
                  </span>
                  <span className="text-amber-400 font-bold">{game.stake}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={() => {
                    soundService.playClick();
                    onSelectGame(game.id);
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer transition active:scale-95 text-center flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Play Table</span>
                </button>

                <button
                  onClick={() => {
                    soundService.playClick();
                    onOpenRoomModal();
                  }}
                  title="Create or Join Room Code"
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Casual Arcade Practice Demos */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-black text-white tracking-wide uppercase">
            Casual Arcade Mini-Games (Play Money Demos)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CASUAL_GAMES.map((cg) => (
            <div
              key={cg.id}
              onClick={() => {
                soundService.playClick();
                onSelectGame(cg.id);
              }}
              className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-lg border border-slate-700 group-hover:scale-110 transition">
                  {cg.icon}
                </div>
                <h4 className="text-xs font-black text-white group-hover:text-amber-300 transition">
                  {cg.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  {cg.desc}
                </p>
              </div>
              <span className="mt-2 text-[10px] text-amber-400 font-mono font-bold">
                Play Demo &rarr;
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture & Tech Stack Details (Portfolio & Educational Showcase) */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Full Stack Architecture & Tech Stack</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-white font-bold block mb-1">Backend Server</span>
            <p className="text-[11px] text-slate-400 font-mono">
              Node.js + Express + Socket.IO v4 running on port 3000 with real-time room broadcasting, seat turns & disconnect recovery.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-white font-bold block mb-1">Client Interface</span>
            <p className="text-[11px] text-slate-400 font-mono">
              React 19 + TypeScript + Tailwind CSS with responsive 15×15 coordinate boards, Card evaluators & Web Audio API FX.
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
            <span className="text-white font-bold block mb-1">Play-Money Economy</span>
            <p className="text-[11px] text-slate-400 font-mono">
              100% Virtual Practice Tokens. Free daily refill faucet, instant room code sharing & smart fallback bot fills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
