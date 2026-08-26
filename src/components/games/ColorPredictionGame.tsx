import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Trophy, 
  HelpCircle, 
  Flame, 
  CheckCircle2, 
  History,
  Sparkles
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface ColorPredictionGameProps {
  balance: number;
  onBet: (amount: number, winAmount: number, details: string) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
}

interface BetSelection {
  type: 'color' | 'number' | 'size';
  value: string; // 'green', 'violet', 'red', '0'..'9', 'big', 'small'
  amount: number;
}

interface PastResult {
  period: string;
  number: number;
  size: 'Big' | 'Small';
  colors: ('green' | 'red' | 'violet')[];
}

export const ColorPredictionGame: React.FC<ColorPredictionGameProps> = ({
  balance,
  onBet,
  onBack,
  adminSettings,
}) => {
  const [modeTime, setModeTime] = useState<1 | 3>(1); // 1 Min or 3 Min
  const [timeLeft, setTimeLeft] = useState(30);
  const [period, setPeriod] = useState('2026082601');
  const [selectedChips, setSelectedChips] = useState<BetSelection[]>([]);
  const [currentChipAmount, setCurrentChipAmount] = useState(50);
  const [activeTab, setActiveTab] = useState<'game' | 'history' | 'rules'>('game');
  const [pastResults, setPastResults] = useState<PastResult[]>([
    { period: '2026082600', number: 7, size: 'Big', colors: ['green'] },
    { period: '2026082599', number: 0, size: 'Small', colors: ['red', 'violet'] },
    { period: '2026082598', number: 2, size: 'Small', colors: ['red'] },
    { period: '2026082597', number: 5, size: 'Big', colors: ['green', 'violet'] },
    { period: '2026082596', number: 8, size: 'Big', colors: ['red'] },
    { period: '2026082595', number: 3, size: 'Small', colors: ['green'] },
    { period: '2026082594', number: 9, size: 'Big', colors: ['green'] },
    { period: '2026082593', number: 4, size: 'Small', colors: ['red'] },
  ]);

  const [lastWinAlert, setLastWinAlert] = useState<{ win: number; desc: string } | null>(null);

  // Timer Tick Loop
  useEffect(() => {
    const totalCycle = modeTime * 60;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 5 && prev > 1) {
          soundService.playBeep(500);
        }
        if (prev <= 1) {
          resolveRound();
          return totalCycle;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [modeTime, selectedChips]);

  const resolveRound = () => {
    // Determine random winning number 0-9 based on admin RTP
    let num = Math.floor(Math.random() * 10);

    if (adminSettings.rtpMode === 'high_win' && selectedChips.length > 0) {
      // Favor user's bet if possible
      const firstNumBet = selectedChips.find((b) => b.type === 'number');
      if (firstNumBet && Math.random() < 0.5) {
        num = parseInt(firstNumBet.value);
      } else {
        const firstColor = selectedChips.find((b) => b.type === 'color');
        if (firstColor?.value === 'green') num = [1, 3, 7, 9][Math.floor(Math.random() * 4)];
        if (firstColor?.value === 'red') num = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
      }
    }

    // Determine colors
    let colors: ('green' | 'red' | 'violet')[] = [];
    if (num === 0) colors = ['red', 'violet'];
    else if (num === 5) colors = ['green', 'violet'];
    else if ([1, 3, 7, 9].includes(num)) colors = ['green'];
    else colors = ['red'];

    const size: 'Big' | 'Small' = num >= 5 ? 'Big' : 'Small';

    const newResult: PastResult = {
      period,
      number: num,
      size,
      colors,
    };

    setPastResults((prev) => [newResult, ...prev.slice(0, 19)]);
    setPeriod((prev) => (BigInt(prev) + 1n).toString());

    // Calculate user payout
    let totalBet = 0;
    let totalWin = 0;

    selectedChips.forEach((bet) => {
      totalBet += bet.amount;
      if (bet.type === 'number' && parseInt(bet.value) === num) {
        totalWin += bet.amount * 9;
      }
      if (bet.type === 'color') {
        if (bet.value === 'green' && colors.includes('green')) {
          totalWin += num === 5 ? Math.round(bet.amount * 1.5) : bet.amount * 2;
        }
        if (bet.value === 'red' && colors.includes('red')) {
          totalWin += num === 0 ? Math.round(bet.amount * 1.5) : bet.amount * 2;
        }
        if (bet.value === 'violet' && colors.includes('violet')) {
          totalWin += bet.amount * 4.5;
        }
      }
      if (bet.type === 'size') {
        if (bet.value.toLowerCase() === size.toLowerCase()) {
          totalWin += bet.amount * 2;
        }
      }
    });

    if (selectedChips.length > 0) {
      onBet(totalBet, totalWin, `Wingo ${modeTime}M Period ${period} Result #${num} (${colors.join('+')})`);
      if (totalWin > 0) {
        soundService.playWin();
        triggerWinConfetti();
        setLastWinAlert({ win: totalWin, desc: `Period ${period} result was ${num} ${size}!` });
      } else {
        soundService.playBeep(250);
      }
      setSelectedChips([]);
    }
  };

  const handleToggleBet = (type: 'color' | 'number' | 'size', value: string) => {
    if (timeLeft <= 5) {
      alert('Betting closed for this round (Last 5 seconds)!');
      return;
    }
    if (balance < currentChipAmount) {
      soundService.playBeep(300);
      alert('Insufficient balance!');
      return;
    }

    soundService.playClick();
    setSelectedChips((prev) => {
      const existsIdx = prev.findIndex((b) => b.type === type && b.value === value);
      if (existsIdx >= 0) {
        // Add more to existing
        const copy = [...prev];
        copy[existsIdx].amount += currentChipAmount;
        return copy;
      } else {
        return [...prev, { type, value, amount: currentChipAmount }];
      }
    });
  };

  const totalBetSelected = selectedChips.reduce((acc, b) => acc + b.amount, 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-2 sm:p-4 text-white">
      {/* Header Bar */}
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

        {/* 1 Min / 3 Min Toggle */}
        <div className="flex bg-slate-900 border border-amber-500/30 p-1 rounded-2xl">
          <button
            onClick={() => {
              soundService.playClick();
              setModeTime(1);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
              modeTime === 1 ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            WinGo 1 Min
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              setModeTime(3);
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
              modeTime === 3 ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            WinGo 3 Min
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab(activeTab === 'rules' ? 'game' : 'rules')}
            className="p-1.5 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Win Alert Banner */}
      {lastWinAlert && (
        <div className="mb-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3 rounded-2xl flex items-center justify-between shadow-xl animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300 animate-bounce" />
            <div>
              <div className="text-xs font-black">ROUND WINNER! +₨ {lastWinAlert.win}</div>
              <div className="text-[10px] text-emerald-100">{lastWinAlert.desc}</div>
            </div>
          </div>
          <button onClick={() => setLastWinAlert(null)} className="text-xs px-2 py-1 bg-black/20 rounded-lg">
            ✕
          </button>
        </div>
      )}

      {/* Countdown Card & Period Info */}
      <div className="bg-gradient-to-r from-[#131d33] via-[#1a2642] to-[#131d33] border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-2xl mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3">
          {/* Period */}
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Current Period
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 font-mono tracking-wider">
              {period}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="col-span-1 sm:col-span-1 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              Time Remaining
            </span>
            <div className="flex items-center gap-1.5 mt-1 font-mono">
              <span className="bg-slate-950 border border-amber-500/40 text-amber-300 font-black text-xl sm:text-2xl px-2.5 py-1 rounded-xl shadow-inner">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}
              </span>
              <span className="text-amber-400 font-black">:</span>
              <span
                className={`bg-slate-950 border text-xl sm:text-2xl font-black px-2.5 py-1 rounded-xl shadow-inner ${
                  timeLeft <= 5
                    ? 'border-rose-500 text-rose-400 animate-pulse'
                    : 'border-amber-500/40 text-amber-300'
                }`}
              >
                {String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
            {timeLeft <= 5 && (
              <span className="text-[10px] font-bold text-rose-400 mt-1 uppercase tracking-wider animate-pulse">
                Locked &bull; Drawing...
              </span>
            )}
          </div>

          {/* Last Result Ball */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-end sm:items-end">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Last Draw Result
            </span>
            {pastResults[0] && (
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md text-white ${
                    pastResults[0].colors.includes('violet')
                      ? 'bg-gradient-to-r from-purple-600 to-rose-600'
                      : pastResults[0].colors.includes('green')
                      ? 'bg-emerald-500'
                      : 'bg-rose-600'
                  }`}
                >
                  {pastResults[0].number}
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase">
                  {pastResults[0].size}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Betting Board */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
        {/* Colors Row: Green (2x), Violet (4.5x), Red (2x) */}
        <div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 block">
            Select Color
          </span>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Green */}
            <button
              onClick={() => handleToggleBet('color', 'green')}
              className="group relative bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white py-3 sm:py-4 rounded-2xl font-black text-center shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95 cursor-pointer border border-emerald-400/40"
            >
              <div className="text-base sm:text-lg">GREEN</div>
              <div className="text-[10px] text-emerald-200 font-medium">2x Payout</div>
              {selectedChips.find((b) => b.type === 'color' && b.value === 'green') && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                  ₨ {selectedChips.find((b) => b.type === 'color' && b.value === 'green')?.amount}
                </span>
              )}
            </button>

            {/* Violet */}
            <button
              onClick={() => handleToggleBet('color', 'violet')}
              className="group relative bg-gradient-to-b from-purple-600 to-indigo-800 hover:from-purple-500 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-2xl font-black text-center shadow-lg shadow-purple-600/30 transition-all transform active:scale-95 cursor-pointer border border-purple-400/40"
            >
              <div className="text-base sm:text-lg">VIOLET</div>
              <div className="text-[10px] text-purple-200 font-medium">4.5x Payout</div>
              {selectedChips.find((b) => b.type === 'color' && b.value === 'violet') && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                  ₨ {selectedChips.find((b) => b.type === 'color' && b.value === 'violet')?.amount}
                </span>
              )}
            </button>

            {/* Red */}
            <button
              onClick={() => handleToggleBet('color', 'red')}
              className="group relative bg-gradient-to-b from-rose-600 to-red-800 hover:from-rose-500 hover:to-red-700 text-white py-3 sm:py-4 rounded-2xl font-black text-center shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 cursor-pointer border border-rose-400/40"
            >
              <div className="text-base sm:text-lg">RED</div>
              <div className="text-[10px] text-rose-200 font-medium">2x Payout</div>
              {selectedChips.find((b) => b.type === 'color' && b.value === 'red') && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                  ₨ {selectedChips.find((b) => b.type === 'color' && b.value === 'red')?.amount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Numbers 0 - 9 Grid (9x Payout) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Select Number (0-9)
            </span>
            <span className="text-[10px] font-bold text-amber-400">9x High Payout</span>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const hasBetOnNum = selectedChips.find(
                (b) => b.type === 'number' && b.value === n.toString()
              );
              let colorBg = 'bg-slate-800 hover:bg-slate-700 text-slate-200';
              if (n === 0) colorBg = 'bg-gradient-to-br from-rose-600 via-purple-600 to-rose-700 text-white';
              else if (n === 5) colorBg = 'bg-gradient-to-br from-emerald-600 via-purple-600 to-emerald-700 text-white';
              else if ([1, 3, 7, 9].includes(n)) colorBg = 'bg-emerald-700 hover:bg-emerald-600 text-white';
              else colorBg = 'bg-rose-700 hover:bg-rose-600 text-white';

              return (
                <button
                  key={n}
                  onClick={() => handleToggleBet('number', n.toString())}
                  className={`relative h-12 rounded-xl font-black text-base flex flex-col items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow border border-white/10 ${colorBg}`}
                >
                  <span>{n}</span>
                  {hasBetOnNum && (
                    <span className="absolute -top-2 -right-1 bg-amber-400 text-slate-950 font-black text-[9px] px-1 rounded-full shadow">
                      ₨{hasBetOnNum.amount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Big vs Small Choices */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleToggleBet('size', 'big')}
            className="relative bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 py-3 rounded-2xl font-black text-sm tracking-wider shadow-lg transition-all transform active:scale-95 cursor-pointer border border-amber-400/30"
          >
            BIG (5-9) &bull; 2x
            {selectedChips.find((b) => b.type === 'size' && b.value === 'big') && (
              <span className="absolute -top-2 -right-2 bg-white text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                ₨ {selectedChips.find((b) => b.type === 'size' && b.value === 'big')?.amount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleToggleBet('size', 'small')}
            className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 rounded-2xl font-black text-sm tracking-wider shadow-lg transition-all transform active:scale-95 cursor-pointer border border-blue-400/30"
          >
            SMALL (0-4) &bull; 2x
            {selectedChips.find((b) => b.type === 'size' && b.value === 'small') && (
              <span className="absolute -top-2 -right-2 bg-white text-slate-950 font-black text-xs px-2 py-0.5 rounded-full shadow">
                ₨ {selectedChips.find((b) => b.type === 'size' && b.value === 'small')?.amount}
              </span>
            )}
          </button>
        </div>

        {/* Chip Amount Selector & Clear Button */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 uppercase">Chip:</span>
            {[20, 50, 100, 500, 1000, 5000].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  soundService.playClick();
                  setCurrentChipAmount(chip);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                  currentChipAmount === chip
                    ? 'bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ₨ {chip}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {selectedChips.length > 0 && (
              <button
                onClick={() => setSelectedChips([])}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-rose-400 hover:bg-slate-700 text-xs font-bold border border-slate-700"
              >
                Clear
              </button>
            )}
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block leading-none">Total Bet</span>
              <span className="text-sm font-black text-amber-300 font-mono">₨ {totalBetSelected}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Past Results & Trend Chart */}
      <div className="mt-4 bg-[#0e1424] border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase">
            <History className="w-4 h-4 text-amber-400" />
            Recent Parity History & Trends
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">Last 8 Rounds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-1.5 px-2">Period</th>
                <th className="py-1.5 px-2">Number</th>
                <th className="py-1.5 px-2">Big/Small</th>
                <th className="py-1.5 px-2">Color</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {pastResults.map((r) => (
                <tr key={r.period} className="hover:bg-slate-900/40">
                  <td className="py-1.5 px-2 text-slate-300">{r.period}</td>
                  <td className="py-1.5 px-2">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-xs text-white ${
                        r.colors.includes('violet')
                          ? 'bg-purple-600'
                          : r.colors.includes('green')
                          ? 'bg-emerald-500'
                          : 'bg-rose-600'
                      }`}
                    >
                      {r.number}
                    </span>
                  </td>
                  <td className="py-1.5 px-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.size === 'Big' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {r.size}
                    </span>
                  </td>
                  <td className="py-1.5 px-2 flex items-center gap-1">
                    {r.colors.map((c) => (
                      <span
                        key={c}
                        className={`w-2.5 h-2.5 rounded-full ${
                          c === 'green'
                            ? 'bg-emerald-400'
                            : c === 'red'
                            ? 'bg-rose-500'
                            : 'bg-purple-500'
                        }`}
                      ></span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
