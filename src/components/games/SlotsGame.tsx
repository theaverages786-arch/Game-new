import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCw, 
  Sparkles, 
  Zap, 
  Volume2, 
  HelpCircle, 
  ArrowLeft,
  Trophy,
  Coins
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration } from '../../services/gameEngine';

interface SlotsGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

// Slot Symbols and payouts
const SYMBOLS = [
  { id: '777', label: '7️⃣', name: 'Triple 7', payout3: 50, payout5: 500, color: 'text-amber-400' },
  { id: 'diamond', label: '💎', name: 'Diamond', payout3: 25, payout5: 200, color: 'text-cyan-400' },
  { id: 'crown', label: '👑', name: 'Crown', payout3: 15, payout5: 100, color: 'text-yellow-400' },
  { id: 'bell', label: '🔔', name: 'Golden Bell', payout3: 10, payout5: 50, color: 'text-amber-300' },
  { id: 'bar', label: '🍫', name: 'BAR Gold', payout3: 8, payout5: 30, color: 'text-rose-400' },
  { id: 'cherry', label: '🍒', name: 'Lucky Cherry', payout3: 5, payout5: 20, color: 'text-red-500' },
  { id: 'lemon', label: '🍋', name: 'Golden Lemon', payout3: 3, payout5: 10, color: 'text-yellow-300' },
];

