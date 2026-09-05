import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bomb, 
  Diamond, 
  Sparkles, 
  Trophy, 
  Shield, 
  Zap, 
  Volume2, 
  VolumeX,
  FastForward,
  Shuffle
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';

interface MinesGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface TileState {
  revealed: boolean;
  isMine: boolean;
}

export const MinesGame: React.FC<MinesGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [grid, setGrid] = useState<TileState[]>(
    Array(25).fill(null).map(() => ({ revealed: false, isMine: false }))
  );
  const [gemsFound, setGemsFound] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [soundMuted, setSoundMuted] = useState(!soundService.isEnabled());

  const quickBets = [50, 100, 200, 500, 1000, 2000];
  const mineOptions = [1, 2, 3, 5, 10, 15, 20, 24];

  // Mathematical Multiplier Formula (Standard 96% RTP base)
  const calculateMultiplier = (mines: number, gems: number) => {
    if (gems === 0) return 1.0;
    let prob = 1.0;
    for (let i = 0; i < gems; i++) {
      prob *= (25 - mines - i) / (25 - i);
    }
    const raw = (1 / prob) * 0.96;
    return +Math.max(1.04, raw).toFixed(2);
  };

  const currentMultiplier = calculateMultiplier(mineCount, gemsFound);
  const nextMultiplier = calculateMultiplier(mineCount, gemsFound + 1);

  const handleStartGame = () => {
    if (balance < betAmount) {
      soundService.playBeep(300);
      alert('Insufficient balance!');
      return;
    }

    soundService.playClick();

    // Place mines on grid
    const indices = Array.from({ length: 25 }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const mineIndices = new Set(indices.slice(0, mineCount));
    const newGrid: TileState[] = Array(25).fill(null).map((_, idx) => ({
      revealed: false,
      isMine: mineIndices.has(idx),
    }));

    setGrid(newGrid);
    setGemsFound(0);
    setIsPlaying(true);
    setGameOver(false);
    setHasWon(false);
  };

  const handleTileClick = (index: number) => {
    if (!isPlaying || gameOver || grid[index].revealed) return;

    let tile = grid[index];

    // Admin Outcome Matrix & Forcer Checks
    const forced = adminSettings?.forcedResults?.mines;
    const masterMode = adminSettings?.masterOutcomeMode;

    if (masterMode === 'always_win' || forced === 'safe') {
      if (tile.isMine) {
        const safeIdx = grid.findIndex((t, idx) => !t.isMine && !t.revealed && idx !== index);
        if (safeIdx !== -1) {
          grid[safeIdx].isMine = true;
          grid[index].isMine = false;
          tile = grid[index];
        }
      }
    } else if (masterMode === 'always_lose' || forced === 'bomb') {
      tile.isMine = true;
      grid[index].isMine = true;
    } else if (tile.isMine) {
      // Check if user is favored this round
      const shouldWin = shouldPlayerWin('mines_treasure', adminSettings, 0.55);
      if (shouldWin && gemsFound < 3) {
        const safeIdx = grid.findIndex((t, idx) => !t.isMine && !t.revealed && idx !== index);
        if (safeIdx !== -1) {
          grid[safeIdx].isMine = true;
          grid[index].isMine = false;
          tile = grid[index];
        }
      }
    }

    if (tile.isMine) {
      // Hit Bomb!
      soundService.playExplosion();
      const revealedGrid = grid.map((t) => ({ ...t, revealed: true }));
      setGrid(revealedGrid);
      setGameOver(true);
      setIsPlaying(false);
      onBet(betAmount, 0, `Mines (${mineCount} mines) hit bomb after ${gemsFound} gems`);
    } else {
      // Diamond Found!
      const newGems = gemsFound + 1;
      soundService.playDiamondSparkle(newGems);
      const updatedGrid = [...grid];
      updatedGrid[index].revealed = true;
      setGrid(updatedGrid);
      setGemsFound(newGems);

      // Check if board fully cleared of gems
      if (newGems === 25 - mineCount) {
        handleCashOut(newGems);
      }
    }
  };

  // 1,000,000x Fast Random Auto Pick
  const handleRandomPick = () => {
    if (!isPlaying || gameOver) return;
    const unrevealedIndices = grid
      .map((t, idx) => (!t.revealed ? idx : -1))
      .filter((i) => i !== -1);

    if (unrevealedIndices.length === 0) return;
    const randomIdx = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    handleTileClick(randomIdx);
  };

  const handleCashOut = (gems = gemsFound) => {
    if (!isPlaying || gameOver || gems === 0) return;

    const finalMultiplier = calculateMultiplier(mineCount, gems);
    const winAmt = Math.round(betAmount * finalMultiplier);

    playOutcomeCelebration(winAmt, betAmount, finalMultiplier >= 3);

    // Reveal entire board
    const revealedGrid = grid.map((t) => ({ ...t, revealed: true }));
    setGrid(revealedGrid);
    setIsPlaying(false);
    setGameOver(true);
    setHasWon(true);

    onBet(betAmount, winAmt, `Mines Cashed Out (${mineCount} mines, ${gems} gems) @ ${finalMultiplier}x`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-[#0c1222] border border-slate-800 p-2.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl">
            <Diamond className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black tracking-wider text-cyan-300">SPRIBE MINES PRO</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = soundService.toggleSound();
              setSoundMuted(!muted);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: Control Panel */}
        <div className="bg-[#0e1628] border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col gap-3.5">
          {/* Bet Amount */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-bold">Bet Amount</span>
              <span className="text-amber-400 font-mono font-bold">{formatPKR(betAmount)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {quickBets.map((amt) => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => {
                    soundService.playChip();
                    setBetAmount(amt);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    betAmount === amt
                      ? 'bg-amber-400 text-slate-950 font-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {formatPKR(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Mines Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-bold">Number of Mines</span>
              <span className="text-rose-400 font-mono font-bold">{mineCount} Bombs</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {mineOptions.map((cnt) => (
                <button
                  key={cnt}
                  disabled={isPlaying}
                  onClick={() => {
                    soundService.playClick();
                    setMineCount(cnt);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    mineCount === cnt
                      ? 'bg-rose-500 text-white font-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Profit Tracker Preview */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Current Multiplier:</span>
              <span className="text-emerald-400 font-bold">{currentMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Next Multiplier:</span>
              <span className="text-cyan-400 font-bold">{nextMultiplier.toFixed(2)}x</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1.5">
              <span className="text-slate-300 font-bold">Current Payout:</span>
              <span className="text-amber-400 font-black">
                {formatPKR(Math.round(betAmount * currentMultiplier))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {!isPlaying ? (
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
            >
              START GAME ({formatPKR(betAmount)})
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleCashOut()}
                disabled={gemsFound === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/40 transition transform active:scale-95 cursor-pointer disabled:opacity-50 animate-pulse"
              >
                CASHOUT {formatPKR(Math.round(betAmount * currentMultiplier))} ({currentMultiplier.toFixed(2)}x)
              </button>

              <button
                onClick={handleRandomPick}
                className="w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>1-CLICK AUTO PICK (FAST)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: 5x5 Mines Grid */}
        <div className="lg:col-span-2 bg-[#090f1d] border-2 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-center">
          {/* Header Stats */}
          <div className="flex items-center justify-between mb-4 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Diamond className="w-4 h-4" />
                {gemsFound} Gems Found
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <Bomb className="w-4 h-4" />
                {mineCount} Mines
              </span>
            </div>

            {hasWon && (
              <div className="bg-emerald-500/20 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/40 font-bold text-xs">
                🎉 Won {formatPKR(Math.round(betAmount * currentMultiplier))}!
              </div>
            )}
            {gameOver && !hasWon && (
              <div className="bg-rose-500/20 text-rose-300 px-3 py-0.5 rounded-full border border-rose-500/40 font-bold text-xs">
                💥 BOOM! Game Over
              </div>
            )}
          </div>

          {/* 5x5 Grid */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3 aspect-square max-w-[420px] mx-auto w-full">
            {grid.map((tile, idx) => (
              <button
                key={idx}
                disabled={!isPlaying || tile.revealed || gameOver}
                onClick={() => handleTileClick(idx)}
                className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-200 transform active:scale-95 cursor-pointer shadow-lg select-none ${
                  !tile.revealed
                    ? 'bg-gradient-to-b from-[#1e293b] to-[#0f172a] hover:from-[#334155] hover:to-[#1e293b] border border-slate-700/80 shadow-slate-900/80'
                    : tile.isMine
                    ? 'bg-gradient-to-b from-rose-600 to-red-800 border-2 border-rose-400 animate-in zoom-in-75'
                    : 'bg-gradient-to-b from-emerald-600/90 to-teal-800/90 border-2 border-cyan-300 animate-in zoom-in-75'
                }`}
              >
                {tile.revealed && (
                  <span>
                    {tile.isMine ? (
                      <Bomb className="w-7 h-7 sm:w-8 sm:h-8 text-white animate-pulse" />
                    ) : (
                      <Diamond className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    )}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
