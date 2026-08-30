import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, Sparkles, Flame } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface FruitPartyProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

const FRUIT_SYMBOLS = [
  { id: 'seven', label: '7️⃣', name: 'Lucky 7', mult: 100, color: 'from-red-600 to-rose-700' },
  { id: 'star', label: '⭐', name: 'Golden Star', mult: 50, color: 'from-amber-400 to-yellow-600' },
  { id: 'bell', label: '🔔', name: 'Golden Bell', mult: 30, color: 'from-yellow-500 to-amber-600' },
  { id: 'watermelon', label: '🍉', name: 'Watermelon', mult: 20, color: 'from-emerald-600 to-green-700' },
  { id: 'grapes', label: '🍇', name: 'Grapes', mult: 15, color: 'from-purple-600 to-indigo-700' },
  { id: 'plum', label: '🫐', name: 'Plum', mult: 10, color: 'from-blue-600 to-indigo-800' },
  { id: 'orange', label: '🍊', name: 'Orange', mult: 8, color: 'from-orange-500 to-amber-600' },
  { id: 'cherry', label: '🍒', name: 'Cherry', mult: 5, color: 'from-rose-500 to-red-700' },
];

export const FruitPartySlotGame: React.FC<FruitPartyProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(20);
  const [isSpinning, setIsSpinning] = useState(false);
  const [grid, setGrid] = useState<string[][]>([
    ['seven', 'watermelon', 'cherry'],
    ['star', 'bell', 'grapes'],
    ['orange', 'seven', 'plum'],
  ]);
  const [lastWin, setLastWin] = useState(0);
  const [multiplier, setMultiplier] = useState(1);

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
      setGrid([
        [getRandomFruit(), getRandomFruit(), getRandomFruit()],
        [getRandomFruit(), getRandomFruit(), getRandomFruit()],
        [getRandomFruit(), getRandomFruit(), getRandomFruit()],
      ]);
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      const rtp = adminSettings?.rtpRate ?? 92;
      const willWin = Math.random() * 100 < rtp;

      let finalGrid: string[][];
      let winAmount = 0;

      if (willWin) {
        const winSym = FRUIT_SYMBOLS[Math.floor(Math.random() * FRUIT_SYMBOLS.length)];
        finalGrid = [
          [winSym.id, getRandomFruit(), getRandomFruit()],
          [winSym.id, getRandomFruit(), getRandomFruit()],
          [winSym.id, getRandomFruit(), getRandomFruit()],
        ];
        const mult = winSym.mult;
        const randomBonusMult = Math.random() > 0.7 ? 2 : 1;
        setMultiplier(randomBonusMult);
        winAmount = bet * mult * randomBonusMult;
      } else {
        finalGrid = [
          [getRandomFruit(), getRandomFruit(), getRandomFruit()],
          [getRandomFruit(), getRandomFruit(), getRandomFruit()],
          [getRandomFruit(), getRandomFruit(), getRandomFruit()],
        ];
        setMultiplier(1);
      }

      setGrid(finalGrid);
      setIsSpinning(false);

      if (winAmount > 0) {
        setLastWin(winAmount);
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('fruit_party', 'Fruit Party Classic', bet, winAmount, +(winAmount / bet).toFixed(2));
        soundService.playWin();
      } else {
        onRecordBet('fruit_party', 'Fruit Party Classic', bet, 0, 0);
      }
    }, 1100);
  };

  const getRandomFruit = () => FRUIT_SYMBOLS[Math.floor(Math.random() * FRUIT_SYMBOLS.length)].id;
  const getFruitData = (id: string) => FRUIT_SYMBOLS.find(s => s.id === id) || FRUIT_SYMBOLS[0];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1b0521] via-[#2f0b3a] to-[#100314] text-slate-100 rounded-3xl p-3 sm:p-5 border border-fuchsia-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-fuchsia-800/60 pb-3">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-fuchsia-300 via-pink-200 to-amber-300 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>🍓</span>
            <span>FRUIT PARTY CLASSIC</span>
          </h1>
          <span className="text-[10px] text-fuchsia-300 font-medium">Lucky 7s • 100x Multipliers • Golden Bells</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="my-auto bg-[#1a0621] border-4 border-fuchsia-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[360px] relative">
        {/* Top Multiplier Banner */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 px-3 py-1 rounded-xl text-xs font-black text-white shadow">
            🎉 MULTIPLIER: {multiplier}x
          </div>

          <div className="bg-black/60 px-3 py-1 rounded-xl border border-fuchsia-500/40 text-xs font-black text-emerald-400 font-mono">
            WIN: Rs {lastWin.toLocaleString()}
          </div>
        </div>

        {/* 3x3 Fruit Reel */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-[#0d0210] p-3 rounded-2xl border-2 border-fuchsia-600/60 shadow-inner max-w-sm w-full">
          {grid.map((col, colIdx) => (
            <div key={colIdx} className="space-y-2">
              {col.map((fruitId, rowIdx) => {
                const f = getFruitData(fruitId);
                return (
                  <div
                    key={rowIdx}
                    className={`h-20 sm:h-24 rounded-2xl bg-gradient-to-b ${f.color} border-2 border-white/20 flex flex-col items-center justify-center shadow-lg transition-transform ${
                      isSpinning ? 'scale-95 blur-[1px]' : 'scale-100'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow">{f.label}</span>
                    <span className="text-[9px] font-black text-white uppercase drop-shadow mt-1">
                      {f.name}
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
            <h2 className="text-xl sm:text-2xl font-black text-pink-400 uppercase tracking-widest">
              FRUIT PARTY MEGA WIN!
            </h2>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono my-2">
              +Rs {lastWin.toLocaleString()}
            </div>
            <button
              onClick={() => setLastWin(0)}
              className="px-6 py-2 bg-gradient-to-r from-fuchsia-400 to-pink-400 text-slate-950 font-black rounded-xl text-xs shadow-lg cursor-pointer"
            >
              Collect
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-[#120317] border border-fuchsia-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
                  ? 'bg-fuchsia-400 text-slate-950 border-fuchsia-300 shadow-md scale-105'
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
          className="px-10 py-3 rounded-2xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>{isSpinning ? 'Spinning...' : `Spin (Rs ${bet})`}</span>
        </button>
      </div>
    </div>
  );
};