export const SlotsGame: React.FC<SlotsGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [reelsCount, setReelsCount] = useState<3 | 5>(3);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAutoSpin, setIsAutoSpin] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['777', 'diamond', 'crown'],
    ['777', '777', 'diamond'],
    ['777', 'crown', 'bell'],
  ]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [showPaytable, setShowPaytable] = useState(false);
  const [jackpotAmount, setJackpotAmount] = useState(adminSettings.slotsJackpotPool);

  const betOptions = [10, 20, 50, 100, 200, 500, 1000, 2000];

  // Jackpot gradual ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setJackpotAmount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const getRandomSymbol = () => {
    // Check RTP setting influence
    const rand = Math.random();
    if (adminSettings.rtpMode === 'high_win') {
      if (rand < 0.35) return '777';
      if (rand < 0.6) return 'diamond';
    } else if (adminSettings.rtpMode === 'house_edge') {
      if (rand < 0.08) return '777';
    }
    const idx = Math.floor(Math.random() * SYMBOLS.length);
    return SYMBOLS[idx].id;
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < betAmount) {
      soundService.playBeep(300);
      alert('Insufficient balance! Please recharge or reload demo balance.');
      setIsAutoSpin(false);
      return;
    }

    soundService.playClick();
    setIsSpinning(true);
    setLastWin(null);
    setWinMessage(null);

    const spinDuration = isTurbo ? 220 : 1200;
    const intervalTick = isTurbo ? 35 : 80;

    let elapsed = 0;
    const tickInterval = setInterval(() => {
      soundService.playSpinTick();
      // Animate random intermediate symbols
      const animatedReels = Array(reelsCount)
        .fill(0)
        .map(() => [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
      setReels(animatedReels);
      elapsed += intervalTick;

      if (elapsed >= spinDuration) {
        clearInterval(tickInterval);
        finalizeSpin();
      }
    }, intervalTick);
  };

  const finalizeSpin = () => {
    // Generate final outcome
    let finalSymbols: string[][] = [];

    // Check if Admin Forced Specific Slots Result
    if (adminSettings.forcedResults?.slots && adminSettings.forcedResults.slots !== 'random') {
      const forced = adminSettings.forcedResults.slots;
      if (forced === '777_jackpot') {
        finalSymbols = Array(reelsCount)
          .fill(0)
          .map(() => [getRandomSymbol(), '777', getRandomSymbol()]);
      } else if (forced === 'diamond_win') {
        finalSymbols = Array(reelsCount)
          .fill(0)
          .map(() => [getRandomSymbol(), 'diamond', getRandomSymbol()]);
      } else if (forced === 'loss') {
        finalSymbols = Array(reelsCount)
          .fill(0)
          .map((_, i) => [
            getRandomSymbol(),
            SYMBOLS[(i * 2 + 1) % SYMBOLS.length].id,
            getRandomSymbol(),
          ]);
      }
    } else {
      // Dynamic outcome governed by shouldPlayerWin
      const isWin = shouldPlayerWin('slots_777', adminSettings, 0.42);

      if (isWin) {
        // Pick a winning symbol
        const winSym = Math.random() < 0.15 ? '777' : Math.random() < 0.35 ? 'diamond' : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
        finalSymbols = Array(reelsCount)
          .fill(0)
          .map(() => [getRandomSymbol(), winSym, getRandomSymbol()]);
      } else {
        // Guaranteed mixed result
        finalSymbols = Array(reelsCount)
          .fill(0)
          .map((_, i) => [
            getRandomSymbol(),
            SYMBOLS[(i * 2 + 1) % SYMBOLS.length].id,
            getRandomSymbol(),
          ]);
      }
    }

    setReels(finalSymbols);
    setIsSpinning(false);

    // Calculate win on middle payline
    const centerLine = finalSymbols.map((col) => col[1]);
    const first = centerLine[0];
    const allMatch = centerLine.every((sym) => sym === first);

    let winAmt = 0;
    let multiplier = 0;

    if (allMatch) {
      const symObj = SYMBOLS.find((s) => s.id === first);
      multiplier = reelsCount === 3 ? (symObj?.payout3 || 5) : (symObj?.payout5 || 20);

      // Check Mega 777 Jackpot
      if (first === '777' && reelsCount === 5) {
        winAmt = betAmount * multiplier + 50000;
        setWinMessage('🔥 MEGA 777 GRAND JACKPOT HIT! 🔥');
        soundService.playJackpot();
        triggerWinConfetti();
      } else if (first === '777') {
        winAmt = betAmount * multiplier;
        setWinMessage('🌟 777 BIG WIN! 🌟');
        soundService.playJackpot();
        triggerWinConfetti();
      } else {
        winAmt = betAmount * multiplier;
        setWinMessage(`🎉 WINNER! ${symObj?.name} x${multiplier}`);
        soundService.playWin();
        triggerWinConfetti();
      }
    } else {
      // Check 2 match mini prize for 3-reels
      if (reelsCount === 3 && (centerLine[0] === centerLine[1] || centerLine[1] === centerLine[2])) {
        const matchingSym = centerLine[1];
        const symObj = SYMBOLS.find((s) => s.id === matchingSym);
        multiplier = 1.5;
        winAmt = Math.round(betAmount * 1.5);
        setWinMessage(`✨ 2-Symbol Match +${winAmt}`);
        soundService.playCoin();
      }
    }

    setLastWin(winAmt);
    onBet(betAmount, winAmt, `Slots ${reelsCount}-Reel [${centerLine.join('-')}]`);

    // Handle Autospin loop
    if (isAutoSpin) {
      setTimeout(() => {
        if (isAutoSpin) {
          handleSpin();
        }
      }, 1000);
    }
  };

  const getSymbolDisplay = (id: string) => {
    const found = SYMBOLS.find((s) => s.id === id);
    return found ? found.label : '❓';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Top Bar with Back & Jackpot */}
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

        {/* Dynamic Grand Jackpot */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/80 via-yellow-900/60 to-amber-950/80 border border-amber-400/50 rounded-2xl px-4 py-1.5 shadow-lg shadow-amber-500/20">
          <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-widest text-amber-300 font-extrabold block leading-none">
              777 Grand Jackpot
            </span>
            <span className="text-base sm:text-lg font-black text-yellow-300 font-mono tracking-wide leading-tight">
              ₨ {jackpotAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            setShowPaytable(!showPaytable);
          }}
          className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/40 transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Paytable</span>
        </button>
      </div>

      {/* Paytable Modal / Dropdown */}
      {showPaytable && (
        <div className="mb-4 bg-[#111728] border border-amber-500/40 rounded-2xl p-4 shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Paytable & Multipliers
            </h4>
            <button
              onClick={() => setShowPaytable(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {SYMBOLS.map((s) => (
              <div key={s.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex items-center gap-2">
                <span className="text-2xl">{s.label}</span>
                <div>
                  <div className="font-bold text-slate-200">{s.name}</div>
                  <div className="text-[10px] text-amber-400">3x: {s.payout3}x | 5x: {s.payout5}x</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Slot Machine Casing */}
      <div className="relative bg-gradient-to-b from-[#1b1928] via-[#0f1422] to-[#0a0d18] border-2 border-amber-500/50 rounded-3xl p-3 sm:p-6 shadow-2xl shadow-amber-500/10">
        {/* Machine Header Crown & Lights */}
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-300"
                style={{ animationDelay: `${i * 150}ms` }}
              ></span>
            ))}
          </div>

          {/* Mode Switch: 3-Reel vs 5-Reel */}
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-amber-500/30">
            <button
              onClick={() => {
                if (isSpinning) return;
                soundService.playClick();
                setReelsCount(3);
                setReels([
                  ['777', 'diamond', 'crown'],
                  ['777', '777', 'diamond'],
                  ['777', 'crown', 'bell'],
                ]);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                reelsCount === 3
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Classic 3-Reel
            </button>
            <button
              onClick={() => {
                if (isSpinning) return;
                soundService.playClick();
                setReelsCount(5);
                setReels([
                  ['777', 'diamond', 'crown'],
                  ['777', '777', 'diamond'],
                  ['777', 'crown', 'bell'],
                  ['diamond', 'bar', '777'],
                  ['crown', 'bell', 'cherry'],
                ]);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                reelsCount === 5
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mega 5-Reel
            </button>
          </div>

          <div className="flex gap-1.5">
            {[...Array(6)].map((_, i) => (
              <span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shadow-sm shadow-yellow-300"
                style={{ animationDelay: `${(5 - i) * 150}ms` }}
              ></span>
            ))}
          </div>
        </div>

        {/* Reels Frame with Center Payline marker */}
        <div className="relative bg-[#070a12] border-4 border-amber-600/60 rounded-2xl p-3 sm:p-5 shadow-inner overflow-hidden">
          {/* Middle Payline Laser Indicator */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-16 sm:h-20 bg-amber-500/10 border-y border-amber-400/40 pointer-events-none z-10 flex items-center justify-between px-1">
            <span className="text-amber-400 font-bold text-xs">▶</span>
            <span className="text-[9px] uppercase tracking-widest text-amber-300/40 font-black">PAYLINE 1</span>
            <span className="text-amber-400 font-bold text-xs">◀</span>
          </div>

          {/* Reel Columns */}
          <div
            className={`grid gap-2 sm:gap-3 ${
              reelsCount === 3 ? 'grid-cols-3' : 'grid-cols-5'
            }`}
          >
            {reels.map((col, colIdx) => (
              <div
                key={colIdx}
                className="bg-gradient-to-b from-[#131a2c] via-[#1a233b] to-[#131a2c] border border-amber-500/30 rounded-xl p-1.5 flex flex-col items-center justify-around h-44 sm:h-56 shadow-lg relative overflow-hidden"
              >
                {col.map((symId, rowIdx) => (
                  <div
                    key={rowIdx}
                    className={`flex items-center justify-center text-3xl sm:text-5xl transition-transform duration-100 ${
                      rowIdx === 1 ? 'scale-110 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]' : 'opacity-40 scale-90'
                    } ${isSpinning ? 'blur-[0.5px] scale-95' : ''}`}
                  >
                    <span>{getSymbolDisplay(symId)}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Win Overlay Notice */}
          {winMessage && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 z-20 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-3 rounded-2xl font-black text-center shadow-2xl border-2 border-white animate-bounce">
              <div className="text-sm sm:text-base tracking-wide">{winMessage}</div>
              <div className="text-xl sm:text-2xl font-mono">+₨ {lastWin?.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* Bet Selection & Action Panel */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Bet Chips */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-extrabold text-amber-400 uppercase shrink-0">Bet:</span>
            <div className="flex gap-1.5 overflow-x-auto">
              {betOptions.map((amt) => (
                <button
                  key={amt}
                  disabled={isSpinning}
                  onClick={() => {
                    soundService.playClick();
                    setBetAmount(amt);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    betAmount === amt
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  ₨ {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Control Buttons (Turbo, Auto, Spin) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
            {/* Turbo Toggle */}
            <button
              onClick={() => {
                soundService.playClick();
                setIsTurbo(!isTurbo);
              }}
              className={`py-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black border transition cursor-pointer ${
                isTurbo
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Zap className={`w-4 h-4 ${isTurbo ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span>Turbo</span>
            </button>

            {/* Auto Spin Toggle */}
            <button
              onClick={() => {
                soundService.playClick();
                if (!isAutoSpin) {
                  setIsAutoSpin(true);
                  handleSpin();
                } else {
                  setIsAutoSpin(false);
                }
              }}
              className={`py-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-black border transition cursor-pointer ${
                isAutoSpin
                  ? 'bg-rose-600/30 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <RotateCw className={`w-4 h-4 ${isAutoSpin ? 'animate-spin' : ''}`} />
              <span>{isAutoSpin ? 'Stop Auto' : 'Auto Spin'}</span>
            </button>

            {/* Big Spin Action Button */}
            <button
              disabled={isSpinning}
              onClick={handleSpin}
              className={`col-span-1 sm:col-span-2 py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-base sm:text-lg font-black tracking-wider transition-all transform active:scale-95 shadow-xl cursor-pointer ${
                isSpinning
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
              }`}
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>{isSpinning ? 'SPINNING...' : `SPIN (₨ ${betAmount})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
