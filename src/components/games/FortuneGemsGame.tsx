import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Gem, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration } from '../../services/gameEngine';

interface FortuneGemsProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface GemSymbol {
  id: string;
  name: string;
  payout: number;
  icon: string;
  color: string;
}

const GEMS: GemSymbol[] = [
  { id: 'garuda', name: 'Golden Garuda', payout: 25.0, icon: '🦅', color: 'from-amber-400 to-yellow-600' },
  { id: 'ruby', name: 'Red Ruby', payout: 12.0, icon: '💎', color: 'from-red-500 to-rose-700' },
  { id: 'emerald', name: 'Green Emerald', payout: 8.0, icon: '🟢', color: 'from-emerald-500 to-teal-700' },
  { id: 'sapphire', name: 'Blue Sapphire', payout: 5.0, icon: '🔷', color: 'from-blue-500 to-indigo-700' },
  { id: 'a', name: 'A', payout: 2.0, icon: '🅰️', color: 'from-purple-500 to-indigo-600' },
  { id: 'k', name: 'K', payout: 1.5, icon: '👑', color: 'from-pink-500 to-rose-600' },
  { id: 'q', name: 'Q', payout: 1.0, icon: '👸', color: 'from-cyan-500 to-blue-600' },
];

const MULTIPLIERS = [1, 2, 3, 5, 10, 15];

