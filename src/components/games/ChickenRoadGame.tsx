import React, { useState } from 'react';
import { ArrowLeft, Volume2, ShieldCheck, Flame, Sparkles, Coins, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface ChickenRoadGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const LANES = [
  { step: 1, mult: 1.25, name: 'Country Lane', danger: 0.12 },
  { step: 2, mult: 1.65, name: 'Highway 101', danger: 0.18 },
  { step: 3, mult: 2.30, name: 'Train Tracks', danger: 0.25 },
  { step: 4, mult: 3.50, name: 'River Rapids', danger: 0.32 },
  { step: 5, mult: 5.80, name: 'Lava Bridge', danger: 0.40 },
  { step: 6, mult: 10.50, name: 'Meteor Zone', danger: 0.48 },
  { step: 7, mult: 22.00, name: 'Golden Nest', danger: 0.55 },
];

export const ChickenRoadGame: React.FC<ChickenRoadGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
}) => {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'crashed' | 'won'>('idle');
  const [chickenPosition, setChickenPosition] = useState<number>(0);
  const [lastWin, setLastWin] = useState<number>(0);

  const chips = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleStartGame = () => {
    if (userBalance < betAmount) {
      alert('Insufficient balance! Please deposit to continue.');
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - betAmount);
    setGameState('playing');
    setCurrentStep(0);
    setChickenPosition(0);
    setLastWin(0);
  };

  const handleCrossNextLane = () => {
    if (gameState !== 'playing') return;

    soundService.playSpin();
    const nextStep = currentStep + 1;
    const laneConfig = LANES[nextStep - 1];

    // Determine crash probability
    let isCrash = Math.random() < laneConfig.danger;
    if (adminSettings.rtpMode === 'high_win') isCrash = Math.random() < laneConfig.danger * 0.5;
    if (adminSettings.rtpMode === 'house_edge') isCrash = Math.random() < laneConfig.danger * 1.5;

    if (isCrash) {
      soundService.playLose();
      setGameState('crashed');
      onRecordBet('inout_chicken_road', 'Chicken Road 2.0', betAmount, 0, 0);
    } else {
      soundService.playCoin();
      setCurrentStep(nextStep);
      setChickenPosition(nextStep);

      if (nextStep === LANES.length) {
        // Reached end!
        handleCashOut(laneConfig.mult);
      }
    }
  };

  const handleCashOut = (overrideMult?: number) => {
    if (gameState !== 'playing' || currentStep === 0) return;

    const mult = overrideMult || LANES[currentStep - 1].mult;
    const win = Math.round(betAmount * mult);

    soundService.playWin();
    triggerWinConfetti();
    onUpdateBalance(userBalance + win);
    setLastWin(win);
    setGameState('won');
    onRecordBet('inout_chicken_road', 'Chicken Road 2.0', betAmount, win, mult);
  };

  return (
    <div className="bg-[#0b1424] border border-amber-500/30 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>🐔 Chicken Road 2.0</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black">
                INOUT
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">Cross the roads for up to 22.0x multiplier!</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Road Visual Field */}
      <div className="relative bg-gradient-to-b from-[#08121f] to-[#040910] border border-slate-700 rounded-2xl p-4 min-h-[300px] flex flex-col justify-between overflow-hidden">
        {/* Lane Step Track */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-2">
            <span>START</span>
            <span>GOLDEN NEST 22x</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {LANES.map((lane) => {
              const isPassed = currentStep >= lane.step;
              const isCurrent = currentStep === lane.step;
              return (
                <div
                  key={lane.step}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col justify-between h-24 ${
                    isCurrent
                      ? 'bg-amber-400/20 border-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                      : isPassed
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <span className="text-[9px] font-bold">Step {lane.step}</span>
                  <div className="text-xl">
                    {chickenPosition === lane.step ? (
                      gameState === 'crashed' ? (
                        '💥'
                      ) : (
                        '🐔'
                      )
                    ) : lane.step === 7 ? (
                      '🏆'
                    ) : (
                      '🛣️'
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-black font-mono ${
                      isCurrent ? 'text-amber-300' : 'text-slate-300'
                    }`}
                  >
                    {lane.mult}x
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Message Overlay */}
        <div className="text-center py-3">
          {gameState === 'idle' && (
            <div className="text-slate-300 text-xs font-bold">
              Select your bet and tap <span className="text-amber-400">CROSS ROAD</span> to begin!
            </div>
          )}
          {gameState === 'playing' && (
            <div className="text-amber-300 text-sm font-black animate-pulse">
              Current Multiplier: {currentStep === 0 ? '1.00x' : `${LANES[currentStep - 1].mult}x`} (Potential Win: ₨{' '}
              {currentStep === 0 ? betAmount : Math.round(betAmount * LANES[currentStep - 1].mult)})
            </div>
          )}
          {gameState === 'won' && (
            <div className="text-emerald-400 text-sm font-black animate-bounce">
              🎉 CASHOUT SUCCESS! You won ₨ {lastWin.toLocaleString()}!
            </div>
          )}
          {gameState === 'crashed' && (
            <div className="text-rose-400 text-sm font-black">
              💥 OUCH! The chicken got hit! Better luck next road!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          {gameState === 'idle' || gameState === 'crashed' || gameState === 'won' ? (
            <button
              onClick={handleStartGame}
              className="w-full max-w-sm py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:from-amber-300 transition cursor-pointer"
            >
              START GAME (₨ {betAmount})
            </button>
          ) : (
            <div className="flex w-full max-w-md gap-2">
              <button
                onClick={handleCrossNextLane}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-xl hover:from-emerald-400 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>NEXT STEP 👣</span>
              </button>
              {currentStep > 0 && (
                <button
                  onClick={() => handleCashOut()}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:from-amber-300 transition cursor-pointer"
                >
                  CASH OUT ₨ {Math.round(betAmount * LANES[currentStep - 1].mult)}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bet Controls */}
      <div className="bg-[#0e1e36] border border-slate-700/80 rounded-2xl p-3 space-y-2">
        <span className="text-xs font-bold text-slate-300">Quick Bet Chips:</span>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {chips.map((c) => (
            <button
              key={c}
              disabled={gameState === 'playing'}
              onClick={() => {
                soundService.playClick();
                setBetAmount(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                betAmount === c
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ₨ {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
