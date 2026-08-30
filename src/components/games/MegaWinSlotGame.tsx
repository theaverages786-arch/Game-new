import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Sparkles, Flame, DollarSign } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface MegaWinSlotProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

const SYMBOLS = [
  { id: 'diamond', label: '💎', name: 'Diamond Wild', mult: 200, color: 'from-cyan-500 to-blue-600' },
  { id: 'seven', label: '7️⃣', name: 'Mega 7', mult: 100, color: 'from-red-600 to-rose-700' },
  { id: 'goldbar', label: '🪙', name: 'Gold Bars', mult: 50, color: 'from-amber-400 to-yellow-600' },
  { id: 'crown', label: '👑', name: 'Crown', mult: 30, color: 'from-yellow-500 to-amber-600' },
  { id: 'bell', label: '🔔', name: 'Bell', mult: 20, color: 'from-orange-500 to-amber-600' },
  { id: 'cherry', label: '🍒', name: 'Cherry', mult: 10, color: 'from-rose-500 to-red-700' },
];

export const MegaWinSlotGame: React.FC<MegaWinSlotProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(25);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>([
    ['diamond', 'seven', 'crown'],
    ['goldbar', 'bell', 'cherry'],
    ['crown', 'diamond', 'seven'],
    ['bell', 'goldbar', 'cherry'],
    ['seven', 'crown', 'diamond'],
  ]);
  const [lastWin, setLastWin] = useState(0);
  const [jackpot, setJackpot] = useState(888888);

  const bets = [10, 25, 50, 100, 250, 500, 1000];

  const handleSpin = () => {
    if (isSpinning) return;
    if (userBalance < bet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);
    setJackpot(prev => prev + Math.floor(bet * 0.05));

    setIsSpinning(true);
    setLastWin(0);
    soundService.playSpinTick();

    const interval = setInterval(() => {
      setReels([
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
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
        const winSym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        finalReels = [
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
          [winSym.id, getRandomSymbol(), getRandomSymbol()],
        ];
        winAmount = bet * winSym.mult;
      } else {
        finalReels = [
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
          [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
        ];
      }

      setReels(finalReels);
      setIsSpinning(false);

      if (winAmount > 0) {
        setLastWin(winAmount);
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('mega_win', 'Mega Win 5-Reel Slots', bet, winAmount, +(winAmount / bet).toFixed(2));
        soundService.playWin();
      } else {
        onRecordBet('mega_win', 'Mega Win 5-Reel Slots', bet, 0, 0);
      }
    }, 1200);
  };

  const getRandomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].id;
  const getSymbolData = (id: string) => SYMBOLS.find(s => s.id === id) || SYMBOLS[0];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0c031c] via-[#1a0836] to-[#070110] text-slate-100 rounded-3xl p-3 sm:p-5 border border-purple-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-800/60 pb-3">
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
            <span>💎</span>
            <span>MEGA WIN 5-REEL SLOTS</span>
          </h1>
          <span className="text-[10px] text-purple-300 font-medium">5 Reels • 243 Ways to Win • Mega Progressive Jackpot</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Jackpot & 5-Reel Grid */}
      <div className="my-auto bg-[#100324] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[360px] relative">
        {/* Progressive Jackpot Ticker */}
        <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 px-6 py-1.5 rounded-full text-slate-950 font-black text-xs sm:text-sm shadow-xl flex items-center gap-2 mb-3 animate-pulse">
          <Trophy className="w-4 h-4 text-yellow-900" />
          <span>GRAND JACKPOT: Rs {jackpot.toLocaleString()}</span>
        </div>

        {/* 5-Reel Grid */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#080112] p-2.5 rounded-2xl border-2 border-purple-600/60 shadow-inner w-full max-w-lg">
          {reels.map((col, colIdx) => (
            <div key={colIdx} className="space-y-1.5">
              {col.map((symId, rowIdx) => {
                const s = getSymbolData(symId);
                return (
                  <div
                    key={rowIdx}
                    className={`h-18 sm:h-22 rounded-xl bg-gradient-to-b ${s.color} border border-white/20 flex flex-col items-center justify-center shadow-lg transition-transform ${
                      isSpinning ? 'scale-95 blur-[1px]' : 'scale-100'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl drop-shadow">{s.label}</span>
                    <span className="text-[8px] font-black text-white uppercase drop-shadow mt-0.5 truncate max-w-[50px]">
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
            <h2 className="text-xl sm:text-2xl font-black text-amber-400 uppercase tracking-widest">
              MEGA JACKPOT WIN!
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono my-2">
              +Rs {lastWin.toLocaleString()}
            </div>
            <button
              onClick={() => setLastWin(0)}
              className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer"
            >
              Collect Coins
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#090114] border border-purple-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
