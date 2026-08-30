import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, Flame, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface BoxingKingProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

const BOXING_SYMBOLS = [
  { id: 'champ_belt', label: '🥊', name: 'Boxing King Wild', mult: 100, color: 'from-amber-400 to-yellow-600' },
  { id: 'belt', label: '🏆', name: 'Gold Belt', mult: 60, color: 'from-yellow-500 to-amber-600' },
  { id: 'red_glove', label: '🧤', name: 'Power Gloves', mult: 40, color: 'from-red-600 to-rose-700' },
  { id: 'bell', label: '🔔', name: 'Round Bell', mult: 25, color: 'from-blue-600 to-indigo-700' },
  { id: 'shoes', label: '👟', name: 'Ring Shoes', mult: 15, color: 'from-emerald-600 to-teal-700' },
  { id: 'punch', label: '💥', name: 'KO Punch', mult: 10, color: 'from-orange-500 to-amber-600' },
];

export const BoxingKingSlotGame: React.FC<BoxingKingProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['champ_belt', 'belt', 'red_glove'],
    ['bell', 'shoes', 'punch'],
    ['belt', 'champ_belt', 'belt'],
  ]);
  const [lastWin, setLastWin] = useState(0);
  const [combo, setCombo] = useState(1);

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
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      const rtp = adminSettings?.rtpRate ?? 92;
      const willWin = Math.random() * 100 < rtp;

      let finalReels: string[][];
      let winAmount = 0;

      if (willWin) {
        const winSym = BOXING_SYMBOLS[Math.floor(Math.random() * BOXING_SYMBOLS.length)];
        finalReels = [
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
        ];
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        winAmount = bet * winSym.mult * (nextCombo > 3 ? 2 : 1);
      } else {
        finalReels = [
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        ];
        setCombo(1);
      }

      setReels(finalReels);
      setIsSpinning(false);

      if (winAmount > 0) {
        setLastWin(winAmount);
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('boxing_king', 'Boxing King Slots', bet, winAmount, +(winAmount / bet).toFixed(2));
        soundService.playWin();
      } else {
        onRecordBet('boxing_king', 'Boxing King Slots', bet, 0, 0);
      }
    }, 1100);
  };

  const getRandomSymbol = () => BOXING_SYMBOLS[Math.floor(Math.random() * BOXING_SYMBOLS.length)].id;
  const getSymbolData = (id: string) => BOXING_SYMBOLS.find(s => s.id === id) || BOXING_SYMBOLS[0];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1f0b07] via-[#36130c] to-[#120503] text-slate-100 rounded-3xl p-3 sm:p-5 border border-red-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-800/60 pb-3">
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
            <span>🥊</span>
            <span>BOXING KING SLOTS</span>
          </h1>
          <span className="text-[10px] text-red-300 font-medium">KO Free Spin Combos • Wild Belt Multipliers</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Boxing Ring Arena */}
      <div className="my-auto bg-[#140604] border-4 border-red-600/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[360px] relative">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-xl border border-red-500/40 text-xs font-black text-red-400">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            <span>KO COMBO: {combo}x</span>
          </div>
          <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/40 text-xs font-black text-emerald-400 font-mono">
            WIN: Rs {lastWin.toLocaleString()}
          </div>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#0a0302] p-3 rounded-2xl border-2 border-red-600/60 shadow-inner max-w-sm w-full">
          {reels.map((col, colIdx) => (
            <div key={colIdx} className="space-y-2">
              {col.map((symId, rowIdx) => {
                const s = getSymbolData(symId);
                return (
                  <div
                    key={rowIdx}
                    className={`h-20 sm:h-24 rounded-2xl bg-gradient-to-b ${s.color} border-2 border-red-300/30 flex flex-col items-center justify-center shadow-lg transition-transform ${
                      isSpinning ? 'scale-95 blur-[1px]' : 'scale-100'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow">{s.label}</span>
                    <span className="text-[9px] font-black text-white uppercase drop-shadow mt-1">
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Win Modal */}
        {lastWin > 0 && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 z-20 animate-fade-in">
            <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-black text-red-400 uppercase tracking-widest">
              KNOCKOUT CHAMPION WIN!
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono my-2">
              +Rs {lastWin.toLocaleString()}
            </div>
            <button
              onClick={() => setLastWin(0)}
              className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer"
            >
              Claim Championship
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#0f0402] border border-red-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
          className="px-10 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : `Spin (Rs ${bet})`}</span>
        </button>
      </div>
    </div>
  );
};
