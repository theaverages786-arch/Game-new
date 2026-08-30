import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface RedVsBlackProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14
  label: string;
  color: 'red' | 'black';
}

type BetSide = 'red' | 'black' | 'lucky_strike';

export const RedVsBlackGame: React.FC<RedVsBlackProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<BetSide, number>>({ red: 0, black: 0, lucky_strike: 0 });
  const [selectedChip, setSelectedChip] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [redCards, setRedCards] = useState<Card[]>([]);
  const [blackCards, setBlackCards] = useState<Card[]>([]);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<('R' | 'B')[]>(['R', 'R', 'B', 'R', 'B', 'B', 'R', 'R']);

  const chips = [20, 50, 100, 500, 1000, 5000];
  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const LABELS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

  const getDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const val of VALUES) {
        deck.push({
          suit,
          value: val,
          label: LABELS[val] || val.toString(),
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
        });
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const addBet = (side: BetSide) => {
    if (isPlaying) return;
    if (userBalance < selectedChip) {
      alert('Insufficient balance!');
      return;
    }
    soundService.playChip();
    setBets(prev => ({ ...prev, [side]: prev[side] + selectedChip }));
    onUpdateBalance(userBalance - selectedChip);
  };

  const clearBets = () => {
    if (isPlaying) return;
    const total = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (total > 0) {
      soundService.playClick();
      onUpdateBalance(userBalance + total);
      setBets({ red: 0, black: 0, lucky_strike: 0 });
    }
  };

  const handleDeal = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Place a bet on Red or Black!');
      return;
    }

    setIsPlaying(true);
    setWinnerMessage(null);
    soundService.playCardDeal();

    const deck = getDeck();
    const rCards = [deck[0], deck[2], deck[4]];
    const bCards = [deck[1], deck[3], deck[5]];

    setRedCards(rCards);
    setBlackCards(bCards);

    setTimeout(() => {
      const sumRed = rCards.reduce((acc, c) => acc + c.value, 0);
      const sumBlack = bCards.reduce((acc, c) => acc + c.value, 0);

      const winningSide: 'R' | 'B' = sumRed >= sumBlack ? 'R' : 'B';
      setHistory(h => [winningSide, ...h.slice(0, 9)]);

      let winAmount = 0;
      if (winningSide === 'R' && bets.red > 0) winAmount += bets.red * 1.95;
      if (winningSide === 'B' && bets.black > 0) winAmount += bets.black * 1.95;

      // Lucky Strike bonus (Triple or Pure Color)
      const isRedFlush = rCards.every(c => c.suit === rCards[0].suit);
      const isBlackFlush = bCards.every(c => c.suit === bCards[0].suit);
      if ((isRedFlush || isBlackFlush) && bets.lucky_strike > 0) {
        winAmount += bets.lucky_strike * 10;
      }

      if (winAmount > 0) {
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('red_vs_black', 'Red vs Black Battle', totalBet, winAmount, +(winAmount / totalBet).toFixed(2));
        setWinnerMessage(`🎉 ${winningSide === 'R' ? 'RED' : 'BLACK'} WINS! +Rs ${winAmount.toLocaleString()}`);
        soundService.playWin();
      } else {
        onRecordBet('red_vs_black', 'Red vs Black Battle', totalBet, 0, 0);
        setWinnerMessage(`${winningSide === 'R' ? 'Red' : 'Black'} won this round. Good luck next!`);
        soundService.playLose();
      }

      setIsPlaying(false);
      setBets({ red: 0, black: 0, lucky_strike: 0 });
    }, 1400);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1f090b] via-[#2d0e11] to-[#120406] text-slate-100 rounded-3xl p-3 sm:p-5 border border-rose-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rose-800/60 pb-3">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-red-400 via-yellow-200 to-slate-200 bg-clip-text text-transparent flex items-center justify-center gap-1.5">
            <span>⚔️</span>
            <span>RED VS BLACK WAR</span>
          </h1>
          <span className="text-[10px] text-rose-300 font-medium">Red (1.95x) • Black (1.95x) • Lucky Strike (10x)</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Ribbon */}
      <div className="bg-black/40 border border-rose-800/40 rounded-xl p-2 flex items-center gap-2 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Roadmap:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
              h === 'R' ? 'bg-red-600 text-white' : 'bg-slate-900 text-white border border-slate-700'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Main Table Felt */}
      <div className="my-auto bg-[#1a080a] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Deal Cards Area */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-3">
          {/* Red Side */}
          <div className="bg-red-950/60 border-2 border-red-500 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-red-400">RED TEAM 🔴</span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[70px]">
              {redCards.map((c, i) => (
                <div key={i} className="w-11 h-16 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-lg text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Black Side */}
          <div className="bg-slate-950/80 border-2 border-slate-600 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-slate-300">BLACK TEAM ⚫</span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[70px]">
              {blackCards.map((c, i) => (
                <div key={i} className="w-11 h-16 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-lg text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Winner Announcement */}
        {winnerMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Betting Felts */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-lg mt-2">
          {/* Bet Red */}
          <div
            onClick={() => addBet('red')}
            className="bg-red-900/70 hover:bg-red-800/90 border-2 border-red-500 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-sm font-black text-red-200">RED (1.95x)</span>
            <div className="h-6 flex items-center justify-center">
              {bets.red > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.red}
                </span>
              )}
            </div>
          </div>

          {/* Lucky Strike */}
          <div
            onClick={() => addBet('lucky_strike')}
            className="bg-amber-900/70 hover:bg-amber-800/90 border-2 border-amber-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-amber-300">LUCKY (10x)</span>
            <div className="h-6 flex items-center justify-center">
              {bets.lucky_strike > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.lucky_strike}
                </span>
              )}
            </div>
          </div>

          {/* Bet Black */}
          <div
            onClick={() => addBet('black')}
            className="bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-500 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-sm font-black text-slate-200">BLACK (1.95x)</span>
            <div className="h-6 flex items-center justify-center">
              {bets.black > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.black}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips Bar */}
      <div className="bg-[#120406] border border-rose-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
            onClick={handleDeal}
            disabled={isPlaying}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer disabled:opacity-50"
          >
            {isPlaying ? 'Dealing...' : `Deal (Rs ${totalCurrentBet})`}
          </button>
        </div>
      </div>
    </div>
  );
};
