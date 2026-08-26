import React, { useState } from 'react';
import { ArrowLeft, Sparkles, RefreshCw, Trophy, Zap, Dice1, Dice6 } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface JILICardsGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
  gameType?: '7up' | 'sicbo' | 'kingmidas';
}

export const JILICardsGame: React.FC<JILICardsGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
  gameType = '7up',
}) => {
  const [selectedBet, setSelectedBet] = useState<'7down' | '7exact' | '7up' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(200);
  const [dice1, setDice1] = useState<number>(3);
  const [dice2, setDice2] = useState<number>(4);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [roundResult, setRoundResult] = useState<string | null>(null);

  const chips = [50, 100, 200, 500, 1000, 2000, 5000];

  const handleRoll = () => {
    if (!selectedBet) {
      alert('Please select 7 Down, Exactly 7, or 7 Up!');
      return;
    }
    if (userBalance < betAmount) {
      alert('Insufficient balance to roll!');
      return;
    }

    soundService.playSpin();
    onUpdateBalance(userBalance - betAmount);
    setIsRolling(true);
    setLastWin(0);
    setRoundResult(null);

    setTimeout(() => {
      let d1 = Math.floor(Math.random() * 6) + 1;
      let d2 = Math.floor(Math.random() * 6) + 1;

      if (adminSettings.rtpMode === 'high_win') {
        if (selectedBet === '7down') {
          d1 = 2;
          d2 = 3; // total 5
        } else if (selectedBet === '7up') {
          d1 = 5;
          d2 = 5; // total 10
        } else {
          d1 = 3;
          d2 = 4; // total 7
        }
      }

      setDice1(d1);
      setDice2(d2);
      const total = d1 + d2;

      let outcome: '7down' | '7exact' | '7up' = total < 7 ? '7down' : total > 7 ? '7up' : '7exact';
      const isWin = selectedBet === outcome;
      const mult = selectedBet === '7exact' ? 5.0 : 2.0;
      const win = isWin ? Math.round(betAmount * mult) : 0;

      if (isWin) {
        soundService.playWin();
        triggerWinConfetti();
        onUpdateBalance(userBalance - betAmount + win);
        setLastWin(win);
        setRoundResult(`WIN ₨ ${win.toLocaleString()}! (Total: ${total})`);
      } else {
        soundService.playLose();
        setRoundResult(`LOST (Dice Total: ${total})`);
      }

      onRecordBet(
        `${gameType}_cards_dice`,
        gameType === 'kingmidas' ? 'KingMidas Bunny Cards' : 'JILI 7Up 7Down & Sic Bo',
        betAmount,
        win,
        isWin ? mult : 0
      );
      setIsRolling(false);
    }, 1300);
  };

  return (
    <div className="bg-[#121c2b] border border-amber-500/40 rounded-3xl p-3 sm:p-5 max-w-4xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
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
              <span>{gameType === 'kingmidas' ? '🐰 KingMidas Cards' : '🎲 JILI 7Up 7Down'}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                TABLE GAME
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">High Payout Dice &amp; Card Thrills</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Dice Stage */}
      <div className="relative bg-gradient-to-b from-[#0b2447] to-[#041021] border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="flex items-center justify-center gap-6">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-3xl border-4 border-amber-200 shadow-2xl flex items-center justify-center text-4xl sm:text-6xl font-black text-slate-950 font-mono ${
              isRolling ? 'animate-bounce' : ''
            }`}
          >
            {dice1}
          </div>
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-3xl border-4 border-amber-200 shadow-2xl flex items-center justify-center text-4xl sm:text-6xl font-black text-slate-950 font-mono ${
              isRolling ? 'animate-bounce' : ''
            }`}
          >
            {dice2}
          </div>
        </div>

        <div className="text-lg font-black text-amber-300">
          Total Dice: <span className="font-mono text-2xl">{dice1 + dice2}</span>
        </div>

        {roundResult && (
          <div className="py-2 bg-amber-400/20 border border-amber-400 rounded-xl animate-bounce max-w-sm mx-auto">
            <span className="text-sm font-black text-amber-300">{roundResult}</span>
          </div>
        )}
      </div>

      {/* 7Down / 7 / 7Up Betting Spots */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <button
          disabled={isRolling}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('7down');
          }}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === '7down'
              ? 'bg-blue-600 text-white border-blue-300 font-black shadow-lg shadow-blue-500/40 scale-105'
              : 'bg-blue-950/40 text-blue-300 border-blue-900 hover:border-blue-500'
          }`}
        >
          <span className="text-sm sm:text-base font-black block">7 DOWN (2-6)</span>
          <span className="text-xs text-blue-200 block">2.0x Multiplier</span>
        </button>

        <button
          disabled={isRolling}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('7exact');
          }}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === '7exact'
              ? 'bg-amber-500 text-slate-950 border-yellow-300 font-black shadow-lg shadow-amber-500/40 scale-105'
              : 'bg-amber-950/40 text-amber-300 border-amber-900 hover:border-amber-500'
          }`}
        >
          <span className="text-sm sm:text-base font-black block">LUCKY 7</span>
          <span className="text-xs text-amber-200 block">5.0x Multiplier</span>
        </button>

        <button
          disabled={isRolling}
          onClick={() => {
            soundService.playClick();
            setSelectedBet('7up');
          }}
          className={`p-4 rounded-2xl border text-center transition cursor-pointer ${
            selectedBet === '7up'
              ? 'bg-rose-600 text-white border-rose-300 font-black shadow-lg shadow-rose-500/40 scale-105'
              : 'bg-rose-950/40 text-rose-300 border-rose-900 hover:border-rose-500'
          }`}
        >
          <span className="text-sm sm:text-base font-black block">7 UP (8-12)</span>
          <span className="text-xs text-rose-200 block">2.0x Multiplier</span>
        </button>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {chips.map((c) => (
            <button
              key={c}
              disabled={isRolling}
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
          disabled={isRolling}
          onClick={handleRoll}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-xl hover:from-amber-300 transition cursor-pointer"
        >
          {isRolling ? 'SHAKING DICE...' : `ROLL DICE (₨ ${betAmount})`}
        </button>
      </div>
    </div>
  );
};
