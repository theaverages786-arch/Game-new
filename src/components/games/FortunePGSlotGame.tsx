import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface FortunePGSlotGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

type Character = 'tiger' | 'rabbit' | 'ox';

const SYMBOLS = [
  { id: 'wild', icon: '🐯', name: 'Wild Tiger', val: 25 },
  { id: 'sycee', icon: '🪙', name: 'Golden Sycee', val: 15 },
  { id: 'envelope', icon: '🧧', name: 'Red Envelope', val: 10 },
  { id: 'firecracker', icon: '🧨', name: 'Firecracker', val: 8 },
  { id: 'orange', icon: '🍊', name: 'Lucky Orange', val: 5 },
  { id: 'pot', icon: '🏺', name: 'Treasure Pot', val: 12 },
];

export const FortunePGSlotGame: React.FC<FortunePGSlotGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [character, setCharacter] = useState<Character>('tiger');
  const [reels, setReels] = useState<string[][]>([
    ['🐯', '🧧', '🪙'],
    ['🧨', '🐯', '🍊'],
    ['🪙', '🏺', '🐯'],
  ]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [is10xActive, setIs10xActive] = useState<boolean>(false);

  const chips = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleSpin = () => {
    if (userBalance < betAmount) {
      alert('Insufficient balance to spin!');
      return;
    }

    soundService.playSpin();
    onUpdateBalance(userBalance - betAmount);
    setIsSpinning(true);
    setLastWin(0);
    setIs10xActive(false);

    setTimeout(() => {
      let winMult = 0;
      const rand = Math.random();
      const shouldWin =
        adminSettings.rtpMode === 'high_win'
          ? rand < 0.65
          : adminSettings.rtpMode === 'house_edge'
          ? rand < 0.25
          : rand < 0.42;

      if (shouldWin) {
        // Fortune Tiger feature: full screen or line match
        const isSuper10x = Math.random() < 0.25;
        if (isSuper10x) {
          setIs10xActive(true);
          winMult = +(25 + Math.random() * 75).toFixed(1);
          setReels([
            ['🐯', '🐯', '🐯'],
            ['🐯', '🐯', '🐯'],
            ['🐯', '🐯', '🐯'],
          ]);
        } else {
          winMult = +(2.5 + Math.random() * 12.0).toFixed(1);
          setReels([
            ['🪙', '🪙', '🪙'],
            ['🧨', '🐯', '🍊'],
            ['🧧', '🏺', '🧧'],
          ]);
        }
      } else {
        const pick = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon;
        setReels([
          [pick(), pick(), pick()],
          [pick(), pick(), pick()],
          [pick(), pick(), pick()],
        ]);
      }

      const win = Math.round(betAmount * winMult);
      if (win > 0) {
        soundService.playWin();
        triggerWinConfetti();
        onUpdateBalance(userBalance - betAmount + win);
        setLastWin(win);
      } else {
        soundService.playLose();
      }

      onRecordBet(
        'pg_fortune_tiger',
        character === 'tiger'
          ? 'PG Fortune Tiger'
          : character === 'rabbit'
          ? 'PG Fortune Rabbit'
          : 'PG Fortune OX',
        betAmount,
        win,
        winMult
      );
      setIsSpinning(false);
    }, 1300);
  };

  return (
    <div className="bg-[#1b080b] border border-amber-500/40 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-rose-900/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>
                {character === 'tiger'
                  ? '🐯 PG Fortune Tiger'
                  : character === 'rabbit'
                  ? '🐰 PG Fortune Rabbit'
                  : '🐂 PG Fortune OX'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black">
                PG SOFT
              </span>
            </h2>
            <span className="text-[10px] text-yellow-200">10x Multiplier Full Screen Respins!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Character Switcher */}
      <div className="flex items-center justify-center gap-2 bg-[#2d0f14] p-1.5 rounded-2xl border border-rose-800">
        {[
          { id: 'tiger', name: '🐯 Fortune Tiger', color: 'from-amber-500 to-yellow-400' },
          { id: 'rabbit', name: '🐰 Fortune Rabbit', color: 'from-purple-500 to-pink-400' },
          { id: 'ox', name: '🐂 Fortune OX', color: 'from-orange-500 to-red-500' },
        ].map((c) => (
          <button
            key={c.id}
            onClick={() => {
              soundService.playClick();
              setCharacter(c.id as any);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              character === c.id
                ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* PG Soft Styled Slot Machine Field */}
      <div className="relative bg-gradient-to-b from-[#4a1017] via-[#2c080d] to-[#140306] border-2 border-amber-400/80 rounded-3xl p-4 sm:p-6 shadow-2xl">
        {/* Multiplier Header Banner */}
        <div className="flex items-center justify-between bg-black/50 border border-amber-400/40 rounded-xl px-3 py-1.5 mb-3">
          <span className="text-xs font-bold text-yellow-300">FULL REEL MULTIPLIER</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded font-mono ${is10xActive ? 'bg-amber-400 text-slate-950 animate-bounce' : 'text-amber-400'}`}>
            x10 BOOST
          </span>
        </div>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
          {reels.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2">
              {col.map((sym, rIdx) => (
                <div
                  key={rIdx}
                  className={`aspect-square rounded-2xl bg-gradient-to-b from-[#6b141f] to-[#3a0a10] border border-amber-300/50 flex items-center justify-center text-4xl sm:text-5xl shadow-inner ${
                    isSpinning ? 'animate-pulse blur-[1px]' : ''
                  }`}
                >
                  {sym}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Win Alert */}
        {lastWin > 0 && (
          <div className="mt-3 text-center py-2 bg-gradient-to-r from-amber-500/30 to-yellow-400/30 border border-amber-400 rounded-xl animate-bounce">
            <span className="text-base sm:text-lg font-black text-amber-300 drop-shadow">
              🎊 BIG WIN: ₨ {lastWin.toLocaleString()}!
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {/* Chip Selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {chips.map((c) => (
            <button
              key={c}
              disabled={isSpinning}
              onClick={() => {
                soundService.playClick();
                setBetAmount(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                betAmount === c
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ₨ {c}
            </button>
          ))}
        </div>

        {/* Spin Button */}
        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-xl hover:from-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>SPIN (₨ {betAmount})</span>
        </button>
      </div>
    </div>
  );
};
