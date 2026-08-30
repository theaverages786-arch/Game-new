import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, Sparkles, Gem } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface AztecGemsProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

const AZTEC_SYMBOLS = [
  { id: 'mask', label: '👺', name: 'Aztec Wild', mult: 50, color: 'from-amber-500 to-yellow-600' },
  { id: 'ruby', label: '💎', name: 'Ruby Gem', mult: 30, color: 'from-red-600 to-rose-700' },
  { id: 'emerald', label: '🟢', name: 'Emerald', mult: 20, color: 'from-emerald-600 to-green-700' },
  { id: 'sapphire', label: '🔷', name: 'Sapphire', mult: 15, color: 'from-blue-600 to-indigo-700' },
  { id: 'amethyst', label: '🟣', name: 'Amethyst', mult: 10, color: 'from-purple-600 to-fuchsia-700' },
  { id: 'topaz', label: '🟡', name: 'Topaz', mult: 5, color: 'from-yellow-500 to-amber-600' },
];

const MULTIPLIERS = [1, 2, 3, 5, 10, 15];

export const AztecGemsSlotGame: React.FC<AztecGemsProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['mask', 'ruby', 'emerald'],
    ['sapphire', 'mask', 'amethyst'],
    ['topaz', 'ruby', 'emerald'],
  ]);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [lastWin, setLastWin] = useState(0);

  const bets = [5, 10, 20, 50, 100, 200, 500, 1000];

  const handleSpin = () => {
    if (isSpinning) return;
    if (userBalance < bet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    setIsSpinning(true);
    setLastWin(0);
    soundService.playSpinTick();

    const interval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      ]);
      setCurrentMultiplier(MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)]);
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      const rtp = adminSettings?.rtpRate ?? 92;
      const willWin = Math.random() * 100 < rtp;

      let finalReels: string[][];
      let finalMult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];
      let winAmount = 0;

      if (willWin) {
        const winningSym = AZTEC_SYMBOLS[Math.floor(Math.random() * AZTEC_SYMBOLS.length)];
        finalReels = [
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
          [winningSym.id, getRandomSymbol(), getRandomSymbol()],
        ];
        winAmount = bet * winningSym.mult * finalMult;
      } else {
        finalReels = [
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        ];
      }

      setReels(finalReels);
      setCurrentMultiplier(finalMult);
      setIsSpinning(false);

      if (winAmount > 0) {
        setLastWin(winAmount);
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('aztec_gems', 'Aztec Gems Deluxe', bet, winAmount, +(winAmount / bet).toFixed(2));
        soundService.playWin();
      } else {
        onRecordBet('aztec_gems', 'Aztec Gems Deluxe', bet, 0, 0);
      }
    }, 1100);
  };

  const getRandomSymbol = () => AZTEC_SYMBOLS[Math.floor(Math.random() * AZTEC_SYMBOLS.length)].id;
  const getSymbolData = (id: string) => AZTEC_SYMBOLS.find(s => s.id === id) || AZTEC_SYMBOLS[0];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1c1803] via-[#332c07] to-[#120f02] text-slate-100 rounded-3xl p-3 sm:p-5 border border-amber-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>👺</span>
            <span>AZTEC GEMS DELUXE</span>
          </h1>
          <span className="text-[10px] text-amber-300 font-medium">3x3 Reels + 4th Multiplier Reel (Up to 15x)</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Aztec Temple Slot Grid */}
      <div className="my-auto bg-[#171302] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[360px] relative">
        <div className="flex items-center justify-between w-full mb-3">
          <span className="text-xs font-bold text-amber-300">🏛️ AZTEC GOLD TREASURE</span>
          <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/40 text-xs font-black text-emerald-400 font-mono">
            WIN: Rs {lastWin.toLocaleString()}
          </div>
        </div>

        {/* 3 Main Reels + 4th Multiplier Reel */}
        <div className="flex items-center gap-3 max-w-md w-full justify-center">
          {/* Main 3x3 Reels */}
          <div className="grid grid-cols-3 gap-2 bg-[#0c0a01] p-3 rounded-2xl border-2 border-amber-600/60 shadow-inner flex-1">
            {reels.map((col, colIdx) => (
              <div key={colIdx} className="space-y-2">
                {col.map((symId, rowIdx) => {
                  const s = getSymbolData(symId);
                  return (
                    <div
                      key={rowIdx}
                      className={`h-20 rounded-2xl bg-gradient-to-b ${s.color} border-2 border-amber-300/40 flex flex-col items-center justify-center shadow-lg transition-transform ${
                        isSpinning ? 'scale-95 blur-[1px]' : 'scale-100'
                      }`}
                    >
                      <span className="text-3xl drop-shadow">{s.label}</span>
                      <span className="text-[9px] font-black text-white uppercase drop-shadow mt-1">
                        {s.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 4th Reel: Multipliers */}
          <div className="w-20 bg-[#0c0a01] p-2 rounded-2xl border-2 border-yellow-400 shadow-inner flex flex-col items-center justify-center space-y-2">
            <span className="text-[9px] font-black text-amber-400 uppercase">MULT</span>
            <div className="h-20 w-full rounded-2xl bg-gradient-to-b from-amber-400 to-yellow-600 border-2 border-white flex flex-col items-center justify-center shadow-lg">
              <span className="text-2xl font-black text-slate-950 font-mono">
                {currentMultiplier}x
              </span>
            </div>
            <span className="text-[8px] text-slate-400 font-bold text-center">UP TO 15X</span>
          </div>
        </div>

        {/* Win Modal */}
        {lastWin > 0 && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-widest">
              AZTEC TEMPLE BIG WIN!
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono my-2">
              +Rs {lastWin.toLocaleString()}
            </div>
            <button
              onClick={() => setLastWin(0)}
              className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer"
            >
              Collect
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#120f01] border border-amber-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {bets.map(b => (
            <button
              key={b}
              onClick={() => {
                soundService.playChip();
                setBet(b);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer border ${
                bet === b
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Rs {b}
            </button>
          ))}
        </div>

        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="px-10 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : `Spin (Rs ${bet})`}</span>
        </button>
      </div>
    </div>
  );
};
