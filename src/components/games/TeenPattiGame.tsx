import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  Users, 
  Volume2, 
  VolumeX,
  Plus,
  Minus
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';

interface TeenPattiProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2 - 14 (14 is Ace)
  label: string;
  color: 'red' | 'black';
}

interface PlayerSeat {
  id: number;
  name: string;
  avatar: string;
  vip: number;
  balance: number;
  isHuman: boolean;
  cards: Card[];
  isPacked: boolean;
  isSeen: boolean;
  currentBet: number;
  statusText: string;
}

const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
const LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const TeenPattiGame: React.FC<TeenPattiProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bootBet, setBootBet] = useState(50);
  const [currentStake, setCurrentStake] = useState(50);
  const [pot, setPot] = useState(0);
  const [gameState, setGameState] = useState<'lobby' | 'dealing' | 'betting' | 'showdown'>('lobby');
  const [activeSeatIndex, setActiveSeatIndex] = useState<number>(0);
  const [turnCountdown, setTurnCountdown] = useState<number>(10);
  const [winnerSeat, setWinnerSeat] = useState<PlayerSeat | null>(null);
  const [winnerHandRank, setWinnerHandRank] = useState<string>('');

  // 5 Seated Players: Index 0 is Human Player (Bottom-Center)
  const [seats, setSeats] = useState<PlayerSeat[]>([
    {
      id: 0,
      name: 'You (VIP)',
      avatar: '👑',
      vip: 7,
      balance: userBalance,
      isHuman: true,
      cards: [],
      isPacked: false,
      isSeen: false,
      currentBet: 0,
      statusText: '',
    },
    {
      id: 1,
      name: 'Raja Malik',
      avatar: '👳‍♂️',
      vip: 5,
      balance: 38400,
      isHuman: false,
      cards: [],
      isPacked: false,
      isSeen: false,
      currentBet: 0,
      statusText: '',
    },
    {
      id: 2,
      name: 'Ali King',
      avatar: '🦁',
      vip: 4,
      balance: 24200,
      isHuman: false,
      cards: [],
      isPacked: false,
      isSeen: false,
      currentBet: 0,
      statusText: '',
    },
    {
      id: 3,
      name: 'Usman 786',
      avatar: '🧔',
      vip: 6,
      balance: 51900,
      isHuman: false,
      cards: [],
      isPacked: false,
      isSeen: false,
      currentBet: 0,
      statusText: '',
    },
    {
      id: 4,
      name: 'Shahid VIP',
      avatar: '🕶️',
      vip: 3,
      balance: 16800,
      isHuman: false,
      cards: [],
      isPacked: false,
      isSeen: false,
      currentBet: 0,
      statusText: '',
    },
  ]);

  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync human balance
  useEffect(() => {
    setSeats((prev) =>
      prev.map((s) => (s.isHuman ? { ...s, balance: userBalance } : s))
    );
  }, [userBalance]);

  // Deck generation
  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach((suit) => {
      LABELS.forEach((lbl, idx) => {
        deck.push({
          suit,
          value: idx + 2,
          label: lbl,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
        });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  // Hand rank evaluation
  const evaluateHand = (cards: Card[]): { rank: number; name: string; highVal: number } => {
    if (cards.length < 3) return { rank: 0, name: 'High Card', highVal: 0 };
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const isFlush = cards.every((c) => c.suit === cards[0].suit);
    const isTrio = cards[0].value === cards[1].value && cards[1].value === cards[2].value;
    const isSeq =
      (sorted[0].value - sorted[1].value === 1 && sorted[1].value - sorted[2].value === 1) ||
      (sorted[0].value === 14 && sorted[1].value === 3 && sorted[2].value === 2); // A-2-3

    if (isTrio) return { rank: 6, name: `Trail (${sorted[0].label})`, highVal: sorted[0].value };
    if (isFlush && isSeq) return { rank: 5, name: 'Pure Sequence', highVal: sorted[0].value };
    if (isSeq) return { rank: 4, name: 'Sequence', highVal: sorted[0].value };
    if (isFlush) return { rank: 3, name: 'Color (Flush)', highVal: sorted[0].value };
    if (sorted[0].value === sorted[1].value || sorted[1].value === sorted[2].value) {
      return { rank: 2, name: `Pair (${sorted[1].label})`, highVal: sorted[1].value };
    }
    return { rank: 1, name: `High Card (${sorted[0].label})`, highVal: sorted[0].value };
  };

  // Start new round
  const handleStartGame = () => {
    if (userBalance < bootBet) {
      alert('Insufficient balance for Boot amount!');
      return;
    }

    soundService.playCardDeal();
    onUpdateBalance(userBalance - bootBet);

    const deck = createDeck();
    const shouldWin = shouldPlayerWin('cards_teen_patti', adminSettings, 0.48);

    // Deal 3 cards to each of the 5 seats
    const newSeats = seats.map((seat, idx) => {
      let hand: Card[];

      if (seat.isHuman) {
        if (shouldWin) {
          // Give human a very solid hand (Trio or Straight Flush or Sequence)
          const roll = Math.random();
          if (roll < 0.3) {
            hand = [
              { suit: '♠', value: 14, label: 'A', color: 'black' },
              { suit: '♥', value: 14, label: 'A', color: 'red' },
              { suit: '♦', value: 14, label: 'A', color: 'red' },
            ];
          } else if (roll < 0.6) {
            hand = [
              { suit: '♥', value: 13, label: 'K', color: 'red' },
              { suit: '♥', value: 12, label: 'Q', color: 'red' },
              { suit: '♥', value: 11, label: 'J', color: 'red' },
            ];
          } else {
            hand = [
              { suit: '♠', value: 14, label: 'A', color: 'black' },
              { suit: '♦', value: 14, label: 'A', color: 'red' },
              { suit: '♣', value: 10, label: '10', color: 'black' },
            ];
          }
        } else {
          hand = [deck.pop()!, deck.pop()!, deck.pop()!];
        }
      } else {
        hand = [deck.pop()!, deck.pop()!, deck.pop()!];
      }

      return {
        ...seat,
        cards: hand,
        isPacked: false,
        isSeen: false,
        currentBet: bootBet,
        statusText: 'Boot In',
      };
    });

    const initialPot = bootBet * 5;
    setPot(initialPot);
    setCurrentStake(bootBet);
    setSeats(newSeats);
    setGameState('betting');
    setWinnerSeat(null);
    setWinnerHandRank('');
    setActiveSeatIndex(0); // Start with human player
    setTurnCountdown(10);
  };

  // Turn management countdown
  useEffect(() => {
    if (gameState !== 'betting') return;

    if (turnTimerRef.current) clearInterval(turnTimerRef.current);

    setTurnCountdown(10);
    turnTimerRef.current = setInterval(() => {
      setTurnCountdown((prev) => {
        if (prev <= 1) {
          // Time expired for this seat
          handleTurnTimeout();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    // If bot turn, schedule bot AI decision
    const currentSeat = seats[activeSeatIndex];
    if (currentSeat && !currentSeat.isHuman && !currentSeat.isPacked) {
      const botDelay = setTimeout(() => {
        executeBotTurn(activeSeatIndex);
      }, 1200);
      return () => clearTimeout(botDelay);
    }

    return () => {
      if (turnTimerRef.current) clearInterval(turnTimerRef.current);
    };
  }, [activeSeatIndex, gameState]);

  const advanceTurn = (fromIndex: number) => {
    // Check remaining active players
    const activeSeats = seats.filter((s) => !s.isPacked);
    if (activeSeats.length <= 1) {
      // Round ends, remaining player wins!
      declareWinner(activeSeats[0] || seats[0]);
      return;
    }

    // Move to next non-packed seat
    let nextIdx = (fromIndex + 1) % seats.length;
    while (seats[nextIdx].isPacked) {
      nextIdx = (nextIdx + 1) % seats.length;
    }

    setActiveSeatIndex(nextIdx);
  };

  const handleTurnTimeout = () => {
    const seat = seats[activeSeatIndex];
    if (seat.isHuman) {
      // Auto pack if player timed out
      handlePlayerPack();
    } else {
      executeBotTurn(activeSeatIndex);
    }
  };

  // Bot AI decision
  const executeBotTurn = (seatIdx: number) => {
    const bot = seats[seatIdx];
    if (!bot || bot.isPacked || gameState !== 'betting') return;

    const handEval = evaluateHand(bot.cards);
    const activeCount = seats.filter((s) => !s.isPacked).length;

    // Decide whether to see cards
    const shouldSee = Math.random() < 0.6 || handEval.rank >= 2;
    const isSeenNow = bot.isSeen || shouldSee;

    // Decision: Pack, Chaal, or Show
    if (activeCount === 2 && Math.random() < 0.35) {
      // Showdown request
      handleShowdown();
      return;
    }

    // Weak hand pack chance
    if (handEval.rank === 1 && handEval.highVal < 10 && pot > bootBet * 8) {
      // Bot folds
      soundService.playCardFlip();
      setSeats((prev) =>
        prev.map((s, idx) =>
          idx === seatIdx ? { ...s, isPacked: true, statusText: 'Folded' } : s
        )
      );
      advanceTurn(seatIdx);
      return;
    }

    // Bot bets Chaal or Blind
    const betAmount = isSeenNow ? currentStake * 2 : currentStake;
    soundService.playChip();
    setPot((p) => p + betAmount);

    setSeats((prev) =>
      prev.map((s, idx) =>
        idx === seatIdx
          ? {
              ...s,
              isSeen: isSeenNow,
              currentBet: s.currentBet + betAmount,
              balance: s.balance - betAmount,
              statusText: isSeenNow ? `Chaal ₨ ${betAmount}` : `Blind ₨ ${betAmount}`,
            }
          : s
      )
    );

    advanceTurn(seatIdx);
  };

  // Human Player Actions
  const handlePlayerSeeCards = () => {
    soundService.playCardFlip();
    setSeats((prev) =>
      prev.map((s, idx) => (idx === 0 ? { ...s, isSeen: true } : s))
    );
  };

  const handlePlayerBet = (multiplier: number) => {
    const human = seats[0];
    const base = human.isSeen ? currentStake * 2 : currentStake;
    const betCost = base * multiplier;

    if (userBalance < betCost) {
      alert('Insufficient balance for this Chaal!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - betCost);
    setPot((p) => p + betCost);

    setSeats((prev) =>
      prev.map((s, idx) =>
        idx === 0
          ? {
              ...s,
              currentBet: s.currentBet + betCost,
              balance: s.balance - betCost,
              statusText: human.isSeen ? `Chaal ₨ ${betCost}` : `Blind ₨ ${betCost}`,
            }
          : s
      )
    );

    advanceTurn(0);
  };

  const handlePlayerPack = () => {
    soundService.playCardFlip();
    setSeats((prev) =>
      prev.map((s, idx) =>
        idx === 0 ? { ...s, isPacked: true, statusText: 'Folded' } : s
      )
    );
    advanceTurn(0);
  };

  const handleShowdown = () => {
    soundService.playCardDeal();
    setGameState('showdown');
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);

    // Evaluate all non-packed players
    const contenders = seats.filter((s) => !s.isPacked);
    let bestSeat = contenders[0];
    let bestEval = evaluateHand(bestSeat.cards);

    for (let i = 1; i < contenders.length; i++) {
      const cEval = evaluateHand(contenders[i].cards);
      if (
        cEval.rank > bestEval.rank ||
        (cEval.rank === bestEval.rank && cEval.highVal > bestEval.highVal)
      ) {
        bestSeat = contenders[i];
        bestEval = cEval;
      }
    }

    declareWinner(bestSeat);
  };

  const declareWinner = (winner: PlayerSeat) => {
    setGameState('showdown');
    setWinnerSeat(winner);
    const winEval = evaluateHand(winner.cards);
    setWinnerHandRank(winEval.name);

    if (winner.isHuman) {
      playOutcomeCelebration(pot, currentStake, winEval.rank >= 4);
      onUpdateBalance(userBalance + pot);
      onRecordBet('cards_teen_patti', 'Teen Patti VIP 5-Player', currentStake, pot, +(pot / currentStake).toFixed(2));
    } else {
      soundService.playLose();
      onRecordBet('cards_teen_patti', 'Teen Patti VIP 5-Player', currentStake, 0, 0);
    }
  };

  const human = seats[0];
  const humanHandEval = evaluateHand(human.cards);
  const activePlayersCount = seats.filter((s) => !s.isPacked).length;
  const isHumanTurn = activeSeatIndex === 0 && gameState === 'betting';

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              if (turnTimerRef.current) clearInterval(turnTimerRef.current);
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wide">
                TEEN PATTI 777 VIP
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                5-PLAYER TABLE
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Classic Pakistani 3-Patti &bull; Blind, Chaal, Show & Pot
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Oval Velvet Casino Table */}
      <div className="relative min-h-[440px] sm:min-h-[500px] rounded-3xl border-4 border-amber-500/50 bg-gradient-to-b from-[#083020] via-[#052115] to-[#02110a] overflow-hidden shadow-2xl p-3 sm:p-6 flex flex-col justify-between">
        {/* Table Felt Glow & Pattern */}
        <div className="absolute inset-4 rounded-[60px] border border-amber-400/20 pointer-events-none"></div>

        {/* Dealer at Top */}
        <div className="flex flex-col items-center justify-center -mt-1 z-10">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-black text-amber-300 shadow">
            <span>👠 Dealer Ayesha</span>
            <span className="text-[10px] text-emerald-400">&bull; Shoe Active</span>
          </div>
        </div>

        {/* Top 4 Bot Seats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-4 z-10">
          {seats.slice(1).map((bot) => {
            const isTurn = activeSeatIndex === bot.id && gameState === 'betting';
            return (
              <div
                key={bot.id}
                className={`relative flex flex-col items-center p-2 rounded-2xl border transition-all ${
                  bot.isPacked
                    ? 'opacity-40 border-slate-800 bg-slate-950/40'
                    : isTurn
                    ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105'
                    : 'border-slate-700/60 bg-slate-900/60'
                }`}
              >
                {/* Turn Countdown Ring */}
                {isTurn && (
                  <div className="absolute -top-2.5 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow animate-bounce">
                    ⏳ {turnCountdown}s
                  </div>
                )}

                <div className="text-xl mb-1">{bot.avatar}</div>
                <span className="text-[11px] font-black text-slate-200 truncate max-w-full">
                  {bot.name}
                </span>
                <span className="text-[9px] text-amber-400 font-mono">
                  ₨ {bot.balance.toLocaleString()}
                </span>

                {/* Status bubble */}
                {bot.statusText && (
                  <span className="mt-1 text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-yellow-300">
                    {bot.statusText}
                  </span>
                )}

                {/* Bot 3 Cards (Hidden or Revealed during Showdown) */}
                <div className="flex gap-0.5 mt-1.5">
                  {(bot.cards.length > 0 ? bot.cards : [null, null, null]).map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-8 sm:w-7 sm:h-10 rounded bg-gradient-to-b from-blue-900 to-indigo-950 border border-amber-400/50 flex items-center justify-center text-[9px] font-black shadow"
                    >
                      {gameState === 'showdown' && c && !bot.isPacked ? (
                        <span className={c.color === 'red' ? 'text-red-400' : 'text-white'}>
                          {c.label}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[8px]">🂠</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Pot & Table Chips */}
        <div className="flex flex-col items-center justify-center my-3 z-10">
          <div className="bg-slate-950/80 border-2 border-amber-400/80 px-4 sm:px-6 py-2 rounded-2xl text-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <span className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest block">
              💰 TABLE POT
            </span>
            <span className="text-xl sm:text-3xl font-black text-amber-300 font-mono">
              ₨ {pot.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Current Stake: ₨ {currentStake} &bull; {activePlayersCount} In Hand
            </span>
          </div>

          {/* Winner Notification Banner */}
          {gameState === 'showdown' && winnerSeat && (
            <div className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
              <Trophy className="w-5 h-5 text-slate-950" />
              <span>
                {winnerSeat.name} WON ₨ {pot.toLocaleString()} ({winnerHandRank})!
              </span>
            </div>
          )}
        </div>

        {/* Bottom Human Player Seat */}
        <div className="flex flex-col items-center z-10">
          {/* Active Turn Badge for Human */}
          {isHumanTurn && (
            <div className="mb-1.5 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg animate-pulse flex items-center gap-1.5">
              <span>🎯 YOUR TURN TO PLAY!</span>
              <span className="bg-slate-950 text-amber-400 px-1.5 py-0.2 rounded font-mono text-[11px]">
                {turnCountdown}s
              </span>
            </div>
          )}

          <div
            className={`flex flex-col sm:flex-row items-center gap-3 p-3 sm:p-4 rounded-3xl border transition-all ${
              human.isPacked
                ? 'opacity-50 bg-slate-950/60 border-slate-800'
                : isHumanTurn
                ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
                : 'border-amber-500/30 bg-slate-900/80'
            }`}
          >
            {/* User Avatar & Status */}
            <div className="flex items-center gap-2">
              <div className="text-3xl">👑</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black text-white">YOU</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    VIP 7
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  ₨ {userBalance.toLocaleString()}
                </span>
                {human.isSeen && (
                  <span className="block text-[10px] text-emerald-400 font-bold">
                    ✓ Hand Seen ({humanHandEval.name})
                  </span>
                )}
              </div>
            </div>

            {/* User 3 Cards */}
            <div className="flex gap-2">
              {(human.cards.length > 0 ? human.cards : [null, null, null]).map((c, i) => (
                <div
                  key={i}
                  className={`w-14 h-20 sm:w-16 sm:h-24 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                    human.isSeen && c
                      ? 'bg-white border-slate-200 shadow-xl'
                      : 'bg-gradient-to-b from-blue-900 to-indigo-950 border-amber-400/80 shadow-lg'
                  }`}
                >
                  {human.isSeen && c ? (
                    <div className="text-center">
                      <span
                        className={`text-base sm:text-lg font-black block leading-none ${
                          c.color === 'red' ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {c.label}
                      </span>
                      <span
                        className={`text-xl sm:text-2xl leading-none ${
                          c.color === 'red' ? 'text-red-600' : 'text-slate-900'
                        }`}
                      >
                        {c.suit}
                      </span>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-amber-400 font-black text-sm">777</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">VIP</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* See Cards Peek Button */}
            {gameState === 'betting' && !human.isSeen && !human.isPacked && (
              <button
                onClick={handlePlayerSeeCards}
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>SEE CARDS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Action Bar */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-3 sm:p-4 shadow-xl space-y-3">
        {gameState === 'lobby' || gameState === 'showdown' ? (
          /* Lobby: Select Boot & Deal */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Boot:</span>
              {[20, 50, 100, 200, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    soundService.playChip();
                    setBootBet(b);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    bootBet === b
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ₨ {b}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START ROUND (BOOT ₨ {bootBet})</span>
            </button>
          </div>
        ) : (
          /* In-Game Betting Actions */
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Pack / Fold */}
            <button
              disabled={!isHumanTurn || human.isPacked}
              onClick={handlePlayerPack}
              className="py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-black text-xs sm:text-sm rounded-2xl transition disabled:opacity-40 cursor-pointer"
            >
              PACK (FOLD)
            </button>

            {/* Chaal / Blind 1x */}
            <button
              disabled={!isHumanTurn || human.isPacked}
              onClick={() => handlePlayerBet(1)}
              className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow transition disabled:opacity-40 cursor-pointer"
            >
              {human.isSeen ? `CHAAL 1× (₨ ${currentStake * 2})` : `BLIND 1× (₨ ${currentStake})`}
            </button>

            {/* Chaal / Blind 2x */}
            <button
              disabled={!isHumanTurn || human.isPacked}
              onClick={() => handlePlayerBet(2)}
              className="py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow transition disabled:opacity-40 cursor-pointer"
            >
              {human.isSeen ? `CHAAL 2× (₨ ${currentStake * 4})` : `BLIND 2× (₨ ${currentStake * 2})`}
            </button>

            {/* Showdown (Available when 2 players left) */}
            <button
              disabled={!isHumanTurn || human.isPacked || activePlayersCount > 2}
              onClick={handleShowdown}
              className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow transition disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1"
            >
              <Trophy className="w-4 h-4" />
              <span>SHOW ({activePlayersCount === 2 ? 'READY' : `${activePlayersCount} In`})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
