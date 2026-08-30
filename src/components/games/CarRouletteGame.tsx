import React, { useState } from 'react';
import { ArrowLeft, Trophy, RefreshCw, Volume2, VolumeX, ShieldCheck, Sparkles, Car } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface CarRouletteProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface CarBrand {
  id: string;
  name: string;
  emoji: string;
  tier: 'luxury' | 'popular';
  mult: number;
  color: string;
}

const CAR_BRANDS: CarBrand[] = [
  { id: 'ferrari', name: 'Ferrari', emoji: '🏎️', tier: 'luxury', mult: 40, color: 'bg-red-600' },
  { id: 'lambo', name: 'Lamborghini', emoji: '🏎️', tier: 'luxury', mult: 30, color: 'bg-yellow-600' },
  { id: 'porsche', name: 'Porsche', emoji: '🏎️', tier: 'luxury', mult: 20, color: 'bg-amber-600' },
  { id: 'maserati', name: 'Maserati', emoji: '🏎️', tier: 'luxury', mult: 10, color: 'bg-blue-600' },
  { id: 'bmw', name: 'BMW', emoji: '🚗', tier: 'popular', mult: 5, color: 'bg-sky-700' },
  { id: 'mercedes', name: 'Mercedes', emoji: '🚗', tier: 'popular', mult: 5, color: 'bg-slate-600' },
  { id: 'audi', name: 'Audi', emoji: '🚗', tier: 'popular', mult: 5, color: 'bg-red-800' },
  { id: 'vw', name: 'Volkswagen', emoji: '🚗', tier: 'popular', mult: 5, color: 'bg-indigo-700' },
];

