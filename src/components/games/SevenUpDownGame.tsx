import React, { useState } from 'react';
import { ArrowLeft, Dices, Trophy, RefreshCw, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface SevenUpDownProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

type BetType = 'down' | 'seven' | 'up';

export const SevenUpDownGame: React.FC<SevenUpDownProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<BetType, number>>({ down: 0, seven: 0, up: 0 });
  const [selectedChip, setSelectedChip] = useState(100);
  const [isRolling, setIsRolling] = useState(false);
  const [dice1, setDice1] = useState(3);
  const [dice2, setDice2] = useState(4);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([7, 4, 11, 2, 8, 7, 5, 9, 12, 6]);

  const chips = [20, 50, 100, 500, 1000, 5000];
  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const addBet = (type: BetType) => {
    if (isRolling) return;
    if (userBalance < selectedChip) {
      alert('Insufficient balance!');
      return;
    }
    soundService.playChip();
    setBets(prev => ({ ...prev, [type]: prev[type] + selectedChip }));
    onUpdateBalance(userBalance - selectedChip);
  };

  const clearBets = () => {
    if (isRolling) return;
    const total = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (total > 0) {
      soundService.playClick();
      onUpdateBalance(userBalance + total);
      setBets({ down: 0, seven: 0, up: 0 });
    }
  };

  const handleRoll = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Place a bet on 2-6 (Down), Lucky 7, or 8-12 (Up)!');
      return;
    }

    setIsRolling(true);
    setWinnerMessage(null);
    soundService.playDiceRoll();

    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const forced = adminSettings?.forcedResults?.sevenUpDown;
      const masterMode = adminSettings?.masterOutcomeMode;
      const globalWin = adminSettings?.globalWinRate ?? 65;
      const willWin = masterMode === 'always_win' || (masterMode !== 'always_lose' && (Math.random() * 100 < globalWin));

      let d1 = Math.floor(Math.random() * 6) + 1;
      let d2 = Math.floor(Math.random() * 6) + 1;
      let sum = d1 + d2;

      // Forced Override
      if (forced === 'lucky7') {
        d1 = 3;
        d2 = 4;
        sum = 7;
      } else if (forced === 'down') {
        d1 = 2;
        d2 = 3;
        sum = 5;
      } else if (forced === 'up') {
        d1 = 5;
        d2 = 5;
        sum = 10;
      } else if (willWin) {
        if (bets.seven > 0 && Math.random() > 0.5) {
          d1 = 3;
          d2 = 4;
          sum = 7;
        } else if (bets.down > bets.up) {
          d1 = 2;
          d2 = 2;
          sum = 4;
        } else if (bets.up > bets.down) {
          d1 = 5;
          d2 = 4;
          sum = 9;
        }
      } else if (masterMode === 'always_lose') {
        if (bets.down > 0 && bets.up === 0 && bets.seven === 0) {
          d1 = 5; d2 = 5; sum = 10;
        } else if (bets.up > 0 && bets.down === 0 && bets.seven === 0) {
          d1 = 1; d2 = 2; sum = 3;
        } else if (bets.seven > 0) {
          d1 = 1; d2 = 2; sum = 3;
        }
      }

      setDice1(d1);
      setDice2(d2);
      setHistory(h => [sum, ...h.slice(0, 9)]);

      let winAmount = 0;
      if (sum < 7 && bets.down > 0) winAmount += bets.down * 2.0;
      else if (sum === 7 && bets.seven > 0) winAmount += bets.seven * 5.8;
      else if (sum > 7 && bets.up > 0) winAmount += bets.up * 2.0;

      if (winAmount > 0) {
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('seven_up_down', '7 Up 7 Down', totalBet, winAmount, +(winAmount / totalBet).toFixed(2));
        setWinnerMessage(`🎉 TOTAL IS ${sum}! +Rs ${winAmount.toLocaleString()}`);
        soundService.playWin();
      } else {
        onRecordBet('seven_up_down', '7 Up 7 Down', totalBet, 0, 0);
        setWinnerMessage(`Total is ${sum}. Better luck next roll!`);
        soundService.playLose();
      }

      setIsRolling(false);
      setBets({ down: 0, seven: 0, up: 0 });
    }, 1200);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
  const totalDice = dice1 + dice2;

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1a0f02] via-[#2d1a04] to-[#0f0801] text-slate-100 rounded-3xl p-3 sm:p-5 border border-amber-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
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
            <span>🎲</span>
            <span>7 UP 7 DOWN CLASSIC</span>
          </h1>
          <span className="text-[10px] text-amber-300 font-medium">2-6 (2x) • Lucky 7 (5.8x) • 8-12 (2x)</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="bg-black/40 border border-amber-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">History:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              h < 7
                ? 'bg-blue-600 text-white'
                : h === 7
                ? 'bg-amber-400 text-slate-950 ring-1 ring-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Main Table Felt */}
      <div className="my-auto bg-[#170c02] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Rolling Dice Display */}
        <div className="flex items-center justify-center gap-4 my-2">
          <div className={`w-18 h-18 sm:w-22 sm:h-22 bg-white text-red-600 rounded-3xl border-4 border-amber-400 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl ${isRolling ? 'animate-spin' : ''}`}>
            {diceFaces[dice1 - 1]}
          </div>
          <div className={`w-18 h-18 sm:w-22 sm:h-22 bg-white text-slate-900 rounded-3xl border-4 border-amber-400 flex items-center justify-center text-5xl sm:text-6xl shadow-2xl ${isRolling ? 'animate-spin' : ''}`}>
            {diceFaces[dice2 - 1]}
          </div>
        </div>

        {/* Total Badge */}
        <div className="bg-black/60 px-4 py-1 rounded-full border border-amber-400/50 text-xs font-black text-amber-300">
          TOTAL: {totalDice}
        </div>

        {/* Winner Announcement */}
        {winnerMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* 3 Main Betting Areas */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg mt-3">
          {/* 2-6 (Down) */}
          <div
            onClick={() => addBet('down')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-sm font-black text-blue-200">2 - 6 (DOWN)</span>
            <span className="text-[10px] text-blue-300 font-bold">2.0x Payout</span>
            <div className="h-6 flex items-center justify-center">
              {bets.down > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.down}
                </span>
              )}
            </div>
          </div>

          {/* Lucky 7 */}
          <div
            onClick={() => addBet('seven')}
            className="bg-amber-900/60 hover:bg-amber-800/80 border-2 border-amber-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-sm font-black text-amber-300">LUCKY 7</span>
            <span className="text-[10px] text-yellow-300 font-bold">5.8x Payout</span>
            <div className="h-6 flex items-center justify-center">
              {bets.seven > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.seven}
                </span>
              )}
            </div>
          </div>

          {/* 8-12 (Up) */}
          <div
            onClick={() => addBet('up')}
            className="bg-red-900/60 hover:bg-red-800/80 border-2 border-red-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-sm font-black text-red-200">8 - 12 (UP)</span>
            <span className="text-[10px] text-red-300 font-bold">2.0x Payout</span>
            <div className="h-6 flex items-center justify-center">
              {bets.up > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.up}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips Bar */}
      <div className="bg-[#0f0701] border border-amber-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
            onClick={handleRoll}
            disabled={isRolling}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50"
          >
            {isRolling ? 'Rolling...' : `Roll Dice (Rs ${totalCurrentBet})`}
          </button>
        </div>
      </div>
    </div>
  );
};
