import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, CircleDot, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface PlinkoProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bet: number;
  row: number;
}

const MULTIPLIERS = [10, 3.5, 1.5, 0.6, 0.3, 0.6, 1.5, 3.5, 10];

export const PlinkoGame: React.FC<PlinkoProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const nextBallId = useRef(1);
  const ROWS = 8;

  const dropBall = () => {
    if (userBalance < bet) {
      alert('Insufficient balance to drop ball!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    const newBall: Ball = {
      id: nextBallId.current++,
      x: 50 + (Math.random() - 0.5) * 4,
      y: 10,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 1.2,
      bet: bet,
      row: 0,
    };

    setBalls((prev) => [...prev, newBall]);
  };

  // Ball physics loop
  useEffect(() => {
    const timer = setInterval(() => {
      setBalls((prev) => {
        const nextBalls: Ball[] = [];

        prev.forEach((b) => {
          let ny = b.y + b.vy;
          let nx = b.x + b.vx;
          let nvy = b.vy + 0.15;
          let nvx = b.vx;

          // Check if ball reached bottom buckets
          if (ny >= 85) {
            // Determine bucket index (0 to 8)
            let bucketIdx = Math.floor((nx / 100) * MULTIPLIERS.length);
            bucketIdx = Math.max(0, Math.min(MULTIPLIERS.length - 1, bucketIdx));

            // Admin RTP bias
            if (adminSettings.rtpMode === 'high_win' && Math.random() < 0.4) {
              bucketIdx = Math.random() < 0.5 ? 0 : 8; // hit 10x!
            }

            const mult = MULTIPLIERS[bucketIdx];
            const win = Math.round(b.bet * mult);

            setActiveSlot(bucketIdx);
            setTimeout(() => setActiveSlot(null), 400);

            if (win >= b.bet) {
              soundService.playWin();
            } else {
              soundService.playSpinTick();
            }

            onUpdateBalance(userBalance - b.bet + win);
            onRecordBet('arcade_plinko', 'Plinko Ball Drop', b.bet, win, mult);
            setLastWin(win);
          } else {
            // Check peg bounce
            const currentRow = Math.floor((ny / 85) * ROWS);
            if (currentRow > b.row) {
              soundService.playSpinTick();
              nvx += (Math.random() - 0.5) * 1.8;
              b.row = currentRow;
            }

            nextBalls.push({
              ...b,
              x: Math.max(10, Math.min(90, nx)),
              y: ny,
              vx: nvx * 0.96,
              vy: nvy,
            });
          }
        });

        return nextBalls;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [userBalance]);

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
            <h2 className="text-base font-black text-amber-300 uppercase">PLINKO 777</h2>
            <span className="text-[11px] text-slate-400">Peg Pyramid &bull; Multipliers up to 10x</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Plinko Board */}
      <div className="relative h-96 sm:h-[420px] rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-[#10172c] via-[#090e1c] to-[#04060d] overflow-hidden p-4 shadow-2xl flex flex-col justify-between">
        {/* Pegs Grid */}
        <div className="absolute inset-0 flex flex-col justify-around py-8 pointer-events-none">
          {Array.from({ length: ROWS }, (_, r) => (
            <div key={r} className="flex justify-center gap-6 sm:gap-10">
              {Array.from({ length: r + 3 }, (_, c) => (
                <div
                  key={c}
                  className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                ></div>
              ))}
            </div>
          ))}
        </div>

        {/* Animated Falling Balls */}
        {balls.map((b) => (
          <div
            key={b.id}
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full shadow-lg border border-white"
          ></div>
        ))}

        {/* Multiplier Buckets at Bottom */}
        <div className="mt-auto grid grid-cols-9 gap-1 z-10">
          {MULTIPLIERS.map((m, idx) => {
            const isHit = activeSlot === idx;
            return (
              <div
                key={idx}
                className={`py-2 rounded-xl text-center font-black text-[10px] sm:text-xs border transition-all ${
                  isHit
                    ? 'bg-amber-400 border-white text-slate-950 scale-110 shadow-lg'
                    : m >= 10
                    ? 'bg-rose-700/80 border-rose-400 text-white'
                    : m >= 3
                    ? 'bg-amber-600/80 border-amber-400 text-white'
                    : m >= 1
                    ? 'bg-yellow-700/80 border-yellow-400 text-yellow-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
              >
                {m}x
              </div>
            );
          })}
        </div>
      </div>

      {/* Bet & Drop Button */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Ball Bet (₨):</span>
          <div className="flex gap-1.5">
            {[20, 50, 100, 200, 500, 1000].map((b) => (
              <button
                key={b}
                onClick={() => {
                  soundService.playChip();
                  setBet(b);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  bet === b
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={dropBall}
          className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer"
        >
          DROP PLINKO BALL (₨ {bet.toLocaleString()})
        </button>
      </div>
    </div>
  );
};
