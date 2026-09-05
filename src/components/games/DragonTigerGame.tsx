import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Swords, 
  Trophy, 
  History, 
  Sparkles, 
  Volume2, 
  VolumeX,
  FastForward,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';

interface DragonTigerGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

type BetTarget = 'dragon' | 'tiger' | 'tie' | 'suited_tie' | 'dragon_red' | 'tiger_red';

interface CardDef {
  suit: '♠' | '♥' | '♣' | '♦';
  rank: string;
  value: number;
  isRed: boolean;
}

const CARDS: CardDef[] = [
  { suit: '♠', rank: 'A', value: 1, isRed: false },
  { suit: '♠', rank: '2', value: 2, isRed: false },
  { suit: '♠', rank: '3', value: 3, isRed: false },
  { suit: '♠', rank: '4', value: 4, isRed: false },
  { suit: '♠', rank: '5', value: 5, isRed: false },
  { suit: '♠', rank: '6', value: 6, isRed: false },
  { suit: '♠', rank: '7', value: 7, isRed: false },
  { suit: '♠', rank: '8', value: 8, isRed: false },
  { suit: '♠', rank: '9', value: 9, isRed: false },
  { suit: '♠', rank: '10', value: 10, isRed: false },
  { suit: '♠', rank: 'J', value: 11, isRed: false },
  { suit: '♠', rank: 'Q', value: 12, isRed: false },
  { suit: '♠', rank: 'K', value: 13, isRed: false },
  { suit: '♥', rank: 'A', value: 1, isRed: true },
  { suit: '♥', rank: '4', value: 4, isRed: true },
  { suit: '♥', rank: '7', value: 7, isRed: true },
  { suit: '♥', rank: '9', value: 9, isRed: true },
  { suit: '♥', rank: 'K', value: 13, isRed: true },
  { suit: '♣', rank: '3', value: 3, isRed: false },
  { suit: '♣', rank: '8', value: 8, isRed: false },
  { suit: '♣', rank: 'Q', value: 12, isRed: false },
  { suit: '♦', rank: '2', value: 2, isRed: true },
  { suit: '♦', rank: '6', value: 6, isRed: true },
  { suit: '♦', rank: '10', value: 10, isRed: true },
  { suit: '♦', rank: 'J', value: 11, isRed: true },
  { suit: '♦', rank: 'K', value: 13, isRed: true },
];

