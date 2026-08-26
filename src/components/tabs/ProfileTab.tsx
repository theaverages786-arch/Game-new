import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Headphones, 
  Mail, 
  Copy, 
  Check, 
  RotateCcw, 
  ChevronRight, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Globe, 
  HelpCircle, 
  MessageSquare, 
  Smartphone, 
  Moon, 
  LogOut, 
  Edit3,
  Search,
  WalletCards,
  Lock,
  History,
  FileText
} from 'lucide-react';
import { UserAccount, BetRecord } from '../../types';
import { soundService } from '../../services/sound';

interface ProfileTabProps {
  user: UserAccount;
  bets: BetRecord[];
  onOpenAdmin: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw?: () => void;
  onOpenSupport?: () => void;
  onResetDemoBalance: () => void;
  onSelectTab?: (tab: 'lobby' | 'activity' | 'agent' | 'support' | 'profile') => void;
  onOpenAuth?: () => void;
  onBack?: () => void;
  language: 'en' | 'ur' | 'hi';
  onLanguageChange?: (lang: 'en' | 'ur' | 'hi') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  bets,
  onOpenAdmin,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSupport,
  onResetDemoBalance,
  onSelectTab,
  onOpenAuth,
  onBack,
  language,
  onLanguageChange,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [nightMode, setNightMode] = useState(true);
  const [showRecordsModal, setShowRecordsModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const nickname = user.username || '3wtq5zhs';
  const userId = user.id || '193623200';

  const handleCopy = (text: string, key: string) => {
    soundService.playClick();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-3 pb-24 max-w-xl mx-auto text-slate-100">
      {/* 1. Header Bar with Back and Support Icons */}
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
          <h2 className="text-base font-bold text-white tracking-wide">Mine Profile</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              if (onOpenSupport) onOpenSupport();
            }}
            className="p-1.5 rounded-xl bg-[#0e223d] text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
            title="Customer Support"
          >
            <Headphones className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              if (onOpenSupport) onOpenSupport();
            }}
            className="relative p-1.5 rounded-xl bg-[#0e223d] text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center">
              1
            </span>
          </button>
        </div>
      </div>

      {/* 2. User Profile Banner */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar with edit icon */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 p-0.5 shadow-md">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl">
                  {user.avatar || '👧'}
                </div>
              </div>
              <button 
                onClick={() => alert('Avatar customizer: Choose your lucky player portrait in settings.')}
                className="absolute bottom-0 right-0 p-1 rounded-full bg-amber-400 text-slate-950 shadow hover:scale-110 transition cursor-pointer"
              >
                <Edit3 className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {/* Nickname */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <span>{nickname}</span>
                <button
                  onClick={() => handleCopy(nickname, 'nick')}
                  className="text-slate-400 hover:text-amber-300"
                >
                  {copiedKey === 'nick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              {/* ID */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <span>ID: {userId}</span>
                <button
                  onClick={() => handleCopy(userId, 'id')}
                  className="text-slate-400 hover:text-amber-300"
                >
                  {copiedKey === 'id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Balance Indicator with reload */}
          <div className="flex items-center bg-[#081524] border border-slate-700/80 rounded-full px-2.5 py-1 text-xs">
            <span className="mr-1">🇵🇰</span>
            <span className="font-mono font-black text-amber-300 mr-1.5">
              {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <button
              onClick={() => {
                soundService.playCoin();
                onResetDemoBalance();
              }}
              className="text-slate-400 hover:text-amber-300 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Action Buttons: Withdraw & Deposit */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => {
              soundService.playClick();
              if (onOpenWithdraw) onOpenWithdraw();
              else onOpenDeposit();
            }}
            className="py-2.5 px-3 rounded-2xl bg-[#0e223d] hover:bg-[#142d4f] border border-slate-700/60 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <WalletCards className="w-4 h-4 text-sky-400" />
            <span>Withdraw</span>
          </button>

          <button
            onClick={() => {
              soundService.playClick();
              onOpenDeposit();
            }}
            className="relative py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Deposit</span>
            <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[8px] bg-rose-600 text-white font-black">
              +5%
            </span>
          </button>
        </div>
      </div>

      {/* 3. VIP Status Card (White / Light styled card as in screenshot) */}
      <div className="bg-gradient-to-r from-[#f7f8fa] to-[#edf0f5] text-slate-900 rounded-3xl p-4 shadow-lg border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-300 font-black text-xs font-mono shadow">
              V{user.vipLevel || 0}
            </span>
            <span className="text-xs font-bold text-slate-800">VIP Privileges</span>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              if (onSelectTab) onSelectTab('activity');
            }}
            className="text-xs text-slate-600 font-bold flex items-center gap-0.5 hover:text-slate-950 cursor-pointer"
          >
            <span>Next level bonus 0.00</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* VIP Progress Bars */}
        <div className="space-y-1.5 text-[11px]">
          {/* Deposit Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>VIP requires Deposit: 100.00</span>
              <span className="font-mono font-bold text-slate-900">0.00 / 100.00</span>
            </div>
            <div className="w-full bg-slate-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[10%] rounded-full"></div>
            </div>
          </div>

          {/* Bets Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-slate-600 font-medium">
              <span>VIP requires Bets: 800.00</span>
              <span className="font-mono font-bold text-slate-900">0.00 / 800.00</span>
            </div>
            <div className="w-full bg-slate-300 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[5%] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. My Records Row & Manage Withdrawal Row */}
      <div className="space-y-1.5">
        <button
          onClick={() => {
            soundService.playClick();
            setShowRecordsModal(true);
          }}
          className="w-full p-3 rounded-2xl bg-[#0b1b30] border border-slate-700/60 flex items-center justify-between text-xs text-left hover:bg-[#10243e] transition cursor-pointer"
        >
          <span className="font-bold text-slate-200">
            My Records <span className="text-[11px] font-normal text-slate-400 ml-1">Details, records, reports, recover balance</span>
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenWithdraw) onOpenWithdraw();
            else onOpenDeposit();
          }}
          className="w-full p-3 rounded-2xl bg-[#0b1b30] border border-slate-700/60 flex items-center justify-between text-xs text-left hover:bg-[#10243e] transition cursor-pointer"
        >
          <span className="font-bold text-slate-200">Manage withdrawal</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* 5. Clean Vertical Options List */}
      <div className="bg-[#0b1b30] border border-slate-700/60 rounded-3xl p-2 shadow-lg divide-y divide-slate-700/50">
        {/* 1. Invite */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onSelectTab) onSelectTab('agent');
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">👥</span>
            <span className="font-bold">Invite</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-bold">
            <span>Get Rs 600</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </button>

        {/* 2. Discover */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onSelectTab) onSelectTab('activity');
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🧭</span>
            <span className="font-bold">Discover</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-600"></span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </button>

        {/* 3. Profile Info */}
        <button
          onClick={() => {
            soundService.playClick();
            alert(`Account Nickname: ${nickname}\nID: ${userId}\nRegistered Mobile: ${user.phone}\nStatus: Active & Verified`);
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">👤</span>
            <span className="font-bold">Profile</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 4. Security Center */}
        <button
          onClick={() => {
            soundService.playClick();
            setShowSecurityModal(true);
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🛡️</span>
            <span className="font-bold">Security Center</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 5. Find Us */}
        <button
          onClick={() => {
            soundService.playClick();
            window.open('https://p999.one', '_blank');
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🌐</span>
            <span className="font-bold">Find us</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Prevent it from opening</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 6. Language */}
        <button
          onClick={() => {
            soundService.playClick();
            setShowLanguageModal(true);
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🌍</span>
            <span className="font-bold">Language</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="uppercase">{language === 'en' ? 'English' : language === 'ur' ? 'اردو' : 'हिंदी'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        {/* 7. FAQ */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenSupport) onOpenSupport();
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">❓</span>
            <span className="font-bold">FAQ</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 8. Reward Feedback */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenSupport) onOpenSupport();
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🎁</span>
            <span className="font-bold">Reward Feedback</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 9. Login Device */}
        <button
          onClick={() => {
            soundService.playClick();
            alert('Current Login: Android/Web Sandbox Chrome 124.0.0 &bull; IP: 182.185.12.98 (Lahore, PK)');
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">📱</span>
            <span className="font-bold">Login device</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 10. Night Mode Toggle */}
        <div className="w-full px-3 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 text-slate-200">
            <span className="text-sm">🌙</span>
            <span className="font-bold">Night mode</span>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              setNightMode(!nightMode);
            }}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
              nightMode ? 'bg-amber-400' : 'bg-slate-700'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform ${
              nightMode ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* 11. Admin Odds Settings Panel */}
        <button
          onClick={() => {
            soundService.playClick();
            onOpenAdmin();
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-amber-300">
            <span className="text-sm">⚙️</span>
            <span className="font-bold">Admin Logic &amp; RTP Control</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {/* 12. Quit / Switch Account */}
        <button
          onClick={() => {
            soundService.playClick();
            if (onOpenAuth) onOpenAuth();
          }}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs hover:bg-[#0e223d] rounded-xl text-rose-400 transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm">🚪</span>
            <span className="font-bold">Quit / Switch Account</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Records Modal */}
      {showRecordsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Betting Records ({bets.length})</h3>
              <button onClick={() => setShowRecordsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 font-mono text-xs">
              {bets.length === 0 ? (
                <div className="text-center py-6 text-slate-500">No bets placed yet. Play a game to record bets!</div>
              ) : (
                bets.map((b) => (
                  <div key={b.id} className="p-2.5 rounded-xl bg-[#0e223d] border border-slate-700 flex justify-between">
                    <div>
                      <div className="font-bold text-white">{b.gameTitle}</div>
                      <div className="text-[10px] text-slate-400">{b.details}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-300">Bet: ₨ {b.betAmount}</div>
                      <div className={b.winAmount > 0 ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {b.winAmount > 0 ? `+₨ ${b.winAmount}` : 'Lost'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowRecordsModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-sm bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Security Center</h3>
              <button onClick={() => setShowSecurityModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#0e223d] border border-slate-700 flex justify-between items-center">
                <span>Bound Mobile Number</span>
                <span className="text-emerald-400 font-bold">{user.phone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e223d] border border-slate-700 flex justify-between items-center">
                <span>Withdrawal Security PIN</span>
                <span className="text-amber-400 font-bold">Enabled (6-digit)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0e223d] border border-slate-700 flex justify-between items-center">
                <span>Account Encryption</span>
                <span className="text-emerald-400 font-bold">AES-256 Active</span>
              </div>
            </div>

            <button
              onClick={() => setShowSecurityModal(false)}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Security Settings Verified
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {showLanguageModal && onLanguageChange && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
          <div className="w-full max-w-xs bg-[#091526] border border-amber-500/40 rounded-3xl p-4 shadow-2xl space-y-2 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white">Select Language</h3>
              <button onClick={() => setShowLanguageModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {[
              { id: 'en' as const, label: 'English' },
              { id: 'ur' as const, label: 'اردو (Urdu)' },
              { id: 'hi' as const, label: 'हिंदी (Hindi)' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  soundService.playClick();
                  onLanguageChange(l.id);
                  setShowLanguageModal(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex justify-between items-center cursor-pointer ${
                  language === l.id ? 'bg-amber-400 text-slate-950 font-black' : 'bg-[#0e223d] text-white hover:bg-[#142d4f]'
                }`}
              >
                <span>{l.label}</span>
                {language === l.id && <span>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