export const FortuneGemsGame: React.FC<FortuneGemsProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(100);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<GemSymbol[][]>([
    [GEMS[0], GEMS[1], GEMS[2]],
    [GEMS[1], GEMS[0], GEMS[3]],
    [GEMS[2], GEMS[3], GEMS[0]],
  ]);
  const [multiplierReel, setMultiplierReel] = useState<number[]>([1, 2, 5]);
  const [activeMultiplier, setActiveMultiplier] = useState(1);
  const [lastWin, setLastWin] = useState(0);
  const [winTitle, setWinTitle] = useState<string | null>(null);
  const [autoSpin, setAutoSpin] = useState(false);

  const betList = [20, 50, 100, 200, 500, 1000, 2500, 5000];

  const handleSpin = () => {
    if (spinning) return;
    if (userBalance < bet) {
      alert('Insufficient Balance! Please recharge.');
      setAutoSpin(false);
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - bet);
    setSpinning(true);
    setWinTitle(null);

    let count = 0;
    const timer = setInterval(() => {
      soundService.playSpinTick();
      setReels([
        [GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)]],
        [GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)]],
        [GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)], GEMS[Math.floor(Math.random() * GEMS.length)]],
      ]);
      setMultiplierReel([
        MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)],
        MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)],
        MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)],
      ]);
      count++;
      if (count >= 10) {
        clearInterval(timer);
        resolveSpin();
      }
    }, 70);
  };

  const resolveSpin = () => {
    const isWin = shouldPlayerWin('slots_fortune_gems', adminSettings, 0.44);

    let finalReels: GemSymbol[][];
    let finalMult = MULTIPLIERS[Math.floor(Math.random() * MULTIPLIERS.length)];

    if (isWin) {
      const matchGem = GEMS[Math.floor(Math.random() * 4)];
      finalReels = [
        [GEMS[Math.floor(Math.random() * GEMS.length)], matchGem, GEMS[Math.floor(Math.random() * GEMS.length)]],
        [GEMS[Math.floor(Math.random() * GEMS.length)], matchGem, GEMS[Math.floor(Math.random() * GEMS.length)]],
        [GEMS[Math.floor(Math.random() * GEMS.length)], matchGem, GEMS[Math.floor(Math.random() * GEMS.length)]],
      ];
      finalMult = Math.random() < 0.3 ? 10 : Math.random() < 0.5 ? 5 : 2;
    } else {
      finalReels = [
        [GEMS[0], GEMS[1], GEMS[2]],
        [GEMS[3], GEMS[4], GEMS[5]],
        [GEMS[2], GEMS[0], GEMS[1]],
      ];
    }

    setReels(finalReels);
    setActiveMultiplier(finalMult);
    setMultiplierReel([
      MULTIPLIERS[(MULTIPLIERS.indexOf(finalMult) + 1) % MULTIPLIERS.length],
      finalMult,
      MULTIPLIERS[(MULTIPLIERS.indexOf(finalMult) + 2) % MULTIPLIERS.length],
    ]);

    // Check middle payline
    const mid1 = finalReels[0][1].id;
    const mid2 = finalReels[1][1].id;
    const mid3 = finalReels[2][1].id;

    if (mid1 === mid2 && mid2 === mid3) {
      const gem = GEMS.find((g) => g.id === mid1) || GEMS[0];
      const win = Math.round(bet * gem.payout * finalMult);
      setLastWin(win);
      soundService.playWin();
      if (finalMult >= 5) soundService.playJackpot();
      onUpdateBalance(userBalance - bet + win);
      onRecordBet('slots_fortune_gems', 'Fortune Gems 777', bet, win, Number((win / bet).toFixed(2)));
      setWinTitle(`💎 FORTUNE GEMS HIT! x${finalMult} Multiplier: ₨ ${win.toLocaleString()}`);
    } else {
      setLastWin(0);
      onRecordBet('slots_fortune_gems', 'Fortune Gems 777', bet, 0, 0);
    }

    setSpinning(false);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (autoSpin && !spinning) {
      timer = setTimeout(handleSpin, 1200);
    }
    return () => clearTimeout(timer);
  }, [autoSpin, spinning]);

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-black text-amber-300 uppercase">FORTUNE GEMS</h2>
              <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                15X WHEEL
              </span>
            </div>
            <span className="text-[11px] text-slate-400">3x3 Reels + 4th Multiplier Wheel</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* 3x3 Grid + 4th Multiplier Reel */}
      <div className="bg-gradient-to-b from-[#131b2e] to-[#090d18] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl relative">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 items-center">
          {/* First 3 Reels */}
          {reels.map((reel, rIdx) => (
            <div key={rIdx} className="space-y-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
              {reel.map((gem, rowIdx) => {
                const isCenter = rowIdx === 1;
                return (
                  <div
                    key={rowIdx}
                    className={`h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      isCenter
                        ? 'bg-gradient-to-br from-amber-500/30 to-yellow-600/40 border-amber-400/80 shadow-lg scale-102'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <span className="text-3xl sm:text-4xl drop-shadow">{gem.icon}</span>
                    <span className="text-[10px] font-bold text-amber-200 mt-1">{gem.name}</span>
                  </div>
                );
              })}
            </div>
          ))}

          {/* 4th Reel: Special Multiplier */}
          <div className="space-y-2 bg-gradient-to-b from-amber-950/40 to-yellow-950/40 p-2 rounded-2xl border-2 border-amber-400">
            <div className="text-center text-[10px] font-black text-amber-300 uppercase mb-1">
              4th Multiplier
            </div>
            {multiplierReel.map((mult, idx) => {
              const isCenter = idx === 1;
              return (
                <div
                  key={idx}
                  className={`h-20 sm:h-24 rounded-xl flex items-center justify-center border font-black text-2xl sm:text-3xl transition-all ${
                    isCenter
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 border-amber-200 text-slate-950 shadow-xl scale-105 animate-pulse'
                      : 'bg-slate-900/80 border-slate-800 text-amber-500/60'
                  }`}
                >
                  {mult}X
                </div>
              );
            })}
          </div>
        </div>

        {/* Win Banner */}
        {winTitle && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-2xl font-black text-sm text-center shadow-lg animate-in zoom-in-95">
            {winTitle}
          </div>
        )}
      </div>

      {/* Bet & Controls */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Bet (₨):</span>
          <div className="flex gap-1.5">
            {betList.map((b) => (
              <button
                key={b}
                disabled={spinning}
                onClick={() => {
                  soundService.playChip();
                  setBet(b);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  bet === b
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={spinning}
            onClick={() => {
              soundService.playClick();
              setAutoSpin(!autoSpin);
            }}
            className={`px-4 py-3.5 rounded-2xl font-black text-xs transition cursor-pointer ${
              autoSpin ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {autoSpin ? 'STOP AUTO' : 'AUTO SPIN'}
          </button>

          <button
            disabled={spinning}
            onClick={handleSpin}
            className={`flex-1 py-3.5 rounded-2xl font-black text-base uppercase tracking-wider transition shadow-xl cursor-pointer ${
              spinning
                ? 'bg-slate-700 text-slate-400'
                : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {spinning ? 'SPINNING GEMS...' : `SPIN (₨ ${bet.toLocaleString()})`}
          </button>
        </div>
      </div>
    </div>
  );
};
