import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface FortuneGarudaGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const SYMBOLS = [
  { id: 'garuda', icon: '🦅', name: 'Garuda Deity', val: 50 },
  { id: 'nudge_gem', icon: '💎', name: 'Nudge Diamond', val: 20 },
  { id: 'golden_mask', icon: '👺', name: 'Golden Mask', val: 15 },
  { id: 'scepter', icon: '🔱', name: 'Trident Scepter', val: 10 },
  { id: 'lotus', icon: '🪷', name: 'Golden Lotus', val: 8 },
  { id: 'coin', icon: '🪙', name: 'Deity Coin', val: 5 },
];

export const FortuneGarudaGame: React.FC<FortuneGarudaGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [reels, setReels] = useState<string[][]>([
    ['🦅', '💎', '👺'],
    ['🔱', '🦅', '🪷'],
    ['🪙', '🦅', '💎'],
  ]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [nudgeMult, setNudgeMult] = useState<number>(1);

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
        // Nudge feature activated
        setNudgeMult(5);
        winMult = +(12.0 + Math.random() * 38.0).toFixed(1);
        setReels([
          ['🦅', '🦅', '🦅'],
          ['💎', '🦅', '👺'],
          ['🔱', '🦅', '🪷'],
        ]);
      } else {
        setNudgeMult(1);
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

      onRecordBet('jili_fortune_garuda', 'JILI Fortune Garuda 500', betAmount, win, winMult);
      setIsSpinning(false);
    }, 1200);
  };

  return (
    <div className="bg-[#1f1203] border border-amber-500/40 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-amber-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🦅 JILI Fortune Garuda 500</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-black">
                500x NUDGE
              </span>
            </h2>
            <span className="text-[10px] text-amber-200">Mythical Garuda Deity Expanding Wild Reels!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Garuda 3x3 Temple Cabinet */}
      <div className="relative bg-gradient-to-b from-[#472905] via-[#261502] to-[#120a01] border-2 border-amber-400 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
          {reels.map((col, cIdx) => (
            <div key={cIdx} className="space-y-2">
              {col.map((sym, rIdx) => (
                <div
                  key={rIdx}
                  className={`aspect-square rounded-2xl bg-gradient-to-b from-[#6b3e09] to-[#3b2104] border border-amber-300/40 flex items-center justify-center text-4xl sm:text-5xl shadow-inner ${
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
          <div className="mt-3 text-center py-2 bg-amber-400/20 border border-amber-400 rounded-xl animate-bounce">
            <span className="text-base font-black text-amber-300">
              🦅 GARUDA NUDGE 500x WIN: ₨ {lastWin.toLocaleString()}!
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
          <span>SPIN GARUDA (₨ {betAmount})</span>
        </button>
      </div>
    </div>
  );
};
