import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Trophy, Zap, Crosshair, Target } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface CaiShenFishingGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
  theme?: 'caishen' | 'happy' | 'ygr';
}

interface FishTarget {
  id: string;
  name: string;
  icon: string;
  multiplier: number;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
}

export const CaiShenFishingGame: React.FC<CaiShenFishingGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
  theme = 'caishen',
}) => {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [fishes, setFishes] = useState<FishTarget[]>([
    { id: 'f1', name: 'Golden Cai Shen Boss', icon: '👑', multiplier: 30, hp: 5, maxHp: 5, x: 50, y: 30 },
    { id: 'f2', name: 'Happy Blue Shark', icon: '🦈', multiplier: 15, hp: 3, maxHp: 3, x: 20, y: 60 },
    { id: 'f3', name: 'Gold Sycee Turtle', icon: '🐢', multiplier: 8, hp: 2, maxHp: 2, x: 80, y: 70 },
    { id: 'f4', name: 'Lucky Pufferfish', icon: '🐡', multiplier: 5, hp: 1, maxHp: 1, x: 35, y: 40 },
    { id: 'f5', name: 'Electric Jellyfish', icon: '🪼', multiplier: 3, hp: 1, maxHp: 1, x: 65, y: 80 },
  ]);
  const [cannonPower, setCannonPower] = useState<number>(1);
  const [lastWin, setLastWin] = useState<number>(0);

  const chips = [10, 20, 50, 100, 200, 500, 1000];

  const handleShootFish = (fishId: string) => {
    if (userBalance < betAmount) {
      alert('Insufficient balance to fire cannon!');
      return;
    }

    soundService.playSpin();
    onUpdateBalance(userBalance - betAmount);

    setFishes((prev) =>
      prev.map((f) => {
        if (f.id !== fishId) return f;

        const newHp = f.hp - 1;
        if (newHp <= 0) {
          // Fish captured!
          const win = Math.round(betAmount * f.multiplier);
          soundService.playWin();
          triggerWinConfetti();
          onUpdateBalance(userBalance - betAmount + win);
          setLastWin(win);
          onRecordBet(
            `${theme}_fishing`,
            `${f.name} Capture`,
            betAmount,
            win,
            f.multiplier
          );

          return {
            ...f,
            hp: f.maxHp,
            x: Math.floor(Math.random() * 80) + 10,
            y: Math.floor(Math.random() * 60) + 20,
          };
        } else {
          soundService.playClick();
          return { ...f, hp: newHp };
        }
      })
    );
  };

  return (
    <div className="bg-[#021526] border border-cyan-500/40 rounded-3xl p-3 sm:p-5 max-w-5xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/80 pb-3">
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
                {theme === 'caishen'
                  ? '🔱 WG Cai Shen Fishing'
                  : theme === 'happy'
                  ? '🦈 JILI Happy Fishing'
                  : '🍹 YGR Party Shark Fishing'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-black uppercase">
                3D ARCADE
              </span>
            </h2>
            <span className="text-[10px] text-cyan-300">Tap Swimming Sea Bosses to Fire Laser Cannons!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Ocean Arcade Stage */}
      <div className="relative bg-gradient-to-b from-[#032b4d] via-[#02182b] to-[#010c17] border-2 border-cyan-400/60 rounded-3xl p-4 min-h-[360px] overflow-hidden shadow-2xl">
        {/* Floating Ambient Sea Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Swimming Fish Targets */}
        {fishes.map((f) => (
          <button
            key={f.id}
            onClick={() => handleShootFish(f.id)}
            style={{ left: `${f.x}%`, top: `${f.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-2xl bg-cyan-950/70 border border-cyan-400/60 hover:scale-125 transition-all shadow-xl hover:border-amber-400 group cursor-crosshair text-center flex flex-col items-center"
          >
            <span className="text-3xl sm:text-4xl animate-pulse">{f.icon}</span>
            <span className="text-[9px] font-black text-yellow-300 whitespace-nowrap drop-shadow">
              {f.name} ({f.multiplier}x)
            </span>
            {/* HP Bar */}
            <div className="w-12 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/50 mt-1">
              <div
                style={{ width: `${(f.hp / f.maxHp) * 100}%` }}
                className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all"
              ></div>
            </div>
          </button>
        ))}

        {/* Win Banner */}
        {lastWin > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 py-2 px-6 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-2xl shadow-2xl animate-bounce text-sm sm:text-base border border-white">
            🎯 SEA BOSS CAPTURED! WON ₨ {lastWin.toLocaleString()}!
          </div>
        )}

        {/* Cannon in Center Bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="text-4xl sm:text-5xl animate-bounce">⚡ 🔫 ⚡</div>
          <span className="text-[10px] font-black text-cyan-300">AUTO-LOCK CANNON (₨ {betAmount}/shot)</span>
        </div>
      </div>

      {/* Ammo & Bet Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => {
                soundService.playClick();
                setBetAmount(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                betAmount === c
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ₨ {c} / Shot
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
