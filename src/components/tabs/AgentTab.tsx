import React, { useState } from 'react';
import { 
  Users, 
  Share2, 
  Copy, 
  Check, 
  Coins, 
  TrendingUp, 
  Award, 
  Sparkles,
  QrCode,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { UserAccount, ReferralTeamMember } from '../../types';
import { soundService } from '../../services/sound';
import { triggerWinConfetti } from '../../services/storage';

interface AgentTabProps {
  user: UserAccount;
  team: ReferralTeamMember[];
  onClaimCommission: (amount: number) => void;
  language: 'en' | 'ur' | 'hi';
}

export const AgentTab: React.FC<AgentTabProps> = ({
  user,
  team,
  onClaimCommission,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const referralCode = user.referralCode || '8khvdc';
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?dl=${referralCode}`
    : `https://777p999.com/?dl=${referralCode}`;

  const totalCommissionEarned = team.reduce((acc, m) => acc + m.commissionEarned, 0);
  const totalTeamBet = team.reduce((acc, m) => acc + m.betTotal, 0);
  const unclaimedCommission = 350; // Available rebate ready to claim

  const handleCopyLink = () => {
    soundService.playClick();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaim = () => {
    if (unclaimedCommission <= 0) return;
    soundService.playWin();
    triggerWinConfetti();
    onClaimCommission(unclaimedCommission);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Agent Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-[#0c1424] border border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
              Official Partner &bull; Multi-Tier Rebate
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              777 AGENT PROMOTION SYSTEM
            </h2>
            <p className="text-xs text-emerald-200/80 font-medium max-w-md mt-0.5">
              Invite friends using your exclusive link <strong className="text-amber-300 font-mono">?dl={referralCode}</strong> and earn up to 30% lifetime rebate on all bets!
            </p>
          </div>

          {/* Quick Claim Box */}
          <div className="bg-[#090f1c]/90 border border-emerald-400/40 rounded-2xl p-3 text-center sm:min-w-[180px] shadow-lg">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Available Rebate
            </span>
            <span className="text-lg font-black text-amber-300 font-mono">
              ₨ {unclaimedCommission}
            </span>
            <button
              onClick={handleClaim}
              className="mt-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs py-1.5 rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
            >
              Transfer to Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Share Link & QR Box */}
      <div className="bg-[#0f1526] border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-400" />
            Your Exclusive Invitation Code
          </span>
          <span className="text-xs font-mono font-black text-white bg-amber-500/20 border border-amber-400/40 px-2.5 py-0.5 rounded-lg">
            {referralCode}
          </span>
        </div>

        {/* Copy Link Input Bar */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1.5">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-amber-300 font-mono px-2 outline-none truncate"
          />
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-black transition transform active:scale-95 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          <button
            onClick={() => setShowQr(!showQr)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition cursor-pointer"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Preview */}
        {showQr && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center animate-in zoom-in-95">
            <div className="w-40 h-40 bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center">
              {/* High fidelity simulated QR Code pattern */}
              <div className="w-full h-full border-4 border-black p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black border-2 border-white"></div>
                  <div className="w-8 h-8 bg-black border-2 border-white"></div>
                </div>
                <div className="text-[10px] font-black font-mono text-center text-black">
                  777 - {referralCode}
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 bg-black border-2 border-white"></div>
                  <div className="w-4 h-4 bg-black rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-mono">{shareUrl}</p>
          </div>
        )}
      </div>

      {/* Tier Commission Rates (Level 1, 2, 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-b from-[#161f36] to-[#0e1424] border border-amber-500/30 rounded-2xl p-3 text-center shadow-lg">
          <span className="text-[10px] font-black text-amber-400 uppercase block">Level 1 (Direct)</span>
          <span className="text-xl font-black text-white font-mono">30%</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Tier 1 Direct Player Bets</span>
        </div>
        <div className="bg-gradient-to-b from-[#161f36] to-[#0e1424] border border-emerald-500/30 rounded-2xl p-3 text-center shadow-lg">
          <span className="text-[10px] font-black text-emerald-400 uppercase block">Level 2 (Team)</span>
          <span className="text-xl font-black text-white font-mono">20%</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Secondary Invites</span>
        </div>
        <div className="bg-gradient-to-b from-[#161f36] to-[#0e1424] border border-cyan-500/30 rounded-2xl p-3 text-center shadow-lg">
          <span className="text-[10px] font-black text-cyan-400 uppercase block">Level 3 (Sub-Team)</span>
          <span className="text-xl font-black text-white font-mono">10%</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Tertiary Network</span>
        </div>
      </div>

      {/* Team Statistics & Member List */}
      <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-400" />
            My Referral Team ({team.length} Active Members)
          </h4>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Total Earned: ₨ {totalCommissionEarned.toLocaleString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2 px-2">Member</th>
                <th className="py-2 px-2">Tier Level</th>
                <th className="py-2 px-2">Total Turnover</th>
                <th className="py-2 px-2">Rebate Commission</th>
                <th className="py-2 px-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-slate-900/40">
                  <td className="py-2 px-2 text-slate-200 font-semibold">{member.phoneMasked}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.level === 1
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : member.level === 2
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      Tier {member.level}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-300">₨ {member.betTotal.toLocaleString()}</td>
                  <td className="py-2 px-2 text-emerald-400 font-bold">+₨ {member.commissionEarned}</td>
                  <td className="py-2 px-2 text-slate-500 text-[11px]">{member.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
