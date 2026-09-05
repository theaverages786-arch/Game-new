import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration } from '../../services/gameEngine';

interface Crazy777GameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const SPECIAL_REEL_ITEMS = ['x2', 'x5', 'x10', '+100', '+500', 'RESPIN', 'x2'];

export const Crazy777Game: React.FC<Crazy777GameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [reels, setReels] = useState<string[]>(['7️⃣', '7️⃣', '7️⃣']);
  const [specialReel, setSpecialReel] = useState<string>('x10');
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
      const shouldWin = shouldPlayerWin('wg_crazy777', adminSettings, 0.44);

      const sp = SPECIAL_REEL_ITEMS[Math.floor(Math.random() * SPECIAL_REEL_ITEMS.length)];
      setSpecialReel(sp);

      if (shouldWin) {
        // High win 777 match
        const symbolType = Math.random() < 0.3 ? '7️⃣' : Math.random() < 0.6 ? '👑' : '💎';
        setReels([symbolType, symbolType, symbolType]);

        let baseMult = symbolType === '7️⃣' ? 20 : symbolType === '👑' ? 10 : 5;
        let specialBonus = sp === 'x10' ? 10 : sp === 'x5' ? 5 : sp === 'x2' ? 2 : 1;
        winMult = baseMult * specialBonus;
      } else {
        const symbols = ['7️⃣', '💎', '👑', '🍒', '🔔', '🪙'];
        setReels([
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
          symbols[Math.floor(Math.random() * symbols.length)],
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

      onRecordBet('wg_crazy777', 'WG Crazy 777 (10000x)', betAmount, win, winMult);
      setIsSpinning(false);
    }, 1100);
  };

  return (
    <div className="bg-[#1c0c2e] border border-amber-500/40 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-purple-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🎰 WG Crazy 777</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black">
                10000x JACKPOT
              </span>
            </h2>
            <span className="text-[10px] text-purple-300">Classic 3-Reel + 4th Multiplier Bonus Reel!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Classic Crazy 777 Slot Cabinet */}
      <div className="relative bg-gradient-to-b from-[#3a105c] via-[#23083b] to-[#120320] border-4 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-center gap-2 sm:gap-4 max-w-lg mx-auto">
          {/* Main 3 Reels */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1 bg-black/60 p-3 rounded-2xl border border-amber-400/50">
            {reels.map((sym, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-2xl bg-gradient-to-b from-[#5c1c8f] to-[#300c4f] border border-amber-300/40 flex items-center justify-center text-4xl sm:text-6xl shadow-inner ${
                  isSpinning ? 'animate-pulse blur-[1px]' : ''
                }`}
              >
                {sym}
              </div>
            ))}
          </div>

          {/* 4th Special Feature Multiplier Reel */}
          <div className="w-20 sm:w-28 bg-amber-500/20 p-2 sm:p-3 rounded-2xl border-2 border-yellow-400 flex flex-col items-center justify-center">
            <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest text-center">
              SPECIAL REEL
            </span>
            <div
              className={`aspect-square w-full rounded-xl bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-lg sm:text-2xl font-mono shadow mt-1 ${
                isSpinning ? 'animate-spin' : ''
              }`}
            >
              {specialReel}
            </div>
          </div>
        </div>

        {/* Win Banner */}
        {lastWin > 0 && (
          <div className="mt-4 text-center py-2 bg-gradient-to-r from-amber-400/30 via-yellow-300/30 to-amber-500/30 border border-amber-400 rounded-xl animate-bounce">
            <span className="text-base sm:text-xl font-black text-amber-300">
              🔥 777 CRAZY HIT: ₨ {lastWin.toLocaleString()}!
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
          <span>SPIN 777 (₨ {betAmount})</span>
        </button>
      </div>
    </div>
  );
};
