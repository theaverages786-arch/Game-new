import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface AndarBaharProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  color: 'red' | 'black';
}

export const AndarBaharGame: React.FC<AndarBaharProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [betAmount, setBetAmount] = useState(100);
  const [chosenSide, setChosenSide] = useState<'andar' | 'bahar' | null>(null);
  const [jokerCard, setJokerCard] = useState<Card | null>({ suit: '♥', value: '8', color: 'red' });
  const [andarCards, setAndarCards] = useState<Card[]>([]);
  const [baharCards, setBaharCards] = useState<Card[]>([]);
  const [dealing, setDealing] = useState(false);
  const [winningSide, setWinningSide] = useState<'andar' | 'bahar' | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const getRandomCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const v = VALUES[Math.floor(Math.random() * VALUES.length)];
    return {
      suit: s,
      value: v,
      color: s === '♥' || s === '♦' ? 'red' : 'black',
    };
  };

  const handlePlaceBetAndPlay = (side: 'andar' | 'bahar') => {
    if (dealing) return;
    if (userBalance < betAmount) {
      alert('Insufficient balance for bet!');
      return;
    }

    soundService.playCardFlip();
    onUpdateBalance(userBalance - betAmount);
    setChosenSide(side);
    setDealing(true);
    setWinningSide(null);
    setResultText(null);
    setAndarCards([]);
    setBaharCards([]);

    // 1. Pick Main Joker Card
    const joker = getRandomCard();
    setJokerCard(joker);

    // 2. Deal sequentially
    const aCards: Card[] = [];
    const bCards: Card[] = [];
    let turn: 'andar' | 'bahar' = 'andar';
    let matchFound = false;

    // Check if high win / house edge
    const userWins =
      adminSettings.rtpMode === 'high_win'
        ? Math.random() < 0.7
        : adminSettings.rtpMode === 'house_edge'
        ? Math.random() < 0.3
        : Math.random() < 0.5;

    const forcedWinner = userWins ? side : side === 'andar' ? 'bahar' : 'andar';

    let cardDealStep = 0;
    const maxSteps = 16;

    const interval = setInterval(() => {
      soundService.playCardFlip();
      cardDealStep++;

      let nextCard = getRandomCard();
      const isTargetStep = cardDealStep >= 4 && (cardDealStep % 2 === (forcedWinner === 'andar' ? 1 : 0) || cardDealStep >= maxSteps);

      if (isTargetStep && !matchFound) {
        nextCard = { ...getRandomCard(), value: joker.value }; // Match found!
        matchFound = true;
      }

      if (turn === 'andar') {
        aCards.push(nextCard);
        setAndarCards([...aCards]);
        if (nextCard.value === joker.value) {
          clearInterval(interval);
          finishRound('andar', aCards.length, side);
          return;
        }
        turn = 'bahar';
      } else {
        bCards.push(nextCard);
        setBaharCards([...bCards]);
        if (nextCard.value === joker.value) {
          clearInterval(interval);
          finishRound('bahar', bCards.length, side);
          return;
        }
        turn = 'andar';
      }
    }, 450);
  };

  const finishRound = (winner: 'andar' | 'bahar', steps: number, playerBet: 'andar' | 'bahar') => {
    setWinningSide(winner);
    setDealing(false);

    if (winner === playerBet) {
      const payoutMult = winner === 'andar' ? 1.9 : 2.0;
      const win = Math.round(betAmount * payoutMult);
      soundService.playWin();
      onUpdateBalance(userBalance - betAmount + win);
      onRecordBet('cards_andar_bahar', 'Andar Bahar Live', betAmount, win, payoutMult);
      setResultText(`🎉 ${winner.toUpperCase()} WINS! Match card arrived on ${winner.toUpperCase()}. You won ₨ ${win.toLocaleString()}!`);
    } else {
      soundService.playCrash();
      onRecordBet('cards_andar_bahar', 'Andar Bahar Live', betAmount, 0, 0);
      setResultText(`❌ ${winner.toUpperCase()} WINS! Match card landed on ${winner.toUpperCase()}. Better luck next hand!`);
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
            <h2 className="text-base font-black text-amber-300 uppercase">ANDAR BAHAR LIVE</h2>
            <span className="text-[11px] text-slate-400">Match the Joker &bull; Andar (1.9x) | Bahar (2.0x)</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Table Felt */}
      <div className="bg-gradient-to-b from-[#0e2a1e] via-[#081a13] to-[#040e0a] border-4 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
        {/* Center Joker Card Box */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1.5">
            🎯 TARGET JOKER CARD
          </span>
          {jokerCard ? (
            <div className="w-20 h-28 bg-white border-2 border-amber-400 rounded-xl flex flex-col items-center justify-center shadow-2xl scale-105">
              <span className={`text-2xl font-black ${jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                {jokerCard.value}
              </span>
              <span className={`text-3xl ${jokerCard.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                {jokerCard.suit}
              </span>
            </div>
          ) : (
            <div className="w-20 h-28 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-xs text-slate-400">
              Dealing...
            </div>
          )}
        </div>

        {/* Andar & Bahar Deal Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ANDAR Side */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            winningSide === 'andar'
              ? 'bg-amber-500/20 border-amber-400 shadow-xl'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm text-amber-300">🔵 ANDAR (Inside - 1.9x)</span>
              <span className="text-xs text-slate-400 font-mono">{andarCards.length} Cards</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[64px] bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              {andarCards.map((c, i) => (
                <div
                  key={i}
                  className={`w-10 h-14 bg-white rounded-lg border flex flex-col items-center justify-center text-xs font-black shadow ${
                    c.value === jokerCard?.value ? 'border-amber-400 bg-amber-100 scale-110' : ''
                  }`}
                >
                  <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                  <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BAHAR Side */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            winningSide === 'bahar'
              ? 'bg-amber-500/20 border-amber-400 shadow-xl'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-sm text-yellow-300">🟡 BAHAR (Outside - 2.0x)</span>
              <span className="text-xs text-slate-400 font-mono">{baharCards.length} Cards</span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[64px] bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
              {baharCards.map((c, i) => (
                <div
                  key={i}
                  className={`w-10 h-14 bg-white rounded-lg border flex flex-col items-center justify-center text-xs font-black shadow ${
                    c.value === jokerCard?.value ? 'border-amber-400 bg-amber-100 scale-110' : ''
                  }`}
                >
                  <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.value}</span>
                  <span className={c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}>{c.suit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result Text */}
        {resultText && (
          <div className="p-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-2xl text-center text-xs sm:text-sm shadow-xl animate-in zoom-in-95">
            {resultText}
          </div>
        )}
      </div>

      {/* Betting Controls */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase">Bet Amount:</span>
          <div className="flex gap-1.5">
            {[50, 100, 200, 500, 1000, 2500, 5000].map((b) => (
              <button
                key={b}
                disabled={dealing}
                onClick={() => {
                  soundService.playChip();
                  setBetAmount(b);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  betAmount === b
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            disabled={dealing}
            onClick={() => handlePlaceBetAndPlay('andar')}
            className={`py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 text-white font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer ${
              dealing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            BET ANDAR (1.9x)
          </button>
          <button
            disabled={dealing}
            onClick={() => handlePlaceBetAndPlay('bahar')}
            className={`py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer ${
              dealing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            BET BAHAR (2.0x)
          </button>
        </div>
      </div>
    </div>
  );
};