export const DragonTigerGame: React.FC<DragonTigerGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  // Betting state (multiple betting spots support)
  const [bets, setBets] = useState<Record<BetTarget, number>>({
    dragon: 0,
    tiger: 0,
    tie: 0,
    suited_tie: 0,
    dragon_red: 0,
    tiger_red: 0,
  });

  const [selectedChip, setSelectedChip] = useState<number>(100);
  const [isDealing, setIsDealing] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [dragonCard, setDragonCard] = useState<CardDef | null>(null);
  const [tigerCard, setTigerCard] = useState<CardDef | null>(null);
  const [winner, setWinner] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [soundMuted, setSoundMuted] = useState(!soundService.isEnabled());

  // Past rounds history (Bead plate)
  const [roadMap, setRoadMap] = useState<('D' | 'T' | 'X')[]>([
    'D', 'D', 'T', 'D', 'T', 'T', 'X', 'D', 'T', 'D', 'D', 'T', 'T', 'D', 'X', 'T'
  ]);

  const chips = [
    { val: 50, color: 'from-blue-600 to-indigo-800', border: 'border-blue-400' },
    { val: 100, color: 'from-rose-600 to-red-800', border: 'border-rose-400' },
    { val: 500, color: 'from-emerald-600 to-teal-800', border: 'border-emerald-400' },
    { val: 1000, color: 'from-amber-600 to-yellow-800', border: 'border-amber-400' },
    { val: 5000, color: 'from-purple-700 to-violet-900', border: 'border-purple-400' },
  ];

  const totalBet: number = (Object.values(bets) as number[]).reduce((a: number, b: number) => a + b, 0);

  // Place chip on betting spot
  const handlePlaceChip = (target: BetTarget) => {
    if (isDealing) return;
    if (balance < totalBet + selectedChip) {
      soundService.playBeep(300);
      alert('Insufficient balance to place this chip!');
      return;
    }
    soundService.playChip();
    setBets((prev) => ({
      ...prev,
      [target]: prev[target] + selectedChip,
    }));
  };

  const handleClearBets = () => {
    if (isDealing) return;
    soundService.playClick();
    setBets({
      dragon: 0,
      tiger: 0,
      tie: 0,
      suited_tie: 0,
      dragon_red: 0,
      tiger_red: 0,
    });
  };

  const handleDoubleBets = () => {
    if (isDealing || totalBet === 0) return;
    if (balance < totalBet * 2) {
      alert('Insufficient balance to double!');
      return;
    }
    soundService.playChipStack();
    setBets((prev) => ({
      dragon: prev.dragon * 2,
      tiger: prev.tiger * 2,
      tie: prev.tie * 2,
      suited_tie: prev.suited_tie * 2,
      dragon_red: prev.dragon_red * 2,
      tiger_red: prev.tiger_red * 2,
    }));
  };

  const handleDeal = () => {
    if (isDealing) return;
    if (totalBet === 0) {
      alert('Please place your chips on the table first!');
      return;
    }

    setIsDealing(true);
    setDragonCard(null);
    setTigerCard(null);
    setWinner(null);
    soundService.playCardDeal();

    // 1. Determine Cards based on Admin Settings & Game Engine
    let dCard: CardDef;
    let tCard: CardDef;

    if (adminSettings?.forcedResults?.dragonTiger && adminSettings.forcedResults.dragonTiger !== 'random') {
      const forced = adminSettings.forcedResults.dragonTiger;
      if (forced === 'dragon') {
        dCard = CARDS.find((c) => c.rank === 'K') || CARDS[12];
        tCard = CARDS.find((c) => c.rank === '3') || CARDS[1];
      } else if (forced === 'tiger') {
        tCard = CARDS.find((c) => c.rank === 'K') || CARDS[12];
        dCard = CARDS.find((c) => c.rank === '3') || CARDS[1];
      } else {
        dCard = CARDS.find((c) => c.rank === '8') || CARDS[7];
        tCard = CARDS.find((c) => c.rank === '8' && c.suit !== dCard.suit) || CARDS[7];
      }
    } else {
      // Game Engine evaluation
      const userShouldWin = shouldPlayerWin('dragon_tiger', adminSettings, 0.48);
      const userPrimarySide = bets.dragon > bets.tiger ? 'dragon' : bets.tiger > bets.dragon ? 'tiger' : bets.tie > 0 ? 'tie' : 'dragon';

      if (userShouldWin) {
        if (userPrimarySide === 'dragon') {
          dCard = CARDS.find((c) => c.rank === 'K' || c.rank === 'Q') || CARDS[11];
          tCard = CARDS.find((c) => c.rank === '4' || c.rank === '2') || CARDS[1];
        } else if (userPrimarySide === 'tiger') {
          tCard = CARDS.find((c) => c.rank === 'K' || c.rank === 'Q') || CARDS[11];
          dCard = CARDS.find((c) => c.rank === '4' || c.rank === '2') || CARDS[1];
        } else {
          dCard = CARDS[8];
          tCard = CARDS.find((c) => c.value === dCard.value && c !== dCard) || CARDS[8];
        }
      } else {
        // Player should lose
        if (userPrimarySide === 'dragon') {
          tCard = CARDS.find((c) => c.rank === 'K') || CARDS[12];
          dCard = CARDS.find((c) => c.rank === '3') || CARDS[2];
        } else if (userPrimarySide === 'tiger') {
          dCard = CARDS.find((c) => c.rank === 'K') || CARDS[12];
          tCard = CARDS.find((c) => c.rank === '3') || CARDS[2];
        } else {
          dCard = CARDS[10];
          tCard = CARDS[2];
        }
      }
    }

    const delay1 = turboMode ? 100 : 400;
    const delay2 = turboMode ? 250 : 900;

    // Deal Dragon Card
    setTimeout(() => {
      soundService.playCardFlip();
      setDragonCard(dCard);
    }, delay1);

    // Deal Tiger Card & Resolve
    setTimeout(() => {
      soundService.playCardFlip();
      setTigerCard(tCard);

      let roundWinner: 'dragon' | 'tiger' | 'tie' = 'tie';
      if (dCard.value > tCard.value) roundWinner = 'dragon';
      else if (tCard.value > dCard.value) roundWinner = 'tiger';

      setWinner(roundWinner);
      setIsDealing(false);

      const symbol = roundWinner === 'dragon' ? 'D' : roundWinner === 'tiger' ? 'T' : 'X';
      setRoadMap((prev) => [symbol, ...prev.slice(0, 19)]);

      // Calculate payouts across all spots
      let winAmt = 0;
      if (roundWinner === 'dragon' && bets.dragon > 0) winAmt += bets.dragon * 2;
      if (roundWinner === 'tiger' && bets.tiger > 0) winAmt += bets.tiger * 2;
      if (roundWinner === 'tie') {
        if (bets.tie > 0) winAmt += bets.tie * 9;
        if (bets.suited_tie > 0 && dCard.suit === tCard.suit) winAmt += bets.suited_tie * 50;
        // In casino, half main bet returned on tie
        winAmt += Math.round(bets.dragon * 0.5) + Math.round(bets.tiger * 0.5);
      }
      if (dCard.isRed && bets.dragon_red > 0) winAmt += bets.dragon_red * 2;
      if (tCard.isRed && bets.tiger_red > 0) winAmt += bets.tiger_red * 2;

      if (winAmt > 0) {
        playOutcomeCelebration(winAmt, totalBet, winAmt >= totalBet * 3);
      } else {
        soundService.playLose();
      }

      onBet(totalBet, winAmt, `Dragon Tiger [${dCard.rank}${dCard.suit} vs ${tCard.rank}${tCard.suit}] Winner: ${roundWinner.toUpperCase()}`);
    }, delay2);
  };

  // Stats calculation
  const dragonWins = roadMap.filter((x) => x === 'D').length;
  const tigerWins = roadMap.filter((x) => x === 'T').length;
  const tieWins = roadMap.filter((x) => x === 'X').length;
  const totalRounds = Math.max(1, roadMap.length);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3 bg-[#0d1424] border border-amber-500/30 p-2.5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2 bg-gradient-to-r from-red-600/20 to-amber-600/20 border border-amber-500/40 px-3 py-1 rounded-xl">
            <Swords className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider text-amber-300">DRAGON TIGER VIP</span>
          </div>
        </div>

        {/* Speed and Sound */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              setTurboMode(!turboMode);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
              turboMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>{turboMode ? '⚡ TURBO ON' : 'NORMAL'}</span>
          </button>

          <button
            onClick={() => {
              const muted = soundService.toggleSound();
              setSoundMuted(!muted);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 border border-slate-700 transition cursor-pointer"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Luxury Casino Table (Felt Green + Gold Trim) */}
      <div className="bg-gradient-to-b from-[#0b3323] via-[#062417] to-[#041910] border-4 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Table Felt Decorative Oval */}
        <div className="absolute inset-2 sm:inset-4 border border-amber-400/20 rounded-2xl pointer-events-none" />

        {/* Center Arena: Dragon (Red) vs Tiger (Amber) Card Squeeze Area */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 items-center justify-center my-2 max-w-xl mx-auto">
          {/* DRAGON BOX */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-rose-500 font-black text-base sm:text-xl tracking-wider mb-2">
              <span>🐉</span>
              <span>DRAGON</span>
            </div>

            {/* Dragon Card */}
            <div
              className={`w-28 h-40 sm:w-36 sm:h-52 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden ${
                winner === 'dragon'
                  ? 'border-rose-400 ring-4 ring-rose-500/50 scale-105 bg-slate-900'
                  : 'border-rose-500/30 bg-slate-950/80'
              }`}
            >
              {dragonCard ? (
                <div className="text-center animate-in zoom-in-75 duration-200">
                  <div className={`text-4xl sm:text-5xl font-black ${dragonCard.isRed ? 'text-rose-500' : 'text-slate-100'}`}>
                    {dragonCard.rank}
                  </div>
                  <div className={`text-3xl sm:text-4xl ${dragonCard.isRed ? 'text-rose-500' : 'text-slate-300'}`}>
                    {dragonCard.suit}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-950 to-slate-950 flex flex-col items-center justify-center text-rose-400 font-black text-sm p-2 text-center">
                  <span className="text-3xl mb-1">🐉</span>
                  <span className="tracking-wider">DRAGON</span>
                </div>
              )}
            </div>
          </div>

          {/* TIGER BOX */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-amber-400 font-black text-base sm:text-xl tracking-wider mb-2">
              <span>🐯</span>
              <span>TIGER</span>
            </div>

            {/* Tiger Card */}
            <div
              className={`w-28 h-40 sm:w-36 sm:h-52 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden ${
                winner === 'tiger'
                  ? 'border-amber-400 ring-4 ring-amber-500/50 scale-105 bg-slate-900'
                  : 'border-amber-500/30 bg-slate-950/80'
              }`}
            >
              {tigerCard ? (
                <div className="text-center animate-in zoom-in-75 duration-200">
                  <div className={`text-4xl sm:text-5xl font-black ${tigerCard.isRed ? 'text-rose-500' : 'text-slate-100'}`}>
                    {tigerCard.rank}
                  </div>
                  <div className={`text-3xl sm:text-4xl ${tigerCard.isRed ? 'text-rose-500' : 'text-slate-300'}`}>
                    {tigerCard.suit}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-amber-950 to-slate-950 flex flex-col items-center justify-center text-amber-400 font-black text-sm p-2 text-center">
                  <span className="text-3xl mb-1">🐯</span>
                  <span className="tracking-wider">TIGER</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="text-center py-2.5 px-4 bg-slate-950/90 border-2 border-amber-400 rounded-2xl max-w-md mx-auto my-3 shadow-2xl animate-in zoom-in-90">
            <span className="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-300">
              {winner === 'tie' ? '🤝 TIE! (9x Payout)!' : `👑 ${winner.toUpperCase()} WINS!`}
            </span>
          </div>
        )}

        {/* Real Casino Betting Zones Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 my-4">
          {/* DRAGON SPOT */}
          <button
            disabled={isDealing}
            onClick={() => handlePlaceChip('dragon')}
            className={`relative py-5 px-3 rounded-2xl bg-gradient-to-b from-rose-900/60 to-red-950/80 hover:from-rose-800/80 hover:to-red-900 border-2 transition-all cursor-pointer ${
              bets.dragon > 0
                ? 'border-rose-400 ring-4 ring-rose-500/40 shadow-lg shadow-rose-900/50'
                : 'border-rose-500/40 hover:border-rose-400'
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-rose-400 tracking-wider">DRAGON</div>
            <div className="text-xs text-rose-300 font-bold">1:1</div>
            {bets.dragon > 0 && (
              <div className="absolute top-2 right-2 bg-rose-500 text-white font-mono text-xs font-black px-2 py-0.5 rounded-full shadow">
                {formatPKR(bets.dragon)}
              </div>
            )}
          </button>

          {/* TIE SPOT */}
          <button
            disabled={isDealing}
            onClick={() => handlePlaceChip('tie')}
            className={`relative py-5 px-3 rounded-2xl bg-gradient-to-b from-emerald-900/60 to-teal-950/80 hover:from-emerald-800/80 hover:to-teal-900 border-2 transition-all cursor-pointer ${
              bets.tie > 0
                ? 'border-emerald-400 ring-4 ring-emerald-500/40 shadow-lg shadow-emerald-900/50'
                : 'border-emerald-500/40 hover:border-emerald-400'
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-emerald-300 tracking-wider">TIE</div>
            <div className="text-xs text-emerald-300 font-bold">1:9 (Suited 1:50)</div>
            {bets.tie > 0 && (
              <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-mono text-xs font-black px-2 py-0.5 rounded-full shadow">
                {formatPKR(bets.tie)}
              </div>
            )}
          </button>

          {/* TIGER SPOT */}
          <button
            disabled={isDealing}
            onClick={() => handlePlaceChip('tiger')}
            className={`relative py-5 px-3 rounded-2xl bg-gradient-to-b from-amber-900/60 to-yellow-950/80 hover:from-amber-800/80 hover:to-yellow-900 border-2 transition-all cursor-pointer ${
              bets.tiger > 0
                ? 'border-amber-400 ring-4 ring-amber-500/40 shadow-lg shadow-amber-900/50'
                : 'border-amber-500/40 hover:border-amber-400'
            }`}
          >
            <div className="text-lg sm:text-xl font-black text-amber-400 tracking-wider">TIGER</div>
            <div className="text-xs text-amber-300 font-bold">1:1</div>
            {bets.tiger > 0 && (
              <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 font-mono text-xs font-black px-2 py-0.5 rounded-full shadow">
                {formatPKR(bets.tiger)}
              </div>
            )}
          </button>
        </div>

        {/* 3D Poker Chips Rack + Control Bar */}
        <div className="bg-slate-950/90 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Chip selector */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Chips:</span>
            {chips.map((chip) => (
              <button
                key={chip.val}
                disabled={isDealing}
                onClick={() => {
                  soundService.playChip();
                  setSelectedChip(chip.val);
                }}
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full font-black text-[11px] shadow-lg flex items-center justify-center border-2 transition transform active:scale-90 cursor-pointer ${chip.border} bg-gradient-to-b ${chip.color} ${
                  selectedChip === chip.val ? 'ring-4 ring-amber-400 scale-110' : 'opacity-85 hover:opacity-100'
                }`}
              >
                {chip.val >= 1000 ? `${chip.val / 1000}K` : chip.val}
              </button>
            ))}
          </div>

          {/* Action Buttons: Clear, Double, Deal */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              disabled={isDealing || totalBet === 0}
              onClick={handleClearBets}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              disabled={isDealing || totalBet === 0}
              onClick={handleDoubleBets}
              className="flex-1 sm:flex-none px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer border border-slate-700 disabled:opacity-50"
            >
              2X Double
            </button>
            <button
              disabled={isDealing || totalBet === 0}
              onClick={handleDeal}
              className="flex-2 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isDealing ? 'DEALING...' : `DEAL (${formatPKR(totalBet)})`}
            </button>
          </div>
        </div>

        {/* Real Bead Plate Roadmap & Win Stats */}
        <div className="mt-3 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
            <span className="flex items-center gap-1.5 text-amber-300">
              <History className="w-3.5 h-3.5" />
              Bead Plate Roadmap (Last 20 Rounds)
            </span>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-rose-400">D: {((dragonWins / totalRounds) * 100).toFixed(0)}%</span>
              <span className="text-emerald-400">Tie: {((tieWins / totalRounds) * 100).toFixed(0)}%</span>
              <span className="text-amber-400">T: {((tigerWins / totalRounds) * 100).toFixed(0)}%</span>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
            {roadMap.map((sym, i) => (
              <span
                key={i}
                className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow-md ${
                  sym === 'D'
                    ? 'bg-rose-600 text-white border border-rose-400/50'
                    : sym === 'T'
                    ? 'bg-amber-500 text-slate-950 border border-amber-300/50'
                    : 'bg-emerald-600 text-white border border-emerald-400/50'
                }`}
              >
                {sym}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
