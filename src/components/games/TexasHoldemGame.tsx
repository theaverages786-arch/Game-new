import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Volume2, VolumeX, ShieldCheck, DollarSign, Zap } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface TexasHoldemProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number;
  label: string;
  color: 'red' | 'black';
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  chips: number;
  currentBet: number;
  cards: Card[];
  folded: boolean;
  isUser?: boolean;
}

export const TexasHoldemGame: React.FC<TexasHoldemProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bigBlind, setBigBlind] = useState(50);
  const [stage, setStage] = useState<'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'betting'>('betting');
  const [pot, setPot] = useState(0);
  const [communityCards, setCommunityCards] = useState<Card[]>([]);
  const [currentHighestBet, setCurrentHighestBet] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [raiseAmount, setRaiseAmount] = useState(100);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]; // 14=A
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

  const startHand = () => {
    if (userBalance < bigBlind) {
      alert('Insufficient balance for Big Blind!');
      return;
    }

    soundService.playChip();
    const deck = getDeck();
    const sb = bigBlind / 2;

    const newPlayers: Player[] = [
      {
        id: 'p1',
        name: 'You (Hero)',
        avatar: '🤠',
        chips: userBalance - bigBlind,
        currentBet: bigBlind,
        cards: [deck[0], deck[1]],
        folded: false,
        isUser: true,
      },
      {
        id: 'p2',
        name: 'Vip_Viper',
        avatar: '😎',
        chips: 5000 - sb,
        currentBet: sb,
        cards: [deck[2], deck[3]],
        folded: false,
      },
      {
        id: 'p3',
        name: 'PokerKing99',
        avatar: '🦁',
        chips: 5000 - bigBlind,
        currentBet: bigBlind,
        cards: [deck[4], deck[5]],
        folded: false,
      },
    ];

    onUpdateBalance(userBalance - bigBlind);
    setPlayers(newPlayers);
    setPot(bigBlind * 2 + sb);
    setCurrentHighestBet(bigBlind);
    setCommunityCards([deck[6], deck[7], deck[8], deck[9], deck[10]]); // prepare all
    setStage('preflop');
    setWinnerMessage(null);
    soundService.playCardDeal();
  };

  const handleFold = () => {
    soundService.playLose();
    setPlayers(prev => prev.map(p => p.isUser ? { ...p, folded: true } : p));
    setWinnerMessage('You folded. Pot awarded to PokerKing99.');
    setStage('showdown');
    onRecordBet('texas_holdem', 'Texas Holdem Poker (Fold)', bigBlind, 0, 0);
  };

  const handleCall = () => {
    soundService.playChip();
    const user = players.find(p => p.isUser);
    if (!user) return;
    const toCall = currentHighestBet - user.currentBet;
    if (toCall > 0) {
      onUpdateBalance(userBalance - toCall);
      setPot(prev => prev + toCall);
    }
    advanceStage();
  };

  const handleRaise = () => {
    soundService.playChip();
    const user = players.find(p => p.isUser);
    if (!user) return;
    const additional = raiseAmount;
    onUpdateBalance(userBalance - additional);
    setPot(prev => prev + additional);
    setCurrentHighestBet(prev => prev + additional);
    advanceStage();
  };

  const advanceStage = () => {
    if (stage === 'preflop') setStage('flop');
    else if (stage === 'flop') setStage('turn');
    else if (stage === 'turn') setStage('river');
    else if (stage === 'river') {
      // Showdown evaluation
      setStage('showdown');
      const rtp = adminSettings?.rtpRate ?? 92;
      const userWon = Math.random() * 100 < rtp;

      setTimeout(() => {
        if (userWon) {
          const winAmount = pot * 1.5;
          onUpdateBalance(userBalance + winAmount);
          onRecordBet('texas_holdem', 'Texas Holdem Poker', bigBlind, winAmount, +(winAmount / bigBlind).toFixed(2));
          setWinnerMessage(`🎉 YOU WON THE POT WITH FULL HOUSE! +Rs ${winAmount.toLocaleString()}`);
          soundService.playWin();
        } else {
          onRecordBet('texas_holdem', 'Texas Holdem Poker', bigBlind, 0, 0);
          setWinnerMessage('PokerKing99 wins with Flush (Ace High).');
          soundService.playLose();
        }
      }, 1000);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#0a192f] via-[#0d2a45] to-[#05111d] text-slate-100 rounded-3xl p-3 sm:p-5 border border-blue-600/30 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-blue-800/60 pb-3">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-blue-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
            TEXAS HOLD'EM NO-LIMIT POKER
          </h1>
          <span className="text-[10px] text-blue-300 font-medium">Blinds: Rs {bigBlind / 2} / Rs {bigBlind} • Table Pot: Rs {pot}</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">CHIPS</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Poker Table Felt */}
      <div className="my-auto relative bg-gradient-to-radial from-[#15523a] to-[#0a291d] rounded-[50px] p-6 sm:p-8 border-8 border-[#3b2311] shadow-2xl min-h-[380px] flex flex-col justify-between">
        {/* Opponents */}
        <div className="flex items-center justify-around">
          {players.filter(p => !p.isUser).map(opp => (
            <div key={opp.id} className="bg-black/60 border border-emerald-600/40 rounded-2xl p-2.5 text-center min-w-[120px]">
              <div className="text-2xl">{opp.avatar}</div>
              <span className="text-xs font-bold text-slate-200 block">{opp.name}</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">Rs {opp.chips}</span>
              <div className="flex items-center justify-center gap-1 mt-1">
                {stage === 'showdown' ? (
                  opp.cards.map((c, i) => (
                    <div key={i} className="w-6 h-9 bg-white text-slate-900 rounded font-black text-[9px] flex flex-col items-center justify-center">
                      <span>{c.label}</span>
                      <span className={c.color === 'red' ? 'text-red-600' : 'text-black'}>{c.suit}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="w-6 h-9 bg-blue-900 border border-blue-400 rounded" />
                    <div className="w-6 h-9 bg-blue-900 border border-blue-400 rounded" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Center Board: Pot & Community Cards */}
        <div className="my-4 text-center">
          <div className="inline-block bg-black/60 px-4 py-1 rounded-full border border-amber-400/50 mb-2">
            <span className="text-xs font-black text-amber-300">POT: Rs {pot.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            {(stage === 'betting' ? [] : communityCards.slice(0, stage === 'flop' ? 3 : stage === 'turn' ? 4 : 5)).map((c, i) => (
              <div key={i} className="w-11 sm:w-14 h-16 sm:h-20 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                <span className={`text-xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                <span className={`text-[10px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
              </div>
            ))}
            {stage === 'betting' && (
              <div className="text-slate-400 text-xs italic">Place Blinds to Deal Cards</div>
            )}
          </div>
        </div>

        {/* Hero / User Cards */}
        {players.find(p => p.isUser) && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 bg-black/70 px-4 py-2 rounded-2xl border border-amber-500/50">
              <span className="text-xs font-black text-amber-300 mr-2">YOUR HAND</span>
              {players.find(p => p.isUser)?.cards.map((c, i) => (
                <div key={i} className="w-12 sm:w-14 h-18 sm:h-20 bg-white rounded-xl shadow-md border-2 border-amber-400 flex flex-col justify-between p-1.5 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-2xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                  <span className={`text-[10px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winner Dialog */}
        {winnerMessage && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md rounded-[50px] flex flex-col items-center justify-center p-6 z-20">
            <Trophy className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-lg sm:text-xl font-black text-white text-center mb-4">{winnerMessage}</h2>
            <button
              onClick={() => setStage('betting')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer"
            >
              Deal Next Hand
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="bg-[#081728] border border-blue-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        {stage === 'betting' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Big Blind:</span>
              {[20, 50, 100, 200, 500].map(b => (
                <button
                  key={b}
                  onClick={() => setBigBlind(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    bigBlind === b ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Rs {b}
                </button>
              ))}
            </div>

            <button
              onClick={startHand}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-lg hover:scale-105 transition cursor-pointer"
            >
              Deal &amp; Post Blind
            </button>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handleFold}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold border border-red-500 shadow cursor-pointer"
            >
              Fold
            </button>

            <button
              onClick={handleCall}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold border border-blue-400 shadow cursor-pointer"
            >
              Check / Call
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRaiseAmount(prev => prev + 50)}
                className="px-2 py-1 bg-slate-800 text-slate-200 rounded text-xs"
              >
                +50
              </button>
              <button
                onClick={handleRaise}
                className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black rounded-xl text-xs shadow-lg hover:scale-105 transition cursor-pointer"
              >
                Raise Rs {raiseAmount}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
