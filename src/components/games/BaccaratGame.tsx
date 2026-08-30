import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Trophy, Volume2, VolumeX, ShieldCheck, Sparkles } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface BaccaratProps {
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

type BetType = 'player' | 'banker' | 'tie' | 'player_pair' | 'banker_pair';

export const BaccaratGame: React.FC<BaccaratProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bets, setBets] = useState<Record<BetType, number>>({
    player: 0,
    banker: 0,
    tie: 0,
    player_pair: 0,
    banker_pair: 0,
  });
  const [selectedChip, setSelectedChip] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [bankerCards, setBankerCards] = useState<Card[]>([]);
  const [history, setHistory] = useState<('P' | 'B' | 'T')[]>(['B', 'P', 'B', 'B', 'P', 'T', 'B', 'P', 'B', 'B']);
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [totalWon, setTotalWon] = useState(0);

  const chips = [20, 50, 100, 500, 1000, 5000];
  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  const LABELS: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

  const getDeck = (): Card[] => {
    const deck: Card[] = [];
    for (let i = 0; i < 8; i++) {
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

  const getBaccaratPoint = (val: number) => {
    if (val >= 10) return 0;
    return val;
  };

  const getHandTotal = (cards: Card[]) => {
    const sum = cards.reduce((acc, c) => acc + getBaccaratPoint(c.value), 0);
    return sum % 10;
  };

  const addBet = (type: BetType) => {
    if (isPlaying) return;
    if (userBalance < selectedChip) {
      alert('Insufficient balance!');
      return;
    }
    soundService.playChip();
    setBets(prev => ({ ...prev, [type]: prev[type] + selectedChip }));
    onUpdateBalance(userBalance - selectedChip);
  };

  const clearBets = () => {
    if (isPlaying) return;
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet > 0) {
      soundService.playClick();
      onUpdateBalance(userBalance + totalBet);
      setBets({ player: 0, banker: 0, tie: 0, player_pair: 0, banker_pair: 0 });
    }
  };

  const handleDeal = () => {
    const totalBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);
    if (totalBet === 0) {
      alert('Please place a bet on Player, Banker, or Tie!');
      return;
    }

    setIsPlaying(true);
    setWinnerMessage(null);
    setTotalWon(0);
    soundService.playCardDeal();

    const deck = getDeck();
    let pCards = [deck[0], deck[2]];
    let bCards = [deck[1], deck[3]];

    setPlayerCards(pCards);
    setBankerCards(bCards);

    // Calculate natural or draw 3rd cards
    setTimeout(() => {
      let pScore = getHandTotal(pCards);
      let bScore = getHandTotal(bCards);

      // 3rd card rules
      if (pScore < 8 && bScore < 8) {
        let p3rd: Card | null = null;
        if (pScore <= 5) {
          p3rd = deck[4];
          pCards.push(p3rd);
          setPlayerCards([...pCards]);
          pScore = getHandTotal(pCards);
        }

        if (p3rd === null) {
          if (bScore <= 5) {
            bCards.push(deck[5]);
            setBankerCards([...bCards]);
            bScore = getHandTotal(bCards);
          }
        } else {
          const p3Val = getBaccaratPoint(p3rd.value);
          if (bScore <= 2 || (bScore === 3 && p3Val !== 8) || (bScore === 4 && [2,3,4,5,6,7].includes(p3Val)) || (bScore === 5 && [4,5,6,7].includes(p3Val)) || (bScore === 6 && [6,7].includes(p3Val))) {
            bCards.push(deck[5]);
            setBankerCards([...bCards]);
            bScore = getHandTotal(bCards);
          }
        }
      }

      // Outcome
      let winOutcome: 'P' | 'B' | 'T' = 'T';
      let winMultiplier = 0;
      let totalWinnings = 0;

      if (pScore > bScore) {
        winOutcome = 'P';
        if (bets.player > 0) totalWinnings += bets.player * 2.0; // 1:1
      } else if (bScore > pScore) {
        winOutcome = 'B';
        if (bets.banker > 0) totalWinnings += bets.banker * 1.95; // 0.95:1 (5% commission)
      } else {
        winOutcome = 'T';
        if (bets.tie > 0) totalWinnings += bets.tie * 9.0; // 8:1 + stake
        totalWinnings += bets.player + bets.banker; // Push on Player/Banker
      }

      setHistory(prev => [winOutcome, ...prev.slice(0, 19)]);
      setTotalWon(totalWinnings);

      if (totalWinnings > 0) {
        onUpdateBalance(userBalance + totalWinnings);
        onRecordBet('baccarat', 'VIP Macau Baccarat', totalBet, totalWinnings, +(totalWinnings / totalBet).toFixed(2));
        setWinnerMessage(`🎉 ${winOutcome === 'P' ? 'PLAYER' : winOutcome === 'B' ? 'BANKER' : 'TIE'} WINS! +Rs ${totalWinnings.toLocaleString()}`);
        soundService.playWin();
      } else {
        onRecordBet('baccarat', 'VIP Macau Baccarat', totalBet, 0, 0);
        setWinnerMessage(`${winOutcome === 'P' ? 'Player' : winOutcome === 'B' ? 'Banker' : 'Tie'} Won. Good luck next round!`);
        soundService.playLose();
      }

      setIsPlaying(false);
      setBets({ player: 0, banker: 0, tie: 0, player_pair: 0, banker_pair: 0 });
    }, 1500);
  };

  const pScore = getHandTotal(playerCards);
  const bScore = getHandTotal(bankerCards);
  const totalCurrentBet = (Object.values(bets) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#180a24] via-[#240e36] to-[#0d0414] text-slate-100 rounded-3xl p-3 sm:p-5 border border-purple-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-800/60 pb-3">
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
            VIP MACAU BACCARAT
          </h1>
          <span className="text-[10px] text-purple-300 font-medium">Banker 0.95:1 • Player 1:1 • Tie 8:1</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Bead Plate History Road */}
      <div className="bg-black/40 border border-purple-800/40 rounded-xl p-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none my-1">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">Roadmap:</span>
        {history.map((h, i) => (
          <span
            key={i}
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
              h === 'P'
                ? 'bg-blue-600 text-white'
                : h === 'B'
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Main Table Felt */}
      <div className="my-auto bg-gradient-to-radial from-[#38114f] to-[#1a0526] rounded-[40px] p-6 border-4 border-amber-600/40 shadow-2xl min-h-[340px] flex flex-col justify-between">
        {/* Dealing Arena */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player Cards */}
          <div className="bg-blue-950/40 border-2 border-blue-500/40 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-blue-400 tracking-wider">
              PLAYER {playerCards.length > 0 && `(${pScore})`}
            </span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[80px]">
              {playerCards.map((c, i) => (
                <div key={i} className="w-12 h-18 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                  <span className={`text-[9px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Banker Cards */}
          <div className="bg-red-950/40 border-2 border-red-500/40 rounded-3xl p-3 text-center flex flex-col items-center justify-between">
            <span className="text-xs font-black text-red-400 tracking-wider">
              BANKER {bankerCards.length > 0 && `(${bScore})`}
            </span>
            <div className="flex items-center justify-center gap-1.5 my-2 min-h-[80px]">
              {bankerCards.map((c, i) => (
                <div key={i} className="w-12 h-18 bg-white rounded-xl shadow-lg border border-slate-300 flex flex-col justify-between p-1 text-slate-950 font-black">
                  <span className={`text-xs ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                  <span className={`text-xl text-center ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.suit}</span>
                  <span className={`text-[9px] text-right ${c.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Result */}
        {winnerMessage && (
          <div className="text-center my-2 animate-bounce">
            <div className="inline-block bg-black/80 px-6 py-2 rounded-2xl border-2 border-amber-400">
              <span className="text-sm font-black text-amber-300">{winnerMessage}</span>
            </div>
          </div>
        )}

        {/* Betting Felts */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {/* Player Felt */}
          <div
            onClick={() => addBet('player')}
            className="bg-blue-900/60 hover:bg-blue-800/80 border-2 border-blue-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-blue-200">PLAYER</span>
            <span className="text-[10px] text-blue-300 font-bold">1 : 1</span>
            <div className="h-6 flex items-center justify-center">
              {bets.player > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.player}
                </span>
              )}
            </div>
          </div>

          {/* Tie Felt */}
          <div
            onClick={() => addBet('tie')}
            className="bg-emerald-900/60 hover:bg-emerald-800/80 border-2 border-emerald-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-emerald-200">TIE</span>
            <span className="text-[10px] text-emerald-300 font-bold">8 : 1</span>
            <div className="h-6 flex items-center justify-center">
              {bets.tie > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.tie}
                </span>
              )}
            </div>
          </div>

          {/* Banker Felt */}
          <div
            onClick={() => addBet('banker')}
            className="bg-red-900/60 hover:bg-red-800/80 border-2 border-red-400 rounded-2xl p-3 text-center cursor-pointer transition transform active:scale-95 shadow-lg flex flex-col justify-between aspect-[4/3]"
          >
            <span className="text-xs font-black text-red-200">BANKER</span>
            <span className="text-[10px] text-red-300 font-bold">0.95 : 1</span>
            <div className="h-6 flex items-center justify-center">
              {bets.banker > 0 && (
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
                  Rs {bets.banker}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Chip & Control Bar */}
      <div className="bg-[#12071a] border border-purple-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
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
