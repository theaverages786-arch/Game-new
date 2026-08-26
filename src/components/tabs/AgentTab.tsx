import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  TrendingUp, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Clock,
  Sparkles,
  Download,
  Send,
  PlusCircle,
  FileText
} from 'lucide-react';
import { UserAccount, ReferralTeamMember } from '../../types';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';

interface AgentTabProps {
  user: UserAccount;
  team: ReferralTeamMember[];
  onClaimCommission: (amount: number) => void;
  onBack?: () => void;
  language: 'en' | 'ur' | 'hi';
}

type InviteSubTab = 'home' | 'sharing' | 'mydata' | 'performance' | 'commission';

export const AgentTab: React.FC<AgentTabProps> = ({
  user,
  team,
  onClaimCommission,
  onBack,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<InviteSubTab>('home');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  
  // Random invite tool
  const [inviteChannel, setInviteChannel] = useState<'sms' | 'email' | 'whatsapp' | 'telegram'>('whatsapp');
  const [importText, setImportText] = useState('');
  const [importCount, setImportCount] = useState(0);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Agency mock data
  const agentId = user.referralCode || '193623200';
  const shareLink = `https://111p999.com/?dl=37a0m8`;
  const unclaimedCommission = 350.0;
  const claimedCommission = 1250.0;
  const yesterdayDirect = 450.0;
  const totalCommission = 1600.0;

  // Countdown timer for next settlement
  const [timeLeft, setTimeLeft] = useState('0 day(s) 10:31:46');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const hours = 23 - now.getHours();
      const minutes = 59 - now.getMinutes();
      const seconds = 59 - now.getSeconds();
      setTimeLeft(`0 day(s) ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyLink = () => {
    soundService.playClick();
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    soundService.playClick();
    navigator.clipboard.writeText(agentId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClaim = () => {
    if (unclaimedCommission <= 0) return;
    soundService.playWin();
    triggerWinConfetti();
    onClaimCommission(unclaimedCommission);
  };

  const handleImportList = () => {
    soundService.playClick();
    const lines = importText.split('\n').filter(l => l.trim().length > 0);
    setImportCount(lines.length);
    alert(`Successfully parsed ${lines.length} contact entries!`);
  };

  const handleSendInvites = () => {
    if (importCount === 0 && !importText.trim()) {
      alert('Please enter or import contact numbers/emails first!');
      return;
    }
    soundService.playWin();
    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  return (
    <div className="space-y-3 pb-24 max-w-2xl mx-auto text-slate-100">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between bg-[#081524] border-b border-slate-800 px-3 py-2.5 rounded-2xl shadow-md">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h2 className="text-base font-bold text-white tracking-wide">Invite</h2>
        </div>
        <button
          onClick={() => setShowRateModal(true)}
          className="text-xs text-amber-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Rules</span>
        </button>
      </div>

      {/* 2. Top Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0a1728] rounded-xl px-1 py-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'home' as InviteSubTab, label: 'Home' },
          { id: 'sharing' as InviteSubTab, label: 'Promotion Sharing' },
          { id: 'mydata' as InviteSubTab, label: 'My Data' },
          { id: 'performance' as InviteSubTab, label: 'Performance' },
          { id: 'commission' as InviteSubTab, label: 'Commission' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundService.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex-1 py-2 px-2 text-center text-xs font-bold transition cursor-pointer whitespace-nowrap ${
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

      {/* 3. Top Scrolling Ticker for Agent Commissions */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs overflow-hidden shadow-inner">
        <span className="text-amber-400 font-bold shrink-0">📢</span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <p className="inline-block animate-marquee text-[11px] text-amber-200 font-mono">
            Agent ID: 40****416 Commission earned today: ₨ 64,695.41 &bull; Agent ID: 88****820 Commission: ₨ 659,630.94 &bull; Agent ID: 99****076: ₨ 74,004.98
          </p>
        </div>
      </div>

      {/* 4. Top Banner Carousel */}
      <div className="bg-gradient-to-r from-[#175239] via-[#1f6e4d] to-[#0c3021] border border-emerald-500/40 rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[9px] font-black uppercase bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full">
            Invitation Bonus ③
          </span>
          <h3 className="text-sm font-black text-white mt-1">
            Up to 3.0% commission reward per day
          </h3>
          <p className="text-[11px] text-emerald-100">
            Invite friends to earn lifetime high rebate turnover rewards!
          </p>
        </div>
        <div className="text-3xl">✈️</div>
      </div>

      {/* 5. Agent Status Box */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-3.5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black text-xs shadow">
              1
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">Agent ID: {agentId}</span>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400/30 px-1.5 py-0.2 rounded">
                  Infinite range
                </span>
              </div>
              <div className="text-[10px] text-slate-400">Settlement date: 26/08/2026</div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Number of audits</span>
            <span className="text-xs font-bold text-white font-mono">0.00</span>
          </div>
        </div>

        {/* Notice Pill */}
        <div className="bg-[#081524] border border-slate-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px]">
          <span className="text-amber-300 font-medium">📢 Max commission 3%, earn big monthly</span>
          <span className="text-slate-400 font-mono text-[10px]">
            (Time until next settlement: {timeLeft})
          </span>
        </div>

        {/* 2x2 Commission Metric Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#0e223d] border border-slate-700/50 rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Claimed Commission</span>
            <span className="text-sm font-black text-white font-mono mt-1">
              ₨ {claimedCommission.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0e223d] border border-slate-700/50 rounded-xl p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase">Unclaimed</span>
              <button
                onClick={handleClaim}
                className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] shadow cursor-pointer"
              >
                Claim
              </button>
            </div>
            <span className="text-sm font-black text-amber-300 font-mono mt-1">
              ₨ {unclaimedCommission.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0e223d] border border-slate-700/50 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase">Yesterday Direct</span>
            <span className="text-sm font-black text-white font-mono block mt-1">
              ₨ {yesterdayDirect.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#0e223d] border border-slate-700/50 rounded-xl p-2.5">
            <span className="text-[10px] text-slate-400 uppercase">Total Commission</span>
            <span className="text-sm font-black text-emerald-400 font-mono block mt-1">
              ₨ {totalCommission.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Invite Friends Box with Link & Share */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-3.5 shadow-lg space-y-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
          Invite Friends
        </h4>

        {/* Invitation Code */}
        <div className="flex items-center justify-between bg-[#081524] p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">My invitation code: <strong className="text-amber-300 font-mono">{agentId}</strong></span>
          <button
            onClick={handleCopyCode}
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Invitation Link */}
        <div className="flex items-center gap-2 bg-[#081524] p-1.5 rounded-xl border border-slate-800 text-xs">
          <input
            type="text"
            readOnly
            value={shareLink}
            className="flex-1 bg-transparent text-amber-300 font-mono px-1.5 outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-slate-950 font-bold rounded-lg transition text-xs shrink-0 cursor-pointer"
          >
            {copiedLink ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <button
            onClick={handleCopyLink}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10243e] hover:bg-[#163052] border border-slate-700/50 transition cursor-pointer"
          >
            <span className="text-base">🔗</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Share</span>
          </button>

          <button
            onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`, '_blank')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10243e] hover:bg-[#163052] border border-slate-700/50 transition cursor-pointer"
          >
            <span className="text-base">📱</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">WhatsApp</span>
          </button>

          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10243e] hover:bg-[#163052] border border-slate-700/50 transition cursor-pointer"
          >
            <span className="text-base">📘</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Facebook</span>
          </button>

          <button
            onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}`, '_blank')}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10243e] hover:bg-[#163052] border border-slate-700/50 transition cursor-pointer"
          >
            <span className="text-base">✈️</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">Telegram</span>
          </button>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#10243e] hover:bg-[#163052] border border-slate-700/50 transition cursor-pointer"
          >
            <span className="text-base">📷</span>
            <span className="text-[10px] font-bold text-slate-200 mt-1">QR Code</span>
          </button>
        </div>
      </div>

      {/* 7. Action Navigation Rows */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            soundService.playClick();
            alert('Sub-level agent creation portal active. New subordinates will automatically inherit your tier rates.');
          }}
          className="p-3 rounded-2xl bg-[#0b1b30] border border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Create sub-level &gt;</span>
          </div>
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            setShowRateModal(true);
          }}
          className="p-3 rounded-2xl bg-[#0b1b30] border border-slate-700/60 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-amber-300 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Commission Rate &gt;</span>
          </div>
        </button>
      </div>

      {/* 8. Random Invite Tool (SMS / Email / WhatsApp / Telegram) */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-2xl p-3.5 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">
            Random invite 📢 <strong className="text-amber-300">3% commission</strong>
          </span>
          <span className="text-[10px] text-slate-400">Up to 200 entries/import</span>
        </div>

        {/* Channels */}
        <div className="flex items-center gap-1.5">
          {[
            { id: 'whatsapp' as const, label: 'WhatsApp' },
            { id: 'sms' as const, label: 'SMS' },
            { id: 'telegram' as const, label: 'Telegram' },
            { id: 'email' as const, label: 'Email' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => {
                soundService.playClick();
                setInviteChannel(c.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                inviteChannel === c.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-[#081524] text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          rows={3}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder={`Paste contact list (one per line, e.g. +923001234567)...`}
          className="w-full bg-[#081524] border border-slate-700/80 rounded-xl p-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
        />

        {sendSuccess && (
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold text-center">
            🎉 Invitation batch transmitted successfully!
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-400">Quantity: {importCount} contacts</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleImportList}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Import
            </button>
            <button
              onClick={handleSendInvites}
              className="px-4 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow hover:from-amber-300 cursor-pointer"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-[#091526] border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4 text-center animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Save Invitation Card</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-white p-3 rounded-2xl mx-auto w-48 h-48 flex items-center justify-center shadow-lg border-4 border-amber-400">
              <div className="text-slate-950 font-black text-center space-y-2">
                <div className="w-36 h-36 border-4 border-black p-2 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-black"></div>
                    <div className="w-6 h-6 bg-black"></div>
                  </div>
                  <div className="text-[10px] font-mono font-black text-black">
                    P999-{agentId}
                  </div>
                  <div className="flex justify-between">
                    <div className="w-6 h-6 bg-black"></div>
                    <div className="w-4 h-4 bg-black rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-amber-300">Invite Code: {agentId}</div>
              <div className="text-[10px] text-slate-400 truncate">{shareLink}</div>
            </div>

            <button
              onClick={() => {
                soundService.playWin();
                alert('Invitation poster saved to device photos!');
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow hover:from-amber-300 cursor-pointer"
            >
              Save Poster
            </button>
          </div>
        </div>
      )}

      {/* Commission Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Agency Commission Rules</h3>
              <button onClick={() => setShowRateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-[#0e223d] rounded-2xl p-3 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 font-bold text-amber-300">
                <span>Tier Level</span>
                <span>Turnover Volume</span>
                <span>Rebate Rate</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Tier 1 (Direct)</span>
                <span>₨ 0 - 50,000</span>
                <span className="font-bold text-emerald-400">1.0%</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Tier 2 (Bronze)</span>
                <span>₨ 50,000 - 200,000</span>
                <span className="font-bold text-emerald-400">1.5%</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Tier 3 (Silver)</span>
                <span>₨ 200,000 - 1,000,000</span>
                <span className="font-bold text-emerald-400">2.0%</span>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <span>Tier 4 (Gold)</span>
                <span>₨ 1,000,000+</span>
                <span className="font-bold text-amber-300">3.0%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Commission is calculated automatically from total valid bets of all players in your sub-tree and credited directly to your withdrawable balance daily.
            </p>

            <button
              onClick={() => setShowRateModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 transition cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
