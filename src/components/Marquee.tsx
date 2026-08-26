import React, { useEffect, useState } from 'react';
import { Volume2, Trophy, Flame } from 'lucide-react';

interface MarqueeProps {
  notice?: string;
}

const mockWinners = [
  { user: '0301***928', game: 'Lucky 777 Slots', amount: '₨ 48,500' },
  { user: '0345***112', game: 'Aviator Crash (18.4x)', amount: '₨ 19,200' },
  { user: '0312***840', game: 'Wingo 1M Green', amount: '₨ 8,600' },
  { user: '0308***776', game: 'Mines Treasure', amount: '₨ 12,400' },
  { user: '0321***559', game: 'Grand VIP Jackpot', amount: '₨ 185,000' },
  { user: '0333***601', game: 'Dragon Tiger 9x', amount: '₨ 14,000' },
];

export const Marquee: React.FC<MarqueeProps> = ({ notice }) => {
  const [winnerIdx, setWinnerIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setWinnerIdx((prev) => (prev + 1) % mockWinners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentWinner = mockWinners[winnerIdx];

  return (
    <div className="w-full bg-[#0a0f1d] border-y border-amber-500/20 px-3 py-1.5 flex items-center gap-2 overflow-hidden text-xs">
      <div className="flex items-center gap-1 text-amber-400 font-bold shrink-0 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
        <Volume2 className="w-3.5 h-3.5 animate-pulse text-amber-400" />
        <span className="text-[10px] uppercase tracking-wider">Notice</span>
      </div>

      <div className="flex-1 overflow-hidden relative h-5">
        <div className="absolute inset-0 flex items-center justify-between transition-all duration-500">
          <p className="text-slate-300 text-[11px] truncate flex items-center gap-1.5">
            {notice ? (
              <span>{notice}</span>
            ) : (
              <>
                <Flame className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="text-slate-400">Congratulate</span>
                <span className="text-amber-300 font-mono font-bold">{currentWinner.user}</span>
                <span className="text-slate-400">in</span>
                <span className="text-yellow-400 font-medium">{currentWinner.game}</span>
                <span className="text-emerald-400 font-black flex items-center gap-0.5">
                  <Trophy className="w-3 h-3" />
                  {currentWinner.amount}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
