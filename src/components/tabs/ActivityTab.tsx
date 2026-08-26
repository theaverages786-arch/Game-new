import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Crown, 
  RotateCcw, 
  Ticket, 
  Clock, 
  Share2, 
  Users, 
  Flame, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  ShieldCheck,
  Award
} from 'lucide-react';
import { UserAccount } from '../../types';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';

interface ActivityTabProps {
  user: UserAccount;
  onClaimDailyCheckIn: (day: number, reward: number) => void;
  onClaimVipReward: (level: number, amount: number) => void;
  onBack?: () => void;
  onOpenDeposit?: () => void;
  language: 'en' | 'ur' | 'hi';
}

type PromoCategory = 'event' | 'unclaimed' | 'mission' | 'vip' | 'rebate';

interface PromoItem {
  id: string;
  badgeNumber: number;
  title: string;
  subtitle: string;
  tag: string;
  gradient: string;
  icon: string;
  category: PromoCategory;
  typeFilter: 'all' | 'cooperate' | 'connect';
  rewardAmount?: number;
  claimed?: boolean;
  content: string[];
}

const PROMO_EVENTS: PromoItem[] = [
  {
    id: 'promo-1',
    badgeNumber: 1,
    title: 'Invitation Bonus ④: Invite friends earn Rs 200 every day',
    subtitle: 'Invite 1 valid active member and receive Rs 200 instant cash reward every single day!',
    tag: 'INVITE ④',
    gradient: 'from-[#144835] via-[#1a6148] to-[#0d3325]',
    icon: '👥',
    category: 'event',
    typeFilter: 'cooperate',
    rewardAmount: 200,
    content: [
      'Event Object: All registered P999 members',
      'Event Condition: Invite friends to register through your promotion link and make a deposit of Rs 100+.',
      'Daily reward: Earn Rs 200 extra bonus per valid invite every day.',
      'Automatic settlement: Transferred to your balance at 00:00 every night.',
    ],
  },
  {
    id: 'promo-2',
    badgeNumber: 2,
    title: 'Invitation Bonus ⑤: Weekly sharing Get your reward Rs 999',
    subtitle: 'Share your promotion link on WhatsApp, Facebook, or TikTok to claim Rs 999 weekly bonus.',
    tag: 'WEEKLY ⑤',
    gradient: 'from-[#733512] via-[#8c4217] to-[#471f08]',
    icon: '🎡',
    category: 'event',
    typeFilter: 'cooperate',
    rewardAmount: 999,
    content: [
      'Share your invitation link to at least 3 social media groups (WhatsApp/Facebook).',
      'Upload a screenshot or contact online customer service.',
      'Receive Rs 999 free cash gift every Monday morning.',
    ],
  },
  {
    id: 'promo-3',
    badgeNumber: 3,
    title: 'Invitation Bonus ⑥: Task Reward Rs 500',
    subtitle: 'Complete invitation task milestone to claim cumulative reward Rs 500.',
    tag: 'TASK ⑥',
    gradient: 'from-[#17456b] via-[#1e5887] to-[#0c283f]',
    icon: '🎯',
    category: 'event',
    typeFilter: 'cooperate',
    rewardAmount: 500,
    content: [
      'Complete 5 new player invitations in one week.',
      'Enjoy an additional Rs 500 milestone task reward with 1x wagering requirement.',
    ],
  },
  {
    id: 'promo-4',
    badgeNumber: 4,
    title: 'Invitation Bonus ⑦: Share with friends to receive reward Rs 10,000',
    subtitle: 'Monthly leaderboard bonus! Top agent network receives grand prize Rs 10,000.',
    tag: 'GRAND ⑦',
    gradient: 'from-[#6e1939] via-[#872147] to-[#450e23]',
    icon: '👑',
    category: 'event',
    typeFilter: 'cooperate',
    rewardAmount: 10000,
    content: [
      'Grand monthly alliance event with maximum payout up to Rs 10,000.',
      'Direct players volume is counted toward monthly agent rating.',
    ],
  },
  {
    id: 'promo-5',
    badgeNumber: 5,
    title: 'Brand Alliance: Q789.com Dual Certification of Reputation and Strength',
    subtitle: 'Certified strategic partnership with global casino license guarantees 100% fair RNG & security.',
    tag: 'ALLIANCE',
    gradient: 'from-[#0e274d] via-[#14376b] to-[#081830]',
    icon: '🛡️',
    category: 'event',
    typeFilter: 'connect',
    content: [
      'P999 and Q789.com dual certification ensures safe withdrawals and licensed gaming servers.',
    ],
  },
  {
    id: 'promo-6',
    badgeNumber: 6,
    title: 'Daily rankings Deposit competition - I will be the champion',
    subtitle: 'Daily deposit leaderboard! Top 10 depositors win up to Rs 50,000 champion jackpot.',
    tag: 'CHAMPION',
    gradient: 'from-[#824f11] via-[#9e6216] to-[#472a06]',
    icon: '🏆',
    category: 'event',
    typeFilter: 'all',
    rewardAmount: 50000,
    content: [
      'Deposit daily using JazzCash or EasyPaisa to climb the ranking board.',
      'Top 10 winners announced daily at 23:59 PKT.',
    ],
  },
  {
    id: 'promo-7',
    badgeNumber: 7,
    title: 'Invitation Bonus ③: Up to 3.0% commission reward per day',
    subtitle: 'Unlimited agency commission: Earn 3.0% daily rebate on all player turnover in your team.',
    tag: 'COMMISSION 3%',
    gradient: 'from-[#175239] via-[#1f6e4d] to-[#0c3021]',
    icon: '✈️',
    category: 'rebate',
    typeFilter: 'all',
    content: [
      'Infinite range agency structure.',
      'Daily commission calculation: Total Valid Bets * Commission Rate (up to 3.0%).',
    ],
  },
  {
    id: 'promo-8',
    badgeNumber: 8,
    title: 'Deposit Bonus: Daily Deposit Game Next Day Bonus Up to Rs 99,999',
    subtitle: 'Recharge today and receive next-day rebate bonus up to Rs 99,999 in your inbox.',
    tag: 'NEXT DAY',
    gradient: 'from-[#1c3363] via-[#244382] to-[#0f1d38]',
    icon: '⚡',
    category: 'event',
    typeFilter: 'all',
    content: [
      'All deposits made from 00:00 to 23:59 qualify for 5% to 15% next-day cash back.',
    ],
  },
  {
    id: 'promo-9',
    badgeNumber: 9,
    title: 'Redeem code money: Follow the Telegram channel and get cash rewards Rs 10-99,999',
    subtitle: 'Join @P999_Official on Telegram. Daily exclusive redeem codes dropped every hour!',
    tag: 'REDEEM CODE',
    gradient: 'from-[#541f6e] via-[#6d298f] to-[#300f3f]',
    icon: '🎟️',
    category: 'mission',
    typeFilter: 'connect',
    content: [
      'Click the Redeem Code button and enter your 8-digit promo code to claim free cash.',
    ],
  },
  {
    id: 'promo-10',
    badgeNumber: 10,
    title: 'New Member Bonus: First deposit Maximum reward Rs 5,000',
    subtitle: '100% First Deposit Match Bonus. Deposit Rs 500 get Rs 500 free, deposit Rs 5,000 get Rs 5,000 free!',
    tag: 'FIRST DEPOSIT',
    gradient: 'from-[#1b5e32] via-[#247a42] to-[#0d331a]',
    icon: '🇵🇰',
    category: 'unclaimed',
    typeFilter: 'all',
    rewardAmount: 500,
    content: [
      'Available once for new members on their first deposit.',
      'Deposit Rs 100+ to activate.',
    ],
  },
  {
    id: 'promo-11',
    badgeNumber: 11,
    title: 'Loss subsidy: Game loss subsidy up to 8%',
    subtitle: 'Play worry-free! If your net loss reaches Rs 500+, receive an 8% rescue bonus back.',
    tag: 'RESCUE 8%',
    gradient: 'from-[#732228] via-[#8c2c33] to-[#421014]',
    icon: '🪂',
    category: 'rebate',
    typeFilter: 'all',
    content: [
      'Calculated based on daily net losses.',
      'Automatic rescue credits credited every morning at 06:00 PKT.',
    ],
  },
  {
    id: 'promo-12',
    badgeNumber: 12,
    title: 'Mysterious bonus: You can participate in the big draw every day',
    subtitle: 'Every day at 12:00 and 20:00, all active players participate in the lucky mystery draw.',
    tag: 'MYSTERY',
    gradient: 'from-[#8c6b12] via-[#ab8318] to-[#4f3c06]',
    icon: '🎁',
    category: 'event',
    typeFilter: 'all',
    content: [
      'Random lucky cash drops from Rs 50 to Rs 100,000.',
    ],
  },
  {
    id: 'promo-13',
    badgeNumber: 13,
    title: 'VIP Club: VIP treatment Exclusive VIP rewards',
    subtitle: 'Level up your VIP tier to unlock exclusive upgrade bonuses, birthday gifts, and weekly salary.',
    tag: 'VIP CLUB',
    gradient: 'from-[#3e226e] via-[#512d8f] to-[#20103b]',
    icon: '👑',
    category: 'vip',
    typeFilter: 'all',
    content: [
      'Upgrade rewards from VIP 1 to VIP 10.',
      'Higher VIP levels enjoy faster zero-fee withdrawals and higher daily betting rebates.',
    ],
  },
];

