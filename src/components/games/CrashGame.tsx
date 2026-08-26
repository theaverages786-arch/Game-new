import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Rocket, 
  TrendingUp, 
  Users, 
  History, 
  Zap, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface CrashGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface SimulatedPlayer {
  name: string;
  bet: number;
  cashout?: number;
  won?: boolean;
}

export const CrashGame: React.FC<CrashGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(2.00);
  const [betAmount, setBetAmount] = useState(100);
  const [hasBet, setHasBet] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number | null>(null);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [useAutoCashout, setUseAutoCashout] = useState(false);
  const [history, setHistory] = useState<number[]>([1.84, 3.25, 1.15, 7.80, 2.10, 1.45, 12.40, 2.88]);
  const [countdown, setCountdown] = useState(4);
  const [players, setPlayers] = useState<SimulatedPlayer[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const betChips = [50, 100, 200, 500, 1000, 2000, 5000];

  // Initialize random simulated players
  const generateSimulatedPlayers = () => {
    const names = ['0301***928', '0345***112', '0312***840', '0308***776', '0321***559', '0333***601'];
    return names.map((name) => ({
      name,
      bet: [100, 200, 500, 1000, 2500][Math.floor(Math.random() * 5)],
      cashout: +(1.2 + Math.random() * 4).toFixed(2),
      won: false,
    }));
  };

  // Determine Next Crash Point based on Admin RTP & Settings
  const calculateCrashPoint = () => {
    const rand = Math.random();
    let point = 1.0;

    if (adminSettings.rtpMode === 'high_win') {
      // 70% above 2.0x
      point = rand < 0.2 ? +(1.1 + Math.random() * 0.8).toFixed(2) : +(2.0 + Math.random() * 8.0).toFixed(2);
    } else if (adminSettings.rtpMode === 'house_edge') {
      // High chance of early crash
      point = rand < 0.45 ? +(1.01 + Math.random() * 0.4).toFixed(2) : +(1.4 + Math.random() * 2.0).toFixed(2);
    } else {
      // Standard fair exponential distribution (Aviator curve)
      if (rand < 0.08) point = 1.02; // instant crash
      else if (rand < 0.6) point = +(1.1 + Math.random() * 1.8).toFixed(2);
      else if (rand < 0.85) point = +(2.0 + Math.random() * 3.5).toFixed(2);
      else point = +(5.0 + Math.random() * 15.0).toFixed(2);
    }

    return Math.max(1.02, point);
  };

  // Game Loop
  const startNextRound = () => {
    const point = calculateCrashPoint();
    setCrashPoint(point);
    setGameState('idle');
    setMultiplier(1.00);
    setHasCashedOut(false);
    setCashoutMultiplier(null);
    setPlayers(generateSimulatedPlayers());
    setCountdown(4);

    let count = 4;
    const countInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      soundService.playBeep(400);

      if (count <= 0) {
        clearInterval(countInterval);
        launchRocket(point);
      }
    }, 1000);
  };

  const launchRocket = (point: number) => {
    setGameState('running');
    startTimeRef.current = Date.now();

    const loop = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      // Exponential growth curve
      const currentMulti = +(1 + Math.pow(elapsed * 0.65, 1.7)).toFixed(2);

      if (currentMulti >= point) {
        // Crashed
        setMultiplier(point);
        setGameState('crashed');
        soundService.playCrash();
        setHistory((prev) => [point, ...prev.slice(0, 9)]);

        // If user didn't cash out and had placed bet
        if (hasBet && !hasCashedOut) {
          onBet(betAmount, 0, `Crash Rocket @ ${point}x (Bust)`);
        }
        setHasBet(false);

        // Auto restart next round
        setTimeout(() => {
          startNextRound();
        }, 3000);
      } else {
        setMultiplier(currentMulti);

        // Update simulated players cashouts
        setPlayers((prev) =>
          prev.map((p) => {
            if (!p.won && p.cashout && currentMulti >= p.cashout) {
              return { ...p, won: true };
            }
            return p;
          })
        );

        // Check Auto-Cashout
        if (hasBet && !hasCashedOut && useAutoCashout && currentMulti >= autoCashout) {
          executeCashOut(currentMulti);
        }

        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    startNextRound();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Draw Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (gameState === 'running' || gameState === 'crashed') {
      const progress = Math.min(1, (multiplier - 1) / (crashPoint === 1 ? 1 : crashPoint * 0.8));
      const endX = 40 + progress * (width - 100);
      const endY = height - 30 - Math.pow(progress, 1.4) * (height - 80);

      // Curve Trail Gradient
      const gradient = ctx.createLinearGradient(40, height - 30, endX, endY);
      if (gameState === 'crashed') {
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.8)');
      } else {
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.1)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0.9)');
      }

      // Fill area under curve
      ctx.beginPath();
      ctx.moveTo(40, height - 30);
      ctx.quadraticCurveTo(endX * 0.5, height - 30, endX, endY);
      ctx.lineTo(endX, height - 30);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      ctx.moveTo(40, height - 30);
      ctx.quadraticCurveTo(endX * 0.5, height - 30, endX, endY);
      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#fbbf24';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Rocket Icon or Explosion
      if (gameState === 'crashed') {
        ctx.fillStyle = '#ef4444';
        ctx.font = '24px sans-serif';
        ctx.fillText('💥', endX - 12, endY + 8);
      } else {
        ctx.fillStyle = '#fbbf24';
        ctx.font = '26px sans-serif';
        ctx.fillText('🚀', endX - 12, endY + 8);
      }
    }
  }, [multiplier, gameState, crashPoint]);

  const handlePlaceBet = () => {
    if (balance < betAmount) {
      soundService.playBeep(300);
      alert('Insufficient balance to bet!');
      return;
    }
    soundService.playClick();
    setHasBet(true);
  };

  const executeCashOut = (currentMulti: number) => {
    if (!hasBet || hasCashedOut || gameState !== 'running') return;
    setHasCashedOut(true);
    setCashoutMultiplier(currentMulti);
    const winAmt = Math.round(betAmount * currentMulti);

    soundService.playWin();
    triggerWinConfetti();
    onBet(betAmount, winAmt, `Crash Aviator Cashed Out @ ${currentMulti.toFixed(2)}x`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 text-white">
      {/* Top Header */}
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

        {/* History Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[60%] py-1">
          <History className="w-4 h-4 text-slate-400 shrink-0" />
          {history.map((h, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold font-mono shrink-0 ${
                h >= 5.0
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : h >= 2.0
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Flight Canvas Area */}
        <div className="lg:col-span-2 bg-[#090e1a] border border-amber-500/30 rounded-3xl p-4 relative shadow-2xl overflow-hidden flex flex-col justify-between min-h-[320px] sm:min-h-[380px]">
          {/* Top Info overlay */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-full px-3 py-1 text-xs">
              <Rocket className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-amber-300">AVIATOR 777</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {gameState === 'idle' && `Starts in ${countdown}s`}
              {gameState === 'running' && 'FLYING'}
              {gameState === 'crashed' && 'FLEW AWAY'}
            </div>
          </div>

          {/* Canvas graphic */}
          <canvas
            ref={canvasRef}
            width={580}
            height={280}
            className="w-full h-48 sm:h-64 my-auto block"
          />

          {/* Huge Multiplier / Status Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {gameState === 'idle' ? (
              <div className="text-center">
                <span className="text-4xl sm:text-5xl font-black text-amber-400 font-mono animate-pulse">
                  NEXT ROUND IN
                </span>
                <div className="text-6xl font-black text-white font-mono mt-1">{countdown}s</div>
              </div>
            ) : gameState === 'crashed' ? (
              <div className="text-center animate-in zoom-in-75 duration-200">
                <span className="text-2xl sm:text-3xl font-black text-rose-500 tracking-wider uppercase block">
                  FLEW AWAY!
                </span>
                <span className="text-5xl sm:text-6xl font-black text-rose-400 font-mono">
                  {crashPoint.toFixed(2)}x
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-5xl sm:text-7xl font-black text-amber-300 font-mono drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  {multiplier.toFixed(2)}x
                </span>
                {hasBet && !hasCashedOut && (
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    Current Payout: ₨ {(betAmount * multiplier).toFixed(0)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cashed Out Banner */}
          {hasCashedOut && cashoutMultiplier && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 px-4 py-1.5 rounded-full font-black text-sm shadow-xl z-20 animate-bounce">
              🎉 CASHED OUT @ {cashoutMultiplier.toFixed(2)}x (+₨ {(betAmount * cashoutMultiplier).toFixed(0)})
            </div>
          )}
        </div>

        {/* Betting Panel & Multiplayer List */}
        <div className="flex flex-col gap-3">
          {/* Bet Control Box */}
          <div className="bg-[#121827] border border-amber-500/30 rounded-3xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Bet Amount (PKR)</span>
              <span className="text-xs font-mono text-amber-400 font-bold">₨ {betAmount}</span>
            </div>

            {/* Chips */}
            <div className="grid grid-cols-4 gap-1.5">
              {betChips.slice(0, 4).map((amt) => (
                <button
                  key={amt}
                  disabled={hasBet && gameState === 'running'}
                  onClick={() => {
                    soundService.playClick();
                    setBetAmount(amt);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    betAmount === amt
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  ₨ {amt}
                </button>
              ))}
            </div>

            {/* Auto Cashout option */}
            <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAutoCashout}
                  onChange={(e) => setUseAutoCashout(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-slate-300 font-semibold">Auto Cashout</span>
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(parseFloat(e.target.value) || 2.0)}
                  disabled={!useAutoCashout}
                  className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-center text-xs font-mono text-amber-300 focus:outline-none"
                />
                <span className="text-slate-400">x</span>
              </div>
            </div>

            {/* Bet / Cashout Button */}
            {hasBet && gameState === 'running' && !hasCashedOut ? (
              <button
                onClick={() => executeCashOut(multiplier)}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-lg shadow-xl shadow-emerald-500/30 transition-all transform active:scale-95 cursor-pointer animate-pulse"
              >
                CASH OUT (₨ {(betAmount * multiplier).toFixed(0)})
              </button>
            ) : hasBet && (gameState === 'idle' || hasCashedOut) ? (
              <div className="w-full py-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-center font-bold text-sm">
                ✓ Bet Placed for Next Round (₨ {betAmount})
              </div>
            ) : (
              <button
                onClick={handlePlaceBet}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/30 transition-all transform active:scale-95 cursor-pointer"
              >
                PLACE BET (₨ {betAmount})
              </button>
            )}
          </div>

          {/* Live Players Table */}
          <div className="bg-[#121827] border border-slate-800 rounded-3xl p-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Live Bets ({players.length + (hasBet ? 1 : 0)})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-48 text-xs font-mono">
              {hasBet && (
                <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-2 flex items-center justify-between">
                  <span className="text-amber-300 font-bold">You</span>
                  <span className="text-slate-300">₨ {betAmount}</span>
                  <span className={hasCashedOut ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {hasCashedOut ? `${cashoutMultiplier?.toFixed(2)}x` : 'Flying...'}
                  </span>
                </div>
              )}
              {players.map((p, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-2 flex items-center justify-between ${
                    p.won
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : 'bg-slate-900/50 border border-slate-800/60'
                  }`}
                >
                  <span className="text-slate-400">{p.name}</span>
                  <span className="text-slate-300">₨ {p.bet}</span>
                  <span className={p.won ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {p.won ? `${p.cashout}x (+₨ ${((p.cashout || 1) * p.bet).toFixed(0)})` : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
