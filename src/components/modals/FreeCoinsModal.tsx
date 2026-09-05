import React, { useState } from 'react';
import { X, Sparkles, Coins, Gift, RotateCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundService } from '../../services/sound';
import confetti from 'canvas-confetti';

interface FreeCoinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  onAddCoins: (amount: number) => void;
}

export const FreeCoinsModal: React.FC<FreeCoinsModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  onAddCoins,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFaucetClaim = (amount: number) => {
    soundService.playWin();
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.3 },
    });
    onAddCoins(amount);
  };

  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    soundService.playSpinTick();

    const rewards = [2000, 5000, 10000, 15000, 25000, 50000];
    const chosen = rewards[Math.floor(Math.random() * rewards.length)];

    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(chosen);
      soundService.playWin();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.35 },
      });
      onAddCoins(chosen);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0e1424] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-white text-center">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
              Free Practice Coins Hub
            </h3>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">Your Virtual Balance:</span>
          <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-base font-black text-amber-300 font-mono">
              {userCoins.toLocaleString()} Coins
            </span>
          </div>
        </div>

        {/* Wheel Spin Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Daily Lucky Wheel Spin</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Spin the wheel once per session to win between 2,000 and 50,000 practice coins!
          </p>

          <div className="relative py-2">
            <div
              className={`w-24 h-24 mx-auto rounded-full border-4 border-amber-400 flex items-center justify-center bg-slate-900 shadow-[0_0_25px_rgba(245,158,11,0.3)] ${
                isSpinning ? 'animate-spin' : ''
              }`}
            >
              <Coins className="w-10 h-10 text-amber-400" />
            </div>
            {spinResult && (
              <div className="mt-2 text-emerald-400 font-black text-sm animate-bounce">
                🎉 Won +{spinResult.toLocaleString()} Free Coins!
              </div>
            )}
          </div>

          <button
            onClick={handleSpinWheel}
            disabled={isSpinning}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 disabled:opacity-50 text-slate-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer transition active:scale-95"
          >
            {isSpinning ? 'Spinning Wheel...' : 'Spin For Free Coins'}
          </button>
        </div>

        {/* Instant Coin Refills */}
        <div className="grid grid-cols-2 gap-2 text-left">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-white block">+10,000 Coins</span>
              <span className="text-[10px] text-slate-400">Practice refill booster</span>
            </div>
            <button
              onClick={() => handleFaucetClaim(10000)}
              className="mt-2 py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-[11px] rounded-lg text-center transition cursor-pointer"
            >
              Claim Instant
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div>
              <span className="text-xs font-black text-white block">+25,000 Coins</span>
              <span className="text-[10px] text-slate-400">High roller practice pack</span>
            </div>
            <button
              onClick={() => handleFaucetClaim(25000)}
              className="mt-2 py-1.5 px-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-black text-[11px] rounded-lg text-center transition cursor-pointer"
            >
              Claim Instant
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Zero real money deposits or gambling. 100% Free educational demo.</span>
        </div>
      </div>
    </div>
  );
};
