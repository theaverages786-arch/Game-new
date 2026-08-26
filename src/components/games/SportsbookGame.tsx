import React, { useState } from 'react';
import { ArrowLeft, Trophy, Flame, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';
import { AdminSettings } from '../../types';

interface SportsbookGameProps {
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  onBack: () => void;
  adminSettings: AdminSettings;
  provider?: '9wickets' | 'saba' | 'wg';
}

interface MatchItem {
  id: string;
  sport: 'cricket' | 'football' | 'hockey';
  league: string;
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
  status: string;
  oddsA: number;
  oddsDraw?: number;
  oddsB: number;
}

const MATCHES: MatchItem[] = [
  {
    id: 'm1',
    sport: 'cricket',
    league: 'ICC Champions Trophy 2026',
    teamA: 'Pakistan 🇵🇰',
    teamB: 'India 🇮🇳',
    scoreA: '286/6 (48.2 ov)',
    scoreB: '245/8 (44.0 ov)',
    status: 'LIVE • 2nd Innings',
    oddsA: 1.65,
    oddsB: 2.30,
  },
  {
    id: 'm2',
    sport: 'cricket',
    league: 'PSL Season 11',
    teamA: 'Lahore Qalandars 🦁',
    teamB: 'Karachi Kings 👑',
    scoreA: '192/4 (20.0 ov)',
    scoreB: '142/3 (14.1 ov)',
    status: 'LIVE • Req RR: 8.5',
    oddsA: 1.85,
    oddsB: 1.95,
  },
  {
    id: 'm3',
    sport: 'football',
    league: 'UEFA Champions League',
    teamA: 'Real Madrid 🇪🇸',
    teamB: 'Manchester City 🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    scoreA: '2',
    scoreB: '1',
    status: 'LIVE • 78\'',
    oddsA: 2.10,
    oddsDraw: 3.40,
    oddsB: 2.80,
  },
  {
    id: 'm4',
    sport: 'football',
    league: 'FIFA World Cup Qualifiers',
    teamA: 'Argentina 🇦🇷 (Messi)',
    teamB: 'Brazil 🇧🇷',
    scoreA: '1',
    scoreB: '0',
    status: 'LIVE • 64\'',
    oddsA: 1.55,
    oddsDraw: 3.80,
    oddsB: 4.20,
  },
  {
    id: 'm5',
    sport: 'hockey',
    league: 'NHL Stanley Cup Finals',
    teamA: 'Tampa Bay Lightning ⚡',
    teamB: 'Vegas Golden Knights ⚔️',
    scoreA: '3',
    scoreB: '2',
    status: 'LIVE • 3rd Period',
    oddsA: 1.75,
    oddsB: 2.05,
  },
];

export const SportsbookGame: React.FC<SportsbookGameProps> = ({
  userBalance,
  onUpdateBalance,
  onRecordBet,
  onBack,
  adminSettings,
  provider = '9wickets',
}) => {
  const [selectedSport, setSelectedSport] = useState<'all' | 'cricket' | 'football' | 'hockey'>('all');
  const [betAmount, setBetAmount] = useState<number>(500);
  const [activeSlip, setActiveSlip] = useState<{ match: MatchItem; pick: string; odds: number } | null>(null);
  const [placedBets, setPlacedBets] = useState<any[]>([]);

  const filteredMatches = MATCHES.filter((m) =>
    selectedSport === 'all' ? true : m.sport === selectedSport
  );

  const chips = [100, 200, 500, 1000, 2500, 5000];

  const handlePlaceBet = () => {
    if (!activeSlip) return;
    if (userBalance < betAmount) {
      alert('Insufficient balance to place bet!');
      return;
    }

    soundService.playCoin();
    onUpdateBalance(userBalance - betAmount);

    const ticketId = 'BET_SP_' + Date.now();
    const potentialWin = Math.round(betAmount * activeSlip.odds);

    const newBet = {
      id: ticketId,
      match: activeSlip.match,
      pick: activeSlip.pick,
      odds: activeSlip.odds,
      stake: betAmount,
      potentialWin,
      status: 'pending',
    };

    setPlacedBets((prev) => [newBet, ...prev]);

    // Instant simulated match resolution after 5 seconds
    setTimeout(() => {
      const isWin =
        adminSettings.rtpMode === 'high_win'
          ? Math.random() < 0.8
          : adminSettings.rtpMode === 'house_edge'
          ? Math.random() < 0.3
          : Math.random() < 0.55;

      if (isWin) {
        soundService.playWin();
        triggerWinConfetti();
        onUpdateBalance(userBalance - betAmount + potentialWin);
        onRecordBet(
          `${provider}_sports`,
          `${activeSlip.match.teamA} vs ${activeSlip.match.teamB}`,
          betAmount,
          potentialWin,
          activeSlip.odds
        );
        setPlacedBets((prev) =>
          prev.map((b) => (b.id === ticketId ? { ...b, status: 'won' } : b))
        );
      } else {
        soundService.playLose();
        onRecordBet(
          `${provider}_sports`,
          `${activeSlip.match.teamA} vs ${activeSlip.match.teamB}`,
          betAmount,
          0,
          0
        );
        setPlacedBets((prev) =>
          prev.map((b) => (b.id === ticketId ? { ...b, status: 'lost' } : b))
        );
      }
    }, 4500);

    setActiveSlip(null);
  };

  return (
    <div className="bg-[#081224] border border-amber-500/30 rounded-3xl p-3 sm:p-5 max-w-5xl mx-auto shadow-2xl space-y-4 animate-in zoom-in-95">
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
              <span>
                {provider === '9wickets'
                  ? '🏏 9Wickets Live Sports'
                  : provider === 'saba'
                  ? '⚽ SABA Sports Betting'
                  : '🏒 WG Sports World'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase">
                LIVE ODDS
              </span>
            </h2>
            <span className="text-[10px] text-slate-400">Cricket, Football, NHL Ice Hockey Live Exchange</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm sm:text-base font-black text-amber-300 font-mono">
            ₨ {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Sports Navigation Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          { id: 'all', label: '🔥 All Live Matches' },
          { id: 'cricket', label: '🏏 Cricket (PSL & ICC)' },
          { id: 'football', label: '⚽ Football (Champions League)' },
          { id: 'hockey', label: '🏒 Ice Hockey (NHL)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedSport(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedSport === tab.id
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow font-black'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Matches Grid */}
      <div className="space-y-3">
        {filteredMatches.map((m) => (
          <div
            key={m.id}
            className="bg-[#0e213b] border border-slate-700 rounded-2xl p-3.5 hover:border-amber-400/60 transition shadow"
          >
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 mb-2.5">
              <span className="text-xs font-bold text-amber-300">{m.league}</span>
              <span className="text-[10px] bg-rose-600/80 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                {m.status}
              </span>
            </div>

            {/* Teams & Scores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{m.teamA}</span>
                  <span className="font-mono text-emerald-400">{m.scoreA}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{m.teamB}</span>
                  <span className="font-mono text-amber-300">{m.scoreB}</span>
                </div>
              </div>

              {/* Odds Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    soundService.playClick();
                    setActiveSlip({ match: m, pick: m.teamA, odds: m.oddsA });
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    activeSlip?.pick === m.teamA
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                      : 'bg-[#091526] text-slate-200 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span className="text-[10px] block truncate">1: {m.teamA.split(' ')[0]}</span>
                  <span className="text-xs font-black font-mono">{m.oddsA}</span>
                </button>

                {m.oddsDraw && (
                  <button
                    onClick={() => {
                      soundService.playClick();
                      setActiveSlip({ match: m, pick: 'Draw', odds: m.oddsDraw! });
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      activeSlip?.pick === 'Draw'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                        : 'bg-[#091526] text-slate-200 border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <span className="text-[10px] block">Draw (X)</span>
                    <span className="text-xs font-black font-mono">{m.oddsDraw}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    soundService.playClick();
                    setActiveSlip({ match: m, pick: m.teamB, odds: m.oddsB });
                  }}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                    activeSlip?.pick === m.teamB
                      ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                      : 'bg-[#091526] text-slate-200 border-slate-700 hover:border-amber-400'
                  }`}
                >
                  <span className="text-[10px] block truncate">2: {m.teamB.split(' ')[0]}</span>
                  <span className="text-xs font-black font-mono">{m.oddsB}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bet Slip Bar */}
      {activeSlip && (
        <div className="bg-gradient-to-r from-[#173860] to-[#0d223d] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl space-y-3 animate-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-300 block">Selected Bet:</span>
              <span className="text-sm font-black text-amber-300">
                {activeSlip.pick} @ {activeSlip.odds}x
              </span>
            </div>
            <button
              onClick={() => setActiveSlip(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel ✕
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => setBetAmount(c)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                  betAmount === c ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ₨ {c}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-300">
              Potential Payout: <span className="text-emerald-400 font-mono">₨ {Math.round(betAmount * activeSlip.odds)}</span>
            </span>
            <button
              onClick={handlePlaceBet}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow hover:from-amber-300 transition cursor-pointer"
            >
              PLACE BET (₨ {betAmount})
            </button>
          </div>
        </div>
      )}

      {/* Placed Active Bets Log */}
      {placedBets.length > 0 && (
        <div className="space-y-1.5 pt-2">
          <span className="text-xs font-bold text-slate-400">Recent Bet Slips:</span>
          <div className="space-y-1">
            {placedBets.map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-xl bg-[#091526] border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{b.pick}</span>
                  <span className="text-[10px] text-slate-400">
                    Stake: ₨ {b.stake} @ {b.odds}x
                  </span>
                </div>
                <div>
                  {b.status === 'pending' && (
                    <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono text-[10px] animate-pulse">
                      Simulating...
                    </span>
                  )}
                  {b.status === 'won' && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                      +₨ {b.potentialWin} WON
                    </span>
                  )}
                  {b.status === 'lost' && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px]">
                      LOST
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
