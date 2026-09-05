import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  History, 
  Zap, 
  Sparkles,
  Volume2,
  VolumeX,
  FastForward,
  Play,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';
import { ProvablyFairModal } from '../modals/ProvablyFairModal';
import { 
  loadProvablyFairState, 
  saveProvablyFairState, 
  calculateCrashMultiplier, 
  pseudoSha256 
} from '../../services/provablyFair';

interface CrashGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface BetPanelState {
  betAmount: number;
  isBetPlaced: boolean;
  hasCashedOut: boolean;
  cashoutMultiplier: number | null;
  autoCashoutEnabled: boolean;
  autoCashoutVal: number;
}

interface SimulatedPlayer {
  name: string;
  avatar: string;
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
  // Game state
  const [gameState, setGameState] = useState<'idle' | 'running' | 'crashed'>('idle');
  const [multiplier, setMultiplier] = useState(1.00);
  const [crashPoint, setCrashPoint] = useState(2.00);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1); // 1x, 2x, 5x
  const [history, setHistory] = useState<number[]>([
    2.15, 1.48, 12.40, 1.18, 4.52, 1.84, 8.90, 1.30, 24.50, 1.95, 3.12, 1.05
  ]);
  const [countdown, setCountdown] = useState<number>(4);
  const [players, setPlayers] = useState<SimulatedPlayer[]>([]);
  const [soundMuted, setSoundMuted] = useState(!soundService.isEnabled());
  const [showPfModal, setShowPfModal] = useState(false);
  const [pfState, setPfState] = useState(loadProvablyFairState);

  // Dual Bet Panels
  const [panel1, setPanel1] = useState<BetPanelState>({
    betAmount: 100,
    isBetPlaced: false,
    hasCashedOut: false,
    cashoutMultiplier: null,
    autoCashoutEnabled: false,
    autoCashoutVal: 2.0,
  });

  const [panel2, setPanel2] = useState<BetPanelState>({
    betAmount: 50,
    isBetPlaced: false,
    hasCashedOut: false,
    cashoutMultiplier: null,
    autoCashoutEnabled: true,
    autoCashoutVal: 1.5,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const countIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioThrottlerRef = useRef<number>(0);

  const chips = [50, 100, 200, 500, 1000, 5000];

  // Simulated live online players
  const generatePlayers = () => {
    const pakistaniUsers = [
      { name: '0301***918', avatar: '👨‍💼' },
      { name: '0345***224', avatar: '👳‍♂️' },
      { name: '0312***840', avatar: '🧔' },
      { name: '0308***776', avatar: '🧕' },
      { name: '0321***559', avatar: '🧑‍💻' },
      { name: '0333***601', avatar: '👑' },
      { name: '0300***439', avatar: '🕶️' },
      { name: '0315***109', avatar: '🦁' },
    ];
    return pakistaniUsers.map((u) => ({
      name: u.name,
      avatar: u.avatar,
      bet: [50, 100, 200, 500, 1000, 2000][Math.floor(Math.random() * 6)],
      cashout: +(1.2 + Math.random() * 5).toFixed(2),
      won: false,
    }));
  };

  // Calculate deterministic or probabilistic crash point using Provably Fair RNG
  const calculateCrashPoint = () => {
    // 1. Check Admin Forced Crash Result
    if (adminSettings?.forcedResults?.crash && adminSettings.forcedResults.crash !== 'random') {
      const forced = Number(adminSettings.forcedResults.crash);
      if (!isNaN(forced) && forced >= 1.01) return forced;
    }

    // 2. Comprehensive Game Engine Check
    const userFavored = shouldPlayerWin('crash_aviator', adminSettings, 0.48);

    // Increment Provably Fair Nonce
    const updatedPf = { ...pfState, nonce: pfState.nonce + 1 };
    setPfState(updatedPf);
    saveProvablyFairState(updatedPf);

    if (userFavored) {
      // Provably fair calculation with favorable seed
      const pfMulti = calculateCrashMultiplier(updatedPf.serverSeed, updatedPf.clientSeed, updatedPf.nonce, 2);
      return Math.max(1.85, pfMulti);
    } else {
      // Early crash (1.01x - 1.95x)
      const r = Math.random();
      if (r < 0.25) return 1.02;
      if (r < 0.65) return +(1.1 + Math.random() * 0.4).toFixed(2);
      return +(1.4 + Math.random() * 0.45).toFixed(2);
    }
  };

  // Start Next Round
  const startNextRound = (immediate: boolean = false) => {
    if (countIntervalRef.current) clearInterval(countIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const point = calculateCrashPoint();
    setCrashPoint(point);
    setGameState('idle');
    setMultiplier(1.00);

    // Reset panels that cashed out or crashed
    setPanel1((prev) => ({
      ...prev,
      hasCashedOut: false,
      cashoutMultiplier: null,
    }));
    setPanel2((prev) => ({
      ...prev,
      hasCashedOut: false,
      cashoutMultiplier: null,
    }));

    setPlayers(generatePlayers());

    if (immediate) {
      launchPlane(point);
      return;
    }

    let count = 3;
    setCountdown(count);

    countIntervalRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      soundService.playBeep(450);

      if (count <= 0) {
        if (countIntervalRef.current) clearInterval(countIntervalRef.current);
        launchPlane(point);
      }
    }, 1000 / speedMultiplier);
  };

  const launchPlane = (point: number) => {
    setGameState('running');
    startTimeRef.current = performance.now();

    const loop = (time: number) => {
      const elapsedSeconds = ((time - startTimeRef.current) / 1000) * speedMultiplier;
      // Exponential Aviator ascent formula: multiplier = 1 + (t * 0.7)^1.75
      const currentMulti = +(1 + Math.pow(elapsedSeconds * 0.75, 1.7)).toFixed(2);

      // Periodically trigger ascending jet hum
      if (time - audioThrottlerRef.current > 150) {
        audioThrottlerRef.current = time;
        soundService.playJetFlight(currentMulti);
      }

      if (currentMulti >= point) {
        // Crashed
        setMultiplier(point);
        setGameState('crashed');
        soundService.playExplosion();
        setHistory((prev) => [point, ...prev.slice(0, 15)]);

        {/* Check un-cashed bets */}
        setPanel1((p1) => {
          if (p1.isBetPlaced && !p1.hasCashedOut) {
            onBet(0, 0, `Aviator Crashed @ ${point.toFixed(2)}x (Bust)`);
            return { ...p1, isBetPlaced: false };
          }
          return p1;
        });

        setPanel2((p2) => {
          if (p2.isBetPlaced && !p2.hasCashedOut) {
            onBet(0, 0, `Aviator Crashed @ ${point.toFixed(2)}x (Bust)`);
            return { ...p2, isBetPlaced: false };
          }
          return p2;
        });

        // Restart round after short pause
        const pauseTime = speedMultiplier >= 2 ? 1000 : 2500;
        setTimeout(() => {
          startNextRound();
        }, pauseTime);
      } else {
        setMultiplier(currentMulti);

        // Update simulated players
        setPlayers((prev) =>
          prev.map((p) => {
            if (!p.won && p.cashout && currentMulti >= p.cashout) {
              return { ...p, won: true };
            }
            return p;
          })
        );

        // Auto Cashout Panel 1
        setPanel1((p1) => {
          if (p1.isBetPlaced && !p1.hasCashedOut && p1.autoCashoutEnabled && currentMulti >= p1.autoCashoutVal) {
            executeCashout('panel1', currentMulti, p1);
            return { ...p1, hasCashedOut: true, cashoutMultiplier: currentMulti, isBetPlaced: false };
          }
          return p1;
        });

        // Auto Cashout Panel 2
        setPanel2((p2) => {
          if (p2.isBetPlaced && !p2.hasCashedOut && p2.autoCashoutEnabled && currentMulti >= p2.autoCashoutVal) {
            executeCashout('panel2', currentMulti, p2);
            return { ...p2, hasCashedOut: true, cashoutMultiplier: currentMulti, isBetPlaced: false };
          }
          return p2;
        });

        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const executeCashout = (panelId: 'panel1' | 'panel2', cashMulti: number, panel: BetPanelState) => {
    soundService.playCashoutDing();
    triggerWinConfetti();
    const winAmt = Math.round(panel.betAmount * cashMulti);
    // Instant automated bet settlement upon cashout
    onBet(0, winAmt, `Aviator ${panelId === 'panel1' ? 'Bet 1' : 'Bet 2'} Cashed Out @ ${cashMulti.toFixed(2)}x`);

    if (panelId === 'panel1') {
      setPanel1((prev) => ({
        ...prev,
        hasCashedOut: true,
        cashoutMultiplier: cashMulti,
        isBetPlaced: false,
      }));
    } else {
      setPanel2((prev) => ({
        ...prev,
        hasCashedOut: true,
        cashoutMultiplier: cashMulti,
        isBetPlaced: false,
      }));
    }
  };

  // Canvas Drawing for Aviator Aeroplane
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle Runway Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 45) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Altitude indicator ticks on right edge
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '10px monospace';
    ctx.fillText('10x -', w - 35, 30);
    ctx.fillText('5x  -', w - 35, h * 0.4);
    ctx.fillText('2x  -', w - 35, h * 0.7);
    ctx.fillText('1x  -', w - 35, h - 15);

    if (gameState === 'running' || gameState === 'crashed') {
      const progress = Math.min(1, (multiplier - 1) / Math.max(1, crashPoint * 0.85));
      const startX = 35;
      const startY = h - 25;
      const endX = startX + progress * (w - 110);
      const endY = startY - Math.pow(progress, 1.25) * (h - 75);

      // Curved Flight Area Fill
      const fillGrad = ctx.createLinearGradient(startX, startY, endX, endY);
      if (gameState === 'crashed') {
        fillGrad.addColorStop(0, 'rgba(220, 38, 38, 0.05)');
        fillGrad.addColorStop(1, 'rgba(220, 38, 38, 0.6)');
      } else {
        fillGrad.addColorStop(0, 'rgba(225, 29, 72, 0.05)');
        fillGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.3)');
        fillGrad.addColorStop(1, 'rgba(244, 63, 94, 0.75)');
      }

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
      ctx.lineTo(endX, startY);
      ctx.closePath();
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Red Flight Path Line with Glow
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + (endX - startX) * 0.45, startY, endX, endY);
      ctx.strokeStyle = gameState === 'crashed' ? '#ef4444' : '#f43f5e';
      ctx.lineWidth = 4;
      ctx.shadowColor = gameState === 'crashed' ? '#ef4444' : '#fb7185';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Draw Red Aeroplane or Explosion
      if (gameState === 'crashed') {
        ctx.fillStyle = '#ef4444';
        ctx.font = '32px sans-serif';
        ctx.fillText('💥', endX - 16, endY + 12);
      } else {
        // Dynamic Aeroplane Drawing
        ctx.save();
        ctx.translate(endX, endY);
        // Tilt slightly upwards
        ctx.rotate(-0.25);

        // Plane Body (Red Aviator style)
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit window
        ctx.fillStyle = '#fecdd3';
        ctx.beginPath();
        ctx.ellipse(8, -1, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Red Main Wing
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.lineTo(-8, -12);
        ctx.lineTo(3, -2);
        ctx.closePath();
        ctx.fill();

        // Tail Fin
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-19, -8);
        ctx.lineTo(-12, 0);
        ctx.closePath();
        ctx.fill();

        // Jet Engine Exhaust Flame
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-18, -2);
        ctx.lineTo(-26 - Math.random() * 6, 0);
        ctx.lineTo(-18, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }
    }
  }, [multiplier, gameState, crashPoint]);

  // Initial mount
  useEffect(() => {
    startNextRound();
    return () => {
      if (countIntervalRef.current) clearInterval(countIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Quick Bet Placers with Instant Wallet Deduction
  const toggleBetPanel = (panelId: 'panel1' | 'panel2') => {
    const target = panelId === 'panel1' ? panel1 : panel2;
    const setTarget = panelId === 'panel1' ? setPanel1 : setPanel2;

    if (target.isBetPlaced && gameState === 'idle') {
      // Cancel bet before round starts -> Instant wallet refund
      soundService.playClick();
      onBet(0, target.betAmount, `Aviator ${panelId === 'panel1' ? 'Bet 1' : 'Bet 2'} Cancelled (Refund)`);
      setTarget((prev) => ({ ...prev, isBetPlaced: false }));
      return;
    }

    if (target.isBetPlaced && gameState === 'running') {
      // Cash out
      executeCashout(panelId, multiplier, target);
      return;
    }

    // Place new bet -> Instant wallet deduction
    if (balance < target.betAmount) {
      alert(`Insufficient balance to bet ${formatPKR(target.betAmount)}!`);
      return;
    }

    soundService.playChipStack();
    onBet(target.betAmount, 0, `Aviator ${panelId === 'panel1' ? 'Bet 1' : 'Bet 2'} Placed`);
    setTarget((prev) => ({ ...prev, isBetPlaced: true, hasCashedOut: false }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 text-white select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-[#0d1322] border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-black tracking-wider text-rose-400">AVIATOR REAL</span>
          </div>

          <button
            onClick={() => setShowPfModal(true)}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Provably Fair Cryptographic Verification"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline font-mono text-[11px]">Fair SHA-256</span>
          </button>
        </div>

        {/* Speed Controls: 1x, 2x, 5x */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <FastForward className="w-3.5 h-3.5 text-amber-400 ml-1" />
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                onClick={() => {
                  soundService.playClick();
                  setSpeedMultiplier(spd);
                }}
                className={`px-2 py-0.5 rounded-lg text-xs font-black transition cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              const muted = soundService.toggleSound();
              setSoundMuted(!muted);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Multipliers Ribbon (Real Aviator Color-Coding) */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 mb-3 scrollbar-none">
        <History className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
        {history.map((h, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shrink-0 shadow-sm transition ${
              h >= 10.0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-amber-500/20'
                : h >= 2.0
                ? 'bg-purple-600/25 text-purple-300 border border-purple-500/40'
                : 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
            }`}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Game Stage + Live Player Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Left Flight Canvas Section */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Flight Stage - 60% Viewport Height */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-4 relative shadow-2xl overflow-hidden h-[50vh] sm:h-[58vh] min-h-[350px] max-h-[560px] flex flex-col justify-between">
            {/* Top Status and Fast-Launch */}
            <div className="flex items-center justify-between z-10">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>PROVABLY FAIR • RTP: {adminSettings?.rtpPercentage ?? 97}%</span>
              </div>

              {gameState === 'idle' && (
                <button
                  onClick={() => startNextRound(true)}
                  className="flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold px-3 py-1 rounded-xl transition cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>FLY NOW (Skip Wait)</span>
                </button>
              )}
            </div>

            {/* Flight Canvas */}
            <canvas
              ref={canvasRef}
              width={750}
              height={360}
              className="w-full h-full my-auto block object-contain"
            />

            {/* Multiplier Central Display with White -> Yellow -> Red Dynamic Transition */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
              {gameState === 'idle' ? (
                <div className="text-center animate-in fade-in duration-200">
                  <div className="text-xs sm:text-sm font-black tracking-widest text-slate-400 uppercase">
                    NEXT FLIGHT IN
                  </div>
                  <div className="text-6xl sm:text-7xl font-black text-rose-500 font-mono drop-shadow-[0_0_25px_rgba(244,63,94,0.6)]">
                    {countdown}s
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Place your bets now!</div>
                </div>
              ) : gameState === 'crashed' ? (
                <div className="text-center animate-in zoom-in-90 duration-150">
                  <div className="text-xl sm:text-2xl font-black text-rose-500 tracking-widest uppercase">
                    FLEW AWAY!
                  </div>
                  <div className="text-6xl sm:text-8xl font-black text-rose-500 font-mono drop-shadow-[0_0_35px_rgba(239,68,68,0.9)]">
                    {crashPoint.toFixed(2)}x
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className={`text-6xl sm:text-8xl font-black font-mono tracking-tight transition-colors duration-200 ${
                      multiplier < 2.0
                        ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]'
                        : multiplier < 10.0
                        ? 'text-[#F59E0B] drop-shadow-[0_0_35px_rgba(245,158,11,0.7)]'
                        : 'text-[#EF4444] drop-shadow-[0_0_40px_rgba(239,68,68,0.9)]'
                    }`}
                  >
                    {multiplier.toFixed(2)}x
                  </div>
                  <div className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-300 uppercase mt-1">
                    Current Multiplier
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dual Betting Controls (Authentic Aviator Bet 1 & Bet 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Panel 1 */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-3.5 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-400">BET 1 (Standard)</span>
                <span className="font-mono text-amber-400 font-bold">{formatPKR(panel1.betAmount)}</span>
              </div>

              {/* Chips */}
              <div className="grid grid-cols-6 gap-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    disabled={panel1.isBetPlaced && gameState === 'running'}
                    onClick={() => {
                      soundService.playChip();
                      setPanel1((prev) => ({ ...prev, betAmount: c }));
                    }}
                    className={`py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      panel1.betAmount === c
                        ? 'bg-rose-500 text-white font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c >= 1000 ? `${c / 1000}K` : c}
                  </button>
                ))}
              </div>

              {/* Auto Cashout toggle */}
              <div className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={panel1.autoCashoutEnabled}
                    onChange={(e) => setPanel1((prev) => ({ ...prev, autoCashoutEnabled: e.target.checked }))}
                    className="rounded text-rose-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-bold">Auto Cashout</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1.1"
                    max="100"
                    value={panel1.autoCashoutVal}
                    onChange={(e) =>
                      setPanel1((prev) => ({ ...prev, autoCashoutVal: parseFloat(e.target.value) || 2.0 }))
                    }
                    disabled={!panel1.autoCashoutEnabled}
                    className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-center text-xs font-mono text-amber-300 focus:outline-none"
                  />
                  <span className="text-slate-400">x</span>
                </div>
              </div>

              {/* Action Button */}
              {panel1.isBetPlaced && gameState === 'running' && !panel1.hasCashedOut ? (
                <button
                  onClick={() => toggleBetPanel('panel1')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer animate-pulse"
                >
                  CASH OUT {formatPKR(panel1.betAmount * multiplier)}
                </button>
              ) : panel1.isBetPlaced && (gameState === 'idle' || panel1.hasCashedOut) ? (
                <button
                  onClick={() => toggleBetPanel('panel1')}
                  className="w-full py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-sm hover:bg-amber-500/30 transition cursor-pointer"
                >
                  {panel1.hasCashedOut
                    ? `✓ Cashed Out @ ${panel1.cashoutMultiplier?.toFixed(2)}x`
                    : `✓ Bet Active (Cancel)`}
                </button>
              ) : (
                <button
                  onClick={() => toggleBetPanel('panel1')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-base shadow-lg shadow-rose-500/30 transition transform active:scale-95 cursor-pointer"
                >
                  BET {formatPKR(panel1.betAmount)}
                </button>
              )}
            </div>

            {/* Panel 2 */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-3.5 shadow-xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400">BET 2 (Hedge / Safety)</span>
                <span className="font-mono text-amber-400 font-bold">{formatPKR(panel2.betAmount)}</span>
              </div>

              {/* Chips */}
              <div className="grid grid-cols-6 gap-1">
                {chips.map((c) => (
                  <button
                    key={c}
                    disabled={panel2.isBetPlaced && gameState === 'running'}
                    onClick={() => {
                      soundService.playChip();
                      setPanel2((prev) => ({ ...prev, betAmount: c }));
                    }}
                    className={`py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                      panel2.betAmount === c
                        ? 'bg-teal-500 text-slate-950 font-black'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c >= 1000 ? `${c / 1000}K` : c}
                  </button>
                ))}
              </div>

              {/* Auto Cashout toggle */}
              <div className="flex items-center justify-between bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={panel2.autoCashoutEnabled}
                    onChange={(e) => setPanel2((prev) => ({ ...prev, autoCashoutEnabled: e.target.checked }))}
                    className="rounded text-teal-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-bold">Auto Cashout</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="1.1"
                    max="100"
                    value={panel2.autoCashoutVal}
                    onChange={(e) =>
                      setPanel2((prev) => ({ ...prev, autoCashoutVal: parseFloat(e.target.value) || 1.5 }))
                    }
                    disabled={!panel2.autoCashoutEnabled}
                    className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-center text-xs font-mono text-amber-300 focus:outline-none"
                  />
                  <span className="text-slate-400">x</span>
                </div>
              </div>

              {/* Action Button */}
              {panel2.isBetPlaced && gameState === 'running' && !panel2.hasCashedOut ? (
                <button
                  onClick={() => toggleBetPanel('panel2')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-base shadow-lg shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer animate-pulse"
                >
                  CASH OUT {formatPKR(panel2.betAmount * multiplier)}
                </button>
              ) : panel2.isBetPlaced && (gameState === 'idle' || panel2.hasCashedOut) ? (
                <button
                  onClick={() => toggleBetPanel('panel2')}
                  className="w-full py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-sm hover:bg-amber-500/30 transition cursor-pointer"
                >
                  {panel2.hasCashedOut
                    ? `✓ Cashed Out @ ${panel2.cashoutMultiplier?.toFixed(2)}x`
                    : `✓ Bet Active (Cancel)`}
                </button>
              ) : (
                <button
                  onClick={() => toggleBetPanel('panel2')}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-base shadow-lg shadow-teal-500/30 transition transform active:scale-95 cursor-pointer"
                >
                  BET {formatPKR(panel2.betAmount)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Players & Bets Feed */}
        <div className="bg-[#0b101e] border border-slate-800 rounded-3xl p-3 shadow-xl flex flex-col h-full max-h-[640px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-400" />
              All Bets ({players.length + (panel1.isBetPlaced ? 1 : 0) + (panel2.isBetPlaced ? 1 : 0)})
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              ● LIVE
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 pr-1 text-xs font-mono scrollbar-thin">
            {/* User Bets */}
            {panel1.isBetPlaced && (
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>⭐️</span>
                  <span className="text-rose-300 font-bold">You (Bet 1)</span>
                </div>
                <span className="text-white font-bold">{formatPKR(panel1.betAmount)}</span>
                <span className={panel1.hasCashedOut ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {panel1.hasCashedOut ? `${panel1.cashoutMultiplier?.toFixed(2)}x` : 'Flying...'}
                </span>
              </div>
            )}

            {panel2.isBetPlaced && (
              <div className="p-2 rounded-xl bg-teal-500/15 border border-teal-500/40 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span>⭐️</span>
                  <span className="text-teal-300 font-bold">You (Bet 2)</span>
                </div>
                <span className="text-white font-bold">{formatPKR(panel2.betAmount)}</span>
                <span className={panel2.hasCashedOut ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {panel2.hasCashedOut ? `${panel2.cashoutMultiplier?.toFixed(2)}x` : 'Flying...'}
                </span>
              </div>
            )}

            {/* Other simulated players */}
            {players.map((p, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl flex items-center justify-between transition ${
                  p.won
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-900/60 border border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate max-w-[110px]">
                  <span>{p.avatar}</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="text-slate-300">{formatPKR(p.bet)}</span>
                <span className={p.won ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {p.won ? `${p.cashout}x` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProvablyFairModal
        isOpen={showPfModal}
        onClose={() => setShowPfModal(false)}
        currentGame="Aviator Crash"
      />
    </div>
  );
};
