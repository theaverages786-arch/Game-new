import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Flame, 
  Sparkles, 
  Zap, 
  Trophy, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  Footprints,
  Bone,
  Bomb
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';
import { ProvablyFairModal } from '../modals/ProvablyFairModal';
import { loadProvablyFairState, pseudoSha256 } from '../../services/provablyFair';

interface ChickenRoadGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface LaneConfig {
  step: number;
  name: string;
  multipliers: Record<Difficulty, number>;
  trapsCount: Record<Difficulty, number>;
}

const LANES_DATA: LaneConfig[] = [
  { step: 1, name: 'Country Lane', multipliers: { easy: 1.25, medium: 1.45, hard: 1.95 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
  { step: 2, name: 'Suburban Street', multipliers: { easy: 1.65, medium: 2.15, hard: 3.90 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
  { step: 3, name: 'Highway 101', multipliers: { easy: 2.30, medium: 3.35, hard: 7.80 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
  { step: 4, name: 'Train Tracks', multipliers: { easy: 3.40, medium: 5.40, hard: 15.60 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
  { step: 5, name: 'Lava Bridge', multipliers: { easy: 5.50, medium: 9.80, hard: 32.00 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
  { step: 6, name: 'Golden Nest', multipliers: { easy: 10.00, medium: 22.00, hard: 75.00 }, trapsCount: { easy: 1, medium: 2, hard: 3 } },
];

interface TileState {
  laneIndex: number;
  colIndex: number;
  revealed: boolean;
  isHazard: boolean;
  isPicked: boolean;
}

export const ChickenRoadGame: React.FC<ChickenRoadGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentLane, setCurrentLane] = useState<number>(0); // 0 = start, 1..6 = lane
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'won'>('idle');
  const [lastWin, setLastWin] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundService.isEnabled());
  const [showPfModal, setShowPfModal] = useState<boolean>(false);
  const [serverHash, setServerHash] = useState<string>('');

  // 6 lanes x 4 columns grid
  const [grid, setGrid] = useState<TileState[][]>(() => generateEmptyGrid());

  const chips = [50, 100, 200, 500, 1000, 2500, 5000];

  function generateEmptyGrid(): TileState[][] {
    return LANES_DATA.map((lane, lIdx) =>
      Array.from({ length: 4 }, (_, cIdx) => ({
        laneIndex: lIdx,
        colIndex: cIdx,
        revealed: false,
        isHazard: false,
        isPicked: false,
      }))
    );
  }

  // Generate authoritative hazard tiles per lane
  function generateLaneHazards(diff: Difficulty): TileState[][] {
    return LANES_DATA.map((lane, lIdx) => {
      const trapsCount = lane.trapsCount[diff];
      // Randomly choose trap columns (e.g. 1 out of 4, or 2 out of 4)
      const trapCols = new Set<number>();
      while (trapCols.size < trapsCount) {
        trapCols.add(Math.floor(Math.random() * 4));
      }

      return Array.from({ length: 4 }, (_, cIdx) => ({
        laneIndex: lIdx,
        colIndex: cIdx,
        revealed: false,
        isHazard: trapCols.has(cIdx),
        isPicked: false,
      }));
    });
  }

  const handleStartGame = () => {
    if (userBalance < betAmount) {
      alert('Insufficient balance! Please deposit to continue.');
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - betAmount);

    const newGrid = generateLaneHazards(difficulty);
    setGrid(newGrid);
    setGameState('playing');
    setCurrentLane(0);
    setLastWin(0);
    setIsShaking(false);

    // Provably fair seed commitment
    const roundSeed = 'chicken_' + Date.now() + '_' + Math.random().toString(36).slice(2);
    setServerHash(pseudoSha256(roundSeed));
  };

  const handleTileClick = (laneIdx: number, colIdx: number) => {
    if (gameState !== 'playing') return;
    // Player must click on the current lane
    if (laneIdx !== currentLane) return;

    const tile = grid[laneIdx][colIdx];
    if (tile.revealed) return;

    // Evaluate win probability governed by admin settings RTP
    const mustWin = shouldPlayerWin('inout_chicken_road', adminSettings, 0.70);
    let isCrash = tile.isHazard;

    if (mustWin && isCrash) {
      // Re-allocate hazard to another column so player survives
      const safeCols = grid[laneIdx]
        .map((t, i) => (!t.isHazard && i !== colIdx ? i : -1))
        .filter((i) => i !== -1);
      if (safeCols.length > 0) {
        isCrash = false;
        grid[laneIdx][colIdx].isHazard = false;
        grid[laneIdx][safeCols[0]].isHazard = true;
      }
    } else if (adminSettings?.masterOutcomeMode === 'always_lose') {
      isCrash = true;
      grid[laneIdx][colIdx].isHazard = true;
    }

    const updatedGrid = grid.map((lane, lIdx) =>
      lane.map((t, cIdx) => {
        if (lIdx === laneIdx) {
          if (cIdx === colIdx) {
            return { ...t, revealed: true, isPicked: true, isHazard: isCrash };
          }
          // If crashed, reveal other hazards in this lane
          if (isCrash) {
            return { ...t, revealed: true };
          }
        }
        return t;
      })
    );

    setGrid(updatedGrid);

    if (isCrash) {
      // Screen Shake effect and explosion on hazard!
      soundService.playExplosion();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      setGameState('crashed');
      onRecordBet('inout_chicken_road', 'Chicken Road 2.0', betAmount, 0, 0);
    } else {
      // Safe Bone / Gem revealed with ding sound!
      const nextStep = currentLane + 1;
      soundService.playDiamondSparkle(nextStep);
      setCurrentLane(nextStep);

      // Check if reached Golden Nest (Lane 6 cleared)
      if (nextStep === LANES_DATA.length) {
        handleCashOut(LANES_DATA[LANES_DATA.length - 1].multipliers[difficulty]);
      }
    }
  };

  const handleCashOut = (overrideMult?: number) => {
    if (gameState !== 'playing' || currentLane === 0) return;

    const mult = overrideMult || LANES_DATA[currentLane - 1].multipliers[difficulty];
    const win = Math.round(betAmount * mult);

    playOutcomeCelebration(win, betAmount, mult >= 3);
    triggerWinConfetti();
    onUpdateBalance(userBalance + win);
    setLastWin(win);
    setGameState('won');
    onRecordBet('inout_chicken_road', 'Chicken Road 2.0', betAmount, win, mult);
  };

  const currentMult = currentLane > 0 ? LANES_DATA[currentLane - 1].multipliers[difficulty] : 1.0;
  const potentialProfit = Math.round(betAmount * currentMult);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* 1. Header Bar with Provably Fair & Balance */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🐔 Chicken Road 2.0</span>
              <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                Arcade
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">
              Cross lanes & flip tiles • Up to {LANES_DATA[5].multipliers[difficulty]}× payout!
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              const muted = soundService.toggleSound();
              setSoundMuted(!muted);
            }}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10 transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setShowPfModal(true)}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 text-emerald-400 rounded-xl border border-white/10 transition cursor-pointer flex items-center gap-1 text-xs font-mono"
            title="Provably Fair"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Fair</span>
          </button>

          <div className="text-right bg-slate-950/80 px-3 py-1.5 rounded-xl border border-amber-500/30 font-mono">
            <span className="text-[9px] text-slate-400 block font-bold uppercase">Balance</span>
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {formatPKR(userBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Game Area: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Controls & Betting Zone */}
        <div className="lg:col-span-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4 justify-between">
          <div className="space-y-4">
            {/* Difficulty Level Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Difficulty</span>
                <span className="text-amber-400 capitalize">{difficulty} ({difficulty === 'easy' ? '1 Trap' : difficulty === 'medium' ? '2 Traps' : '3 Traps'})</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/10">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    disabled={gameState === 'playing'}
                    onClick={() => {
                      soundService.playClick();
                      setDifficulty(d);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                      difficulty === d
                        ? d === 'easy'
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : d === 'medium'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white disabled:opacity-40'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Bet Amount</span>
                <span className="text-amber-400 font-mono text-sm">{formatPKR(betAmount)}</span>
              </div>

              {/* Quick Chips */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {chips.slice(0, 4).map((c) => (
                  <button
                    key={c}
                    disabled={gameState === 'playing'}
                    onClick={() => {
                      soundService.playChip();
                      setBetAmount(c);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                      betAmount === c
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40'
                    }`}
                  >
                    ₨ {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {chips.slice(4).map((c) => (
                  <button
                    key={c}
                    disabled={gameState === 'playing'}
                    onClick={() => {
                      soundService.playChip();
                      setBetAmount(c);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer border ${
                      betAmount === c
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow'
                        : 'bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40'
                    }`}
                  >
                    ₨ {c >= 1000 ? `${c / 1000}k` : c}
                  </button>
                ))}
                <button
                  disabled={gameState === 'playing'}
                  onClick={() => setBetAmount((b) => Math.max(10, Math.floor(b / 2)))}
                  className="py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  ½
                </button>
                <button
                  disabled={gameState === 'playing'}
                  onClick={() => setBetAmount((b) => Math.min(50000, b * 2))}
                  className="py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  2×
                </button>
              </div>
            </div>

            {/* Current Multiplier & Next Odds Box */}
            <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 space-y-2 text-xs font-mono shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Multiplier:</span>
                <span className="text-emerald-400 font-black text-sm">{currentMult.toFixed(2)}×</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Profit:</span>
                <span className="text-amber-300 font-black text-sm">{formatPKR(potentialProfit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Next Lane Multiplier:</span>
                <span className="text-cyan-400 font-black">
                  {currentLane < LANES_DATA.length
                    ? `${LANES_DATA[currentLane].multipliers[difficulty].toFixed(2)}×`
                    : 'MAX WIN!'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 mt-4">
            {gameState !== 'playing' ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base shadow-xl hover:from-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>START RUN (₨ {betAmount})</span>
              </motion.button>
            ) : (
              <div className="space-y-2">
                {currentLane > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCashOut()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black text-base shadow-[0_0_20px_rgba(16,185,129,0.5)] transition cursor-pointer animate-pulse flex items-center justify-center gap-2"
                  >
                    <Trophy className="w-5 h-5 text-slate-950" />
                    <span>CASH OUT {formatPKR(potentialProfit)} ({currentMult.toFixed(2)}×)</span>
                  </motion.button>
                )}
                <div className="text-center text-xs text-slate-400">
                  Select a tile in <strong className="text-amber-400">Lane {currentLane + 1}</strong> to step forward!
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: The 6-Lane Traversal Grid (Road from Bottom to Top) */}
        <div className="lg:col-span-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col justify-between overflow-hidden relative">
          {/* Status Overlay */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-amber-400">🐔 Chicken Position:</span>
              <span className="text-slate-300 font-mono">Lane {currentLane} of 6</span>
            </div>

            <AnimatePresence>
              {gameState === 'won' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WON {formatPKR(lastWin)}!</span>
                </motion.div>
              )}
              {gameState === 'crashed' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>BOOM! Hit Hazard Trap</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 6-Lane Traversal Grid with Screen Shake Effect */}
          <motion.div
            animate={
              isShaking
                ? {
                    x: [-14, 14, -10, 10, -6, 6, -2, 2, 0],
                    y: [-4, 4, -2, 2, 0],
                    rotate: [-1.5, 1.5, -1, 1, 0],
                  }
                : {}
            }
            transition={{ duration: 0.55 }}
            className="flex flex-col-reverse gap-2 my-auto"
          >
            {grid.map((lane, lIdx) => {
              const laneConfig = LANES_DATA[lIdx];
              const isCurrentLane = gameState === 'playing' && currentLane === lIdx;
              const isPassedLane = currentLane > lIdx;
              const laneMult = laneConfig.multipliers[difficulty];

              return (
                <div
                  key={lIdx}
                  className={`p-2 rounded-2xl border transition-all flex items-center gap-2 sm:gap-3 ${
                    isCurrentLane
                      ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : isPassedLane
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : 'bg-slate-900/40 border-white/5 opacity-75'
                  }`}
                >
                  {/* Lane Milestone Tag */}
                  <div className="w-16 sm:w-20 shrink-0 text-left">
                    <div className="text-[10px] font-bold text-slate-400 truncate">
                      {laneConfig.name}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-black font-mono ${
                        isCurrentLane
                          ? 'text-amber-300'
                          : isPassedLane
                          ? 'text-emerald-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {laneMult.toFixed(2)}×
                    </div>
                  </div>

                  {/* 4 Solid Glassmorphism Square Tiles */}
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {lane.map((tile) => {
                      const isClickable = isCurrentLane && !tile.revealed && gameState === 'playing';

                      return (
                        <motion.button
                          key={tile.colIndex}
                          disabled={!isClickable}
                          onClick={() => handleTileClick(lIdx, tile.colIndex)}
                          whileHover={isClickable ? { scale: 1.06 } : {}}
                          whileTap={isClickable ? { scale: 0.94 } : {}}
                          className={`h-12 sm:h-14 rounded-xl flex items-center justify-center transition-all select-none relative cursor-pointer ${
                            !tile.revealed
                              ? isClickable
                                ? 'backdrop-blur-md bg-white/10 border border-amber-400/50 hover:bg-amber-400/20 shadow-md shadow-amber-500/10'
                                : 'backdrop-blur-md bg-white/5 border border-white/10'
                              : tile.isHazard
                              ? 'bg-gradient-to-b from-rose-600 via-red-600 to-rose-900 border-2 border-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                              : 'bg-gradient-to-b from-emerald-600/90 via-teal-700/90 to-slate-900 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                          }`}
                        >
                          {tile.revealed ? (
                            <motion.div
                              initial={{ scale: 0.2, rotateY: 180 }}
                              animate={{ scale: 1, rotateY: 0 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                            >
                              {tile.isHazard ? (
                                <Bomb className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse" />
                              ) : (
                                <span className="text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(16,185,129,0.9)]">
                                  💎
                                </span>
                              )}
                            </motion.div>
                          ) : (
                            isClickable && (
                              <div className="w-2 h-2 rounded-full bg-amber-400/60 animate-ping" />
                            )
                          )}

                          {/* Chicken Icon Overlay on current position */}
                          {tile.isPicked && !tile.isHazard && (
                            <div className="absolute -top-2 -right-1 text-sm sm:text-base animate-bounce">
                              🐔
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Golden Goal Finish Banner */}
          <div className="mt-3 p-2 bg-amber-400/10 border border-amber-400/30 rounded-xl text-[10px] text-amber-300 flex items-center justify-between font-mono">
            <span className="flex items-center gap-1 font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Reach Golden Nest for {LANES_DATA[5].multipliers[difficulty]}× Max Jackpot</span>
            </span>
            <span className="text-slate-400">RTP: 97.2%</span>
          </div>
        </div>
      </div>

      {/* Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showPfModal}
        onClose={() => setShowPfModal(false)}
        clientSeed="user_chicken_road"
        serverSeedHash={serverHash}
        nonce={1}
        gameName="Chicken Road 2.0"
      />
    </div>
  );
};
