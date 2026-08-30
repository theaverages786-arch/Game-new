import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface RummyGameProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  id: string;
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 1 to 13 (1=A, 11=J, 12=Q, 13=K)
  label: string;
  color: 'red' | 'black';
  selected?: boolean;
}

export const RummyGame: React.FC<RummyGameProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [pointValue, setPointValue] = useState(1); // Rs 1 per point
  const [gameState, setGameState] = useState<'betting' | 'dealing' | 'playing' | 'declare' | 'finished'>('betting');
  const [hand, setHand] = useState<Card[]>([]);
  const [opponentHandCount, setOpponentHandCount] = useState<number[]>([13, 13, 13]);
  const [wildJoker, setWildJoker] = useState<Card | null>(null);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [drawPileCount, setDrawPileCount] = useState(38);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [gameResult, setGameResult] = useState<{ won: boolean; winAmount: number; score: number; message: string } | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [timer, setTimer] = useState(30);

  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

  const formatCardLabel = (val: number) => LABELS[val] || val.toString();

  const generateDeck = (): Card[] => {
    const deck: Card[] = [];
    let idCounter = 1;
    for (let deckNum = 0; deckNum < 2; deckNum++) {
      for (const suit of SUITS) {
        for (const value of VALUES) {
          deck.push({
            id: `c_${idCounter++}`,
            suit,
            value,
            label: formatCardLabel(value),
            color: suit === '♥' || suit === '♦' ? 'red' : 'black',
          });
        }
      }
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const handleStartGame = () => {
    const entryFee = pointValue * 80; // 80 points max loss per standard Rummy rule
    if (userBalance < entryFee) {
      alert(`Insufficient balance! Minimum Rs ${entryFee} required for Point Value Rs ${pointValue}`);
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - entryFee);

    setGameState('dealing');
    setHasDrawn(false);
    setGameResult(null);
    setSelectedCards([]);

    const fullDeck = generateDeck();
    const player13 = fullDeck.slice(0, 13);
    const jokerCard = fullDeck[13];
    const firstDiscard = fullDeck[14];

    setWildJoker(jokerCard);
    setDiscardPile([firstDiscard]);
    setDrawPileCount(fullDeck.length - 15 - 39); // 13 cards for 3 opponents

    setTimeout(() => {
      // Sort hand by suit & value
      const sorted = [...player13].sort((a, b) => {
        if (a.suit === b.suit) return a.value - b.value;
        return a.suit.localeCompare(b.suit);
      });
      setHand(sorted);
      setGameState('playing');
      setTimer(30);
      soundService.playCardDeal();
    }, 1000);
  };

  // Draw card from Closed Deck
  const handleDrawClosed = () => {
    if (!hasDrawn && gameState === 'playing') {
      const fullDeck = generateDeck();
      const newCard = fullDeck[Math.floor(Math.random() * fullDeck.length)];
      setHand(prev => [...prev, newCard]);
      setHasDrawn(true);
      soundService.playCardDeal();
    }
  };

  // Draw card from Discard Pile
  const handleDrawOpen = () => {
    if (!hasDrawn && discardPile.length > 0 && gameState === 'playing') {
      const card = discardPile[discardPile.length - 1];
      setDiscardPile(prev => prev.slice(0, -1));
      setHand(prev => [...prev, card]);
      setHasDrawn(true);
      soundService.playCardDeal();
    }
  };

  // Discard card
  const handleDiscard = (cardId: string) => {
    if (!hasDrawn || gameState !== 'playing') return;
    const cardToDiscard = hand.find(c => c.id === cardId);
    if (!cardToDiscard) return;

    soundService.playClick();
    setHand(prev => prev.filter(c => c.id !== cardId));
    setDiscardPile(prev => [...prev, cardToDiscard]);
    setHasDrawn(false);
    setSelectedCards([]);
  };

  // Declare & Show
  const handleDeclare = () => {
    if (hand.length !== 13 && hand.length !== 14) return;
    soundService.playSpinTick();
    setGameState('declare');

    // Simulate Rummy validation algorithm based on admin RTP
    const rtp = adminSettings?.rtpRate ?? 92;
    const shouldWin = Math.random() * 100 < rtp;

    setTimeout(() => {
      const entryFee = pointValue * 80;
      if (shouldWin) {
        // Winner gets pot minus table commission
        const winAmount = entryFee * 3.8; // 4 players table
        onUpdateBalance(userBalance + winAmount);
        onRecordBet('rummy', '13 Cards Point Rummy', entryFee, winAmount, +(winAmount / entryFee).toFixed(2));
        setGameResult({
          won: true,
          winAmount,
          score: 0,
          message: '🏆 PURE SEQUENCE VALIDATED! YOU WON THE TABLE POT!',
        });
        soundService.playWin();
      } else {
        const lossScore = Math.floor(Math.random() * 40) + 15;
        const lossAmount = pointValue * lossScore;
        const refunded = entryFee - lossAmount;
        onUpdateBalance(userBalance + refunded);
        onRecordBet('rummy', '13 Cards Point Rummy', entryFee, refunded, 0);
        setGameResult({
          won: false,
          winAmount: 0,
          score: lossScore,
          message: `Opponent declared first! Lost ${lossScore} points (Rs ${lossAmount}).`,
        });
        soundService.playLose();
      }
      setGameState('finished');
    }, 1500);
  };

  const handleDrop = () => {
    if (gameState !== 'playing') return;
    const entryFee = pointValue * 80;
    const firstDropPenalty = pointValue * 20; // 20 points for 1st drop
    const refund = entryFee - firstDropPenalty;
    onUpdateBalance(userBalance + refund);
    onRecordBet('rummy', '13 Cards Point Rummy (Drop)', entryFee, refund, 0);
    soundService.playLose();
    setGameResult({
      won: false,
      winAmount: 0,
      score: 20,
      message: `Table Dropped. First drop penalty of 20 points (Rs ${firstDropPenalty}) deducted.`,
    });
    setGameState('finished');
  };

  const toggleSelectCard = (id: string) => {
    soundService.playClick();
    setSelectedCards(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const sortHand = () => {
    soundService.playCardDeal();
    setHand(prev => [...prev].sort((a, b) => {
      if (a.suit === b.suit) return a.value - b.value;
      return a.suit.localeCompare(b.suit);
    }));
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#072418] via-[#0b3823] to-[#04160d] text-slate-100 rounded-3xl p-3 sm:p-5 border border-emerald-600/30 shadow-2xl relative overflow-hidden flex flex-col justify-between">
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
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl">🎴</span>
            <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              13 CARDS INDIAN RUMMY
            </h1>
          </div>
          <span className="text-[10px] text-emerald-300 font-medium">Point Value: Rs {pointValue} • 4-Player Table</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
            <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              Rs {userBalance.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Main Rummy Felt Table */}
      <div className="relative my-auto bg-gradient-to-radial from-[#12613d] to-[#08301c] rounded-3xl p-4 sm:p-6 border-4 border-amber-800/40 shadow-inner min-h-[360px] flex flex-col justify-between">
        {/* Opponents Area */}
        <div className="grid grid-cols-3 gap-2">
          {['Player 2 (Rahul_99)', 'Player 3 (Asif_Khan)', 'Player 4 (Zain_Vip)'].map((name, i) => (
            <div key={i} className="bg-black/40 border border-emerald-700/40 rounded-xl p-2 text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-base">👤</span>
                <span className="text-[10px] font-bold text-slate-200 truncate">{name}</span>
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="w-3.5 h-5 bg-blue-900 border border-blue-400 rounded-sm" />
                ))}
                <span className="text-[9px] font-bold text-amber-300 ml-1">13 Cards</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center Table: Wild Joker & Discard Pile */}
        <div className="flex items-center justify-center gap-6 my-4">
          {/* Closed Deck */}
          <div
            onClick={handleDrawClosed}
            className={`cursor-pointer group flex flex-col items-center ${
              !hasDrawn && gameState === 'playing' ? 'ring-2 ring-amber-400 rounded-xl animate-pulse' : ''
            }`}
          >
            <div className="w-14 h-20 bg-gradient-to-b from-blue-700 to-indigo-900 border-2 border-blue-400 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition">
              <span className="text-2xl text-blue-200">🂠</span>
            </div>
            <span className="text-[10px] font-bold text-slate-300 mt-1">Closed Deck</span>
          </div>

          {/* Wild Joker */}
          {wildJoker && (
            <div className="flex flex-col items-center">
              <div className="w-14 h-20 bg-amber-100 border-2 border-amber-500 rounded-xl flex flex-col items-center justify-center text-slate-950 font-black shadow-lg">
                <span className="text-xs text-amber-800">JOKER</span>
                <span className={`text-base ${wildJoker.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                  {wildJoker.label} {wildJoker.suit}
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 mt-1">Wild Joker</span>
            </div>
          )}

          {/* Open / Discard Deck */}
          <div
            onClick={handleDrawOpen}
            className={`cursor-pointer group flex flex-col items-center ${
              !hasDrawn && gameState === 'playing' && discardPile.length > 0 ? 'ring-2 ring-emerald-400 rounded-xl' : ''
            }`}
          >
            {discardPile.length > 0 ? (
              <div className="w-14 h-20 bg-white border-2 border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-950 font-black shadow-lg transform group-hover:scale-105 transition">
                <span className={`text-lg font-bold ${discardPile[discardPile.length - 1].color === 'red' ? 'text-red-600' : 'text-slate-950'}`}>
                  {discardPile[discardPile.length - 1].label} {discardPile[discardPile.length - 1].suit}
                </span>
              </div>
            ) : (
              <div className="w-14 h-20 bg-black/40 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center text-slate-500 text-xs">
                Empty
              </div>
            )}
            <span className="text-[10px] font-bold text-slate-300 mt-1">Discard Pile</span>
          </div>
        </div>

        {/* Player's Cards Hand */}
        {gameState !== 'betting' && (
          <div className="bg-black/60 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                <span>YOUR HAND ({hand.length} Cards)</span>
                {hasDrawn && <span className="text-[10px] bg-amber-500 text-black px-1.5 rounded font-black">DISCARD 1 CARD</span>}
              </span>
              <button
                onClick={sortHand}
                className="px-2.5 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold border border-emerald-500/50 flex items-center gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>Sort Suit</span>
              </button>
            </div>

            {/* Render Cards with horizontal scroll */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
              {hand.map((card) => {
                const isSelected = selectedCards.includes(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      if (hasDrawn) {
                        handleDiscard(card.id);
                      } else {
                        toggleSelectCard(card.id);
                      }
                    }}
                    className={`min-w-[42px] sm:min-w-[48px] h-16 sm:h-20 bg-white rounded-xl flex flex-col justify-between p-1.5 shadow-md cursor-pointer border-2 transition-all duration-200 transform ${
                      isSelected
                        ? '-translate-y-2 border-amber-500 shadow-amber-500/50 shadow-lg'
                        : 'border-slate-300 hover:-translate-y-1'
                    }`}
                  >
                    <span className={`text-xs font-black leading-none ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                      {card.label}
                    </span>
                    <span className={`text-base text-center font-bold ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                      {card.suit}
                    </span>
                    <span className={`text-[9px] font-black text-right leading-none ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                      {card.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Result Overlay */}
        {gameResult && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 z-20 animate-fade-in">
            <div className="text-5xl mb-2">{gameResult.won ? '🏆' : '💀'}</div>
            <h2 className={`text-xl font-black mb-1 ${gameResult.won ? 'text-amber-400' : 'text-red-400'}`}>
              {gameResult.won ? 'VICTORY - RUMMY DECLARED!' : 'DEFEAT'}
            </h2>
            <p className="text-xs text-slate-200 text-center max-w-sm mb-4">{gameResult.message}</p>
            {gameResult.won && (
              <div className="text-2xl font-black text-emerald-400 font-mono mb-4">
                +Rs {gameResult.winAmount.toLocaleString()}
              </div>
            )}
            <button
              onClick={() => setGameState('betting')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition"
            >
              Play Next Hand
            </button>
          </div>
        )}
      </div>

      {/* Action & Betting Bar */}
      <div className="bg-[#081b12] border border-emerald-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        {gameState === 'betting' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Point Value:</span>
              {[0.5, 1, 2, 5, 10, 25].map((pv) => (
                <button
                  key={pv}
                  onClick={() => {
                    soundService.playChip();
                    setPointValue(pv);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    pointValue === pv
                      ? 'bg-amber-400 text-slate-950 shadow-md border border-amber-300 scale-105'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  Rs {pv}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-bold">MAX RISK (80 pts)</span>
                <span className="text-xs font-black text-amber-400">Rs {(pointValue * 80).toLocaleString()}</span>
              </div>
              <button
                onClick={handleStartGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg hover:from-emerald-400 hover:to-teal-400 transition cursor-pointer"
              >
                Join Table (Deal)
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleDrop}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold border border-red-500 shadow"
            >
              Drop Table (-20 Pts)
            </button>

            <div className="text-center">
              <span className="text-[10px] text-amber-300 font-bold block">
                {hasDrawn ? '👉 Click a card in your hand to discard' : '👈 Draw from Closed Deck or Discard Pile'}
              </span>
            </div>

            <button
              onClick={handleDeclare}
              className="px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:scale-105 transition"
            >
              Declare &amp; Show
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