export const CarRouletteGame: React.FC<CarRouletteProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<string, number>>({});
  const [selectedChip, setSelectedChip] = useState(50);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeSlot, setActiveSlot] = useState(0);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<CarBrand[]>([
    CAR_BRANDS[4], CAR_BRANDS[0], CAR_BRANDS[5], CAR_BRANDS[6], CAR_BRANDS[1]
  ]);

  const chips = [20, 50, 100, 500, 1000, 5000];

  const addBet = (id: string) => {
    if (isSpinning) return;
    if (userBalance < selectedChip) {
      alert('Insufficient balance!');
      return;
    }
    soundService.playChip();
    setBets(prev => ({ ...prev, [id]: (prev[id] || 0) + selectedChip }));
    onUpdateBalance(userBalance - selectedChip);
  };

  const clearBets = () => {
    if (isSpinning) return;
    const total = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (total > 0) {
      soundService.playClick();
      onUpdateBalance(userBalance + total);
      setBets({});
    }
  };

  const handleSpin = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Please place a bet on any car brand or tier!');
      return;
    }

    setIsSpinning(true);
    setWinnerMessage(null);
    soundService.playSpinTick();

    const totalSteps = 24 + Math.floor(Math.random() * 10);
    let currentStep = 0;
    const interval = setInterval(() => {
      setActiveSlot(prev => (prev + 1) % CAR_BRANDS.length);
      currentStep++;

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        const forced = adminSettings?.forcedResults?.carRoulette;
        const masterMode = adminSettings?.masterOutcomeMode;
        const globalWin = adminSettings?.globalWinRate ?? 65;
        const willWin = masterMode === 'always_win' || (masterMode !== 'always_lose' && (Math.random() * 100 < globalWin));

        let winningIndex: number;
        const bettedIds = Object.keys(bets).filter(k => bets[k] > 0);

        if (forced === 'ferrari') {
          winningIndex = CAR_BRANDS.findIndex(c => c.id === 'ferrari');
          if (winningIndex === -1) winningIndex = 0;
        } else if (forced === 'lambo') {
          winningIndex = CAR_BRANDS.findIndex(c => c.id === 'lamborghini');
          if (winningIndex === -1) winningIndex = 0;
        } else if (forced === 'bmw') {
          winningIndex = CAR_BRANDS.findIndex(c => c.id === 'bmw');
          if (winningIndex === -1) winningIndex = 0;
        } else if (willWin && bettedIds.length > 0) {
          const targetId = bettedIds[Math.floor(Math.random() * bettedIds.length)];
          winningIndex = CAR_BRANDS.findIndex(c => c.id === targetId || c.tier === targetId);
          if (winningIndex === -1) winningIndex = Math.floor(Math.random() * CAR_BRANDS.length);
        } else if (masterMode === 'always_lose') {
          const unbetted = CAR_BRANDS.map((c, i) => !bettedIds.includes(c.id) && !bettedIds.includes(c.tier) ? i : -1).filter(i => i !== -1);
          winningIndex = unbetted.length > 0 ? unbetted[Math.floor(Math.random() * unbetted.length)] : 0;
        } else {
          winningIndex = Math.floor(Math.random() * CAR_BRANDS.length);
        }

        setActiveSlot(winningIndex);
        const winner = CAR_BRANDS[winningIndex];
        setHistory(h => [winner, ...h.slice(0, 9)]);

        let winAmount = 0;
        if (bets[winner.id]) winAmount += bets[winner.id] * winner.mult;
        if (bets[winner.tier]) winAmount += bets[winner.tier] * (winner.tier === 'luxury' ? 5 : 2);

        if (winAmount > 0) {
          onUpdateBalance(userBalance + winAmount);
          onRecordBet('car_roulette', 'Supercar Roulette', totalBet, winAmount, +(winAmount / totalBet).toFixed(2));
          setWinnerMessage(`🎉 ${winner.name.toUpperCase()} WON! (${winner.mult}x) +Rs ${winAmount.toLocaleString()}`);
          soundService.playWin();
        } else {
          onRecordBet('car_roulette', 'Supercar Roulette', totalBet, 0, 0);
          setWinnerMessage(`${winner.name} (${winner.mult}x) hit. Good luck next round!`);
          soundService.playLose();
        }

        setIsSpinning(false);
        setBets({});
      }
    }, 90);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0a1524] via-[#10243d] to-[#060c14] text-slate-100 rounded-3xl p-3 sm:p-5 border border-blue-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-800/60 pb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>🏎️</span>
            <span>SUPERCAR ROULETTE</span>
          </h1>
          <span className="text-[10px] text-blue-300 font-medium">Ferrari (40x) • Lambo (30x) • BMW (5x) • Benz (5x)</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-black/40 border border-blue-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Recent:</span>
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-blue-500/30 shrink-0">
            <span className="text-xs font-bold text-slate-200">{h.name}</span>
            <span className="text-[9px] font-bold text-amber-300">({h.mult}x)</span>
          </div>
        ))}
      </div>

      {/* Main Supercar Wheel */}
      <div className="my-auto bg-[#091524] border-4 border-blue-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Car Ring Slots */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg mb-3">
          {CAR_BRANDS.map((car, idx) => {
            const isTarget = activeSlot === idx;
            return (
              <div
                key={car.id}
                onClick={() => addBet(car.id)}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border-2 cursor-pointer ${
                  isTarget
                    ? 'bg-amber-400 text-slate-950 border-white scale-110 shadow-2xl shadow-amber-400/80 z-10'
                    : `${car.color} text-white border-white/20 hover:opacity-100 opacity-80`
                }`}
              >
                <span className="text-2xl">{car.emoji}</span>
                <span className="text-[10px] font-black uppercase mt-1 truncate">{car.name}</span>
                <span className={`text-[9px] font-bold ${isTarget ? 'text-slate-950 font-black' : 'text-amber-300'}`}>
                  {car.mult}x
                </span>
                {bets[car.id] > 0 && (
                  <span className="bg-slate-950 text-amber-300 text-[9px] font-black px-1.5 rounded-full mt-0.5">
                    Rs {bets[car.id]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Center Result Banner */}
        {winnerMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Tier Betting Felts */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-lg mt-2">
          {/* Luxury Supercars (4x) */}
          <div
            onClick={() => addBet('luxury')}
            className="bg-amber-900/60 hover:bg-amber-800/80 border-2 border-amber-500 rounded-2xl p-2.5 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-xs font-black text-amber-300">👑 TOP LUXURY (5x)</span>
            <div className="h-5 flex items-center justify-center">
              {bets['luxury'] > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets['luxury']}
                </span>
              )}
            </div>
          </div>

          {/* Popular Brands (2x) */}
          <div
            onClick={() => addBet('popular')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-2.5 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-xs font-black text-blue-300">🚗 POPULAR TIERS (2x)</span>
            <div className="h-5 flex items-center justify-center">
              {bets['popular'] > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets['popular']}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips & Controls */}
      <div className="bg-[#050e1a] border border-blue-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {chips.map(c => (
            <button
              key={c}
              onClick={() => {
                soundService.playChip();
                setSelectedChip(c);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer border ${
                selectedChip === c
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Rs {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {totalCurrentBet > 0 && (
            <button
              onClick={clearBets}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold border border-slate-600 cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50"
          >
            {isSpinning ? 'Spinning...' : `Spin (Rs ${totalCurrentBet})`}
          </button>
        </div>
      </div>
    </div>
  );
};
