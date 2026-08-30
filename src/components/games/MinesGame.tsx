import React, { useState } from 'react';
import { ArrowLeft, Bomb, Diamond, Sparkles, Trophy, Shield } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

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

  // Multiplier formula based on mines & gems found
  const calculateMultiplier = (mines: number, gems: number) => {
    if (gems === 0) return 1.0;
    let prob = 1.0;
    for (let i = 0; i < gems; i++) {
      prob *= (25 - mines - i) / (25 - i);
    }
    const rawMulti = (1 / prob) * 0.96; // 96% RTP base
    return +Math.max(1.05, rawMulti).toFixed(2);
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
    // Shuffle
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
    const gameRtp = adminSettings?.gameRtpOverrides?.['mines_treasure'] ?? adminSettings?.rtpPercentage ?? 96;
    const globalWin = adminSettings?.globalWinRate ?? 65;

    if (masterMode === 'always_win' || forced === 'safe') {
      if (tile.isMine) {
        // Swap mine with an unrevealed safe tile
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
      // Dynamic RTP / Win rate calculation: give chance to dodge bomb
      const randomRoll = Math.random() * 100;
      if (randomRoll < (globalWin - 20) && (gameRtp > 95)) {
        const safeIdx = grid.findIndex((t, idx) => !t.isMine && !t.revealed && idx !== index);
        if (safeIdx !== -1) {
          grid[safeIdx].isMine = true;
          grid[index].isMine = false;
          tile = grid[index];
        }
      }
    }

    if (tile.isMine) {
      // Hit a bomb!
      soundService.playCrash();
      const revealedGrid = grid.map((t) => ({ ...t, revealed: true }));
      setGrid(revealedGrid);
      setGameOver(true);
      setIsPlaying(false);
      onBet(betAmount, 0, `Mines (${mineCount} mines) hit bomb after ${gemsFound} gems`);
    } else {
      // Found a Gem!
      soundService.playCoin();
      const updatedGrid = [...grid];
      updatedGrid[index].revealed = true;
      setGrid(updatedGrid);

      const newGems = gemsFound + 1;
      setGemsFound(newGems);

      // Check if all gems discovered
      if (newGems === 25 - mineCount) {
        handleCashOut(newGems);
      }
    }
  };

  const handleCashOut = (gems = gemsFound) => {
    if (!isPlaying || gameOver || gems === 0) return;

    const finalMultiplier = calculateMultiplier(mineCount, gems);
    const winAmt = Math.round(betAmount * finalMultiplier);

    soundService.playWin();
    triggerWinConfetti();

    // Reveal whole board
    const revealedGrid = grid.map((t) => ({ ...t, revealed: true }));
    setGrid(revealedGrid);
    setGameOver(true);
    setIsPlaying(false);
    setHasWon(true);

    onBet(betAmount, winAmt, `Mines (${mineCount} mines) Cashed out ${finalMultiplier}x with ${gems} gems`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Exit Game</span>
        </button>

        <div className="flex items-center gap-2 bg-[#121826] border border-amber-500/30 px-3 py-1 rounded-2xl">
          <Diamond className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-slate-200">
            Gems Found: <strong className="text-amber-300 font-mono">{gemsFound} / {25 - mineCount}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Side: 5x5 Mines Grid */}
        <div className="lg:col-span-2 bg-[#090d18] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
          <div className="grid grid-cols-5 gap-2 sm:gap-3 aspect-square max-w-md mx-auto">
            {grid.map((tile, idx) => (
              <button
                key={idx}
                disabled={!isPlaying || tile.revealed}
                onClick={() => handleTileClick(idx)}
                className={`rounded-2xl font-black text-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-md border cursor-pointer ${
                  tile.revealed
                    ? tile.isMine
                      ? 'bg-rose-700/80 border-rose-500 text-white animate-bounce'
                      : 'bg-gradient-to-br from-cyan-600 to-blue-700 border-cyan-400 text-white animate-in zoom-in-75'
                    : isPlaying
                    ? 'bg-gradient-to-b from-[#1c263d] to-[#121a2c] hover:from-[#253250] hover:to-[#1a253e] border-amber-500/30 text-amber-300/40 hover:border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
              >
                {tile.revealed ? (
                  tile.isMine ? (
                    <Bomb className="w-8 h-8 text-white fill-rose-500" />
                  ) : (
                    <Diamond className="w-8 h-8 text-cyan-200 fill-cyan-400" />
                  )
                ) : (
                  <span className="text-xs font-mono opacity-20">{idx + 1}</span>
                )}
              </button>
            ))}
          </div>

          {/* Win Result Overlay */}
          {hasWon && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 p-4 rounded-3xl font-black text-center shadow-2xl border-2 border-white animate-in zoom-in-90 z-20">
              <div className="text-base sm:text-lg uppercase">🎉 CASHED OUT SUCCESSFULLY!</div>
              <div className="text-2xl sm:text-3xl font-mono mt-1">
                +₨ {(betAmount * currentMultiplier).toFixed(0)} ({currentMultiplier}x)
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Betting Controls & Multiplier progression */}
        <div className="bg-[#121827] border border-amber-500/30 rounded-3xl p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xl">
          <div className="space-y-4">
            {/* Bet Amount */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>Bet Amount</span>
                <span className="text-amber-400 font-mono">₨ {betAmount}</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[50, 100, 200, 500, 1000, 2500].map((amt) => (
                  <button
                    key={amt}
                    disabled={isPlaying}
                    onClick={() => {
                      soundService.playClick();
                      setBetAmount(amt);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      betAmount === amt
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    ₨ {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Mines Count Selector (1 to 24) */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <Bomb className="w-3.5 h-3.5 text-rose-400" />
                  Mines Count
                </span>
                <span className="text-rose-400 font-bold">{mineCount} Mines</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 3, 5, 10, 15, 20, 24].map((count) => (
                  <button
                    key={count}
                    disabled={isPlaying}
                    onClick={() => {
                      soundService.playClick();
                      setMineCount(count);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      mineCount === count
                        ? 'bg-rose-600 text-white font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {count} 💣
                  </button>
                ))}
              </div>
            </div>

            {/* Multiplier Stats Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Payout:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {currentMultiplier}x (₨ {(betAmount * currentMultiplier).toFixed(0)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Next Tile Payout:</span>
                <span className="text-cyan-400 font-bold">{nextMultiplier}x</span>
              </div>
            </div>
          </div>

          {/* Action Button: Start or Cash Out */}
          {isPlaying ? (
            <button
              disabled={gemsFound === 0}
              onClick={() => handleCashOut()}
              className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                gemsFound > 0
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 shadow-emerald-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {gemsFound > 0
                ? `CASH OUT (₨ ${(betAmount * currentMultiplier).toFixed(0)})`
                : 'Pick a Tile...'}
            </button>
          ) : (
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/30 transition-all transform active:scale-95 cursor-pointer"
            >
              START GAME (₨ {betAmount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
