import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Zap, Flame, Info, RotateCcw, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration } from '../../services/gameEngine';

interface SuperAceGameProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface SymbolDef {
  id: string;
  name: string;
  payout: number;
  icon: string;
  color: string;
  isGolden?: boolean;
}

const BASE_SYMBOLS: SymbolDef[] = [
  { id: 'ace', name: 'Ace of Spades', payout: 5.0, icon: '♠️ A', color: 'text-amber-300' },
  { id: 'king', name: 'King of Hearts', payout: 3.5, icon: '♥️ K', color: 'text-rose-400' },
  { id: 'queen', name: 'Queen of Clubs', payout: 2.5, icon: '♣️ Q', color: 'text-cyan-300' },
  { id: 'jack', name: 'Jack of Diamonds', payout: 2.0, icon: '♦️ J', color: 'text-emerald-400' },
  { id: 'ten', name: 'Ten', payout: 1.2, icon: '🔟', color: 'text-yellow-400' },
  { id: 'joker', name: 'Joker Wild', payout: 10.0, icon: '🃏', color: 'text-purple-300' },
];

export const SuperAceGame: React.FC<SuperAceGameProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [lastWin, setLastWin] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);
  const [soundOn, setSoundOn] = useState(soundService.isEnabled());

  // 5 reels x 4 rows
  const [grid, setGrid] = useState<SymbolDef[][]>([
    [BASE_SYMBOLS[0], BASE_SYMBOLS[1], BASE_SYMBOLS[2], BASE_SYMBOLS[3]],
    [BASE_SYMBOLS[1], BASE_SYMBOLS[0], BASE_SYMBOLS[4], BASE_SYMBOLS[2]],
    [BASE_SYMBOLS[5], BASE_SYMBOLS[2], BASE_SYMBOLS[0], BASE_SYMBOLS[1]],
    [BASE_SYMBOLS[3], BASE_SYMBOLS[4], BASE_SYMBOLS[1], BASE_SYMBOLS[0]],
    [BASE_SYMBOLS[2], BASE_SYMBOLS[3], BASE_SYMBOLS[0], BASE_SYMBOLS[4]],
  ]);

  const [winningCells, setWinningCells] = useState<{ reel: number; row: number }[]>([]);

  const betOptions = [10, 20, 50, 100, 200, 500, 1000, 2500, 5000];

  const getRandomSymbol = (canBeGolden: boolean = true): SymbolDef => {
    const s = BASE_SYMBOLS[Math.floor(Math.random() * (BASE_SYMBOLS.length - 1))];
    const isGold = canBeGolden && Math.random() < 0.18;
    return {
      ...s,
      isGolden: isGold,
    };
  };

  const handleSpin = () => {
    if (spinning) return;
    if (userBalance < bet) {
      alert('Insufficient Balance! Please top up.');
      setAutoSpin(false);
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - bet);
    setSpinning(true);
    setWinningCells([]);
    setWinMessage(null);
    setComboMultiplier(1);

    // Initial spin animation
    let stepCount = 0;
    const spinInterval = setInterval(() => {
      soundService.playSpinTick();
      setGrid(
        Array(5)
          .fill(0)
          .map(() => [
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol(),
            getRandomSymbol(),
          ])
      );
      stepCount++;
      if (stepCount >= 10) {
        clearInterval(spinInterval);
        resolveSpin();
      }
    }, 80);
  };

  const resolveSpin = () => {
    // Generate final grid governed by master outcome & RTP
    const isWin = shouldPlayerWin('slots_super_ace', adminSettings, 0.45);

    let finalGrid: SymbolDef[][];

    if (isWin) {
      const matchSymbol = BASE_SYMBOLS[Math.floor(Math.random() * 4)];
      finalGrid = Array(5)
        .fill(0)
        .map((_, rIdx) => [
          rIdx < 3 ? matchSymbol : getRandomSymbol(),
          getRandomSymbol(),
          getRandomSymbol(),
          getRandomSymbol(),
        ]);
    } else {
      finalGrid = Array(5)
        .fill(0)
        .map(() => [
          getRandomSymbol(),
          getRandomSymbol(),
          getRandomSymbol(),
          getRandomSymbol(),
        ]);
    }

    setGrid(finalGrid);

    // Check matches on line 1
    const firstSym = finalGrid[0][0].id;
    let matchLen = 1;
    for (let r = 1; r < 5; r++) {
      if (finalGrid[r][0].id === firstSym || finalGrid[r][0].id === 'joker') {
        matchLen++;
      } else {
        break;
      }
    }

    if (matchLen >= 3) {
      const symDef = BASE_SYMBOLS.find((s) => s.id === firstSym) || BASE_SYMBOLS[0];
      const mult = symDef.payout * (matchLen === 5 ? 3 : matchLen === 4 ? 1.8 : 1);
      const totalWin = Math.round(bet * mult * comboMultiplier);

      const winning = [];
      for (let i = 0; i < matchLen; i++) {
        winning.push({ reel: i, row: 0 });
      }
      setWinningCells(winning);
      setLastWin(totalWin);
      setComboMultiplier((prev) => Math.min(5, prev + 1));

      soundService.playWin();
      onUpdateBalance(userBalance - bet + totalWin);
      onRecordBet('slots_super_ace', 'Super Ace 777', bet, totalWin, Number((totalWin / bet).toFixed(2)));

      if (totalWin >= bet * 5) {
        soundService.playJackpot();
        setWinMessage(`🔥 MEGA ELIMINATION WIN: ₨ ${totalWin.toLocaleString()}!`);
      } else {
        setWinMessage(`SUPER ACE WIN: ₨ ${totalWin.toLocaleString()}!`);
      }
    } else {
      setLastWin(0);
      onRecordBet('slots_super_ace', 'Super Ace 777', bet, 0, 0);
    }

    setSpinning(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1200);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning]);

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wide">
                SUPER ACE 777
              </h2>
              <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded">
                JILI HOT
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Card Elimination &bull; Multiplier x5</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
            <span className="text-[10px] text-slate-400 block">Balance</span>
            <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
          </div>
          <button
            onClick={() => {
              const res = soundService.toggleSound();
              setSoundOn(res);
            }}
            className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Elimination Combo Multiplier Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { level: 1, text: 'x1' },
          { level: 2, text: 'x2' },
          { level: 3, text: 'x3' },
          { level: 4, text: 'x5' },
        ].map((m) => {
          const isActive = comboMultiplier >= m.level;
          return (
            <div
              key={m.level}
              className={`py-2 rounded-xl text-center border font-black transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-400 border-amber-300 text-slate-950 shadow-lg scale-102'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500'
              }`}
            >
              <div className="text-[10px] uppercase">Combo Level {m.level}</div>
              <div className="text-base font-extrabold">{m.text}</div>
            </div>
          );
        })}
      </div>

      {/* Main 5x4 Slot Grid */}
      <div className="bg-gradient-to-b from-[#141a2e] to-[#0a0e1a] border-2 border-amber-500/40 rounded-3xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {grid.map((reel, rIdx) => (
            <div key={rIdx} className="space-y-2">
              {reel.map((sym, rowIdx) => {
                const isWinning = winningCells.some((c) => c.reel === rIdx && c.row === rowIdx);
                return (
                  <div
                    key={rowIdx}
                    className={`h-16 sm:h-20 rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${
                      isWinning
                        ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-200 text-slate-950 font-black shadow-lg animate-pulse scale-105'
                        : sym.isGolden
                        ? 'bg-gradient-to-b from-yellow-700/40 to-amber-900/60 border-yellow-400 text-yellow-200'
                        : 'bg-slate-900/90 border-slate-800 text-white'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl drop-shadow">{sym.icon}</span>
                    <span className="text-[9px] font-bold mt-0.5 opacity-80">{sym.name}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win Banner Floating */}
        {winMessage && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-90">
            <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-1 rounded-3xl shadow-2xl">
              <div className="bg-[#0b101d] px-6 py-4 rounded-[22px] text-center space-y-2">
                <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
                <h3 className="text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wide">
                  {winMessage}
                </h3>
                <p className="text-xs text-slate-300">Multiplier applied &bull; Balance updated</p>
                <button
                  onClick={() => setWinMessage(null)}
                  className="mt-2 px-5 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Betting Controls & Spin Button */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        {/* Bet presets */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Bet (₨):</span>
          <div className="flex gap-1.5">
            {betOptions.map((b) => (
              <button
                key={b}
                disabled={spinning}
                onClick={() => {
                  soundService.playChip();
                  setBet(b);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  bet === b
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            disabled={spinning}
            onClick={() => {
              soundService.playClick();
              setAutoSpin(!autoSpin);
            }}
            className={`px-4 py-3.5 rounded-2xl font-black text-xs transition cursor-pointer ${
              autoSpin
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {autoSpin ? 'STOP AUTO' : 'AUTO SPIN'}
          </button>

          <button
            disabled={spinning}
            onClick={handleSpin}
            className={`flex-1 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition shadow-xl cursor-pointer ${
              spinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-500/30 active:scale-95'
            }`}
          >
            {spinning ? 'SPINNING CARDS...' : `SPIN (₨ ${bet.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
};
