import React, { useState } from 'react';
import { ArrowLeft, Swords, Trophy, History } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface DragonTigerGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

const CARDS = [
  { rank: 'A', value: 1, suit: '♠' },
  { rank: '2', value: 2, suit: '♥' },
  { rank: '3', value: 3, suit: '♣' },
  { rank: '4', value: 4, suit: '♦' },
  { rank: '5', value: 5, suit: '♠' },
  { rank: '6', value: 6, suit: '♥' },
  { rank: '7', value: 7, suit: '♣' },
  { rank: '8', value: 8, suit: '♦' },
  { rank: '9', value: 9, suit: '♠' },
  { rank: '10', value: 10, suit: '♥' },
  { rank: 'J', value: 11, suit: '♣' },
  { rank: 'Q', value: 12, suit: '♦' },
  { rank: 'K', value: 13, suit: '♠' },
];

export const DragonTigerGame: React.FC<DragonTigerGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [betSide, setBetSide] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [betAmount, setBetAmount] = useState(100);
  const [isDealing, setIsDealing] = useState(false);
  const [dragonCard, setDragonCard] = useState<{ rank: string; value: number; suit: string } | null>(null);
  const [tigerCard, setTigerCard] = useState<{ rank: string; value: number; suit: string } | null>(null);
  const [winner, setWinner] = useState<'dragon' | 'tiger' | 'tie' | null>(null);
  const [roadMap, setRoadMap] = useState<('D' | 'T' | 'X')[]>(['D', 'D', 'T', 'D', 'T', 'T', 'X', 'D']);

  const handleDeal = (side: 'dragon' | 'tiger' | 'tie') => {
    if (isDealing) return;
    if (balance < betAmount) {
      soundService.playBeep(300);
      alert('Insufficient balance!');
      return;
    }

    soundService.playClick();
    setBetSide(side);
    setIsDealing(true);
    setDragonCard(null);
    setTigerCard(null);
    setWinner(null);

    // Pick cards based on RTP & Forced Result
    let dIdx = Math.floor(Math.random() * CARDS.length);
    let tIdx = Math.floor(Math.random() * CARDS.length);

    // Admin Forced Outcome Override
    if (adminSettings.forcedResults?.dragonTiger && adminSettings.forcedResults.dragonTiger !== 'random') {
      const forced = adminSettings.forcedResults.dragonTiger;
      if (forced === 'dragon') {
        dIdx = Math.min(CARDS.length - 1, 10);
        tIdx = Math.max(0, 3);
      } else if (forced === 'tiger') {
        tIdx = Math.min(CARDS.length - 1, 10);
        dIdx = Math.max(0, 3);
      } else if (forced === 'tie') {
        dIdx = 7;
        tIdx = 7;
      }
    } else if (adminSettings.rtpMode === 'high_win') {
      if (side === 'dragon') {
        dIdx = Math.min(CARDS.length - 1, tIdx + 2);
      } else if (side === 'tiger') {
        tIdx = Math.min(CARDS.length - 1, dIdx + 2);
      }
    }

    const dCard = CARDS[dIdx];
    const tCard = CARDS[tIdx];

    // Card Deal Sequence
    setTimeout(() => {
      soundService.playSpinTick();
      setDragonCard(dCard);
    }, 600);

    setTimeout(() => {
      soundService.playSpinTick();
      setTigerCard(tCard);

      let roundWinner: 'dragon' | 'tiger' | 'tie' = 'tie';
      if (dCard.value > tCard.value) roundWinner = 'dragon';
      else if (tCard.value > dCard.value) roundWinner = 'tiger';

      setWinner(roundWinner);
      setIsDealing(false);

      const symbol = roundWinner === 'dragon' ? 'D' : roundWinner === 'tiger' ? 'T' : 'X';
      setRoadMap((prev) => [symbol, ...prev.slice(0, 15)]);

      let winAmt = 0;
      if (side === roundWinner) {
        winAmt = side === 'tie' ? betAmount * 9 : betAmount * 2;
        soundService.playWin();
        triggerWinConfetti();
      } else {
        soundService.playBeep(250);
      }

      onBet(betAmount, winAmt, `Dragon Tiger [${dCard.rank} vs ${tCard.rank}] Winner: ${roundWinner.toUpperCase()}`);
    }, 1400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Exit Game</span>
        </button>

        <div className="flex items-center gap-2 bg-[#121826] border border-amber-500/30 px-3 py-1 rounded-2xl">
          <Swords className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-amber-300">Dragon vs Tiger (Fast Card)</span>
        </div>
      </div>

      {/* Main Battle Table */}
      <div className="bg-[#0b101e] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-2 gap-4 items-center justify-center my-4">
          {/* Dragon Side */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-rose-500 tracking-wider mb-2">DRAGON</span>
            <div className="w-28 h-40 sm:w-36 sm:h-48 rounded-2xl border-2 border-rose-500/50 bg-slate-900 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
              {dragonCard ? (
                <div className="text-center animate-in zoom-in-75">
                  <div className="text-3xl sm:text-4xl font-black text-rose-500">{dragonCard.rank}</div>
                  <div className="text-2xl sm:text-3xl text-rose-400">{dragonCard.suit}</div>
                </div>
              ) : (
                <div className="text-slate-600 font-bold text-xs uppercase">🐉 Dragon</div>
              )}
            </div>
          </div>

          {/* Tiger Side */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-amber-400 tracking-wider mb-2">TIGER</span>
            <div className="w-28 h-40 sm:w-36 sm:h-48 rounded-2xl border-2 border-amber-500/50 bg-slate-900 flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
              {tigerCard ? (
                <div className="text-center animate-in zoom-in-75">
                  <div className="text-3xl sm:text-4xl font-black text-amber-400">{tigerCard.rank}</div>
                  <div className="text-2xl sm:text-3xl text-amber-300">{tigerCard.suit}</div>
                </div>
              ) : (
                <div className="text-slate-600 font-bold text-xs uppercase">🐯 Tiger</div>
              )}
            </div>
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="text-center py-2 bg-slate-900/90 rounded-2xl border border-amber-500/30 mb-4 animate-bounce">
            <span className="text-lg font-black text-yellow-300 uppercase">
              {winner === 'tie' ? '🤝 TIE (9x PAYOUT)!' : `👑 ${winner.toUpperCase()} WINS!`}
            </span>
          </div>
        )}

        {/* Betting Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-4">
          <button
            disabled={isDealing}
            onClick={() => handleDeal('dragon')}
            className="py-4 rounded-2xl bg-gradient-to-b from-rose-600 to-red-800 hover:from-rose-500 hover:to-red-700 text-white font-black text-center shadow-lg shadow-rose-600/30 transition transform active:scale-95 cursor-pointer border border-rose-400/40"
          >
            <div className="text-base sm:text-lg">DRAGON</div>
            <div className="text-[10px] text-rose-200">2x Payout</div>
          </button>

          <button
            disabled={isDealing}
            onClick={() => handleDeal('tie')}
            className="py-4 rounded-2xl bg-gradient-to-b from-emerald-600 to-teal-800 hover:from-emerald-500 hover:to-teal-700 text-white font-black text-center shadow-lg shadow-emerald-600/30 transition transform active:scale-95 cursor-pointer border border-emerald-400/40"
          >
            <div className="text-base sm:text-lg">TIE</div>
            <div className="text-[10px] text-emerald-200">9x Payout</div>
          </button>

          <button
            disabled={isDealing}
            onClick={() => handleDeal('tiger')}
            className="py-4 rounded-2xl bg-gradient-to-b from-amber-500 to-yellow-700 hover:from-amber-400 hover:to-yellow-600 text-slate-950 font-black text-center shadow-lg shadow-amber-500/30 transition transform active:scale-95 cursor-pointer border border-amber-400/40"
          >
            <div className="text-base sm:text-lg">TIGER</div>
            <div className="text-[10px] text-amber-950">2x Payout</div>
          </button>
        </div>

        {/* Bet Amount Selector */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pt-2 border-t border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase">Bet Chip:</span>
          <div className="flex gap-1.5">
            {[50, 100, 200, 500, 1000, 2500].map((amt) => (
              <button
                key={amt}
                disabled={isDealing}
                onClick={() => {
                  soundService.playClick();
                  setBetAmount(amt);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  betAmount === amt
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ₨ {amt}
              </button>
            ))}
          </div>
        </div>

        {/* Road Map (History Dots) */}
        <div className="mt-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1">
            <History className="w-3.5 h-3.5 text-amber-400" />
            Roadmap Bead Plate (Past Rounds)
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {roadMap.map((sym, i) => (
              <span
                key={i}
                className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center text-white shrink-0 ${
                  sym === 'D' ? 'bg-rose-600' : sym === 'T' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600'
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
