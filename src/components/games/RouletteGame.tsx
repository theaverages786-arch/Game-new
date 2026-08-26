import React, { useState, useRef } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, CircleDot, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface RouletteProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

const RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RouletteGame: React.FC<RouletteProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [selectedChip, setSelectedChip] = useState(50);
  const [placedBets, setPlacedBets] = useState<{ [key: string]: number }>({});
  const [spinning, setSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const totalBet = Object.keys(placedBets).reduce(
    (acc, key) => acc + (placedBets[key] || 0),
    0
  );

  const addBet = (spot: string) => {
    if (spinning) return;
    if (userBalance < totalBet + selectedChip) {
      alert('Insufficient balance to add chip!');
      return;
    }
    soundService.playChip();
    setPlacedBets((prev) => ({
      ...prev,
      [spot]: ((prev[spot] as number) || 0) + selectedChip,
    }));
  };

  const clearBets = () => {
    if (spinning) return;
    soundService.playClick();
    setPlacedBets({});
  };

  const spinRoulette = () => {
    if (spinning) return;
    if (totalBet <= 0) {
      alert('Please place your bets on the roulette table first!');
      return;
    }
    if (userBalance < totalBet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playClick();
    onUpdateBalance(userBalance - totalBet);
    setSpinning(true);
    setResultMsg(null);

    // Spin animation with sound ticks
    const extraRotations = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.floor(Math.random() * 360);
    const newRot = wheelRotation + extraRotations * 360 + randomAngle;
    setWheelRotation(newRot);

    let count = 0;
    const tickInterval = setInterval(() => {
      soundService.playSpinTick();
      count++;
      if (count >= 15) {
        clearInterval(tickInterval);
      }
    }, 120);

    setTimeout(() => {
      resolveWheelOutcome();
    }, 2800);
  };

  const resolveWheelOutcome = () => {
    // Generate winning number 0-36
    let winNum = Math.floor(Math.random() * 37);

    // Admin RTP bias
    if (adminSettings.rtpMode === 'high_win' && Object.keys(placedBets).length > 0) {
      const redBet = placedBets['red'] || 0;
      const blackBet = placedBets['black'] || 0;
      if (redBet > blackBet) {
        winNum = RED_NUMS[Math.floor(Math.random() * RED_NUMS.length)];
      } else if (blackBet > redBet) {
        const blackNums = Array.from({ length: 36 }, (_, i) => i + 1).filter((n) => !RED_NUMS.includes(n));
        winNum = blackNums[Math.floor(Math.random() * blackNums.length)];
      }
    }

    setWinningNumber(winNum);

    // Calculate payouts
    let totalWon = 0;
    const isRed = RED_NUMS.includes(winNum);
    const isBlack = winNum !== 0 && !isRed;
    const isEven = winNum !== 0 && winNum % 2 === 0;
    const isOdd = winNum !== 0 && winNum % 2 !== 0;
    const isLow = winNum >= 1 && winNum <= 18;
    const isHigh = winNum >= 19 && winNum <= 36;
    const is1st12 = winNum >= 1 && winNum <= 12;
    const is2nd12 = winNum >= 13 && winNum <= 24;
    const is3rd12 = winNum >= 25 && winNum <= 36;

    const getBet = (key: string): number => placedBets[key] || 0;

    if (getBet(`num_${winNum}`) > 0) totalWon += getBet(`num_${winNum}`) * 36;
    if (isRed && getBet('red') > 0) totalWon += getBet('red') * 2;
    if (isBlack && getBet('black') > 0) totalWon += getBet('black') * 2;
    if (isEven && getBet('even') > 0) totalWon += getBet('even') * 2;
    if (isOdd && getBet('odd') > 0) totalWon += getBet('odd') * 2;
    if (isLow && getBet('1-18') > 0) totalWon += getBet('1-18') * 2;
    if (isHigh && getBet('19-36') > 0) totalWon += getBet('19-36') * 2;
    if (is1st12 && getBet('1st12') > 0) totalWon += getBet('1st12') * 3;
    if (is2nd12 && getBet('2nd12') > 0) totalWon += getBet('2nd12') * 3;
    if (is3rd12 && getBet('3rd12') > 0) totalWon += getBet('3rd12') * 3;

    setLastWin(totalWon);
    setSpinning(false);

    if (totalWon > 0) {
      soundService.playWin();
      if (totalWon >= totalBet * 5) soundService.playJackpot();
      onUpdateBalance(userBalance - totalBet + totalWon);
      const mult = totalBet > 0 ? Number((totalWon / totalBet).toFixed(2)) : 0;
      onRecordBet('casino_roulette', 'European Roulette 777', totalBet, totalWon, mult);
      setResultMsg(`🎉 NUMBER ${winNum} (${winNum === 0 ? 'GREEN' : isRed ? 'RED' : 'BLACK'})! YOU WON ₨ ${totalWon.toLocaleString()}!`);
    } else {
      soundService.playCrash();
      onRecordBet('casino_roulette', 'European Roulette 777', totalBet, 0, 0);
      setResultMsg(`❌ NUMBER ${winNum} (${winNum === 0 ? 'GREEN 0' : isRed ? 'RED' : 'BLACK'})! No hit on your bets.`);
    }
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
            <h2 className="text-base font-black text-amber-300 uppercase">EUROPEAN ROULETTE</h2>
            <span className="text-[11px] text-slate-400">Single 0 Wheel &bull; 36x Straight-Up &bull; 2x Outside</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Wheel Stage */}
      <div className="bg-gradient-to-b from-[#141d33] to-[#0a0f1d] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* Animated Wheel Graphics */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 bg-gradient-to-tr from-amber-700 via-yellow-600 to-amber-900 shadow-2xl flex items-center justify-center transition-transform duration-3000 ease-out"
            style={{ transform: `rotate(${wheelRotation}deg)` }}
          >
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-amber-300/60 bg-slate-950 flex items-center justify-center">
              <span className="text-xs font-black text-amber-300 uppercase tracking-widest">777</span>
            </div>
          </div>
          {/* Wheel Pointer */}
          <div className="absolute -top-2 w-4 h-4 bg-amber-300 transform rotate-45 border border-slate-950 shadow-lg"></div>
        </div>

        {/* Result Indicator */}
        <div className="text-center space-y-2">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Winning Pocket</div>
          <div
            className={`w-20 h-20 mx-auto rounded-2xl border-2 flex items-center justify-center text-3xl font-black shadow-2xl ${
              winningNumber === null
                ? 'bg-slate-900 border-slate-700 text-slate-500'
                : winningNumber === 0
                ? 'bg-emerald-600 border-emerald-300 text-white animate-bounce'
                : RED_NUMS.includes(winningNumber)
                ? 'bg-rose-600 border-rose-300 text-white animate-bounce'
                : 'bg-slate-950 border-slate-400 text-white animate-bounce'
            }`}
          >
            {winningNumber !== null ? winningNumber : '?'}
          </div>
          {resultMsg && (
            <div className="text-xs font-black text-amber-300 max-w-xs">{resultMsg}</div>
          )}
        </div>
      </div>

      {/* Betting Board Felt */}
      <div className="bg-[#0b2417] border-4 border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3">
        {/* Outside Bets Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { id: 'red', label: 'RED (2x)', bg: 'bg-rose-700 hover:bg-rose-600 text-white' },
            { id: 'black', label: 'BLACK (2x)', bg: 'bg-slate-950 hover:bg-slate-900 text-white' },
            { id: 'even', label: 'EVEN (2x)', bg: 'bg-slate-900 hover:bg-slate-800 text-amber-300' },
            { id: 'odd', label: 'ODD (2x)', bg: 'bg-slate-900 hover:bg-slate-800 text-amber-300' },
            { id: '1-18', label: '1-18 (2x)', bg: 'bg-slate-900 hover:bg-slate-800 text-yellow-300' },
            { id: '19-36', label: '19-36 (2x)', bg: 'bg-slate-900 hover:bg-slate-800 text-yellow-300' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => addBet(b.id)}
              className={`p-3 rounded-xl font-black text-xs border border-white/20 shadow transition transform active:scale-95 cursor-pointer relative ${b.bg}`}
            >
              {b.label}
              {placedBets[b.id] && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 rounded-full px-1.5 py-0.2 text-[10px] font-black shadow">
                  ₨ {placedBets[b.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Numbers Row (Quick Grid 0 to 12) */}
        <div className="grid grid-cols-7 sm:grid-cols-13 gap-1 pt-2">
          {Array.from({ length: 13 }, (_, i) => i).map((n) => {
            const isRed = RED_NUMS.includes(n);
            const is0 = n === 0;
            return (
              <button
                key={n}
                onClick={() => addBet(`num_${n}`)}
                className={`h-12 rounded-lg font-black text-xs flex flex-col items-center justify-center border transition transform active:scale-95 cursor-pointer relative ${
                  is0
                    ? 'bg-emerald-600 border-emerald-300 text-white col-span-1'
                    : isRed
                    ? 'bg-rose-600 border-rose-400 text-white'
                    : 'bg-slate-950 border-slate-700 text-white'
                }`}
              >
                <span>{n}</span>
                {placedBets[`num_${n}`] && (
                  <span className="text-[8px] bg-amber-400 text-slate-950 px-1 rounded font-black mt-0.5">
                    {placedBets[`num_${n}`]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chip selector & Action footer */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Selected Chip:</span>
          <div className="flex gap-1.5">
            {[20, 50, 100, 500, 1000, 2500].map((c) => (
              <button
                key={c}
                disabled={spinning}
                onClick={() => setSelectedChip(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedChip === c
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                ₨ {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={spinning || totalBet === 0}
            onClick={clearBets}
            className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs rounded-2xl cursor-pointer"
          >
            CLEAR BETS
          </button>
          <button
            disabled={spinning}
            onClick={spinRoulette}
            className={`flex-1 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl cursor-pointer ${
              spinning
                ? 'bg-slate-700 text-slate-400'
                : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300'
            }`}
          >
            {spinning ? 'WHEEL SPINNING...' : `SPIN WHEEL (TOTAL BET ₨ ${totalBet})`}
          </button>
        </div>
      </div>
    </div>
  );
};
