import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Bomb, 
  Diamond, 
  Sparkles, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Zap, 
  RotateCcw, 
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';
import { ProvablyFairModal } from '../modals/ProvablyFairModal';
import { 
  loadProvablyFairState, 
  saveProvablyFairState, 
  generateMinesGrid 
} from '../../services/provablyFair';

interface MinesGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface TileState {
  index: number;
  revealed: boolean;
  isMine: boolean;
  isTriggeredBomb?: boolean;
}

interface HistoryItem {
  id: string;
  mines: number;
  gems: number;
  multiplier: number;
  payout: number;
  status: 'won' | 'busted';
  timestamp: number;
}

export const MinesGame: React.FC<MinesGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  // Game Configuration State
  const [mineCount, setMineCount] = useState<number>(3);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(!soundService.isEnabled());
  const [autoCashoutTarget, setAutoCashoutTarget] = useState<number | null>(null);

  // Active Round State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [grid, setGrid] = useState<TileState[]>(() => 
    Array.from({ length: 25 }, (_, i) => ({ index: i, revealed: false, isMine: false }))
  );
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [nextMultiplier, setNextMultiplier] = useState<number>(1.1);
  const [multiplierLadder, setMultiplierLadder] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Provably Fair Transparency
  const [serverSeedHash, setServerSeedHash] = useState<string>('');
  const [revealedServerSeed, setRevealedServerSeed] = useState<string | null>(null);
  const [clientSeed, setClientSeed] = useState<string>(() => loadProvablyFairState().clientSeed || 'user-seed-786');
  const [nonce, setNonce] = useState<number>(() => loadProvablyFairState().nonce || 1);
  const [showPfModal, setShowPfModal] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  // Round History
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 'h1', mines: 3, gems: 4, multiplier: 1.67, payout: 167, status: 'won', timestamp: Date.now() - 120000 },
    { id: 'h2', mines: 5, gems: 2, multiplier: 1.58, payout: 158, status: 'won', timestamp: Date.now() - 90000 },
    { id: 'h3', mines: 3, gems: 1, multiplier: 0, payout: 0, status: 'busted', timestamp: Date.now() - 60000 },
    { id: 'h4', mines: 1, gems: 7, multiplier: 1.34, payout: 134, status: 'won', timestamp: Date.now() - 30000 },
  ]);

  const ladderScrollRef = useRef<HTMLDivElement>(null);

  const quickBets = [20, 50, 100, 250, 500, 1000, 2500, 5000];
  const minePresets = [1, 2, 3, 5, 10, 15, 20, 24];

  // Mathematical Multiplier Calculator (Formula: P(k) = prod_{i=0..k-1}(25-M-i)/(25-i), mult = 0.97 / P(k))
  const calculateLocalMultiplier = (mines: number, gems: number): number => {
    if (gems <= 0) return 1.0;
    const safeTiles = 25 - mines;
    if (gems > safeTiles) gems = safeTiles;
    let prob = 1.0;
    for (let i = 0; i < gems; i++) {
      prob *= (safeTiles - i) / (25 - i);
    }
    const raw = (1 / prob) * 0.97;
    return Math.max(1.02, Math.floor(raw * 100) / 100);
  };

  const calculateLadder = (mines: number): number[] => {
    const totalGems = 25 - mines;
    const ladder: number[] = [];
    for (let g = 1; g <= totalGems; g++) {
      ladder.push(calculateLocalMultiplier(mines, g));
    }
    return ladder;
  };

  // Fetch or calculate ladder whenever mine count changes
  useEffect(() => {
    const localLadder = calculateLadder(mineCount);
    setMultiplierLadder(localLadder);
    setNextMultiplier(localLadder[0] || 1.05);

    // Try fetching authoritative ladder from backend
    fetch(`/api/games/mines/ladder/${mineCount}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.ladder)) {
          setMultiplierLadder(data.ladder);
          setNextMultiplier(data.ladder[0] || 1.05);
        }
      })
      .catch(() => {
        // Fallback to local math
      });
  }, [mineCount]);

  // Auto-scroll multiplier ladder to current gem step
  useEffect(() => {
    if (ladderScrollRef.current && gemsFound > 0) {
      const activeElement = ladderScrollRef.current.children[gemsFound - 1] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [gemsFound]);

  // Handle Start Round (Authoritative Backend + Local Fallback)
  const handleStartGame = async () => {
    if (balance < betAmount) {
      soundService.playBeep(300);
      setErrorMessage('Insufficient balance! Please deposit or adjust bet.');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    soundService.playClick();
    setErrorMessage(null);
    setRevealedServerSeed(null);

    // Automated balance deduction on start
    onBet(betAmount, 0, `Mines (${mineCount} Mines) Placed`);

    const newNonce = nonce + 1;
    setNonce(newNonce);

    // Reset board
    setGrid(Array.from({ length: 25 }, (_, i) => ({ index: i, revealed: false, isMine: false })));
    setGemsFound(0);
    setCurrentMultiplier(1.0);
    setGameOver(false);
    setHasWon(false);
    setLastWinAmount(0);

    try {
      // Call Node.js Backend API
      const res = await fetch('/api/games/mines/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betAmount,
          mineCount,
          clientSeed,
          nonce: newNonce,
        }),
      });

      const data = await res.json();

      if (data.success && data.session) {
        setSessionId(data.session.id);
        setServerSeedHash(data.serverSeedHash);
        if (data.session.multiplierLadder) {
          setMultiplierLadder(data.session.multiplierLadder);
          setNextMultiplier(data.session.multiplierLadder[0] || 1.05);
        }
        setIsPlaying(true);
        return;
      }
    } catch (err) {
      console.warn('Backend Mines API unavailable, falling back to local Provably Fair engine', err);
    }

    // Local Fallback Mode
    const pfState = loadProvablyFairState();
    const updatedPf = { ...pfState, nonce: newNonce };
    saveProvablyFairState(updatedPf);

    const pfGrid = generateMinesGrid(updatedPf.serverSeed, clientSeed, newNonce, 25, mineCount);
    setServerSeedHash(updatedPf.serverSeedHash);
    setSessionId(`local_${Date.now()}`);
    setGrid(pfGrid.map((isMine, index) => ({ index, revealed: false, isMine })));
    setIsPlaying(true);
  };

  // Handle Tile Click (Authoritative Backend + Local Fallback)
  const handleTileClick = async (index: number) => {
    if (!isPlaying || gameOver || grid[index].revealed) return;

    soundService.playClick();

    // 1. Try Backend API
    if (sessionId && !sessionId.startsWith('local_')) {
      try {
        const res = await fetch('/api/games/mines/reveal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            tileIndex: index,
          }),
        });
        const data = await res.json();

        if (data.success) {
          if (data.isMine) {
            // Player Busted!
            handleBustOutcome(index, data.mines || [], data.serverSeed);
          } else {
            // Diamond Revealed!
            handleDiamondOutcome(index, data.gemsFound, data.currentMultiplier, data.nextMultiplier, data.status === 'cashed_out', data.payout, data.mines, data.serverSeed);
          }
          return;
        }
      } catch (err) {
        console.warn('API reveal error, evaluating local state', err);
      }
    }

    // 2. Local Mode Tile Evaluation (with Admin Settings & RTP overrides)
    let tile = grid[index];
    const forced = adminSettings?.forcedResults?.mines;
    const masterMode = adminSettings?.masterOutcomeMode;

    if (masterMode === 'always_win' || forced === 'safe') {
      if (tile.isMine) {
        const safeIdx = grid.findIndex((t, i) => !t.isMine && !t.revealed && i !== index);
        if (safeIdx !== -1) {
          grid[safeIdx].isMine = true;
          grid[index].isMine = false;
          tile = grid[index];
        }
      }
    } else if (masterMode === 'always_lose' || forced === 'bomb') {
      tile.isMine = true;
      grid[index].isMine = true;
    } else if (tile.isMine) {
      const shouldWin = shouldPlayerWin('mines_treasure', adminSettings, 0.55);
      if (shouldWin && gemsFound < 2) {
        const safeIdx = grid.findIndex((t, i) => !t.isMine && !t.revealed && i !== index);
        if (safeIdx !== -1) {
          grid[safeIdx].isMine = true;
          grid[index].isMine = false;
          tile = grid[index];
        }
      }
    }

    if (tile.isMine) {
      const allMineIndices = grid.map((t, idx) => (t.isMine ? idx : -1)).filter((idx) => idx !== -1);
      const pfState = loadProvablyFairState();
      handleBustOutcome(index, allMineIndices, pfState.serverSeed);
    } else {
      const newGems = gemsFound + 1;
      const ladder = multiplierLadder.length ? multiplierLadder : calculateLadder(mineCount);
      const newMult = ladder[newGems - 1] || calculateLocalMultiplier(mineCount, newGems);
      const nextMult = ladder[newGems] || calculateLocalMultiplier(mineCount, newGems + 1);
      const isBoardCleared = newGems === 25 - mineCount;

      handleDiamondOutcome(
        index,
        newGems,
        newMult,
        nextMult,
        isBoardCleared,
        Math.floor(betAmount * newMult),
        isBoardCleared ? grid.map((t, i) => (t.isMine ? i : -1)).filter((i) => i !== -1) : undefined
      );
    }
  };

  // Bust Handling (Hit Mine)
  const handleBustOutcome = (
    hitIndex: number,
    allMines: number[],
    serverSeed?: string
  ) => {
    soundService.playExplosion();
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 600);
    if (serverSeed) setRevealedServerSeed(serverSeed);

    const updatedGrid = grid.map((t) => {
      const isMine = allMines.includes(t.index) || t.isMine;
      return {
        ...t,
        revealed: true,
        isMine,
        isTriggeredBomb: t.index === hitIndex,
      };
    });

    setGrid(updatedGrid);
    setGameOver(true);
    setIsPlaying(false);
    setHasWon(false);

    // Record 0 payout in history
    setHistory((prev) => [
      {
        id: 'h_' + Date.now(),
        mines: mineCount,
        gems: gemsFound,
        multiplier: 0,
        payout: 0,
        status: 'busted',
        timestamp: Date.now(),
      },
      ...prev.slice(0, 9),
    ]);

    onBet(0, 0, `Mines (${mineCount} mines) hit bomb after ${gemsFound} gems`);
  };

  // Diamond Revealed Handling
  const handleDiamondOutcome = (
    index: number,
    newGems: number,
    newMult: number,
    nextMult: number | null,
    isCompleted: boolean,
    winPayout: number,
    allMines?: number[],
    serverSeed?: string
  ) => {
    soundService.playDiamondSparkle(newGems);

    const updatedGrid = [...grid];
    updatedGrid[index] = { ...updatedGrid[index], revealed: true, isMine: false };

    setGrid(updatedGrid);
    setGemsFound(newGems);
    setCurrentMultiplier(newMult);
    if (nextMult) setNextMultiplier(nextMult);

    // Check Auto Cashout Target
    if (autoCashoutTarget && newMult >= autoCashoutTarget) {
      handleCashOut(newMult, newGems);
      return;
    }

    // Auto cashout if all diamonds found
    if (isCompleted) {
      if (allMines) {
        setGrid((prev) =>
          prev.map((t) => ({ ...t, revealed: true, isMine: allMines.includes(t.index) }))
        );
      }
      if (serverSeed) setRevealedServerSeed(serverSeed);
      executeCashoutSuccess(newMult, newGems, winPayout);
    }
  };

  // Cash Out Active Winnings
  const handleCashOut = async (overrideMult?: number, overrideGems?: number) => {
    const gems = overrideGems ?? gemsFound;
    if (!isPlaying || gameOver || gems === 0) return;

    soundService.playSuccess();
    const ladder = multiplierLadder.length ? multiplierLadder : calculateLadder(mineCount);
    const finalMult = overrideMult ?? currentMultiplier;
    const finalWin = Math.floor(betAmount * finalMult);

    // Call Backend API
    if (sessionId && !sessionId.startsWith('local_')) {
      try {
        const res = await fetch('/api/games/mines/cashout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (data.success) {
          if (data.serverSeed) setRevealedServerSeed(data.serverSeed);
          if (data.mines) {
            setGrid((prev) =>
              prev.map((t) => ({ ...t, revealed: true, isMine: data.mines.includes(t.index) }))
            );
          }
          executeCashoutSuccess(data.multiplier, data.gemsFound, data.payout);
          return;
        }
      } catch (err) {
        console.warn('Backend cashout failed, resolving locally', err);
      }
    }

    // Local Fallback
    const pfState = loadProvablyFairState();
    setRevealedServerSeed(pfState.serverSeed);
    setGrid((prev) => prev.map((t) => ({ ...t, revealed: true })));
    executeCashoutSuccess(finalMult, gems, finalWin);
  };

  const executeCashoutSuccess = (mult: number, gems: number, winAmt: number) => {
    setGameOver(true);
    setIsPlaying(false);
    setHasWon(true);
    setLastWinAmount(winAmt);

    triggerWinConfetti();
    playOutcomeCelebration(winAmt, betAmount, mult >= 3);

    // Credit winnings to wallet balance
    onBet(0, winAmt, `Mines Cashed Out (${mineCount} mines, ${gems} gems) @ ${mult}x`);

    // Add to history
    setHistory((prev) => [
      {
        id: 'h_' + Date.now(),
        mines: mineCount,
        gems,
        multiplier: mult,
        payout: winAmt,
        status: 'won',
        timestamp: Date.now(),
      },
      ...prev.slice(0, 9),
    ]);
  };

  // 1-Click Fast Random Tile Pick
  const handleRandomPick = () => {
    if (!isPlaying || gameOver) return;
    const unrevealed = grid.filter((t) => !t.revealed).map((t) => t.index);
    if (unrevealed.length === 0) return;
    const pick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    handleTileClick(pick);
  };

  // Win Chance on Next Pick
  const remainingTiles = 25 - gemsFound;
  const remainingSafeTiles = Math.max(0, 25 - mineCount - gemsFound);
  const winChancePercent = remainingTiles > 0 ? ((remainingSafeTiles / remainingTiles) * 100).toFixed(1) : '0';

  const copyServerSeedHash = () => {
    if (!serverSeedHash) return;
    navigator.clipboard.writeText(serverSeedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div id="mines-game-container" className="w-full max-w-6xl mx-auto p-2 sm:p-4 text-white select-none">
      {/* Top Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="mines-back-to-lobby-btn"
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold border border-slate-700/80 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl shadow-inner">
            <Diamond className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="text-xs sm:text-sm font-black tracking-wider text-cyan-300">
              MINES 5×5 PRO
            </span>
          </div>

          <button
            id="mines-fairness-modal-btn"
            onClick={() => setShowPfModal(true)}
            className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
            title="Provably Fair SHA-256 Verification"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[11px] hidden md:inline">Fair SHA-256</span>
          </button>
        </div>

        {/* Balance & Settings */}
        <div className="flex items-center gap-2.5">
          <button
            id="mines-turbo-toggle-btn"
            onClick={() => setIsTurbo(!isTurbo)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isTurbo
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Fast Animation Turbo Mode"
          >
            <Zap className={`w-3.5 h-3.5 inline mr-1 ${isTurbo ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span className="text-[11px]">Turbo</span>
          </button>

          <button
            id="mines-sound-toggle-btn"
            onClick={() => {
              const muted = soundService.toggleSound();
              setSoundMuted(!muted);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Toggle Sound"
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <div className="bg-slate-950 border border-amber-500/30 px-3.5 py-1.5 rounded-xl font-mono text-right shadow-inner">
            <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wide">
              Balance
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {formatPKR(balance)}
            </span>
          </div>
        </div>
      </header>

      {/* Error Alert Bar */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2.5 bg-rose-950/90 border border-rose-500/60 rounded-xl text-rose-200 text-xs font-semibold flex items-center justify-between"
          >
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Game Interface (2-Column Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Control Panel (4 Cols on desktop) */}
        <section className="lg:col-span-4 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
          {/* Bet Amount Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Bet Amount</span>
              <span className="text-amber-400 font-mono text-sm">{formatPKR(betAmount)}</span>
            </div>

            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                ₨
              </div>
              <input
                id="mines-bet-input"
                type="number"
                disabled={isPlaying}
                min={10}
                max={50000}
                step={10}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(10, Math.min(50000, Number(e.target.value) || 10)))}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-20 py-2.5 text-amber-300 font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 disabled:opacity-60"
              />
              <div className="absolute inset-y-0 right-1 flex items-center gap-1">
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setBetAmount((b) => Math.max(10, Math.floor(b / 2)))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setBetAmount((b) => Math.min(50000, b * 2))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-[10px] font-bold rounded-lg transition cursor-pointer"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={() => setBetAmount(Math.min(50000, Math.max(10, balance)))}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-400 text-[10px] font-bold rounded-lg transition cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Quick Chip Presets */}
            <div className="grid grid-cols-4 gap-1.5">
              {quickBets.map((amt) => (
                <button
                  key={amt}
                  disabled={isPlaying}
                  onClick={() => {
                    soundService.playChip();
                    setBetAmount(amt);
                  }}
                  className={`py-1.5 rounded-xl text-[11px] font-mono font-bold transition cursor-pointer disabled:opacity-40 ${
                    betAmount === amt
                      ? 'bg-amber-400 text-slate-950 shadow-md scale-102 font-black'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {amt >= 1000 ? `${amt / 1000}k` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Mines Count Selector */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-300">Number of Mines</span>
              <span className="text-rose-400 font-mono font-bold flex items-center gap-1">
                <Bomb className="w-3.5 h-3.5" />
                {mineCount} {mineCount === 1 ? 'Mine' : 'Mines'}
              </span>
            </div>

            {/* Preset Pills */}
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {minePresets.map((cnt) => (
                <button
                  key={cnt}
                  disabled={isPlaying}
                  onClick={() => {
                    soundService.playClick();
                    setMineCount(cnt);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-40 ${
                    mineCount === cnt
                      ? 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/30'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>

            {/* Slider & Stepper */}
            <div className="flex items-center gap-2">
              <button
                disabled={isPlaying || mineCount <= 1}
                onClick={() => setMineCount((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold flex items-center justify-center text-sm transition cursor-pointer"
              >
                -
              </button>
              <input
                id="mines-range-slider"
                type="range"
                disabled={isPlaying}
                min={1}
                max={24}
                value={mineCount}
                onChange={(e) => setMineCount(Number(e.target.value))}
                className="flex-1 accent-rose-500 cursor-pointer disabled:opacity-50"
              />
              <button
                disabled={isPlaying || mineCount >= 24}
                onClick={() => setMineCount((c) => Math.min(24, c + 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold flex items-center justify-center text-sm transition cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Odds & Profit Breakdown Dashboard Card */}
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-2 text-xs font-mono shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Current Multiplier:
              </span>
              <span className="text-emerald-400 font-black text-sm">
                {currentMultiplier.toFixed(2)}×
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Next Multiplier:
              </span>
              <span className="text-cyan-400 font-black text-sm">
                {nextMultiplier.toFixed(2)}×
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-purple-400" />
                Next Pick Chance:
              </span>
              <span className="text-purple-300 font-bold">
                {winChancePercent}%
              </span>
            </div>

            <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between font-sans">
              <span className="text-slate-300 font-bold text-xs">Current Profit:</span>
              <span className="text-amber-300 font-mono font-black text-base">
                {formatPKR(Math.floor(betAmount * currentMultiplier))}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-auto">
            {!isPlaying ? (
              <button
                id="mines-start-btn"
                onClick={handleStartGame}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-emerald-500/20 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>START GAME ({formatPKR(betAmount)})</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  id="mines-cashout-btn"
                  onClick={() => handleCashOut()}
                  disabled={gemsFound === 0}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-slate-950 font-black text-base sm:text-lg shadow-xl shadow-emerald-500/30 transition transform active:scale-98 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 animate-pulse"
                >
                  <span>
                    CASHOUT {formatPKR(Math.floor(betAmount * currentMultiplier))}
                  </span>
                  <span className="text-xs bg-slate-950 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    {currentMultiplier.toFixed(2)}×
                  </span>
                </button>

                <button
                  id="mines-random-pick-btn"
                  onClick={handleRandomPick}
                  className="w-full py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
                >
                  <Shuffle className="w-4 h-4" />
                  <span>RANDOM SAFE PICK</span>
                </button>
              </div>
            )}
          </div>

          {/* Cryptographic Hash Commitment Mini-Badge */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-[10px] text-slate-400 font-mono">
            <div className="flex items-center justify-between mb-1">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Round Hash (Committed)</span>
              <button
                onClick={copyServerSeedHash}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                title="Copy SHA-256 Hash"
              >
                {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedHash ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="truncate text-slate-300 select-all font-mono">
              {serverSeedHash || 'Hash generated when round begins'}
            </div>
          </div>
        </section>

        {/* Right Side: Game Arena (8 Cols on desktop) */}
        <section className="lg:col-span-8 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Multiplier Ladder Ribbon */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold mb-1.5 px-1">
              <span>Multiplier Ladder ({25 - mineCount} Gems)</span>
              <span className="text-cyan-400 font-mono">Step {gemsFound} / {25 - mineCount}</span>
            </div>
            <div 
              ref={ladderScrollRef}
              className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {multiplierLadder.map((stepMult, idx) => {
                const stepNum = idx + 1;
                const isCurrent = stepNum === gemsFound;
                const isPassed = stepNum < gemsFound;
                const isNext = stepNum === gemsFound + 1;

                return (
                  <div
                    key={idx}
                    className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-center text-xs font-mono font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-500 text-slate-950 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300 font-black'
                        : isPassed
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-400'
                        : isNext
                        ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-[9px] opacity-70">#{stepNum}</div>
                    <div>{stepMult.toFixed(2)}×</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Outcome Status Banner */}
          <div className="flex items-center justify-between mb-3 px-2 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Diamond className="w-4 h-4 text-emerald-400" />
                <span>{gemsFound} Gems Found</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <Bomb className="w-4 h-4" />
                <span>{mineCount} Mines</span>
              </span>
            </div>

            <AnimatePresence>
              {hasWon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-3.5 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Cashed Out {formatPKR(lastWinAmount)} ({currentMultiplier.toFixed(2)}×)!</span>
                </motion.div>
              )}
              {gameOver && !hasWon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-rose-500/20 border border-rose-500/50 text-rose-300 px-3 py-1 rounded-full font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                >
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>BOOM! Mine Exploded</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5x5 Mines Board (25 Tiles) with Screen Shake effect on hazard explosion */}
          <motion.div
            animate={
              isShaking
                ? {
                    x: [-14, 14, -10, 10, -6, 6, -2, 2, 0],
                    y: [-4, 4, -2, 2, 0],
                    rotate: [-1.5, 1.5, -1, 1, 0],
                  }
                : {}
            }
            transition={{ duration: 0.55 }}
            className="grid grid-cols-5 gap-2 sm:gap-3 aspect-square max-w-[430px] mx-auto w-full my-auto"
          >
            {grid.map((tile) => {
              const isDisabled = !isPlaying || tile.revealed || gameOver;
              return (
                <motion.button
                  key={tile.index}
                  id={`mines-tile-${tile.index}`}
                  disabled={isDisabled}
                  onClick={() => handleTileClick(tile.index)}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  transition={{ duration: isTurbo ? 0.08 : 0.2 }}
                  className={`w-full h-full rounded-2xl flex items-center justify-center transition-all select-none relative group cursor-pointer shadow-lg ${
                    !tile.revealed
                      ? 'backdrop-blur-md bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 shadow-slate-950/80'
                      : tile.isMine
                      ? tile.isTriggeredBomb
                        ? 'bg-gradient-to-b from-rose-600 via-red-600 to-rose-900 border-2 border-rose-300 shadow-[0_0_20px_rgba(239,68,68,0.8)]'
                        : 'bg-rose-950/80 border border-rose-700/60 opacity-80'
                      : 'bg-gradient-to-b from-emerald-600/90 via-teal-700/90 to-slate-900 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  } ${isDisabled && !tile.revealed ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {tile.revealed && (
                    <motion.div
                      initial={{ scale: 0.2, rotateY: 180 }}
                      animate={{ scale: 1, rotateY: 0 }}
                      transition={{ duration: isTurbo ? 0.12 : 0.35, ease: 'easeOut' }}
                    >
                      {tile.isMine ? (
                        <Bomb
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            tile.isTriggeredBomb
                              ? 'text-white drop-shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse'
                              : 'text-rose-400'
                          }`}
                        />
                      ) : (
                        <Diamond className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-300 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" />
                      )}
                    </motion.div>
                  )}

                  {!tile.revealed && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-amber-400/60 transition shadow-inner" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Seed Revealed Footer for Past Round Verification */}
          {revealedServerSeed && (
            <div className="mt-3 p-2 bg-slate-950/80 border border-emerald-500/30 rounded-xl text-[10px] font-mono text-emerald-300 flex items-center justify-between">
              <span className="truncate">
                Server Seed Revealed: <span className="text-white font-bold">{revealedServerSeed}</span>
              </span>
              <button
                onClick={() => setShowPfModal(true)}
                className="text-cyan-400 hover:text-cyan-300 underline text-[10px] ml-2 flex-shrink-0 cursor-pointer"
              >
                Verify Fair
              </button>
            </div>
          )}

          {/* Past Rounds History Badges */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Recent Rounds:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[70%] scrollbar-none">
              {history.map((h) => (
                <span
                  key={h.id}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                    h.status === 'won'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                  }`}
                  title={`${h.mines} mines, ${h.gems} gems - ${h.status === 'won' ? formatPKR(h.payout) : 'Busted'}`}
                >
                  {h.status === 'won' ? `${h.multiplier.toFixed(2)}×` : '💥 0.00×'}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Cryptographic Provably Fair Modal */}
      <ProvablyFairModal
        isOpen={showPfModal}
        onClose={() => setShowPfModal(false)}
        currentGame="Mines 5x5"
      />
    </div>
  );
};
