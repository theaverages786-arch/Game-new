import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  CalendarCheck, 
  Award, 
  Crown, 
  CheckCircle2, 
  Trophy,
  Flame,
  ChevronRight
} from 'lucide-react';
import { UserAccount } from '../../types';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';

interface ActivityTabProps {
  user: UserAccount;
  onClaimDailyCheckIn: (day: number, reward: number) => void;
  onClaimVipReward: (level: number, amount: number) => void;
  language: 'en' | 'ur' | 'hi';
}

const CHECK_IN_REWARDS = [
  { day: 1, reward: 50 },
  { day: 2, reward: 100 },
  { day: 3, reward: 150 },
  { day: 4, reward: 200 },
  { day: 5, reward: 250 },
  { day: 6, reward: 350 },
  { day: 7, reward: 500 },
];

const VIP_LEVELS = [
  { level: 1, expRequired: 500, bonus: 100, rebate: '0.2%' },
  { level: 2, expRequired: 1500, bonus: 200, rebate: '0.4%' },
  { level: 3, expRequired: 5000, bonus: 500, rebate: '0.6%' },
  { level: 4, expRequired: 15000, bonus: 1200, rebate: '0.8%' },
  { level: 5, expRequired: 50000, bonus: 3000, rebate: '1.0%' },
];

export const ActivityTab: React.FC<ActivityTabProps> = ({
  user,
  onClaimDailyCheckIn,
  onClaimVipReward,
  language,
}) => {
  const [mysteryChestOpened, setMysteryChestOpened] = useState(false);
  const [mysteryReward, setMysteryReward] = useState<number | null>(null);

  const handleCheckIn = (day: number, reward: number) => {
    soundService.playWin();
    triggerWinConfetti();
    onClaimDailyCheckIn(day, reward);
  };

  const handleOpenMysteryChest = () => {
    if (mysteryChestOpened) return;
    soundService.playJackpot();
    triggerWinConfetti();
    const prize = [100, 200, 500, 888, 1288][Math.floor(Math.random() * 5)];
    setMysteryReward(prize);
    setMysteryChestOpened(true);
    onClaimDailyCheckIn(user.dailyStreak, prize);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* 7-Day Check-in Streak Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-yellow-800 to-[#121a2c] border border-amber-400/50 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-yellow-200 border border-amber-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-max">
              <Flame className="w-3 h-3 text-amber-300" />
              Daily Login Streak Bonus
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white">
              7-DAY CONSECUTIVE SIGN-IN
            </h3>
            <p className="text-xs text-yellow-100/80">
              Sign in daily to unlock escalating cash prizes up to ₨ 500! Current streak: <strong className="text-amber-300">{user.dailyStreak} Days</strong>
            </p>
          </div>
        </div>

        {/* 7-Day Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {CHECK_IN_REWARDS.map((item) => {
            const isCompleted = item.day < user.dailyStreak;
            const isToday = item.day === user.dailyStreak;
            return (
              <div
                key={item.day}
                className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between border text-center transition-all ${
                  isCompleted
                    ? 'bg-slate-900/80 border-emerald-500/40 text-emerald-400'
                    : isToday
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-500 text-slate-950 border-white shadow-lg shadow-amber-500/40 scale-105'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <span className="text-[10px] font-black uppercase">Day {item.day}</span>
                <span className="text-2xl my-1">
                  {isCompleted ? '✓' : item.day === 7 ? '🎁' : '💰'}
                </span>
                <span className="text-xs font-black font-mono">₨ {item.reward}</span>

                {isToday && (
                  <button
                    onClick={() => handleCheckIn(item.day, item.reward)}
                    className="mt-1 w-full bg-slate-950 text-amber-300 text-[10px] font-black py-0.5 rounded-lg hover:bg-slate-900 cursor-pointer shadow"
                  >
                    Claim
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mystery VIP Chest Box */}
      <div className="bg-[#0f1628] border border-purple-500/30 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-3xl shadow-lg border border-purple-400/40 animate-pulse">
            {mysteryChestOpened ? '💎' : '🎁'}
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Daily Mystery Lucky Box</h4>
            <p className="text-xs text-purple-200/80">
              Open your free daily surprise chest for instant bonus credits.
            </p>
            {mysteryReward && (
              <span className="text-xs font-black text-emerald-400 font-mono">
                🎉 Won +₨ {mysteryReward} Credits!
              </span>
            )}
          </div>
        </div>

        <button
          disabled={mysteryChestOpened}
          onClick={handleOpenMysteryChest}
          className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition transform active:scale-95 cursor-pointer whitespace-nowrap ${
            mysteryChestOpened
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/30'
          }`}
        >
          {mysteryChestOpened ? 'Opened Today' : 'OPEN MYSTERY BOX'}
        </button>
      </div>

      {/* VIP Club Level Progression */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h4 className="text-sm font-black text-amber-300 uppercase tracking-wider">
              VIP Club Privileges &amp; Rebate
            </h4>
          </div>
          <span className="text-xs font-bold text-amber-400 font-mono">
            Current: VIP {user.vipLevel} (EXP: {user.vipExp} / 5000)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (user.vipExp / 5000) * 100)}%` }}
          ></div>
        </div>

        {/* VIP Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {VIP_LEVELS.slice(0, 3).map((v) => (
            <div
              key={v.level}
              className={`p-3 rounded-2xl border flex flex-col justify-between ${
                user.vipLevel >= v.level
                  ? 'bg-slate-900/90 border-amber-400/40 text-amber-300 shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black">VIP {v.level}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {v.rebate} Bet Rebate
                </span>
              </div>
              <div className="mt-3">
                <span className="text-[10px] text-slate-400 block">Level-up Reward</span>
                <span className="text-sm font-black text-white font-mono">₨ {v.bonus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
