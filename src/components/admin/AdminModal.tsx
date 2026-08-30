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
  Lock,
  Activity,
  Flame,
  Gamepad2,
  DollarSign,
  UserCheck,
  UserX,
  Volume2,
  Wrench,
  Percent
} from 'lucide-react';
import { AdminSettings, TransactionRecord, UserAccount, ForcedGameResults } from '../../types';
import { soundService } from '../../services/sound';
import { loadAllUsers, saveAllUsers, saveUserData, defaultPresetUsers } from '../../services/storage';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  onUpdateAdminSettings: (settings: AdminSettings) => void;
  user: UserAccount;
  onUpdateUserBalance: (newBalance: number) => void;
  onSwitchUser?: (newUser: UserAccount) => void;
  transactions: TransactionRecord[];
  onApproveTransaction: (id: string) => void;
  onRejectTransaction: (id: string) => void;
  onResetDatabase?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  onUpdateAdminSettings,
  user,
  onUpdateUserBalance,
  onSwitchUser,
  transactions,
  onApproveTransaction,
  onRejectTransaction,
  onResetDatabase,
}) => {
  const [settings, setSettings] = useState<AdminSettings>(adminSettings);
  const [manualBalanceInput, setManualBalanceInput] = useState<string>(user.balance.toString());
  const [activeTab, setActiveTab] = useState<'stats' | 'odds' | 'transactions' | 'users' | 'system'>('stats');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [allUsersList, setAllUsersList] = useState<UserAccount[]>(loadAllUsers());
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserAccount>(user);

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
      // update local user list
      const updated = allUsersList.map((u) => (u.id === user.id ? { ...u, balance: num } : u));
      setAllUsersList(updated);
      saveAllUsers(updated);
      alert(`Balance updated to ₨ ${num.toLocaleString()}`);
    }
  };

  const handleForcedResultChange = <K extends keyof ForcedGameResults>(
    game: K,
    val: ForcedGameResults[K]
  ) => {
    soundService.playClick();
    const updatedSettings = {
      ...settings,
      forcedResults: {
        ...settings.forcedResults,
        [game]: val,
      },
    };
    setSettings(updatedSettings);
    onUpdateAdminSettings(updatedSettings);
  };

  const handleToggleFreezeUser = (targetId: string) => {
    soundService.playClick();
    const updated = allUsersList.map((u) => {
      if (u.id === targetId) {
        return { ...u, isFrozen: !u.isFrozen };
      }
      return u;
    });
    setAllUsersList(updated);
    saveAllUsers(updated);
  };

  const handleChangeUserVip = (targetId: string, delta: number) => {
    soundService.playClick();
    const updated = allUsersList.map((u) => {
      if (u.id === targetId) {
        const nextVip = Math.max(1, Math.min(10, u.vipLevel + delta));
        return { ...u, vipLevel: nextVip };
      }
      return u;
    });
    setAllUsersList(updated);
    saveAllUsers(updated);
  };

  const pendingTransactions = transactions.filter((t) => t.status === 'pending');
  const totalTurnover = allUsersList.reduce((acc, u) => acc + (u.totalBetAmount || 0), 0) + 1250000;
  const totalDeposits = allUsersList.reduce((acc, u) => acc + (u.totalDeposited || 0), 0) + 780000;
  const totalWithdrawals = allUsersList.reduce((acc, u) => acc + (u.totalWithdrawn || 0), 0) + 420000;
  const grossProfit = totalDeposits - totalWithdrawals;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div 
        className="w-full max-w-3xl bg-[#0b101d] border-2 border-amber-500/60 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto text-white"
        id="admin-master-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center text-slate-950 font-black shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wide">
                  777 Master Admin &amp; Control Centre
                </h3>
                <span className="text-[10px] bg-red-500/30 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded font-black">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Real-time GGR, Game Rigging Forcer, KYC Approvals &amp; Settings</p>
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
        <div className="grid grid-cols-5 bg-slate-950 p-1 rounded-2xl border border-slate-800 my-3 gap-1">
          <button
            onClick={() => { soundService.playClick(); setActiveTab('stats'); }}
            className={`py-2 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'stats' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stats</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setActiveTab('odds'); }}
            className={`py-2 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'odds' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RTP / Rig</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setActiveTab('transactions'); }}
            className={`py-2 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 relative ${
              activeTab === 'transactions' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Approvals</span>
            {pendingTransactions.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-2"></span>
            )}
          </button>

          <button
            onClick={() => { soundService.playClick(); setActiveTab('users'); }}
            className={`py-2 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Users</span>
          </button>

          <button
            onClick={() => { soundService.playClick(); setActiveTab('system'); }}
            className={`py-2 rounded-xl text-[11px] font-black transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'system' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">System</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Turnover</div>
                <div className="text-base font-black text-amber-300 font-mono mt-0.5">
                  ₨ {totalTurnover.toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">↑ +14.2% Today</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Deposits</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  ₨ {totalDeposits.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-1">JazzCash &bull; EasyPaisa</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Payouts</div>
                <div className="text-base font-black text-rose-400 font-mono mt-0.5">
                  ₨ {totalWithdrawals.toLocaleString()}
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-1">100% Settled</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3">
                <div className="text-[10px] text-slate-400 uppercase font-bold">House Gross GGR</div>
                <div className="text-base font-black text-yellow-300 font-mono mt-0.5">
                  ₨ {grossProfit.toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-400 font-bold mt-1">Net Margin 46.1%</div>
              </div>
            </div>

            {/* Live System Health */}
            <div className="bg-[#0e1424] border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-200">Server &amp; Node Status</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-bold">
                  ● 100% OPERATIONAL
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-slate-300">
                <div>Active Online Players: <span className="text-amber-300 font-bold">1,842</span></div>
                <div>RNG Hash Speed: <span className="text-amber-300 font-bold">0.4ms</span></div>
                <div>Pending Payouts: <span className="text-amber-300 font-bold">{pendingTransactions.length}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GAME RTP & RESULT FORCER (RIGGING TOOL) */}
        {activeTab === 'odds' && (
          <div className="space-y-4 text-xs">
            {/* Master Outcome Mode Switch */}
            <div className="bg-[#121a30] border-2 border-amber-500/60 rounded-2xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-amber-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  Master Casino Outcome Mode (Instant Override)
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-500/40">
                  {settings.masterOutcomeMode === 'always_win' ? '🔥 100% PLAYER WIN' : settings.masterOutcomeMode === 'always_lose' ? '💀 100% HOUSE WIN' : '⚖️ NORMAL RTP'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Override all games at once. Set forced win, forced loss, or standard probability mode:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    soundService.playClick();
                    setSettings({ ...settings, masterOutcomeMode: 'normal' });
                  }}
                  className={`p-2.5 rounded-xl border text-center font-black transition cursor-pointer ${
                    settings.masterOutcomeMode === 'normal'
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ⚖️ Normal RNG
                </button>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setSettings({ ...settings, masterOutcomeMode: 'always_win' });
                  }}
                  className={`p-2.5 rounded-xl border text-center font-black transition cursor-pointer ${
                    settings.masterOutcomeMode === 'always_win'
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🌟 Force Win (100%)
                </button>
                <button
                  onClick={() => {
                    soundService.playClick();
                    setSettings({ ...settings, masterOutcomeMode: 'always_lose' });
                  }}
                  className={`p-2.5 rounded-xl border text-center font-black transition cursor-pointer ${
                    settings.masterOutcomeMode === 'always_lose'
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ❌ Force Loss (0%)
                </button>
              </div>
            </div>

            {/* Global Win / Loss Percentage Sliders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs uppercase tracking-wide">
                  Global Win &amp; Loss Percentage Controller
                </span>
                <span className="font-mono text-amber-300 font-bold text-sm bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Player Win: {settings.globalWinRate || 65}% | House Retention: {100 - (settings.globalWinRate || 65)}%
                </span>
              </div>

              <div>
                <input
                  type="range"
                  min="5"
                  max="98"
                  value={settings.globalWinRate || 65}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings({ ...settings, globalWinRate: val, rtpPercentage: val + 20 });
                  }}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>5% (Extreme Casino Edge)</span>
                  <span>50% (50/50 Fair)</span>
                  <span>75% (Player Favor)</span>
                  <span>98% (Jackpot Streak)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[
                  { label: '💰 Tight (30% Win)', win: 30, rtp: 80 },
                  { label: '⚖️ Standard (50% Win)', win: 50, rtp: 96 },
                  { label: '🔥 Boosted (75% Win)', win: 75, rtp: 110 },
                  { label: '👑 Mega Luck (95% Win)', win: 95, rtp: 130 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      soundService.playClick();
                      setSettings({ ...settings, globalWinRate: preset.win, rtpPercentage: preset.rtp });
                    }}
                    className={`p-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer text-center ${
                      (settings.globalWinRate || 65) === preset.win
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Game RTP & Loss Override Sliders */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <span className="font-bold text-amber-300 block text-xs uppercase">
                🎮 Individual Game RTP &amp; Profit Margins (%):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'slots_super_ace', name: 'Super Ace 777 Slots', def: 97 },
                  { id: 'slots_fortune_gems', name: 'Fortune Gems Slots', def: 96 },
                  { id: 'slots_money_coming', name: 'Money Coming Slots', def: 96 },
                  { id: 'slots_roma', name: 'Roma Classic Slots', def: 95 },
                  { id: 'crash_aviator', name: 'Aviator Flight Crash', def: 96 },
                  { id: 'cards_teen_patti', name: 'Teen Patti 3-Card', def: 95 },
                  { id: 'teen_patti_2020', name: 'Teen Patti 20-20', def: 95 },
                  { id: 'dragon_tiger', name: 'Dragon vs Tiger Clash', def: 96 },
                  { id: 'cards_andar_bahar', name: 'Andar Bahar Live', def: 95 },
                  { id: 'cards_rummy', name: 'Indian Rummy 13-Card', def: 94 },
                  { id: 'cards_baccarat', name: 'VIP Baccarat Macau', def: 98 },
                  { id: 'cards_blackjack', name: 'Blackjack 21 Classic', def: 98 },
                  { id: 'casino_roulette', name: 'European Roulette 36x', def: 97 },
                  { id: 'zoo_roulette', name: 'Zoo Roulette 24x', def: 95 },
                  { id: 'car_roulette', name: 'Car Roulette 40x', def: 95 },
                  { id: 'seven_up_down', name: '7 Up 7 Down Dice', def: 96 },
                  { id: 'mines_treasure', name: 'Mines Gold Field', def: 95 },
                  { id: 'color_wingo', name: 'WinGo Color Lottery', def: 95 },
                  { id: 'sic_bo', name: 'Macau Sic Bo 180x', def: 96 },
                  { id: 'hilo_game', name: 'Hi-Lo Master Card', def: 96 },
                  { id: 'arcade_plinko', name: 'Plinko 1000x Drops', def: 96 },
                ].map((g) => {
                  const currentRtp = settings.gameRtpOverrides?.[g.id] ?? g.def;
                  return (
                    <div key={g.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-white truncate max-w-[130px]">{g.name}</span>
                        <span className="font-mono font-black text-amber-300">{currentRtp}% RTP</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="140"
                        value={currentRtp}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setSettings({
                            ...settings,
                            gameRtpOverrides: {
                              ...(settings.gameRtpOverrides || {}),
                              [g.id]: val,
                            },
                          });
                        }}
                        className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE RESULT FORCER / RIGGING TOOL */}
            <div className="bg-[#121829] border border-amber-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Next Round Specific Result Override (Rigging Matrix)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Force exact outcomes on the very next round of each game:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {/* Slots Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🎰 Next Slots Spin:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🌟 777 Jackpot', val: '777_jackpot' },
                      { label: '💎 Diamond Win', val: 'diamond_win' },
                      { label: '❌ Force Loss', val: 'loss' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('slots', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.slots === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aviator Crash Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">✈️ Next Aviator Flight:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🚀 Force 50.0x', val: 50 },
                      { label: '🔥 Force 10.0x', val: 10 },
                      { label: '💥 Crash 1.05x', val: 1.05 },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        onClick={() => handleForcedResultChange('crash', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.crash === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* WinGo Color Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🎨 Next WinGo Color:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🟢 Force Green', val: 'green' },
                      { label: '🔴 Force Red', val: 'red' },
                      { label: '🟣 Force Violet', val: 'violet' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('wingo', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.wingo === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dragon vs Tiger Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🐉 Dragon vs Tiger:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🐉 Dragon Win', val: 'dragon' },
                      { label: '🐅 Tiger Win', val: 'tiger' },
                      { label: '🤝 Tie (9x)', val: 'tie' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('dragonTiger', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.dragonTiger === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Teen Patti 20-20 Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">⚡ Teen Patti 20-20:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🅰️ Player A', val: 'playerA' },
                      { label: '🅱️ Player B', val: 'playerB' },
                      { label: '💎 Pair Plus', val: 'pairPlus' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('teenPatti', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.teenPatti === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* European Roulette Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🎡 Roulette:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🔴 Force Red', val: 'red' },
                      { label: '⚫ Force Black', val: 'black' },
                      { label: '🟢 Zero (36x)', val: 'zero' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('roulette', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.roulette === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7 Up 7 Down Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🎲 7 Up 7 Down:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '⬇️ Down (2-6)', val: 'down' },
                      { label: '🌟 Lucky 7 (5.8x)', val: 'lucky7' },
                      { label: '⬆️ Up (8-12)', val: 'up' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('sevenUpDown', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.sevenUpDown === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoo Roulette Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🦁 Zoo Roulette:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🦅 Birds (12x)', val: 'birds' },
                      { label: '🦁 Beasts (12x)', val: 'beasts' },
                      { label: '🦈 Shark (24x)', val: 'shark' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('zooRoulette', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.zooRoulette === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Car Roulette Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🏎️ Car Roulette:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🏎️ Ferrari (40x)', val: 'ferrari' },
                      { label: '⚡ Lambo (30x)', val: 'lambo' },
                      { label: '🚘 BMW (5x)', val: 'bmw' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('carRoulette', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.carRoulette === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Macau Sic Bo Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">🎲 Macau Sic Bo:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🔹 Small (4-10)', val: 'small' },
                      { label: '🔺 Big (11-17)', val: 'big' },
                      { label: '👑 Triple (180x)', val: 'triple' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('sicBo', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.sicBo === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Baccarat Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">👑 VIP Baccarat:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '🔵 Player Win', val: 'player' },
                      { label: '🔴 Banker Win', val: 'banker' },
                      { label: '🟢 Tie (8:1)', val: 'tie' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('baccarat', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.baccarat === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mines Forcer */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-slate-200 block text-[11px]">💣 Mines Gold:</span>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: '🎲 Random', val: 'random' },
                      { label: '💎 Safe Gold', val: 'safe' },
                      { label: '💥 Instant Bomb', val: 'bomb' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        onClick={() => handleForcedResultChange('mines', opt.val as any)}
                        className={`py-1 px-2 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          settings.forcedResults.mines === opt.val
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
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
              Save &amp; Apply All System Logic
            </button>
          </div>
        )}

        {/* TAB 3: FINANCIAL APPROVALS */}
        {activeTab === 'transactions' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 block">Pending Deposit &amp; Withdrawal Requests</span>
              <span className="text-amber-400 font-bold">{pendingTransactions.length} Pending</span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="bg-slate-950 p-6 rounded-2xl text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <div>All deposit and withdrawal queues are clear!</div>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-black text-white flex items-center gap-1.5">
                        <span className={tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}>
                          {tx.type.toUpperCase()}
                        </span>
                        <span>₨ {tx.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({tx.method})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Account: {tx.accountNumber || '03001234567'} &bull; Name: {tx.accountName || 'Player'}
                      </div>
                      {tx.note && <div className="text-[9px] text-amber-400/80">{tx.note}</div>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundService.playWin();
                          onApproveTransaction(tx.id);
                        }}
                        className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          soundService.playClick();
                          onRejectTransaction(tx.id);
                        }}
                        className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
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

        {/* TAB 4: USERS MANAGER */}
        {activeTab === 'users' && (
          <div className="space-y-4 text-xs">
            {/* Active User Balance Quick Setter */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-2">
              <span className="font-bold text-slate-400 block uppercase">Active User: {user.username}</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={manualBalanceInput}
                  onChange={(e) => setManualBalanceInput(e.target.value)}
                  className="flex-1 bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                  placeholder="Set custom balance"
                />
                <button
                  onClick={handleApplyBalance}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  Set ₨
                </button>
              </div>
            </div>

            {/* All Registered Users Table */}
            <div className="space-y-2">
              <span className="font-bold text-slate-300 block">Registered User Accounts</span>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {allUsersList.map((u) => {
                  const isActive = u.id === user.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between ${
                        isActive ? 'bg-amber-500/10 border-amber-400' : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{u.avatar}</span>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {u.isFrozen && (
                              <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black">
                                FROZEN
                              </span>
                            )}
                            <span className="text-[10px] text-amber-400 font-bold">VIP {u.vipLevel}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {u.phone} &bull; Bal: ₨ {u.balance.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleChangeUserVip(u.id, 1)}
                          className="px-2 py-1 bg-slate-800 text-amber-300 rounded-lg text-[10px] font-bold hover:bg-slate-700 cursor-pointer"
                          title="VIP Level Up"
                        >
                          +VIP
                        </button>
                        <button
                          onClick={() => handleToggleFreezeUser(u.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                            u.isFrozen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {u.isFrozen ? 'Unfreeze' : 'Freeze'}
                        </button>
                        {onSwitchUser && !isActive && (
                          <button
                            onClick={() => {
                              soundService.playClick();
                              onSwitchUser(u);
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black hover:bg-amber-400 cursor-pointer"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM BROADCAST & CONTROLS */}
        {activeTab === 'system' && (
          <div className="space-y-4 text-xs">
            {/* Grand Jackpot Editor */}
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

            {/* Referral Commission Rates */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 space-y-2">
              <span className="font-bold text-amber-300 block">Affiliate Commission Tier Rates</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Tier 1 (%)</label>
                  <input
                    type="number"
                    value={settings.referralTier1Rate}
                    onChange={(e) => setSettings({ ...settings, referralTier1Rate: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Tier 2 (%)</label>
                  <input
                    type="number"
                    value={settings.referralTier2Rate}
                    onChange={(e) => setSettings({ ...settings, referralTier2Rate: parseInt(e.target.value) || 20 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center font-bold text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Tier 3 (%)</label>
                  <input
                    type="number"
                    value={settings.referralTier3Rate}
                    onChange={(e) => setSettings({ ...settings, referralTier3Rate: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-center font-bold text-white"
                  />
                </div>
              </div>
            </div>

            {/* Maintenance Mode & Reset */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  soundService.playClick();
                  setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode });
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  settings.maintenanceMode
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {settings.maintenanceMode ? '⚠️ Maintenance Mode ACTIVE' : 'Maintenance Mode: OFF'}
              </button>

              {onResetDatabase && (
                <button
                  onClick={() => {
                    if (confirm('Reset demo state to initial defaults?')) {
                      onResetDatabase();
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Reset DB
                </button>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg"
            >
              Save System Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

