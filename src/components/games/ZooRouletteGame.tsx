import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface ZooRouletteProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface ZooAnimal {
  id: string;
  name: string;
  emoji: string;
  type: 'beast' | 'bird' | 'shark';
  mult: number;
  color: string;
}

const ZOO_ANIMALS: ZooAnimal[] = [
  { id: 'lion', name: 'Lion', emoji: '🦁', type: 'beast', mult: 12, color: 'bg-amber-600' },
  { id: 'panda', name: 'Panda', emoji: '🐼', type: 'beast', mult: 8, color: 'bg-slate-700' },
  { id: 'monkey', name: 'Monkey', emoji: '🐒', type: 'beast', mult: 8, color: 'bg-amber-800' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', type: 'beast', mult: 6, color: 'bg-rose-700' },
  { id: 'eagle', name: 'Eagle', emoji: '🦅', type: 'bird', mult: 12, color: 'bg-blue-700' },
  { id: 'peacock', name: 'Peacock', emoji: '🦚', type: 'bird', mult: 8, color: 'bg-teal-700' },
  { id: 'pigeon', name: 'Pigeon', emoji: '🕊️', type: 'bird', mult: 8, color: 'bg-indigo-700' },
  { id: 'swallow', name: 'Swallow', emoji: '🐦', type: 'bird', mult: 6, color: 'bg-sky-700' },
  { id: 'shark_gold', name: 'Gold Shark', emoji: '🦈', type: 'shark', mult: 24, color: 'bg-yellow-500' },
  { id: 'shark_silver', name: 'Silver Shark', emoji: '🦈', type: 'shark', mult: 24, color: 'bg-slate-400' },
];

export const ZooRouletteGame: React.FC<ZooRouletteProps> = ({
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
  const [history, setHistory] = useState<ZooAnimal[]>([
    ZOO_ANIMALS[0], ZOO_ANIMALS[4], ZOO_ANIMALS[1], ZOO_ANIMALS[8], ZOO_ANIMALS[3]
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
      alert('Please place a bet on any animal or category!');
      return;
    }

    setIsSpinning(true);
    setWinnerMessage(null);
    soundService.playSpinTick();

    const totalSteps = 24 + Math.floor(Math.random() * 10);
    let currentStep = 0;
    const interval = setInterval(() => {
      setActiveSlot(prev => (prev + 1) % ZOO_ANIMALS.length);
      currentStep++;

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        const forced = adminSettings?.forcedResults?.zooRoulette;
        const masterMode = adminSettings?.masterOutcomeMode;
        const globalWin = adminSettings?.globalWinRate ?? 65;
        const willWin = masterMode === 'always_win' || (masterMode !== 'always_lose' && (Math.random() * 100 < globalWin));

        // Choose winning animal
        let winningIndex: number;
        const bettedIds = Object.keys(bets).filter(k => bets[k] > 0);

        if (forced === 'shark') {
          winningIndex = ZOO_ANIMALS.findIndex(a => a.type === 'shark' || a.id.includes('shark'));
          if (winningIndex === -1) winningIndex = 0;
        } else if (forced === 'birds') {
          const birdIndices = ZOO_ANIMALS.map((a, i) => a.type === 'bird' ? i : -1).filter(i => i !== -1);
          winningIndex = birdIndices[Math.floor(Math.random() * birdIndices.length)];
        } else if (forced === 'beasts') {
          const beastIndices = ZOO_ANIMALS.map((a, i) => a.type === 'beast' ? i : -1).filter(i => i !== -1);
          winningIndex = beastIndices[Math.floor(Math.random() * beastIndices.length)];
        } else if (willWin && bettedIds.length > 0) {
          const targetId = bettedIds[Math.floor(Math.random() * bettedIds.length)];
          winningIndex = ZOO_ANIMALS.findIndex(a => a.id === targetId || a.type === targetId);
          if (winningIndex === -1) winningIndex = Math.floor(Math.random() * ZOO_ANIMALS.length);
        } else if (masterMode === 'always_lose') {
          const unbetted = ZOO_ANIMALS.map((a, i) => !bettedIds.includes(a.id) && !bettedIds.includes(a.type) ? i : -1).filter(i => i !== -1);
          winningIndex = unbetted.length > 0 ? unbetted[Math.floor(Math.random() * unbetted.length)] : 0;
        } else {
          winningIndex = Math.floor(Math.random() * ZOO_ANIMALS.length);
        }

        setActiveSlot(winningIndex);
        const winner = ZOO_ANIMALS[winningIndex];
        setHistory(h => [winner, ...h.slice(0, 9)]);

        // Calculate payout
        let winAmount = 0;
        if (bets[winner.id]) winAmount += bets[winner.id] * winner.mult;
        if (bets[winner.type]) winAmount += bets[winner.type] * (winner.type === 'shark' ? 12 : 2);

        if (winAmount > 0) {
          onUpdateBalance(userBalance + winAmount);
          onRecordBet('zoo_roulette', 'Zoo Roulette', totalBet, winAmount, +(winAmount / totalBet).toFixed(2));
          setWinnerMessage(`🎉 ${winner.emoji} ${winner.name.toUpperCase()} WON! (${winner.mult}x) +Rs ${winAmount.toLocaleString()}`);
          soundService.playWin();
        } else {
          onRecordBet('zoo_roulette', 'Zoo Roulette', totalBet, 0, 0);
          setWinnerMessage(`${winner.emoji} ${winner.name} (${winner.mult}x) hit. Better luck next spin!`);
          soundService.playLose();
        }

        setIsSpinning(false);
        setBets({});
      }
    }, 90);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#062419] via-[#0a3827] to-[#04140e] text-slate-100 rounded-3xl p-3 sm:p-5 border border-emerald-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
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
            <span>🦁</span>
            <span>ZOO ROULETTE (BIRDS &amp; BEASTS)</span>
          </h1>
          <span className="text-[10px] text-emerald-300 font-medium">Birds (2x) • Beasts (2x) • Golden Shark (24x)</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="bg-black/40 border border-emerald-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Recent:</span>
        {history.map((h, i) => (
          <div key={i} className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
            <span className="text-sm">{h.emoji}</span>
            <span className="text-[9px] font-bold text-amber-300">{h.mult}x</span>
          </div>
        ))}
      </div>

      {/* Main Circular Zoo Wheel Carousel */}
      <div className="my-auto bg-[#071d15] border-4 border-emerald-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Roulette Ring Slots */}
        <div className="grid grid-cols-5 gap-2 w-full max-w-lg mb-3">
          {ZOO_ANIMALS.map((animal, idx) => {
            const isTarget = activeSlot === idx;
            return (
              <div
                key={animal.id}
                className={`p-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-150 border-2 ${
                  isTarget
                    ? 'bg-amber-400 text-slate-950 border-white scale-110 shadow-2xl shadow-amber-400/80 z-10'
                    : `${animal.color} text-white border-white/20 opacity-80`
                }`}
              >
                <span className="text-2xl sm:text-3xl">{animal.emoji}</span>
                <span className="text-[9px] font-black uppercase mt-0.5 truncate">{animal.name}</span>
                <span className={`text-[8px] font-bold ${isTarget ? 'text-slate-900 font-black' : 'text-yellow-200'}`}>
                  {animal.mult}x
                </span>
              </div>
            );
          })}
        </div>

        {/* Center Result */}
        {winnerMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Category Betting Felts */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-lg mt-2">
          {/* Beast (2x) */}
          <div
            onClick={() => addBet('beast')}
            className="bg-amber-900/60 hover:bg-amber-800/80 border-2 border-amber-500 rounded-2xl p-2.5 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-xs font-black text-amber-300">🦁 BEASTS (2x)</span>
            <div className="h-5 flex items-center justify-center">
              {bets['beast'] > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets['beast']}
                </span>
              )}
            </div>
          </div>

          {/* Golden Shark (12x/24x) */}
          <div
            onClick={() => addBet('shark_gold')}
            className="bg-yellow-900/60 hover:bg-yellow-800/80 border-2 border-yellow-400 rounded-2xl p-2.5 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-xs font-black text-yellow-300">🦈 SHARK (24x)</span>
            <div className="h-5 flex items-center justify-center">
              {bets['shark_gold'] > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets['shark_gold']}
                </span>
              )}
            </div>
          </div>

          {/* Bird (2x) */}
          <div
            onClick={() => addBet('bird')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-2.5 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-xs font-black text-blue-300">🦅 BIRDS (2x)</span>
            <div className="h-5 flex items-center justify-center">
              {bets['bird'] > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets['bird']}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips Bar */}
      <div className="bg-[#04170f] border border-emerald-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
