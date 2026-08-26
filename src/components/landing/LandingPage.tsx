import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Download, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Trophy, 
  Gift, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  Star, 
  ArrowUpRight,
  Flame,
  Award,
  CircleDollarSign,
  TrendingUp,
  Percent
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';

interface LandingPageProps {
  onPlayGame: (gameId: string) => void;
  onOpenLobby: () => void;
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onOpenAppDownload: () => void;
  jackpotAmount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onPlayGame,
  onOpenLobby,
  onOpenDeposit,
  onOpenAuth,
  onOpenAppDownload,
  jackpotAmount,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [liveWins, setLiveWins] = useState([
    { user: '0308****412', game: 'Aviator Crash 777', amount: 18500, time: '2s ago' },
    { user: '0345****881', game: 'Mega 777 Slots', amount: 64000, time: '8s ago' },
    { user: '0312****903', game: 'WinGo Color Lottery', amount: 9200, time: '14s ago' },
    { user: '0321****774', game: 'Mines Treasure', amount: 14800, time: '22s ago' },
    { user: '0300****559', game: 'Dragon vs Tiger', amount: 25000, time: '35s ago' },
  ]);

  // Live winners stream ticker
  useEffect(() => {
    const interval = setInterval(() => {
      const randomGames = ['Mega 777 Slots', 'Aviator Crash 777', 'WinGo Color Lottery', 'Mines Treasure', 'Dragon vs Tiger', 'Lucky Wheel'];
      const randomUser = '03' + Math.floor(10 + Math.random() * 89) + '****' + Math.floor(100 + Math.random() * 899);
      const randomAmount = Math.floor(2000 + Math.random() * 75000);
      const newWin = {
        user: randomUser,
        game: randomGames[Math.floor(Math.random() * randomGames.length)],
        amount: randomAmount,
        time: 'Just now',
      };
      setLiveWins((prev) => [newWin, ...prev.slice(0, 5)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const gamesShowcase = [
    {
      id: 'slots',
      title: 'Mega 777 Slots',
      category: 'Slots & Jackpot',
      badge: 'HOT 🔥',
      image: '🎰',
      bgGradient: 'from-amber-600 to-yellow-500',
      multiplier: 'Up to 500x',
      players: '12,450 Playing',
    },
    {
      id: 'crash',
      title: 'Aviator Crash 777',
      category: 'Crash & Multiplier',
      badge: 'POPULAR 🚀',
      image: '✈️',
      bgGradient: 'from-rose-600 to-red-500',
      multiplier: 'Up to 100x',
      players: '18,890 Playing',
    },
    {
      id: 'color',
      title: 'WinGo Color Prediction',
      category: 'Lottery & Parity',
      badge: 'LIVE ⏱️',
      image: '🎨',
      bgGradient: 'from-emerald-600 to-teal-500',
      multiplier: '98.5% Payout',
      players: '9,340 Playing',
    },
    {
      id: 'mines',
      title: 'Mines Treasure 5x5',
      category: 'Arcade & Strategy',
      badge: 'BIG WIN 💎',
      image: '💣',
      bgGradient: 'from-blue-600 to-indigo-500',
      multiplier: 'Custom Risk',
      players: '7,120 Playing',
    },
    {
      id: 'dragon_tiger',
      title: 'Dragon vs Tiger',
      category: 'Live Cards',
      badge: 'FAST 🐉',
      image: '🐉',
      bgGradient: 'from-purple-600 to-violet-500',
      multiplier: 'Instant 2x / 9x',
      players: '5,600 Playing',
    },
    {
      id: 'wheel',
      title: 'Lucky Spin Wheel',
      category: 'Daily Rewards',
      badge: 'FREE 🎁',
      image: '🎡',
      bgGradient: 'from-pink-600 to-rose-500',
      multiplier: 'Guaranteed Prize',
      players: '8,400 Playing',
    },
  ];

  const faqs = [
    {
      q: 'How do I deposit balance via JazzCash and EasyPaisa?',
      a: 'Click on the "Deposit" button, choose JazzCash, EasyPaisa, or Bank Transfer, enter your amount (min ₨ 200), copy our official merchant account details, transfer from your mobile app, and upload the transaction ID. Your balance is instantly credited.',
    },
    {
      q: 'What is the minimum withdrawal amount and how fast is it?',
      a: 'The minimum withdrawal is ₨ 500. Withdrawals are processed 24/7 with zero fees directly into your JazzCash, EasyPaisa, or Pakistani Bank Account within 3 to 10 minutes.',
    },
    {
      q: 'How does the 30% Lifetime Agent Commission work?',
      a: 'Share your personal referral link (e.g. ?dl=8khvdc). Every time your invited players place bets across slots, crash, or lotteries, you automatically earn up to 30% Tier-1, 20% Tier-2, and 10% Tier-3 commission daily.',
    },
    {
      q: 'Are the game results provably fair?',
      a: 'Yes. All slot RNGs, Aviator crash curves, and lottery numbers are certified under GLI-19 standard cryptographic hashes, guaranteeing 100% fair and transparent outcomes.',
    },
  ];

  return (
    <div className="w-full text-white space-y-8 pb-12" id="landing-page-root">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#161c2e] via-[#0f1424] to-[#0a0d18] border-2 border-amber-500/40 p-5 sm:p-8 shadow-2xl">
        {/* Background glow orb */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-xs font-black text-amber-300 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>PAKISTAN & GLOBAL #1 PREMIER GAMING PORTAL &bull; 777p999.com</span>
          </div>

          {/* Big Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            WIN BIG & CASH OUT <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-md">
              INSTANTLY TO JAZZCASH & EASYPAISA
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-medium">
            Experience authentic high-multiplier Slots, Aviator Crash, WinGo Color Prediction, and Mines. Daily 100% First Deposit Bonus and up to 30% Lifetime Agent Rebate.
          </p>

          {/* Grand Jackpot Display */}
          <div className="py-2">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 bg-gradient-to-r from-amber-950/90 via-yellow-900/80 to-amber-950/90 border-2 border-amber-400/60 rounded-3xl px-6 py-3 shadow-2xl shadow-amber-500/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-7 h-7 text-amber-300 animate-bounce" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
                  777 Progressive Grand Jackpot
                </span>
              </div>
              <span className="text-2xl sm:text-4xl font-black text-yellow-300 font-mono tracking-wider">
                ₨ {jackpotAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                soundService.playClick();
                onOpenLobby();
              }}
              className="px-6 sm:px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 text-sm sm:text-base tracking-wider flex items-center gap-2 transform active:scale-95 transition cursor-pointer"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>PLAY GAMES NOW</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onOpenAppDownload();
              }}
              className="px-5 sm:px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-black rounded-2xl shadow-lg text-sm sm:text-base tracking-wider flex items-center gap-2 transform active:scale-95 transition cursor-pointer"
            >
              <Download className="w-5 h-5" />
              <span>DOWNLOAD APK (v2.8)</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onOpenDeposit();
              }}
              className="px-5 sm:px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg shadow-emerald-600/30 text-sm sm:text-base tracking-wider flex items-center gap-2 transform active:scale-95 transition cursor-pointer"
            >
              <CircleDollarSign className="w-5 h-5" />
              <span>CLAIM 100% BONUS</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME LIVE WINNERS TICKER */}
      <section className="bg-[#0e1320] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300">
            <Flame className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>REAL-TIME LIVE PAYOUTS & WINNERS</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            Automated Payout Stream
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {liveWins.slice(0, 3).map((win, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                  👑
                </div>
                <div>
                  <div className="font-bold text-slate-200">{win.user}</div>
                  <div className="text-[10px] text-slate-400">{win.game}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-black text-amber-300 font-mono">+₨ {win.amount.toLocaleString()}</div>
                <div className="text-[9px] text-slate-500">{win.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED GAMES SUITE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              HOT CASINO & ARCADE SUITE
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Click any game to launch immediately with your live balance
            </p>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              onOpenLobby();
            }}
            className="text-xs font-black text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Lobby</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {gamesShowcase.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                soundService.playClick();
                onPlayGame(g.id);
              }}
              className="group relative bg-[#111728] hover:bg-[#151e33] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-4 shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-start justify-between gap-1 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {g.image}
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {g.badge}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                  {g.title}
                </h3>
                <div className="text-[11px] text-slate-400 font-medium">{g.category}</div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-amber-400">{g.multiplier}</span>
                <span className="text-[10px] text-slate-500">{g.players}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PLATFORM ADVANTAGES & TRUST PILLARS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Gift className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-slate-100">100% First Deposit Bonus</h4>
          <p className="text-xs text-slate-400">
            Double your initial bankroll on deposits over ₨ 500 with instant automatic credit.
          </p>
        </div>

        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-slate-100">5-Min Instant Payouts</h4>
          <p className="text-xs text-slate-400">
            24/7 automated withdrawals directly to JazzCash, EasyPaisa, and local bank cards.
          </p>
        </div>

        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-slate-100">30% Lifetime Agent Rebate</h4>
          <p className="text-xs text-slate-400">
            Earn continuous daily commission on every turnover your referrals place.
          </p>
        </div>

        <div className="bg-[#0f1422] border border-amber-500/30 rounded-2xl p-4 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-black text-sm text-slate-100">GLI-19 Certified RNG</h4>
          <p className="text-xs text-slate-400">
            Mathematically audited provably fair algorithms guaranteeing zero tampering.
          </p>
        </div>
      </section>

      {/* 5. APP DOWNLOAD BANNER */}
      <section className="bg-gradient-to-r from-amber-950/60 via-[#182035] to-amber-950/60 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-black">
            <Smartphone className="w-3.5 h-3.5" />
            <span>OFFICIAL MOBILE APP</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Download 777 Premier App for Android & iOS
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Get ultra-low latency game streams, one-touch biometric login, and exclusive APK-only daily recharge bonuses.
          </p>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            onOpenAppDownload();
          }}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/30 text-sm tracking-wider flex items-center gap-2 shrink-0 transform active:scale-95 transition cursor-pointer"
        >
          <Download className="w-5 h-5" />
          <span>DOWNLOAD APK NOW (28.4 MB)</span>
        </button>
      </section>

