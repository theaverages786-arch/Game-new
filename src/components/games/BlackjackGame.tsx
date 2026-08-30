import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, ShieldCheck, Sparkles, RefreshCw, Trophy } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface BlackjackProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 1 to 13
  label: string;
  color: 'red' | 'black';
}

export const BlackjackGame: React.FC<BlackjackProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(100);
  const [selectedChip, setSelectedChip] = useState(100);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer_turn' | 'resolved'>('betting');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameMessage, setGameMessage] = useState<string | null>(null);
  const [lastWin, setLastWin] = useState(0);

  const chips = [20, 50, 100, 500, 1000, 5000];
  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

  const getDeck = (): Card[] => {
    const deck: Card[] = [];
    for (let i = 0; i < 4; i++) {
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
    }
    return deck.sort(() => Math.random() - 0.5);
  };

  const calculateHandValue = (hand: Card[]) => {
    let sum = 0;
    let aces = 0;
    for (const card of hand) {
      if (card.value === 1) {
        aces += 1;
        sum += 11;
      } else if (card.value >= 10) {
        sum += 10;
      } else {
        sum += card.value;
      }
    }
    while (sum > 21 && aces > 0) {
      sum -= 10;
      aces -= 1;
    }
    return sum;
  };

  const handleDeal = () => {
    if (userBalance < bet) {
      alert('Insufficient balance!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    const deck = getDeck();
    const pHand = [deck[0], deck[2]];
    const dHand = [deck[1], deck[3]];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameState('playing');
    setGameMessage(null);
    setLastWin(0);
    soundService.playCardDeal();

    // Check instant player Blackjack
    if (calculateHandValue(pHand) === 21) {
      handleDealerTurn(pHand, dHand, true);
    }
  };

  const handleHit = () => {
    if (gameState !== 'playing') return;
    soundService.playCardDeal();
    const deck = getDeck();
    const newHand = [...playerHand, deck[0]];
    setPlayerHand(newHand);

    const val = calculateHandValue(newHand);
    if (val > 21) {
      // Bust
      setGameState('resolved');
      setGameMessage('💥 BUST! You exceeded 21.');
      onRecordBet('blackjack', 'Classic Blackjack 21', bet, 0, 0);
      soundService.playLose();
    } else if (val === 21) {
      handleDealerTurn(newHand, dealerHand);
    }
  };

  const handleStand = () => {
    if (gameState !== 'playing') return;
    soundService.playClick();
    handleDealerTurn(playerHand, dealerHand);
  };

  const handleDouble = () => {
    if (gameState !== 'playing' || playerHand.length !== 2) return;
    if (userBalance < bet) {
      alert('Insufficient balance to Double Down!');
      return;
    }

    onUpdateBalance(userBalance - bet);
    const newBet = bet * 2;
    setBet(newBet);

    const deck = getDeck();
    const newHand = [...playerHand, deck[0]];
    setPlayerHand(newHand);
    soundService.playCardDeal();

    const val = calculateHandValue(newHand);
    if (val > 21) {
      setGameState('resolved');
      setGameMessage('💥 BUST on Double Down!');
      onRecordBet('blackjack', 'Blackjack (Double Down)', newBet, 0, 0);
      soundService.playLose();
    } else {
      handleDealerTurn(newHand, dealerHand, false, newBet);
    }
  };

  const handleDealerTurn = (
    currentPHand: Card[],
    currentDHand: Card[],
    isPlayerBlackjack = false,
    finalBet = bet
  ) => {
    setGameState('dealer_turn');

    const pVal = calculateHandValue(currentPHand);
    let dCards = [...currentDHand];
    let dVal = calculateHandValue(dCards);

    const deck = getDeck();
    let deckIdx = 0;

    // Dealer draws to 17
    while (dVal < 17) {
      dCards.push(deck[deckIdx++]);
      dVal = calculateHandValue(dCards);
    }

    setDealerHand(dCards);
    setGameState('resolved');

    if (isPlayerBlackjack && dVal !== 21) {
      // Natural Blackjack 3:2 payout (2.5x total)
      const win = Math.round(finalBet * 2.5);
      setLastWin(win);
      onUpdateBalance(userBalance + win);
      onRecordBet('blackjack', 'Blackjack (Natural 3:2)', finalBet, win, 2.5);
      setGameMessage('🎉 BLACKJACK! 3:2 Payout!');
      soundService.playWin();
    } else if (dVal > 21 || pVal > dVal) {
      const win = finalBet * 2;
      setLastWin(win);
      onUpdateBalance(userBalance + win);
      onRecordBet('blackjack', 'Classic Blackjack', finalBet, win, 2.0);
      setGameMessage(`🎉 YOU WON! Dealer had ${dVal > 21 ? 'Busted (' + dVal + ')' : dVal}.`);
      soundService.playWin();
    } else if (pVal === dVal) {
      // Push / Tie
      setLastWin(finalBet);
      onUpdateBalance(userBalance + finalBet);
      onRecordBet('blackjack', 'Classic Blackjack (Push)', finalBet, finalBet, 1.0);
      setGameMessage('🤝 PUSH (TIE)! Bet returned.');
    } else {
      // Dealer wins
      onRecordBet('blackjack', 'Classic Blackjack', finalBet, 0, 0);
      setGameMessage(`💀 DEALER WINS with ${dVal} vs your ${pVal}.`);
      soundService.playLose();
    }
  };

  const pScore = calculateHandValue(playerHand);
  const dScore = gameState === 'playing'
    ? calculateHandValue([dealerHand[0]])
    : calculateHandValue(dealerHand);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0a2318] via-[#0e3b28] to-[#05170f] text-slate-100 rounded-3xl p-3 sm:p-5 border border-emerald-600/40 shadow-2xl relative flex flex-col justify-between">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            EUROPEAN VIP BLACKJACK 21
          </h1>
          <span className="text-[10px] text-emerald-300 font-medium">Dealer Stands on 17 • Blackjack Pays 3:2</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Blackjack Table Felt */}
      <div className="my-auto bg-gradient-to-radial from-[#126b42] to-[#083822] rounded-[40px] p-6 border-4 border-amber-700/50 shadow-inner min-h-[360px] flex flex-col justify-between relative">
        {/* Dealer Section */}
        <div className="flex flex-col items-center">
          <div className="bg-black/50 px-3 py-0.5 rounded-full border border-emerald-500/30 text-[10px] font-bold text-slate-300 mb-2">
            DEALER {dealerHand.length > 0 && `(${dScore})`}
          </div>
          <div className="flex items-center gap-2">
            {dealerHand.map((card, idx) => {
              if (idx === 1 && gameState === 'playing') {
                return (
                  <div key={idx} className="w-14 h-20 bg-blue-900 border-2 border-blue-400 rounded-xl flex items-center justify-center text-blue-200 text-xl font-bold shadow-lg">
                    🂠
                  </div>
                );
              }
              return (
                <div key={idx} className="w-14 h-20 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1.5 text-slate-950 font-black">
                  <span className={`text-xs ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.label}</span>
                  <span className={`text-2xl text-center ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.suit}</span>
                  <span className={`text-[10px] text-right ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Banner / Game Outcome */}
        <div className="my-2 text-center">
          {gameMessage ? (
            <div className="inline-block bg-black/80 px-6 py-2 rounded-2xl border-2 border-amber-400 shadow-2xl animate-bounce">
              <span className="text-sm sm:text-base font-black text-amber-300">{gameMessage}</span>
              {lastWin > 0 && (
                <span className="block text-xs font-black text-emerald-400 font-mono mt-0.5">
                  +Rs {lastWin.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              {gameState === 'playing' ? 'Hit, Stand, or Double Down' : 'Place Your Bet & Deal'}
            </div>
          )}
        </div>

        {/* Player Section */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            {playerHand.map((card, idx) => (
              <div key={idx} className="w-14 h-20 bg-white rounded-xl shadow-xl border-2 border-amber-400 flex flex-col justify-between p-1.5 text-slate-950 font-black">
                <span className={`text-xs ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.label}</span>
                <span className={`text-2xl text-center ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.suit}</span>
                <span className={`text-[10px] text-right ${card.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{card.label}</span>
              </div>
            ))}
          </div>
          <div className="bg-black/60 px-4 py-1 rounded-full border border-amber-400/40 text-xs font-black text-amber-300">
            YOU ({pScore}) • BET: Rs {bet}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="bg-[#081a12] border border-emerald-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        {gameState === 'betting' || gameState === 'resolved' ? (
          <>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              {chips.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    soundService.playChip();
                    setBet(c);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer border ${
                    bet === c
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  Rs {c}
                </button>
              ))}
            </div>

            <button
              onClick={handleDeal}
              className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer"
            >
              Deal Cards
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 w-full">
            <button
              onClick={handleHit}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-lg border border-emerald-400 cursor-pointer"
            >
              Hit (+Card)
            </button>

            <button
              onClick={handleStand}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-sm shadow-lg border border-rose-400 cursor-pointer"
            >
              Stand
            </button>

            {playerHand.length === 2 && (
              <button
                onClick={handleDouble}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg hover:scale-105 transition cursor-pointer"
              >
                Double (2x Bet)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
