import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, CircleDollarSign } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface MoneyComingProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

export const MoneyComingGame: React.FC<MoneyComingProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState<string[]>(['1', '0', '00', '10X']);
  const [lastWin, setLastWin] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);

  const betList = [10, 20, 50, 100, 200, 500, 1000, 2000];

  const handleSpin = () => {
    if (spinning) return;
    if (userBalance < bet) {
      alert('Insufficient balance for spin!');
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - bet);
    setSpinning(true);
    setBanner(null);

    let count = 0;
    const interval = setInterval(() => {
      soundService.playSpinTick();
      const r1 = ['0', '1', '5', '10', ''][Math.floor(Math.random() * 5)];
      const r2 = ['0', '5', '00', ''][Math.floor(Math.random() * 4)];
      const r3 = ['0', '00', '10', ''][Math.floor(Math.random() * 4)];
      const r4 = ['2X', '5X', '10X', 'WHEEL', 'FREE'][Math.floor(Math.random() * 5)];
      setReels([r1, r2, r3, r4]);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        resolveOutcome();
      }
    }, 70);
  };

  const resolveOutcome = () => {
    const isWin =
      adminSettings.rtpMode === 'high_win'
        ? Math.random() < 0.6
        : adminSettings.rtpMode === 'house_edge'
        ? Math.random() < 0.25
        : Math.random() < 0.4;

    let r1 = '0';
    let r2 = '0';
    let r3 = '0';
    let r4 = '1X';
    let win = 0;

    if (isWin) {
      const baseOptions = [
        { r1: '1', r2: '0', r3: '0', mult: 5, multStr: '5X' },
        { r1: '5', r2: '0', r3: '0', mult: 2, multStr: '2X' },
        { r1: '1', r2: '00', r3: '0', mult: 10, multStr: '10X' },
        { r1: '10', r2: '0', r3: '00', mult: 5, multStr: '5X' },
      ];
      const chosen = baseOptions[Math.floor(Math.random() * baseOptions.length)];
      r1 = chosen.r1;
      r2 = chosen.r2;
      r3 = chosen.r3;
      r4 = chosen.multStr;

      const numVal = parseInt(r1 + r2 + r3, 10) || 50;
      win = Math.round(bet * (numVal / 100) * chosen.mult);
      setLastWin(win);
      soundService.playWin();
      if (win >= bet * 5) soundService.playJackpot();
      setBanner(`💰 MONEY COMING JACKPOT: ₨ ${win.toLocaleString()}!`);
      onUpdateBalance(userBalance - bet + win);
      onRecordBet('slots_money_coming', 'Money Coming 777', bet, win, Number((win / bet).toFixed(2)));
    } else {
      r1 = '';
      r2 = '0';
      r3 = '';
      r4 = '2X';
      setLastWin(0);
      onRecordBet('slots_money_coming', 'Money Coming 777', bet, 0, 0);
    }

    setReels([r1, r2, r3, r4]);
    setSpinning(false);
  };

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
            <h2 className="text-base font-black text-amber-300 uppercase">MONEY COMING</h2>
            <span className="text-[11px] text-slate-400">Instant Cash Digit Alignment + Multiplier</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Single Row Slot Screen */}
      <div className="bg-gradient-to-b from-[#18233c] to-[#0d1322] border-2 border-yellow-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
          ⭐ Align Digits & Special Multiplier Reel ⭐
        </div>

        <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-lg mx-auto">
          {reels.map((sym, idx) => {
            const isSpecial = idx === 3;
            return (
              <div
                key={idx}
                className={`h-28 sm:h-36 rounded-2xl flex items-center justify-center font-mono font-black text-3xl sm:text-5xl border-2 transition-all ${
                  isSpecial
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-200 text-slate-950 shadow-xl scale-105'
                    : 'bg-slate-950 border-amber-500/40 text-amber-300 shadow-inner'
                }`}
              >
                {sym || '—'}
              </div>
            );
          })}
        </div>

        {banner && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black rounded-xl text-sm animate-bounce">
            {banner}
          </div>
        )}
      </div>

      {/* Bet & Spin Control */}
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

        <button
          disabled={spinning}
          onClick={handleSpin}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition shadow-xl cursor-pointer ${
            spinning
              ? 'bg-slate-700 text-slate-400'
              : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 shadow-amber-500/30'
          }`}
        >
          {spinning ? 'SPINNING...' : `SPIN (₨ ${bet.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
};
