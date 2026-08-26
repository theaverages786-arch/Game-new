import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface FCThreePigsGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const SYMBOLS = [
  { id: 'pig_straw', icon: '🐷', name: 'Straw Piggy', val: 10 },
  { id: 'pig_wood', icon: '🐽', name: 'Wood Piggy', val: 15 },
  { id: 'pig_brick', icon: '🐖', name: 'Brick Piggy', val: 25 },
  { id: 'wolf', icon: '🐺', name: 'Big Bad Wolf', val: 30 },
  { id: 'brick_house', icon: '🏰', name: 'Brick House', val: 20 },
  { id: 'straw_house', icon: '🛖', name: 'Straw Hut', val: 8 },
  { id: 'pot', icon: '🍲', name: 'Boiling Pot', val: 12 },
];

export const FCThreePigsGame: React.FC<FCThreePigsGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [reels, setReels] = useState<string[][]>([
    ['🐷', '🛖', '🐺'],
    ['🐽', '🐖', '🏰'],
    ['🍲', '🐷', '🐽'],
  ]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);

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

    setTimeout(() => {
      let winMult = 0;
      const rand = Math.random();
      const shouldWin =
        adminSettings.rtpMode === 'high_win'
          ? rand < 0.65
          : adminSettings.rtpMode === 'house_edge'
          ? rand < 0.25
          : rand < 0.45;

      if (shouldWin) {
        winMult = +(4.0 + Math.random() * 20.0).toFixed(1);
        setReels([
          ['🐷', '🐷', '🐷'],
          ['🏰', '🐖', '🏰'],
          ['🐺', '🍲', '🐺'],
        ]);
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

      onRecordBet('fc_slot', 'FC Three Little Pigs', betAmount, win, winMult);
      setIsSpinning(false);
    }, 1100);
  };

  return (
    <div className="bg-[#140b24] border border-pink-500/40 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-pink-900/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🐷 FC Three Little Pigs</span>
              <span className="px-1.5 py-0.5 rounded bg-pink-600 text-white text-[9px] font-black">
                FC SLOT
              </span>
            </h2>
            <span className="text-[10px] text-pink-300">Wolf Free Spins &amp; Brick House Jackpots!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-[#2e1047] via-[#1b082c] to-[#0d0217] border-2 border-pink-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
          {reels.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2">
              {col.map((sym, rIdx) => (
                <div
                  key={rIdx}
                  className={`aspect-square rounded-2xl bg-gradient-to-b from-[#4d1975] to-[#25083b] border border-pink-400/40 flex items-center justify-center text-4xl sm:text-5xl shadow-inner ${
                    isSpinning ? 'animate-pulse blur-[1px]' : ''
                  }`}
                >
                  {sym}
                </div>
              ))}
            </div>
          ))}
        </div>

        {lastWin > 0 && (
          <div className="mt-3 text-center py-2 bg-pink-500/20 border border-pink-400 rounded-xl animate-bounce">
            <span className="text-base font-black text-pink-300">
              🐷 BRICK HOUSE WIN: ₨ {lastWin.toLocaleString()}!
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
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
                  ? 'bg-pink-500 text-white border-pink-300 shadow font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ₨ {c}
            </button>
          ))}
        </div>

        <button
          disabled={isSpinning}
          onClick={handleSpin}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-base sm:text-lg shadow-xl hover:from-pink-400 transition cursor-pointer flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
          <span>SPIN PIGGIES (₨ {betAmount})</span>
        </button>
      </div>
    </div>
  );
};
