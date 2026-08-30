import React, { useState } from 'react';
import { ArrowLeft, Dices, Trophy, RefreshCw, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface SicBoProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

type SicBoBet = 'small' | 'big' | 'odd' | 'even' | 'any_triple' | 'triple_6';

export const SicBoGame: React.FC<SicBoProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<SicBoBet, number>>({
    small: 0,
    big: 0,
    odd: 0,
    even: 0,
    any_triple: 0,
    triple_6: 0,
  });
  const [selectedChip, setSelectedChip] = useState(100);
  const [isRolling, setIsRolling] = useState(false);
  const [dice, setDice] = useState<[number, number, number]>([4, 5, 6]);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<number[]>([15, 8, 11, 14, 6, 9, 13, 10]);

  const chips = [20, 50, 100, 500, 1000, 5000];
  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const addBet = (type: SicBoBet) => {
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
      setBets({ small: 0, big: 0, odd: 0, even: 0, any_triple: 0, triple_6: 0 });
    }
  };

  const handleRoll = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Place your bet on Small, Big, Odd, Even, or Triples!');
      return;
    }

    setIsRolling(true);
    setWinnerMessage(null);
    soundService.playDiceRoll();

    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ]);
    }, 70);

    setTimeout(() => {
      clearInterval(interval);
      const forced = adminSettings?.forcedResults?.sicBo;
      const masterMode = adminSettings?.masterOutcomeMode;
      const globalWin = adminSettings?.globalWinRate ?? 65;
      const willWin = masterMode === 'always_win' || (masterMode !== 'always_lose' && (Math.random() * 100 < globalWin));

      let d1 = Math.floor(Math.random() * 6) + 1;
      let d2 = Math.floor(Math.random() * 6) + 1;
      let d3 = Math.floor(Math.random() * 6) + 1;
      let sum = d1 + d2 + d3;

      if (forced === 'triple') {
        d1 = 6; d2 = 6; d3 = 6; sum = 18;
      } else if (forced === 'small') {
        d1 = 2; d2 = 3; d3 = 3; sum = 8;
      } else if (forced === 'big') {
        d1 = 5; d2 = 4; d3 = 5; sum = 14;
      } else if (willWin) {
        if (bets.triple_6 > 0) {
          d1 = 6; d2 = 6; d3 = 6; sum = 18;
        } else if (bets.any_triple > 0) {
          d1 = 4; d2 = 4; d3 = 4; sum = 12;
        } else if (bets.small > bets.big) {
          d1 = 2; d2 = 3; d3 = 4; sum = 9;
        } else if (bets.big > bets.small) {
          d1 = 4; d2 = 5; d3 = 5; sum = 14;
        }
      } else if (masterMode === 'always_lose') {
        if (bets.small > 0 && bets.big === 0) {
          d1 = 5; d2 = 5; d3 = 5; sum = 15;
        } else if (bets.big > 0 && bets.small === 0) {
          d1 = 2; d2 = 2; d3 = 3; sum = 7;
        }
      }

      setDice([d1, d2, d3]);
      setHistory(h => [sum, ...h.slice(0, 9)]);

      const isTriple = d1 === d2 && d2 === d3;
      const isSmall = sum >= 4 && sum <= 10 && !isTriple;
      const isBig = sum >= 11 && sum <= 17 && !isTriple;
      const isOdd = sum % 2 !== 0 && !isTriple;
      const isEven = sum % 2 === 0 && !isTriple;

      let winAmount = 0;
      if (isSmall && bets.small > 0) winAmount += bets.small * 2.0;
      if (isBig && bets.big > 0) winAmount += bets.big * 2.0;
      if (isOdd && bets.odd > 0) winAmount += bets.odd * 2.0;
      if (isEven && bets.even > 0) winAmount += bets.even * 2.0;
      if (isTriple && bets.any_triple > 0) winAmount += bets.any_triple * 31.0;
      if (isTriple && d1 === 6 && bets.triple_6 > 0) winAmount += bets.triple_6 * 181.0;

      if (winAmount > 0) {
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('sic_bo', 'Macau Sic Bo 3-Dice', totalBet, winAmount, +(winAmount / totalBet).toFixed(2));
        setWinnerMessage(`🎉 TOTAL IS ${sum} (${sum >= 11 ? 'BIG' : 'SMALL'})! +Rs ${winAmount.toLocaleString()}`);
        soundService.playWin();
      } else {
        onRecordBet('sic_bo', 'Macau Sic Bo 3-Dice', totalBet, 0, 0);
        setWinnerMessage(`Total is ${sum} (${sum >= 11 ? 'Big' : 'Small'}). Better luck next round!`);
        soundService.playLose();
      }

      setIsRolling(false);
      setBets({ small: 0, big: 0, odd: 0, even: 0, any_triple: 0, triple_6: 0 });
    }, 1300);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
  const totalSum = dice[0] + dice[1] + dice[2];

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1a0808] via-[#2d0f0f] to-[#100303] text-slate-100 rounded-3xl p-3 sm:p-5 border border-red-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-red-800/60 pb-3">
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
            <span>MACAU SIC BO (3-DICE)</span>
          </h1>
          <span className="text-[10px] text-rose-300 font-medium">Small (4-10) • Big (11-17) • Triples Up to 180x</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="bg-black/40 border border-red-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">History:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              h >= 11 ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Main Glass Dome 3-Dice Arena */}
      <div className="my-auto bg-[#170505] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* 3 Rolling Dice */}
        <div className="flex items-center justify-center gap-3 my-2">
          {dice.map((d, i) => (
            <div
              key={i}
              className={`w-16 h-16 sm:w-20 sm:h-20 bg-white text-red-600 rounded-2xl border-4 border-amber-400 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ${
                isRolling ? 'animate-bounce' : ''
              }`}
            >
              {diceFaces[d - 1]}
            </div>
          ))}
        </div>

        {/* Total Badge */}
        <div className="bg-black/60 px-4 py-1 rounded-full border border-amber-400/50 text-xs font-black text-amber-300">
          TOTAL: {totalSum} ({totalSum >= 11 ? 'BIG' : 'SMALL'})
        </div>

        {/* Winner Announcement */}
        {winnerMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Sic Bo Betting Grid */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-lg mt-3">
          {/* Small 4-10 */}
          <div
            onClick={() => addBet('small')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-2 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-blue-200">SMALL (4-10)</span>
            <span className="text-[9px] text-blue-300">2.0x</span>
            <div className="h-4 flex items-center justify-center">
              {bets.small > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets.small}
                </span>
              )}
            </div>
          </div>

          {/* Any Triple (30x) */}
          <div
            onClick={() => addBet('any_triple')}
            className="bg-amber-900/60 hover:bg-amber-800/80 border-2 border-amber-400 rounded-2xl p-2 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-amber-300">ANY TRIPLE</span>
            <span className="text-[9px] text-yellow-300">30x</span>
            <div className="h-4 flex items-center justify-center">
              {bets.any_triple > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets.any_triple}
                </span>
              )}
            </div>
          </div>

          {/* Triple 6 (180x) */}
          <div
            onClick={() => addBet('triple_6')}
            className="bg-purple-900/60 hover:bg-purple-800/80 border-2 border-purple-400 rounded-2xl p-2 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-purple-200">TRIPLE 666</span>
            <span className="text-[9px] text-purple-300">180x</span>
            <div className="h-4 flex items-center justify-center">
              {bets.triple_6 > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets.triple_6}
                </span>
              )}
            </div>
          </div>

          {/* Big 11-17 */}
          <div
            onClick={() => addBet('big')}
            className="bg-red-900/60 hover:bg-red-800/80 border-2 border-red-400 rounded-2xl p-2 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-red-200">BIG (11-17)</span>
            <span className="text-[9px] text-red-300">2.0x</span>
            <div className="h-4 flex items-center justify-center">
              {bets.big > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.2 rounded-full">
                  Rs {bets.big}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips Bar */}
      <div className="bg-[#120303] border border-red-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
