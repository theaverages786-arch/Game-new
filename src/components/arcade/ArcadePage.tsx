import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Rocket, 
  Bomb, 
  Sparkles, 
  Flame, 
  Trophy, 
  RefreshCcw, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  Volume2,
  VolumeX,
  CircleDot
} from 'lucide-react';
import { CrashGame } from '../games/CrashGame';
import { MinesGame } from '../games/MinesGame';
import { ChickenRoadGame } from '../games/ChickenRoadGame';
import { PlinkoGame } from '../games/PlinkoGame';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface ArcadePageProps {
  initialGame?: 'aviator' | 'mines' | 'chicken_road' | 'plinko';
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const ARCADE_GAMES = [
  {
    id: 'aviator',
    name: 'Aviator Rocket',
    subtitle: 'Crash & Multiplier',
    icon: Rocket,
    badge: 'HOT 99.2%',
    accentColor: '#EF4444',
    bgGlow: 'from-rose-500/20 to-transparent',
    borderColor: 'border-rose-500/40',
  },
  {
    id: 'mines',
    name: 'Mines 5×5',
    subtitle: 'Provably Fair Grid',
    icon: Bomb,
    badge: 'UP TO 5,000×',
    accentColor: '#10B981',
    bgGlow: 'from-emerald-500/20 to-transparent',
    borderColor: 'border-emerald-500/40',
  },
  {
    id: 'chicken_road',
    name: 'Chicken Road 2.0',
    subtitle: 'Cross Roads & Multiply',
    icon: Zap,
    badge: 'NEW',
    accentColor: '#F59E0B',
    bgGlow: 'from-amber-500/20 to-transparent',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'plinko',
    name: 'Plinko Master',
    subtitle: 'Physics Pegboard',
    icon: Sparkles,
    badge: '1,000× MAX',
    accentColor: '#8B5CF6',
    bgGlow: 'from-purple-500/20 to-transparent',
    borderColor: 'border-purple-500/40',
  },
] as const;

type ArcadeGameId = typeof ARCADE_GAMES[number]['id'];

// Rolling Balance Counter Component
const AnimatedBalance: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 600; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(step);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.15, color: '#10B981' }}
      animate={{ scale: 1, color: '#F59E0B' }}
      transition={{ duration: 0.3 }}
      className="font-mono font-black text-sm sm:text-base text-amber-400"
    >
      ₨ {displayValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.span>
  );
};

export const ArcadePage: React.FC<ArcadePageProps> = ({
  initialGame = 'aviator',
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [activeTab, setActiveTab] = useState<ArcadeGameId>(initialGame);
  const [tickerIndex, setTickerIndex] = useState(0);

  // Live Winners Ticker Feeds
  const liveWinners = [
    { user: 'User ***456', game: 'Super Ace', amount: 'Rs 50,000' },
    { user: 'User ***891', game: 'Aviator Crash', amount: 'Rs 124,500' },
    { user: 'User ***204', game: 'Mines 5x5', amount: 'Rs 38,200' },
    { user: 'User ***632', game: 'Chicken Road', amount: 'Rs 74,000' },
    { user: 'User ***109', game: 'Plinko Master', amount: 'Rs 210,000' },
    { user: 'User ***774', game: 'Aviator (44.2x)', amount: 'Rs 88,400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % liveWinners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [liveWinners.length]);

  const currentWinner = liveWinners[tickerIndex];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#0F172A] via-[#090D18] to-[#020617] text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Global Live Winners Ticker Marquee at the absolute top of the screen */}
      <div className="w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/10 px-3 py-1.5 flex items-center justify-between text-xs overflow-hidden z-30 sticky top-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full text-amber-400 font-bold text-[10px] uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Live Feed</span>
          </div>
        </div>

        <div className="flex-1 mx-4 overflow-hidden relative h-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-center justify-center text-xs truncate"
            >
              <span className="text-slate-400">
                <strong className="text-amber-400 font-mono">{currentWinner.user}</strong> just won{' '}
                <strong className="text-emerald-400 font-black">{currentWinner.amount}</strong> in{' '}
                <span className="text-cyan-300 font-semibold">{currentWinner.game}</span>!
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 shrink-0 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Provably Fair Active</span>
        </div>
      </div>

      {/* 2. Arcade Header Bar with Glassmorphism */}
      <header className="px-3 sm:px-6 py-3 border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-8 z-20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5"
            title="Return to Main Lobby"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold hidden sm:inline">Lobby</span>
          </motion.button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                  ARCADE ARENA
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  97% RTP
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Crash & Arcade Suite • Provably Fair Real-Time Gameplay
            </p>
          </div>
        </div>

        {/* Balance & Game Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-slate-900/90 border border-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:inline">
              Balance:
            </span>
            <AnimatedBalance value={userBalance} />
          </div>
        </div>
      </header>

      {/* 3. Game Selection Navigation Tabs (Glassmorphism + Framer Motion) */}
      <nav className="px-3 sm:px-6 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 max-w-7xl mx-auto">
          {ARCADE_GAMES.map((g) => {
            const Icon = g.icon;
            const isActive = activeTab === g.id;

            return (
              <motion.button
                key={g.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  soundService.playClick();
                  setActiveTab(g.id);
                }}
                className={`relative px-3.5 sm:px-5 py-2.5 rounded-2xl flex items-center gap-2 sm:gap-3 shrink-0 transition-all border cursor-pointer ${
                  isActive
                    ? 'backdrop-blur-md bg-white/10 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'backdrop-blur-md bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-black tracking-tight leading-tight">
                      {g.name}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {g.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    {g.subtitle}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="arcade-tab-indicator"
                    className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* 4. Main Game Stage with Framer Motion Mounting Animation */}
      <main className="flex-1 px-2 sm:px-4 py-2 sm:py-4 max-w-7xl w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            {activeTab === 'aviator' && (
              <CrashGame
                balance={userBalance}
                onBet={(amount, winAmount, details) => {
                  const netDelta = winAmount - amount;
                  onUpdateBalance(userBalance + netDelta);
                  const mult = amount > 0 ? Number((winAmount / amount).toFixed(2)) : 0;
                  onRecordBet('spribe_aviator', 'Aviator Rocket', amount, winAmount, mult);
                }}
                onBack={onBack}
                adminSettings={adminSettings}
              />
            )}

            {activeTab === 'mines' && (
              <MinesGame
                balance={userBalance}
                onBet={(amount, winAmount, details) => {
                  const netDelta = winAmount - amount;
                  onUpdateBalance(userBalance + netDelta);
                  const mult = amount > 0 ? Number((winAmount / amount).toFixed(2)) : 0;
                  onRecordBet('spribe_mines', 'Mines 5×5', amount, winAmount, mult);
                }}
                onBack={onBack}
                adminSettings={adminSettings}
              />
            )}

            {activeTab === 'chicken_road' && (
              <ChickenRoadGame
                userBalance={userBalance}
                onUpdateBalance={onUpdateBalance}
                onRecordBet={onRecordBet}
                onBack={onBack}
                adminSettings={adminSettings}
              />
            )}

            {activeTab === 'plinko' && (
              <PlinkoGame
                userBalance={userBalance}
                onUpdateBalance={onUpdateBalance}
                onRecordBet={onRecordBet}
                onBack={onBack}
                adminSettings={adminSettings}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
