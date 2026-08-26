import React, { useState } from 'react';
import { ArrowLeft, Volume2, ShieldCheck, Users, Sparkles, Trophy, Clock } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface LiveCasinoGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
  dealerType?: 'tg' | 'pp' | 'sexy';
}

export const LiveCasinoGame: React.FC<LiveCasinoGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
  dealerType = 'tg',
}) => {
  const [selectedBet, setSelectedBet] = useState<'player' | 'banker' | 'tie' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(500);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [bankerCard, setBankerCard] = useState<number | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [history, setHistory] = useState<('P' | 'B' | 'T')[]>(['P', 'B', 'B', 'P', 'T', 'B', 'P', 'B', 'P', 'B']);

  const dealerInfo = {
    tg: {
      name: 'Pooja (TG Live VIP)',
      avatar: '💃',
      tag: 'Gold VIP Lounge',
      bg: 'from-[#2e2008] to-[#120c02]',
      border: 'border-amber-500/50',
    },
    pp: {
      name: 'Isabella (PP Live)',
      avatar: '💎',
      tag: 'Pragmatic Speed Studio',
      bg: 'from-[#172338] to-[#070e1a]',
      border: 'border-blue-500/50',
    },
    sexy: {
      name: 'Mei Ling (Sexy Live)',
      avatar: '💋',
      tag: 'Sexy Baccarat Room 8',
      bg: 'from-[#381026] to-[#14040d]',
      border: 'border-pink-500/50',
    },
  }[dealerType];

  const chips = [100, 200, 500, 1000, 2500, 5000];

  const handleDeal = () => {
    if (!selectedBet) {
      alert('Please select Player, Banker, or Tie before dealing!');
      return;
    }
    if (userBalance < betAmount) {
      alert('Insufficient balance to bet!');
      return;
    }

    soundService.playSpin();
    onUpdateBalance(userBalance - betAmount);
    setIsDealing(true);
    setPlayerCard(null);
    setBankerCard(null);
    setRoundResult(null);

    setTimeout(() => {
      let pScore = Math.floor(Math.random() * 10);
      let bScore = Math.floor(Math.random() * 10);

      if (adminSettings.rtpMode === 'high_win') {
        if (selectedBet === 'player') {
          pScore = 9;
          bScore = 6;
        } else if (selectedBet === 'banker') {
          bScore = 9;
          pScore = 7;
        }
      }

      setPlayerCard(pScore);
      setBankerCard(bScore);

      let winner: 'player' | 'banker' | 'tie' = 'tie';
      if (pScore > bScore) winner = 'player';
      else if (bScore > pScore) winner = 'banker';

      const isWin = selectedBet === winner;
      const mult = selectedBet === 'tie' ? 8.0 : selectedBet === 'banker' ? 1.95 : 2.0;
      const winAmount = isWin ? Math.round(betAmount * mult) : 0;

      if (isWin) {
        soundService.playWin();
        triggerWinConfetti();
        onUpdateBalance(userBalance - betAmount + winAmount);
        setRoundResult(`WIN ₨ ${winAmount.toLocaleString()}!`);
      } else {
        soundService.playLose();
        setRoundResult('LOST');
      }

      setHistory((prev) => [winner === 'player' ? 'P' : winner === 'banker' ? 'B' : 'T', ...prev.slice(0, 15)]);
      onRecordBet(
        `${dealerType}_live_casino`,
        `Live Baccarat (${dealerInfo.name})`,
        betAmount,
        winAmount,
        isWin ? mult : 0
      );
      setIsDealing(false);
    }, 1800);
  };

  return (
    <div className={`bg-gradient-to-b ${dealerInfo.bg} border ${dealerInfo.border} rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5">
              <span>{dealerInfo.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase">
                🔴 4K LIVE
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">{dealerInfo.tag} • Real-time Optical Scanner</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Live Stream Stage Simulation */}
      <div className="relative bg-black/60 border border-amber-500/40 rounded-2xl p-4 min-h-[220px] flex flex-col justify-between overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-300">Live Video Stream 1080p</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Table Limit: ₨ 100 - 50,000</span>
        </div>

        {/* Dealer Stage Center */}
        <div className="flex items-center justify-around my-auto">
          {/* Player Hand */}
          <div className="text-center p-3 rounded-2xl bg-blue-950/60 border border-blue-500/60 w-32 shadow">
            <span className="text-xs font-black text-blue-400 block">PLAYER</span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white my-1">
              {playerCard !== null ? playerCard : isDealing ? '?' : '-'}
            </div>
            <span className="text-[10px] text-slate-300">Points</span>
          </div>

          {/* VS / Dealer Symbol */}
          <div className="text-center">
            <div className="text-4xl sm:text-5xl animate-bounce">{dealerInfo.avatar}</div>
            <span className="text-[10px] font-bold text-amber-300 block mt-1">Live Dealer</span>
          </div>

          {/* Banker Hand */}
          <div className="text-center p-3 rounded-2xl bg-rose-950/60 border border-rose-500/60 w-32 shadow">
            <span className="text-xs font-black text-rose-400 block">BANKER</span>
            <div className="text-4xl sm:text-5xl font-black font-mono text-white my-1">
              {bankerCard !== null ? bankerCard : isDealing ? '?' : '-'}
            </div>
            <span className="text-[10px] text-slate-300">Points</span>
          </div>
        </div>

        {/* Round Result Toast */}
        {roundResult && (
          <div className="text-center py-1.5 bg-amber-400/20 border border-amber-400 rounded-xl animate-bounce">
            <span className="text-sm sm:text-base font-black text-amber-300">{roundResult}</span>
          </div>
        )}

        {/* Bead Roadmap */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold mr-1">Road:</span>
          {history.map((r, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                r === 'P' ? 'bg-blue-600' : r === 'B' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Betting Positions */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          disabled={isDealing}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('player');
          }}
          className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === 'player'
              ? 'bg-blue-600 text-white border-blue-300 font-black shadow-lg shadow-blue-500/40 scale-105'
              : 'bg-blue-950/40 text-blue-300 border-blue-900 hover:border-blue-500'
          }`}
        >
          <span className="text-xs sm:text-sm font-black block">PLAYER</span>
          <span className="text-[10px] text-blue-200 block">Pays 1:1 (2.0x)</span>
        </button>

        <button
          disabled={isDealing}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('tie');
          }}
          className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === 'tie'
              ? 'bg-emerald-600 text-white border-emerald-300 font-black shadow-lg shadow-emerald-500/40 scale-105'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-900 hover:border-emerald-500'
          }`}
        >
          <span className="text-xs sm:text-sm font-black block">TIE</span>
          <span className="text-[10px] text-emerald-200 block">Pays 8:1 (8.0x)</span>
        </button>

        <button
          disabled={isDealing}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('banker');
          }}
          className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === 'banker'
              ? 'bg-rose-600 text-white border-rose-300 font-black shadow-lg shadow-rose-500/40 scale-105'
              : 'bg-rose-950/40 text-rose-300 border-rose-900 hover:border-rose-500'
          }`}
        >
          <span className="text-xs sm:text-sm font-black block">BANKER</span>
          <span className="text-[10px] text-rose-200 block">Pays 0.95:1 (1.95x)</span>
        </button>
      </div>

      {/* Chip Controls & Deal Trigger */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {chips.map((c) => (
            <button
              key={c}
              disabled={isDealing}
              onClick={() => {
                soundService.playClick();
                setBetAmount(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                betAmount === c
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              ₨ {c}
            </button>
          ))}
        </div>

        <button
          disabled={isDealing}
          onClick={handleDeal}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-xl hover:from-amber-300 transition cursor-pointer"
        >
          {isDealing ? 'DEALER DEALING CARDS...' : `DEAL HAND (₨ ${betAmount})`}
        </button>
      </div>
    </div>
  );
};