      {/* 6. VIP CLUB PREVIEW */}
      <section className="bg-[#0d121c] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400">Exclusive Privileges</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">777 VIP Club Tier Rewards</h3>
          <p className="text-xs text-slate-400">Upgrade automatically as you bet to unlock weekly cashbacks and instant gifts</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { level: 'VIP 1', deposit: '₨ 500', bonus: '₨ 50', rebate: '0.4%' },
            { level: 'VIP 3', deposit: '₨ 5,000', bonus: '₨ 500', rebate: '0.8%' },
            { level: 'VIP 5', deposit: '₨ 50,000', bonus: '₨ 5,000', rebate: '1.2%' },
            { level: 'VIP 10', deposit: '₨ 500,000', bonus: '₨ 50,000', rebate: '2.5%' },
          ].map((v, i) => (
            <div key={i} className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 text-center space-y-1">
              <div className="font-black text-amber-300 text-sm">{v.level}</div>
              <div className="text-[11px] text-slate-400">Target: {v.deposit}</div>
              <div className="text-xs font-bold text-emerald-400">Level Bonus: {v.bonus}</div>
              <div className="text-[10px] text-yellow-400 font-mono">Daily Rebate: {v.rebate}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. GAME PROVIDERS */}
      <section className="text-center space-y-3">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Official Game Providers</span>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-70">
          {['PG SOFT', 'PRAGMATIC PLAY', 'JILI GAMES', 'SPRIBE AVIATOR', 'EVOLUTION', 'FASTPAY 777'].map((p, i) => (
            <div key={i} className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-black text-slate-300 tracking-wider">
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="bg-[#0f1422] border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-3">
        <h3 className="text-xl font-black text-slate-100 flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-3.5 text-left font-bold text-sm text-slate-200 hover:text-amber-300 flex items-center justify-between gap-2 cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-amber-400 text-base">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="p-3.5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. RESPONSIBLE GAMING & LICENSING FOOTER */}
      <footer className="pt-4 border-t border-slate-800 text-center space-y-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-bold">
          <span>🔞 18+ Only</span>
          <span>🛡️ Curacao eGaming License #777/JAZ</span>
          <span>🔒 256-Bit SSL Secured</span>
          <span>💎 Provably Fair Certified</span>
        </div>
        <p className="text-[11px] text-slate-600 max-w-xl mx-auto">
          777 Premier Portal adheres to strict responsible gaming regulations. Players must be 18 years or older. Play responsibly.
        </p>
      </footer>
    </div>
  );
};
