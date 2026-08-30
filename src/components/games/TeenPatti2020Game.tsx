import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface TeenPatti2020Props {
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

type BetSide = 'player_a' | 'player_b' | 'pair_plus_a' | 'pair_plus_b' | 'six_card_bonus';

export const TeenPatti2020Game: React.FC<TeenPatti2020Props> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<BetSide, number>>({
    player_a: 0,
    player_b: 0,
    pair_plus_a: 0,
    pair_plus_b: 0,
    six_card_bonus: 0,
  });
  const [selectedChip, setSelectedChip] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [handA, setHandA] = useState<Card[]>([]);
  const [handB, setHandB] = useState<Card[]>([]);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<('A' | 'B')[]>(['A', 'A', 'B', 'A', 'B', 'B', 'A', 'B', 'A', 'A']);

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

  const evaluate3Card = (cards: Card[]) => {
    const vals = cards.map(c => c.value).sort((a, b) => b - a);
    const isFlush = cards.every(c => c.suit === cards[0].suit);
    const isStraight = (vals[0] - vals[1] === 1 && vals[1] - vals[2] === 1) || (vals[0] === 14 && vals[1] === 3 && vals[2] === 2);
    const isTrio = vals[0] === vals[1] && vals[1] === vals[2];
    const isPair = vals[0] === vals[1] || vals[1] === vals[2];

    if (isTrio) return { rank: 6, name: 'Trail / Trio (AAA)' };
    if (isFlush && isStraight) return { rank: 5, name: 'Pure Sequence' };
    if (isStraight) return { rank: 4, name: 'Sequence (Straight)' };
    if (isFlush) return { rank: 3, name: 'Color (Flush)' };
    if (isPair) return { rank: 2, name: 'Pair' };
    return { rank: 1, name: `High Card (${cards[0].label})` };
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
      setBets({ player_a: 0, player_b: 0, pair_plus_a: 0, pair_plus_b: 0, six_card_bonus: 0 });
    }
  };

  const handleDeal = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Place a bet on Player A or Player B!');
      return;
    }

    setIsPlaying(true);
    setWinnerMessage(null);
    soundService.playCardDeal();

    const deck = getDeck();
    let cardsA = [deck[0], deck[2], deck[4]];
    let cardsB = [deck[1], deck[3], deck[5]];

    const forced = adminSettings?.forcedResults?.teenPatti;
    const masterMode = adminSettings?.masterOutcomeMode;
    const globalWin = adminSettings?.globalWinRate ?? 65;
    const willWin = masterMode === 'always_win' || (masterMode !== 'always_lose' && (Math.random() * 100 < globalWin));

    if (forced === 'playerA' || (willWin && bets.player_a > bets.player_b)) {
      cardsA = [
        { suit: '♠', value: 14, label: 'A', color: 'black' },
        { suit: '♥', value: 14, label: 'A', color: 'red' },
        { suit: '♦', value: 14, label: 'A', color: 'red' }
      ];
      cardsB = [
        { suit: '♣', value: 5, label: '5', color: 'black' },
        { suit: '♦', value: 8, label: '8', color: 'red' },
        { suit: '♠', value: 2, label: '2', color: 'black' }
      ];
    } else if (forced === 'playerB' || (willWin && bets.player_b > bets.player_a)) {
      cardsB = [
        { suit: '♠', value: 13, label: 'K', color: 'black' },
        { suit: '♥', value: 13, label: 'K', color: 'red' },
        { suit: '♦', value: 13, label: 'K', color: 'red' }
      ];
      cardsA = [
        { suit: '♣', value: 4, label: '4', color: 'black' },
        { suit: '♦', value: 7, label: '7', color: 'red' },
        { suit: '♠', value: 3, label: '3', color: 'black' }
      ];
    } else if (forced === 'pairPlus' || bets.pair_plus_a > 0 || bets.pair_plus_b > 0) {
      if (bets.pair_plus_a > 0 || forced === 'pairPlus') {
        cardsA = [
          { suit: '♠', value: 10, label: '10', color: 'black' },
          { suit: '♥', value: 10, label: '10', color: 'red' },
          { suit: '♦', value: 10, label: '10', color: 'red' }
        ];
      } else {
        cardsB = [
          { suit: '♠', value: 12, label: 'Q', color: 'black' },
          { suit: '♥', value: 12, label: 'Q', color: 'red' },
          { suit: '♦', value: 12, label: 'Q', color: 'red' }
        ];
      }
    } else if (masterMode === 'always_lose') {
      if (bets.player_a > bets.player_b) {
        cardsA = [{ suit: '♣', value: 2, label: '2', color: 'black' }, { suit: '♦', value: 4, label: '4', color: 'red' }, { suit: '♠', value: 6, label: '6', color: 'black' }];
        cardsB = [{ suit: '♠', value: 14, label: 'A', color: 'black' }, { suit: '♥', value: 14, label: 'A', color: 'red' }, { suit: '♦', value: 10, label: '10', color: 'red' }];
      } else if (bets.player_b > bets.player_a) {
        cardsB = [{ suit: '♣', value: 2, label: '2', color: 'black' }, { suit: '♦', value: 3, label: '3', color: 'red' }, { suit: '♠', value: 5, label: '5', color: 'black' }];
        cardsA = [{ suit: '♠', value: 14, label: 'A', color: 'black' }, { suit: '♥', value: 14, label: 'A', color: 'red' }, { suit: '♦', value: 10, label: '10', color: 'red' }];
      }
    }

    setHandA(cardsA);
    setHandB(cardsB);

    setTimeout(() => {
      const evalA = evaluate3Card(cardsA);
      const evalB = evaluate3Card(cardsB);

      let winnerSide: 'A' | 'B' = 'A';
      if (evalA.rank > evalB.rank) winnerSide = 'A';
      else if (evalB.rank > evalA.rank) winnerSide = 'B';
      else {
        const sumA = cardsA.reduce((s, c) => s + c.value, 0);
        const sumB = cardsB.reduce((s, c) => s + c.value, 0);
        winnerSide = sumA >= sumB ? 'A' : 'B';
      }

      setHistory(h => [winnerSide, ...h.slice(0, 19)]);

      let totalWin = 0;
      if (winnerSide === 'A' && bets.player_a > 0) totalWin += bets.player_a * 1.95;
      if (winnerSide === 'B' && bets.player_b > 0) totalWin += bets.player_b * 1.95;

      // Pair plus bonus
      if (evalA.rank >= 2 && bets.pair_plus_a > 0) {
        const mult = evalA.rank === 6 ? 30 : evalA.rank === 5 ? 20 : evalA.rank === 4 ? 6 : evalA.rank === 3 ? 4 : 2;
        totalWin += bets.pair_plus_a * mult;
      }
      if (evalB.rank >= 2 && bets.pair_plus_b > 0) {
        const mult = evalB.rank === 6 ? 30 : evalB.rank === 5 ? 20 : evalB.rank === 4 ? 6 : evalB.rank === 3 ? 4 : 2;
        totalWin += bets.pair_plus_b * mult;
      }

      if (totalWin > 0) {
        onUpdateBalance(userBalance + totalWin);
        onRecordBet('teen_patti_2020', 'Teen Patti 20-20', totalBet, totalWin, +(totalWin / totalBet).toFixed(2));
        setWinnerMessage(`🎉 PLAYER ${winnerSide} WINS with ${winnerSide === 'A' ? evalA.name : evalB.name}! +Rs ${totalWin.toLocaleString()}`);
        soundService.playWin();
      } else {
        onRecordBet('teen_patti_2020', 'Teen Patti 20-20', totalBet, 0, 0);
        setWinnerMessage(`Player ${winnerSide} won with ${winnerSide === 'A' ? evalA.name : evalB.name}.`);
        soundService.playLose();
      }

      setIsPlaying(false);
      setBets({ player_a: 0, player_b: 0, pair_plus_a: 0, pair_plus_b: 0, six_card_bonus: 0 });
    }, 1500);
  };

  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#26090c] via-[#3b0d13] to-[#140305] text-slate-100 rounded-3xl p-3 sm:p-5 border border-rose-600/40 shadow-2xl relative flex flex-col justify-between">
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
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            TEEN PATTI 20-20 LIVE
          </h1>
          <span className="text-[10px] text-rose-300 font-medium">Player A vs Player B • Pair Plus Up to 30x</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* History Beads */}
      <div className="bg-black/40 border border-rose-800/40 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Roadmap:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              h === 'A' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Main Table Felt */}
      <div className="my-auto bg-gradient-to-radial from-[#521319] to-[#260509] rounded-[40px] p-6 border-4 border-amber-600/40 shadow-2xl min-h-[340px] flex flex-col justify-between">
        {/* Dealing Area */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player A */}
          <div className="bg-blue-950/40 border-2 border-blue-500/40 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-blue-400 tracking-wider">PLAYER A</span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[80px]">
              {handA.map((c, i) => (
                <div key={i} className="w-12 h-18 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                  <span className={`text-[9px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Player B */}
          <div className="bg-red-950/40 border-2 border-red-500/40 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-red-400 tracking-wider">PLAYER B</span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[80px]">
              {handB.map((c, i) => (
                <div key={i} className="w-12 h-18 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                  <span className={`text-[9px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Result Message */}
        {winnerMessage && (
          <div className="text-center my-2 animate-bounce">
            <div className="inline-block bg-black/80 px-6 py-2 rounded-2xl border-2 border-amber-400">
              <span className="text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Betting Felts */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {/* Bet Player A */}
          <div
            onClick={() => addBet('player_a')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-sm font-black text-blue-200">PLAYER A (1.95x)</span>
            <div className="h-6 flex items-center justify-center">
              {bets.player_a > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.player_a}
                </span>
              )}
            </div>
          </div>

          {/* Bet Player B */}
          <div
            onClick={() => addBet('player_b')}
            className="bg-red-900/60 hover:bg-red-800/80 border-2 border-red-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between"
          >
            <span className="text-sm font-black text-red-200">PLAYER B (1.95x)</span>
            <div className="h-6 flex items-center justify-center">
              {bets.player_b > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.player_b}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chips Bar */}
      <div className="bg-[#170507] border border-rose-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
