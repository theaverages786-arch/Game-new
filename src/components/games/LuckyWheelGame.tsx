import React, { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, Trophy, RotateCw, Gift } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface LuckyWheelGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface WheelSegment {
  label: string;
  amount: number;
  multiplier: number;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  { label: '₨ 500', amount: 500, multiplier: 5, color: '#f59e0b', textColor: '#000' },
  { label: '₨ 50', amount: 50, multiplier: 0.5, color: '#3b82f6', textColor: '#fff' },
  { label: '₨ 2,000', amount: 2000, multiplier: 20, color: '#ec4899', textColor: '#fff' },
  { label: '₨ 100', amount: 100, multiplier: 1, color: '#10b981', textColor: '#fff' },
  { label: '₨ 10,000', amount: 10000, multiplier: 100, color: '#eab308', textColor: '#000' },
  { label: '₨ 200', amount: 200, multiplier: 2, color: '#8b5cf6', textColor: '#fff' },
  { label: '₨ 1,000', amount: 1000, multiplier: 10, color: '#ef4444', textColor: '#fff' },
  { label: '₨ 0 (Try Again)', amount: 0, multiplier: 0, color: '#475569', textColor: '#fff' },
];

export const LuckyWheelGame: React.FC<LuckyWheelGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [spinCost, setSpinCost] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);

  const numSegments = SEGMENTS.length;
  const degreesPerSegment = 360 / numSegments;

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < spinCost) {
      soundService.playBeep(300);
      alert('Insufficient balance to spin wheel!');
      return;
    }

    soundService.playClick();
    setIsSpinning(true);
    setWonPrize(null);

    // Pick target segment based on admin RTP
    let targetIdx = Math.floor(Math.random() * numSegments);

    if (adminSettings.rtpMode === 'high_win') {
      // Favor high prizes (e.g. 500, 1000, 2000)
      targetIdx = [0, 2, 4, 6][Math.floor(Math.random() * 4)];
    } else if (adminSettings.rtpMode === 'house_edge') {
      targetIdx = [1, 7][Math.floor(Math.random() * 2)];
    }

    // Total rotations: 5 to 8 full spins + segment offset
    const extraRotations = 360 * 6;
    const targetDegree = 360 - (targetIdx * degreesPerSegment + degreesPerSegment / 2);
    const finalRotation = rotation + extraRotations + (targetDegree - (rotation % 360));

    setRotation(finalRotation);

    // Play spinning ticks
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      soundService.playSpinTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 150);

    setTimeout(() => {
      setIsSpinning(false);
      const prize = SEGMENTS[targetIdx];
      setWonPrize(prize);

      if (prize.amount > 0) {
        soundService.playWin();
        triggerWinConfetti();
      } else {
        soundService.playBeep(250);
      }

      onBet(spinCost, prize.amount, `Lucky Wheel Spin -> ${prize.label}`);
    }, 4200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Exit Game</span>
        </button>

        <div className="flex items-center gap-2 bg-[#131a2c] border border-amber-500/30 px-3 py-1 rounded-2xl">
          <Gift className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">Lucky Spin &amp; Win</span>
        </div>
      </div>

      <div className="bg-[#0b101c] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-8 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Pointer Triangle at Top */}
        <div className="relative z-20 -mb-5 flex flex-col items-center">
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.8)]"></div>
        </div>

        {/* The Rotating Wheel */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-8 border-amber-500/80 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden">
          <div
            className="w-full h-full rounded-full transition-transform duration-[4000ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                ${SEGMENTS.map(
                  (s, i) =>
                    `${s.color} ${i * (100 / numSegments)}% ${(i + 1) * (100 / numSegments)}%`
                ).join(', ')}
              )`,
            }}
          >
            {/* Render segment labels */}
            {SEGMENTS.map((s, idx) => {
              const angle = idx * degreesPerSegment + degreesPerSegment / 2;
              return (
                <div
                  key={idx}
                  className="absolute w-full h-full flex justify-center items-start pt-4 text-xs sm:text-sm font-black pointer-events-none"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    color: s.textColor,
                  }}
                >
                  <span className="transform -rotate-90 origin-center translate-y-6">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Wheel Center Hub */}
          <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 border-4 border-slate-900 shadow-xl flex items-center justify-center font-black text-slate-950 text-xs">
            777
          </div>
        </div>

        {/* Prize Notification Overlay */}
        {wonPrize && (
          <div className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-6 py-2 rounded-2xl font-black text-center shadow-xl border border-white animate-bounce">
            🎉 YOU WON: {wonPrize.label}!
          </div>
        )}

        {/* Bet Chips & Spin Action */}
        <div className="mt-6 w-full max-w-sm flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Spin Ticket Cost</span>
            <span className="text-amber-400 font-mono">₨ {spinCost}</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 500, 1000].map((amt) => (
              <button
                key={amt}
                disabled={isSpinning}
                onClick={() => {
                  soundService.playClick();
                  setSpinCost(amt);
                }}
                className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  spinCost === amt
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ₨ {amt}
              </button>
            ))}
          </div>

          <button
            disabled={isSpinning}
            onClick={handleSpin}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-xl transition-all transform active:scale-95 cursor-pointer ${
              isSpinning
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isSpinning ? 'SPINNING WHEEL...' : `SPIN WHEEL (₨ ${spinCost})`}
          </button>
        </div>
      </div>
    </div>
  );
};
