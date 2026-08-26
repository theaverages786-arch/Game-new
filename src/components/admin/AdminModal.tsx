import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sliders, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react';
import { AdminSettings, TransactionRecord, UserAccount } from '../../types';
import { soundService } from '../../services/sound';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  user: UserAccount;
  onUpdateUserBalance: (newBalance: number) => void;
  transactions: TransactionRecord[];
  onApproveTransaction: (id: string) => void;
  onRejectTransaction: (id: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  user,
  onUpdateUserBalance,
  transactions,
  onApproveTransaction,
  onRejectTransaction,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(adminSettings);
  const [manualBalanceInput, setManualBalanceInput] = useState<string>(user.balance.toString());
  const [activeTab, setActiveTab] = useState<'odds' | 'transactions' | 'users'>('odds');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveSettings = () => {
    soundService.playClick();
    onUpdateAdminSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleApplyBalance = () => {
    const num = parseFloat(manualBalanceInput);
    if (!isNaN(num)) {
      soundService.playCoin();
      onUpdateUserBalance(num);
      alert(`User balance updated to ₨ ${num.toLocaleString()}`);
    }
  };

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-[#0b101d] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wide">
                777 System &amp; Game Logic Admin Panel
              </h3>
              <p className="text-[10px] text-slate-400">Master Odds &bull; Payout Algorithm &bull; User Controls</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 my-3">
          <button
            onClick={() => setActiveTab('odds')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'odds' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
            }`}
          >
            Game RTP &amp; Odds
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer relative ${
              activeTab === 'transactions' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
            }`}
          >
            Financial Approvals ({pendingTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400'
            }`}
          >
            User Balance Manager
          </button>
        </div>

        {/* Tab 1: Game RTP & Odds Logic */}
        {activeTab === 'odds' && (
          <div className="space-y-4 text-xs">
            {/* Global RTP Mode */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block uppercase">
                Return to Player (RTP) Algorithm Mode:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSettings({ ...settings, rtpMode: 'fair', rtpPercentage: 96.5 })}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                    settings.rtpMode === 'fair'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">Standard Fair (96.5%)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Realistic standard casino mathematics</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, rtpMode: 'high_win', rtpPercentage: 120 })}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                    settings.rtpMode === 'high_win'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">High Win / Promo (120%)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Boosts wins for demo &amp; testing</div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, rtpMode: 'house_edge', rtpPercentage: 85 })}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition ${
                    settings.rtpMode === 'house_edge'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">House Edge (85%)</div>
                  <div className="text-[10px] text-slate-400 mt-1">Max platform retention logic</div>
                </button>
              </div>
            </div>

            {/* Jackpot Pool Editor */}
            <div className="space-y-1">
              <span className="font-bold text-slate-300">Slots Grand Jackpot Pool (PKR)</span>
              <input
                type="number"
                value={settings.slotsJackpotPool}
                onChange={(e) =>
                  setSettings({ ...settings, slotsJackpotPool: parseInt(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Announcement Banner Editor */}
            <div className="space-y-1">
              <span className="font-bold text-slate-300">Platform Marquee Announcement Broadcast</span>
              <input
                type="text"
                value={settings.systemNotice}
                onChange={(e) => setSettings({ ...settings, systemNotice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            {saveSuccess && (
              <div className="bg-emerald-600 text-white p-2.5 rounded-xl font-bold text-xs text-center">
                ✓ Admin settings applied successfully!
              </div>
            )}

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
            >
              Save &amp; Apply System Logic
            </button>
          </div>
        )}

        {/* Tab 2: Financial Approvals */}
        {activeTab === 'transactions' && (
          <div className="space-y-3 text-xs">
            <span className="font-bold text-slate-300 block">Pending Deposits &amp; Withdrawals</span>
            {pendingTransactions.length === 0 ? (
              <div className="bg-slate-950 p-4 rounded-2xl text-center text-slate-500">
                No pending transactions in queue. All payments processed!
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-black text-white">
                        {tx.type.toUpperCase()}: ₨ {tx.amount.toLocaleString()} ({tx.method})
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Account: {tx.accountNumber || 'N/A'} ({tx.accountName || 'N/A'})
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onApproveTransaction(tx.id)}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => onRejectTransaction(tx.id)}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: User Balance Manager */}
        {activeTab === 'users' && (
          <div className="space-y-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 space-y-2">
              <span className="font-bold text-slate-400 block uppercase">Current Active User:</span>
              <div className="flex justify-between font-mono">
                <span className="text-white font-bold">{user.username} ({user.phone})</span>
                <span className="text-amber-300 font-bold">Current: ₨ {user.balance.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-300">Set New Balance (PKR)</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualBalanceInput}
                  onChange={(e) => setManualBalanceInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                />
                <button
                  onClick={handleApplyBalance}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Set Balance
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => onUpdateUserBalance(user.balance + 5000)}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-xl"
              >
                +₨ 5,000
              </button>
              <button
                onClick={() => onUpdateUserBalance(user.balance + 25000)}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-400 font-bold rounded-xl"
              >
                +₨ 25,000
              </button>
              <button
                onClick={() => onUpdateUserBalance(1000)}
                className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400 font-bold rounded-xl"
              >
                Reset to ₨ 1,000
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
