import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, ArrowUp, ArrowDown, DollarSign } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface HiLoProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2..14 (14=A)
  label: string;
  color: 'red' | 'black';
}

export const HiLoGame: React.FC<HiLoProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCard, setCurrentCard] = useState<Card>({
    suit: '♠',
    value: 8,
    label: '8',
    color: 'black',
  });
  const [streak, setStreak] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<Card[]>([]);

  const bets = [10, 20, 50, 100, 250, 500, 1000];
  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const LABELS: Record<number, string> = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

  const getRandomCard = (): Card => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const value = VALUES[Math.floor(Math.random() * VALUES.length)];
    return {
      suit,
      value,
      label: LABELS[value] || value.toString(),
      color: suit === '♥' || suit === '♦' ? 'red' : 'black',
    };
  };

  const handleStartGame = () => {
    if (userBalance < bet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    const firstCard = getRandomCard();
    setCurrentCard(firstCard);
    setHistory([firstCard]);
    setStreak(0);
    setCurrentMultiplier(1.0);
    setIsPlaying(true);
    setGameMessage(null);
    soundService.playCardDeal();
  };

  const handleGuess = (guess: 'higher' | 'lower') => {
    if (!isPlaying) return;

    soundService.playCardDeal();
    const nextCard = getRandomCard();
    const isCorrect =
      (guess === 'higher' && nextCard.value >= currentCard.value) ||
      (guess === 'lower' && nextCard.value <= currentCard.value);

    setHistory(h => [nextCard, ...h.slice(0, 5)]);
    setCurrentCard(nextCard);

    if (isCorrect) {
      const nextStreak = streak + 1;
      const nextMult = +(currentMultiplier * 1.5).toFixed(2);
      setStreak(nextStreak);
      setCurrentMultiplier(nextMult);
      soundService.playWin();
      setGameMessage(`Correct! Multiplier now ${nextMult}x`);
    } else {
      setIsPlaying(false);
      onRecordBet('hilo_game', 'Hi-Lo Card Streak', bet, 0, 0);
      setGameMessage(`Wrong! Card was ${nextCard.label} of ${nextCard.suit}. Round Over.`);
      soundService.playLose();
    }
  };

  const handleCashOut = () => {
    if (!isPlaying || streak === 0) return;

    const winAmount = Math.round(bet * currentMultiplier);
    onUpdateBalance(userBalance + winAmount);
    onRecordBet('hilo_game', 'Hi-Lo Card Streak', bet, winAmount, currentMultiplier);
    soundService.playWin();
    setGameMessage(`💰 CASHED OUT! +Rs ${winAmount.toLocaleString()} (${currentMultiplier}x)`);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0a1828] via-[#102947] to-[#060f1c] text-slate-100 rounded-3xl p-3 sm:p-5 border border-cyan-600/40 shadow-2xl relative flex flex-col justify-between">
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
            <span>🃏</span>
            <span>HI-LO CARD MASTER</span>
          </h1>
          <span className="text-[10px] text-cyan-300 font-medium">Guess Higher / Lower • Compounding Multipliers</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Card Arena */}
      <div className="my-auto bg-[#081524] border-4 border-cyan-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between min-h-[340px] relative">
        {/* Streak and Current Profit Banner */}
        <div className="flex items-center justify-between w-full mb-3">
          <div className="bg-black/60 px-3 py-1 rounded-xl border border-cyan-500/40 text-xs font-black text-cyan-300">
            STREAK: {streak} | {currentMultiplier}x
          </div>

          {isPlaying && streak > 0 && (
            <div className="bg-emerald-600 px-4 py-1 rounded-full text-white text-xs font-black animate-pulse">
              POTENTIAL: Rs {Math.round(bet * currentMultiplier).toLocaleString()}
            </div>
          )}
        </div>

        {/* Big Center Active Card */}
        <div className="my-2 flex flex-col items-center">
          <div className="w-28 h-40 sm:w-32 sm:h-48 bg-white rounded-2xl shadow-2xl border-4 border-amber-400 flex flex-col justify-between p-3 text-slate-950 font-black">
            <span className={`text-xl ${currentCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.label}
            </span>
            <span className={`text-5xl text-center ${currentCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.suit}
            </span>
            <span className={`text-lg text-right ${currentCard.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
              {currentCard.label}
            </span>
          </div>
        </div>

        {/* Message Banner */}
        {gameMessage && (
          <div className="text-center my-1 animate-bounce">
            <div className="inline-block bg-black/85 px-6 py-1.5 rounded-2xl border-2 border-amber-400">
              <span className="text-xs sm:text-sm font-black text-amber-300">{gameMessage}</span>
            </div>
          </div>
        )}

        {/* Guess Buttons or Cash Out */}
        {isPlaying ? (
          <div className="flex items-center justify-center gap-4 w-full max-w-md mt-3">
            <button
              onClick={() => handleGuess('higher')}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg border border-emerald-400 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
              <span>HIGHER (OR EQUAL)</span>
            </button>

            {streak > 0 && (
              <button
                onClick={handleCashOut}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl hover:scale-105 transition cursor-pointer"
              >
                Cash Out
              </button>
            )}

            <button
              onClick={() => handleGuess('lower')}
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm shadow-lg border border-rose-400 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowDown className="w-4 h-4" />
              <span>LOWER (OR EQUAL)</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider my-2">
            Select Bet &amp; Start Round
          </div>
        )}
      </div>

      {/* Bet Controls */}
      <div className="bg-[#050e18] border border-cyan-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        {!isPlaying ? (
          <>
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
              onClick={handleStartGame}
              className="px-10 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-amber-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition cursor-pointer"
            >
              Start Game (Rs {bet})
            </button>
          </>
        ) : (
          <div className="w-full text-center text-xs text-amber-300 font-bold">
            Guess Higher or Lower to continue the streak!
          </div>
        )}
      </div>
    </div>
  );
};
