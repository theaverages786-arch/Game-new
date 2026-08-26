import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Trophy, Zap, RefreshCw } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface PiggyBankGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const SYMBOLS = [
  { id: 'piggy', icon: '🐷', name: 'Golden Piggy', value: 20 },
  { id: 'hammer', icon: '🔨', name: 'Gold Hammer', value: 15 },
  { id: 'cash', icon: '💵', name: 'Cash Stack', value: 10 },
  { id: 'coin', icon: '🪙', name: 'Gold Coin', value: 5 },
  { id: 'gem', icon: '💎', name: 'Diamond', value: 8 },
  { id: 'safe', icon: '🏦', name: 'Vault Safe', value: 12 },
];

export const PiggyBankGame: React.FC<PiggyBankGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [reels, setReels] = useState<string[][]>([
    ['🐷', '💵', '🪙'],
    ['🔨', '🐷', '💎'],
    ['🪙', '🏦', '🐷'],
  ]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [bonusMode, setBonusMode] = useState<boolean>(false);

  const chips = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleSpin = (isBonusBuy = false) => {
    const cost = isBonusBuy ? betAmount * 10 : betAmount;
    if (userBalance < cost) {
      alert('Insufficient balance to spin!');
      return;
    }

    soundService.playSpin();
    onUpdateBalance(userBalance - cost);
    setIsSpinning(true);
    setLastWin(0);

    setTimeout(() => {
      // Determine win based on RTP or Bonus Buy
      let winMultiplier = 0;
      const rand = Math.random();

      if (isBonusBuy || rand < (adminSettings.rtpMode === 'high_win' ? 0.65 : 0.38)) {
        winMultiplier = isBonusBuy
          ? +(15 + Math.random() * 85).toFixed(1)
          : +(1.5 + Math.random() * 8.5).toFixed(1);

        // Win result
        setReels([
          ['🐷', '🐷', '🐷'],
          ['🔨', '🐷', '🔨'],
          ['🪙', '🐷', '💎'],
        ]);
      } else {
        // Random spin
        const pick = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)].icon;
        setReels([
          [pick(), pick(), pick()],
          [pick(), pick(), pick()],
          [pick(), pick(), pick()],
        ]);
      }

      const win = Math.round(betAmount * winMultiplier);
      if (win > 0) {
        soundService.playWin();
        triggerWinConfetti();
        onUpdateBalance(userBalance - cost + win);
        setLastWin(win);
      } else {
        soundService.playLose();
      }

      onRecordBet('jdb_piggy_bank', 'JDB Piggy Bank 13000x', cost, win, winMultiplier);
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <div className="bg-[#120a1f] border border-amber-500/30 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🐷 JDB Piggy Bank</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-slate-950 text-[9px] font-black">
                13000x BUY
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">Smash Golden Piggies for huge jackpot multipliers!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3x3 Piggy Slot Grid */}
      <div className="relative bg-gradient-to-b from-[#2a0e38] via-[#1a0824] to-[#0d0312] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
          {reels.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2">
              {col.map((sym, rIdx) => (
                <div
                  key={rIdx}
                  className={`aspect-square rounded-2xl bg-gradient-to-b from-[#401254] to-[#21072d] border border-amber-400/40 flex items-center justify-center text-4xl sm:text-5xl shadow-inner ${
                    isSpinning ? 'animate-pulse blur-[1px]' : ''
                  }`}
                >
                  {sym}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Win Banner */}
        {lastWin > 0 && (
          <div className="mt-3 text-center py-2 bg-amber-400/20 border border-amber-400 rounded-xl animate-bounce">
            <span className="text-sm sm:text-base font-black text-amber-300">
              🎉 PIGGY SMASH WIN: ₨ {lastWin.toLocaleString()}!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
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

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={isSpinning}
            onClick={() => handleSpin(true)}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs sm:text-sm shadow-xl hover:from-rose-500 transition cursor-pointer flex flex-col items-center justify-center"
          >
            <span>⚡ 13000x BONUS BUY</span>
            <span className="text-[10px] opacity-80">Cost: ₨ {betAmount * 10}</span>
          </button>

          <button
            disabled={isSpinning}
            onClick={() => handleSpin(false)}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base shadow-xl hover:from-amber-300 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>SPIN (₨ {betAmount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
