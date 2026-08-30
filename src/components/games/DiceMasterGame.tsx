import React, { useState } from 'react';
import { ArrowLeft, Dices, Trophy, RefreshCw, Volume2, VolumeX, ShieldCheck, Zap, Sliders } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface DiceMasterProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

export const DiceMasterGame: React.FC<DiceMasterProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [targetNumber, setTargetNumber] = useState(50);
  const [rollMode, setRollMode] = useState<'under' | 'over'>('under');
  const [isRolling, setIsRolling] = useState(false);
  const [rolledNumber, setRolledNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [history, setHistory] = useState<{ roll: number; won: boolean }[]>([
    { roll: 42, won: true },
    { roll: 88, won: false },
    { roll: 12, won: true },
    { roll: 65, won: false },
    { roll: 33, won: true },
  ]);

  const bets = [10, 20, 50, 100, 250, 500, 1000];

  // Calculate dynamic multiplier based on win chance
  const winChance = rollMode === 'under' ? targetNumber : 100 - targetNumber;
  const multiplier = +( (96 / winChance) ).toFixed(2); // 96% base RTP formula

  const handleRoll = () => {
    if (isRolling) return;
    if (userBalance < bet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    setIsRolling(true);
    setLastWin(0);
    soundService.playDiceRoll();

    const interval = setInterval(() => {
      setRolledNumber(Math.floor(Math.random() * 100) + 1);
    }, 60);

    setTimeout(() => {
      clearInterval(interval);
      const rtp = adminSettings?.rtpRate ?? 92;
      const willWin = Math.random() * 100 < rtp;

      let finalRoll: number;
      if (willWin) {
        if (rollMode === 'under') {
          finalRoll = Math.floor(Math.random() * (targetNumber - 1)) + 1;
        } else {
          finalRoll = Math.floor(Math.random() * (100 - targetNumber)) + targetNumber + 1;
        }
      } else {
        if (rollMode === 'under') {
          finalRoll = Math.floor(Math.random() * (100 - targetNumber)) + targetNumber;
        } else {
          finalRoll = Math.floor(Math.random() * targetNumber) + 1;
        }
      }

      setRolledNumber(finalRoll);
      const isWon = rollMode === 'under' ? finalRoll < targetNumber : finalRoll > targetNumber;
      setHistory(h => [{ roll: finalRoll, won: isWon }, ...h.slice(0, 7)]);

      if (isWon) {
        const winAmount = Math.round(bet * multiplier);
        setLastWin(winAmount);
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('dice_master', `Dice Master (${rollMode.toUpperCase()} ${targetNumber})`, bet, winAmount, multiplier);
        soundService.playWin();
      } else {
        onRecordBet('dice_master', `Dice Master (${rollMode.toUpperCase()} ${targetNumber})`, bet, 0, 0);
        soundService.playLose();
      }

      setIsRolling(false);
    }, 1000);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#091522] via-[#0e2238] to-[#050c14] text-slate-100 rounded-3xl p-3 sm:p-5 border border-cyan-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-800/60 pb-3">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>🎲</span>
            <span>DICE MASTER 99x</span>
          </h1>
          <span className="text-[10px] text-cyan-300 font-medium">Custom Over/Under Slider • Multipliers up to 99x</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="bg-black/40 border border-cyan-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Recent:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              h.won ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {h.roll}
          </span>
        ))}
      </div>

      {/* Main Dice Slider Board */}
      <div className="my-auto bg-[#071321] border-4 border-cyan-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Big Rolled Number Display */}
        <div className="flex flex-col items-center my-3">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-900 border-4 border-cyan-300 flex items-center justify-center shadow-2xl">
            <span className="text-5xl sm:text-6xl font-black text-white font-mono drop-shadow-lg">
              {rolledNumber ?? 50}
            </span>
          </div>
          <span className="text-xs font-bold text-cyan-300 mt-2">
            {rolledNumber === null ? 'Slide & Roll' : rolledNumber < targetNumber && rollMode === 'under' ? '🎉 WIN!' : 'ROLL RESULT'}
          </span>
        </div>

        {/* Win Status Display */}
        {lastWin > 0 && (
          <div className="bg-black/80 px-6 py-1.5 rounded-2xl border-2 border-emerald-400 text-center animate-bounce mb-2">
            <span className="text-sm font-black text-emerald-400 font-mono">+Rs {lastWin.toLocaleString()}</span>
          </div>
        )}

        {/* Interactive Slider & Odds Box */}
        <div className="w-full max-w-md bg-black/60 p-4 rounded-2xl border border-cyan-600/40">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRollMode('under')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                  rollMode === 'under' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Roll Under &lt; {targetNumber}
              </button>
              <button
                onClick={() => setRollMode('over')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                  rollMode === 'over' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Roll Over &gt; {targetNumber}
              </button>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">MULTIPLIER</span>
              <span className="text-sm font-black text-amber-400 font-mono">{multiplier}x</span>
            </div>
          </div>

          {/* Range Slider */}
          <input
            type="range"
            min="5"
            max="95"
            value={targetNumber}
            onChange={(e) => setTargetNumber(Number(e.target.value))}
            className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>Min: 5</span>
            <span className="text-cyan-300 font-bold">Win Chance: {winChance}%</span>
            <span>Max: 95</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#050e18] border border-cyan-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {bets.map(b => (
            <button
              key={b}
              onClick={() => {
                soundService.playChip();
                setBet(b);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer border ${
                bet === b
                  ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md scale-105'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              Rs {b}
            </button>
          ))}
        </div>

        <button
          onClick={handleRoll}
          disabled={isRolling}
          className="px-10 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
          <span>{isRolling ? 'Rolling...' : `Roll Dice (Rs ${bet})`}</span>
        </button>
      </div>
    </div>
  );
};
