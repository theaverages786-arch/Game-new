import React, { useState, useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { ArrowLeft, Play, Pause, Flame, Sparkles, Volume2, VolumeX, ShieldCheck, History } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';

interface PlinkoProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

type RiskLevel = 'low' | 'medium' | 'high';

// Stake.com standard Plinko multipliers
const PLINKO_PAYOUTS: Record<number, Record<RiskLevel, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  10: {
    low: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
    medium: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    high: [76, 10, 3, 0.9, 0.2, 0.2, 0.2, 0.9, 3, 10, 76],
  },
  12: {
    low: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  14: {
    low: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
    medium: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
    high: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

interface BallMetadata {
  id: number;
  bet: number;
  color: string;
}

export const PlinkoGame: React.FC<PlinkoProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState<number>(50);
  const [rows, setRows] = useState<number>(12);
  const [risk, setRisk] = useState<RiskLevel>('high');
  const [autoDrop, setAutoDrop] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([2, 0.2, 8.1, 0.7, 24, 0.2, 1.5]);
  const [activeBucket, setActiveBucket] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const autoDropTimerRef = useRef<NodeJS.Timeout | null>(null);
  const ballMetaRef = useRef<Map<number, BallMetadata>>(new Map());
  const balanceRef = useRef(userBalance);
  balanceRef.current = userBalance;

  const multipliers = PLINKO_PAYOUTS[rows]?.[risk] || PLINKO_PAYOUTS[12].high;

  // Initialize and rebuild physics world whenever rows change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 640;
    const height = 580;
    canvas.width = width;
    canvas.height = height;

    // Create Matter Engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.15, scale: 0.0012 },
    });
    engineRef.current = engine;

    const world = engine.world;
    Matter.World.clear(world, false);

    // Peg Pyramid layout
    const pegRadius = 4.5;
    const startY = 70;
    const spacingY = (height - 150) / rows;
    const pegBodies: Matter.Body[] = [];

    for (let r = 0; r < rows; r++) {
      const numPegs = r + 3;
      const spacingX = Math.min(38, (width - 80) / (rows + 3));
      const rowWidth = (numPegs - 1) * spacingX;
      const startX = (width - rowWidth) / 2;

      for (let c = 0; c < numPegs; c++) {
        const x = startX + c * spacingX;
        const y = startY + r * spacingY;
        const peg = Matter.Bodies.circle(x, y, pegRadius, {
          isStatic: true,
          restitution: 0.75,
          friction: 0.05,
          label: `peg_${r}`,
          render: { fillStyle: '#fbbf24' },
        });
        pegBodies.push(peg);
      }
    }

    // Boundary funnel walls to prevent balls getting stuck outside
    const wallOpts = { isStatic: true, restitution: 0.8, friction: 0 };
    const leftWall = Matter.Bodies.rectangle(20, height / 2, 20, height, wallOpts);
    const rightWall = Matter.Bodies.rectangle(width - 20, height / 2, 20, height, wallOpts);

    Matter.World.add(world, [...pegBodies, leftWall, rightWall]);

    // Collision listener for sounds & bucket detection
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const isBallA = bodyA.label === 'plinko_ball';
        const isBallB = bodyB.label === 'plinko_ball';
        const ball = isBallA ? bodyA : isBallB ? bodyB : null;
        const other = isBallA ? bodyB : bodyA;

        if (ball && other.label?.startsWith('peg_')) {
          const rowNum = parseInt(other.label.split('_')[1] || '0', 10);
          soundService.playPlinkoPeg(rowNum / rows);
        }
      });
    });

    // Custom 60fps render loop
    let animId: number;
    const ctx = canvas.getContext('2d');

    const render = () => {
      if (!ctx || !engineRef.current) return;
      Matter.Engine.update(engineRef.current, 1000 / 60);

      ctx.clearRect(0, 0, width, height);

      // Draw background ambient gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#0a0f1d');
      bgGrad.addColorStop(1, '#05070e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Pegs
      pegBodies.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.position.x, peg.position.y, pegRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw and check balls
      const allBodies = Matter.Composite.allBodies(engine.world);
      const ballsToRemove: Matter.Body[] = [];

      allBodies.forEach((body) => {
        if (body.label === 'plinko_ball') {
          const meta = ballMetaRef.current.get(body.id);

          // Draw ball with neon glow
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, 7, 0, Math.PI * 2);
          ctx.fillStyle = meta?.color || '#38bdf8';
          ctx.shadowColor = meta?.color || '#0284c7';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Check if ball passed bottom line
          if (body.position.y >= height - 48) {
            ballsToRemove.push(body);

            // Compute bucket index
            const bucketCount = multipliers.length;
            const startX = (width - (rows + 2) * Math.min(38, (width - 80) / (rows + 3))) / 2 - 10;
            const endX = width - startX;
            const rawRatio = (body.position.x - startX) / (endX - startX);
            let bucketIdx = Math.floor(rawRatio * bucketCount);
            bucketIdx = Math.max(0, Math.min(bucketCount - 1, bucketIdx));

            // Admin RTP override
            const fav = shouldPlayerWin('arcade_plinko', adminSettings, 0.48);
            if (fav && Math.random() < 0.25) {
              bucketIdx = Math.random() < 0.5 ? 0 : bucketCount - 1; // hit high mult
            }

            const mult = multipliers[bucketIdx];
            const ballBet = meta?.bet || bet;
            const win = Math.round(ballBet * mult);

            // Trigger bucket reaction
            setActiveBucket(bucketIdx);
            setTimeout(() => setActiveBucket(null), 300);

            if (mult >= 2) {
              playOutcomeCelebration(win, ballBet, mult >= 10);
            } else {
              soundService.playSpinTick();
            }

            const newBal = balanceRef.current + win;
            balanceRef.current = newBal;
            onUpdateBalance(newBal);
            onRecordBet('arcade_plinko', `Plinko ${rows}R ${risk.toUpperCase()}`, ballBet, win, mult);
            setHistory((prev) => [mult, ...prev.slice(0, 11)]);
          }
        }
      });

      // Safely remove finished balls
      ballsToRemove.forEach((b) => {
        ballMetaRef.current.delete(b.id);
        Matter.World.remove(engine.world, b);
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world, false);
      }
    };
  }, [rows, risk, adminSettings]);

  // Drop single ball function
  const dropBall = () => {
    if (balanceRef.current < bet) {
      alert('Insufficient balance to drop ball!');
      setAutoDrop(false);
      return;
    }

    // Deduct bet from balance immediately
    const nextBal = balanceRef.current - bet;
    balanceRef.current = nextBal;
    onUpdateBalance(nextBal);
    soundService.playChip();

    if (!engineRef.current) return;

    const width = 640;
    // Jitter top spawn slightly to generate organic natural distribution
    const spawnX = width / 2 + (Math.random() - 0.5) * 14;
    const spawnY = 30;

    const ballColors = ['#f43f5e', '#a855f7', '#06b6d4', '#eab308', '#22c55e', '#ec4899'];
    const ballColor = ballColors[Math.floor(Math.random() * ballColors.length)];

    const ball = Matter.Bodies.circle(spawnX, spawnY, 6.5, {
      restitution: 0.65,
      friction: 0.05,
      frictionAir: 0.02,
      density: 0.002,
      label: 'plinko_ball',
    });

    ballMetaRef.current.set(ball.id, { id: ball.id, bet, color: ballColor });
    Matter.World.add(engineRef.current.world, ball);
  };

  // Auto-drop loop
  useEffect(() => {
    if (autoDrop) {
      autoDropTimerRef.current = setInterval(() => {
        dropBall();
      }, 350);
    } else {
      if (autoDropTimerRef.current) clearInterval(autoDropTimerRef.current);
    }

    return () => {
      if (autoDropTimerRef.current) clearInterval(autoDropTimerRef.current);
    };
  }, [autoDrop, bet]);

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              setAutoDrop(false);
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wide">
                STAKE PLINKO VIP
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                PRO 60FPS
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Rigid Body Matter.js Physics &bull; Real Payout Curve
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Recent History Multiplier Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-slate-950/80 border border-slate-800 rounded-2xl scrollbar-none">
        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1 shrink-0 px-1">
          <History className="w-3.5 h-3.5 text-amber-400" /> RECENT:
        </span>
        {history.map((m, idx) => (
          <span
            key={idx}
            className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 shadow transition ${
              m >= 20
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30 scale-105'
                : m >= 5
                ? 'bg-purple-600 text-white'
                : m >= 2
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {m}x
          </span>
        ))}
      </div>

      {/* Main Board Container */}
      <div className="relative rounded-3xl border-2 border-amber-500/40 bg-[#070b16] overflow-hidden shadow-2xl p-2 sm:p-4 flex flex-col items-center">
        {/* Canvas for Physics */}
        <canvas
          ref={canvasRef}
          className="w-full max-w-[580px] h-[360px] sm:h-[460px] rounded-2xl block"
        />

        {/* Multiplier Bucket Shelf */}
        <div className="w-full max-w-[580px] -mt-6 z-10 grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: `repeat(${multipliers.length}, minmax(0, 1fr))` }}>
          {multipliers.map((m, idx) => {
            const isHit = activeBucket === idx;
            const isExtreme = idx === 0 || idx === multipliers.length - 1;
            const isMid = idx === 1 || idx === multipliers.length - 2;

            return (
              <div
                key={idx}
                className={`py-1.5 sm:py-2 text-center rounded-xl font-black text-[9px] sm:text-xs transition-all duration-150 ${
                  isHit
                    ? 'bg-white text-slate-950 scale-125 z-20 shadow-[0_0_15px_rgba(255,255,255,0.9)]'
                    : isExtreme
                    ? 'bg-gradient-to-b from-rose-500 to-red-700 text-white shadow-red-900/50'
                    : isMid
                    ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-amber-900/50'
                    : m >= 2
                    ? 'bg-gradient-to-b from-yellow-500 to-amber-600 text-slate-950'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300'
                }`}
              >
                {m >= 100 ? `${m}` : `${m}x`}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-3 sm:p-4 shadow-xl space-y-3">
        {/* Risk & Rows Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Risk Level */}
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Risk Level:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl">
              {(['low', 'medium', 'high'] as RiskLevel[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    soundService.playClick();
                    setRisk(r);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                    risk === r
                      ? r === 'high'
                        ? 'bg-rose-600 text-white'
                        : r === 'medium'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Rows */}
          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Rows:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl">
              {[8, 10, 12, 14, 16].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    soundService.playClick();
                    setRows(num);
                  }}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                    rows === num
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Bet Selection */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Bet (₨):</span>
          <div className="flex gap-1.5 items-center">
            {[20, 50, 100, 500, 1000, 2500].map((b) => (
              <button
                key={b}
                onClick={() => {
                  soundService.playChip();
                  setBet(b);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  bet === b
                    ? 'bg-amber-400 text-slate-950 shadow scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ₨ {b}
              </button>
            ))}
            <button
              onClick={() => {
                soundService.playChip();
                setBet(Math.max(10, Math.floor(bet / 2)));
              }}
              className="px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              ½
            </button>
            <button
              onClick={() => {
                soundService.playChip();
                setBet(bet * 2);
              }}
              className="px-2 py-1.5 rounded-xl text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 cursor-pointer"
            >
              2×
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              setAutoDrop(!autoDrop);
            }}
            className={`py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer transition border ${
              autoDrop
                ? 'bg-rose-600 border-rose-400 text-white animate-pulse'
                : 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
            }`}
          >
            {autoDrop ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoDrop ? 'STOP AUTO' : 'AUTO DROP'}</span>
          </button>

          <button
            onClick={dropBall}
            className="col-span-2 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>DROP BALL (₨ {bet.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