export const ActivityTab: React.FC<ActivityTabProps> = ({
  user,
  onClaimDailyCheckIn,
  onClaimVipReward,
  onBack,
  onOpenDeposit,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<PromoCategory>('event');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cooperate' | 'connect'>('all');
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);
  
  // Redeem code modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemMessage, setRedeemMessage] = useState<string | null>(null);

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) return;
    soundService.playWin();
    triggerWinConfetti();
    const bonus = 188;
    onClaimDailyCheckIn(1, bonus);
    setRedeemMessage(`🎉 Success! Redeemed Rs ${bonus} Cash Bonus!`);
    setRedeemCode('');
  };

  const filteredEvents = PROMO_EVENTS.filter((item) => {
    const matchCat = activeTab === 'event' 
      ? true 
      : item.category === activeTab;
    const matchFilter = activeFilter === 'all' 
      ? true 
      : item.typeFilter === activeFilter;
    return matchCat && matchFilter;
  });

  return (
    <div className="space-y-3 pb-24 max-w-3xl mx-auto text-slate-100">
      {/* 1. Header Bar with Back button */}
      <div className="flex items-center justify-between bg-[#081524] border-b border-slate-800 px-3 py-2 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base font-bold text-white tracking-wide">Promo Center</h2>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            setShowRedeemModal(true);
          }}
          className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 px-3 py-1 rounded-full text-xs font-black shadow flex items-center gap-1 cursor-pointer"
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Redeem Code</span>
        </button>
      </div>

      {/* 2. Top Category Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0a1728] rounded-xl px-1 py-1">
        {[
          { id: 'event' as PromoCategory, label: 'Event (4)', badge: '4' },
          { id: 'unclaimed' as PromoCategory, label: 'Unclaimed (1)', badge: '1' },
          { id: 'mission' as PromoCategory, label: 'Mission (1)', badge: '1' },
          { id: 'vip' as PromoCategory, label: 'VIP' },
          { id: 'rebate' as PromoCategory, label: 'Rebate' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundService.playClick();
                setActiveTab(tab.id);
              }}
              className={`relative flex-1 py-2 px-1 text-center text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'text-amber-400 font-black border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-filter Chips & Action Buttons Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Left Filter Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all' as const, label: 'All (4)', icon: '▦' },
            { id: 'cooperate' as const, label: 'cooperate (4)', icon: '🤝' },
            { id: 'connect' as const, label: 'connect', icon: '📢' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                soundService.playClick();
                setActiveFilter(pill.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 whitespace-nowrap ${
                activeFilter === pill.id
                  ? 'bg-[#10243e] text-amber-300 border-amber-400/50 shadow'
                  : 'bg-[#081524] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <span>{pill.icon}</span>
              <span>{pill.label}</span>
            </button>
          ))}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => soundService.playClick()}
            className="px-2.5 py-1 rounded-xl bg-[#081524] border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <Clock className="w-3 h-3 text-slate-400" />
            <span>History</span>
          </button>
          <button
            onClick={() => {
              soundService.playClick();
              alert('Promotional rewards and conditions refreshed!');
            }}
            className="px-2.5 py-1 rounded-xl bg-[#081524] border border-slate-800 text-[11px] text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4. Promotional Cards List */}
      <div className="space-y-2.5">
        {filteredEvents.map((promo, idx) => (
          <div
            key={promo.id}
            onClick={() => {
              soundService.playClick();
              setSelectedPromo(promo);
            }}
            className="group relative bg-[#0b182b] border border-slate-700/60 hover:border-amber-400/80 rounded-2xl p-3 shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
          >
            {/* Metallic Badge Accent & Badge Number */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* Banner Icon */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${promo.gradient} border border-white/20 flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition`}>
                  {promo.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[9px] font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                      {promo.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {promo.subtitle}
                  </p>
                </div>
              </div>

              <span className="text-[9px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full shrink-0">
                {promo.tag}
              </span>
            </div>

            {/* Bottom info bar */}
            <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Permanent Event &bull; Real-time Settlement
              </span>

              <span className="text-amber-300 font-bold group-hover:translate-x-1 transition flex items-center gap-0.5">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Detail Modal for Selected Event */}
      {selectedPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow text-slate-950">
                  {selectedPromo.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedPromo.title}</h3>
                  <span className="text-[10px] text-amber-300 font-mono">{selectedPromo.tag}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPromo(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0e223d] rounded-2xl p-3 border border-slate-700/60 space-y-2 text-xs">
              <h4 className="font-bold text-amber-300 uppercase tracking-wide text-[11px]">
                Event Rules &amp; Settlement
              </h4>
              <ul className="space-y-1.5 text-slate-300 leading-relaxed">
                {selectedPromo.content.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedPromo.rewardAmount && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <span className="text-xs text-emerald-300 font-bold">Reward Amount:</span>
                <span className="text-base font-black text-amber-300 font-mono">
                  ₨ {selectedPromo.rewardAmount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedPromo(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  soundService.playWin();
                  triggerWinConfetti();
                  if (selectedPromo.rewardAmount) {
                    onClaimDailyCheckIn(1, selectedPromo.rewardAmount);
                  }
                  alert(`Participated in ${selectedPromo.title}! Check your balance or settlement records.`);
                  setSelectedPromo(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-xs shadow transition cursor-pointer"
              >
                Participate / Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Redeem Promo Code Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Redeem Coupon Code</h3>
              </div>
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setRedeemMessage(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Enter your promo code from the official Telegram channel <strong className="text-sky-400">@P999_Official</strong> to receive instant cash bonuses.
            </p>

            {redeemMessage ? (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                {redeemMessage}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter 8-digit Redeem Code..."
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#0e223d] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-amber-300 font-mono tracking-widest uppercase focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRedeemCode('P999BONUS');
                    }}
                    className="text-[10px] text-amber-300 underline"
                  >
                    Use Sample Code: P999BONUS
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleRedeemCode}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold text-xs shadow hover:from-amber-300 transition cursor-pointer"
            >
              Claim Cash Bonus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
