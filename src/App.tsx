import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, MainTab } from './components/Navbar';
import { Marquee } from './components/Marquee';

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';

// Tabs
import { LobbyTab } from './components/tabs/LobbyTab';
import { ActivityTab } from './components/tabs/ActivityTab';
import { AgentTab } from './components/tabs/AgentTab';
import { WalletTab } from './components/tabs/WalletTab';
import { ProfileTab } from './components/tabs/ProfileTab';

// Games
import { SlotsGame } from './components/games/SlotsGame';
import { CrashGame } from './components/games/CrashGame';
import { ColorPredictionGame } from './components/games/ColorPredictionGame';
import { MinesGame } from './components/games/MinesGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { DragonTigerGame } from './components/games/DragonTigerGame';

// Modals
import { AdminModal } from './components/admin/AdminModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { AppDownloadModal } from './components/modals/AppDownloadModal';

// Storage & Types
import { 
  loadUserData, 
  saveUserData, 
  loadTransactions, 
  saveTransactions, 
  loadBets, 
  saveBets, 
  loadAdminSettings, 
  saveAdminSettings, 
  loadTeam 
} from './services/storage';
import { UserAccount, TransactionRecord, BetRecord, AdminSettings, ReferralTeamMember } from './types';

export default function App() {
  const [user, setUser] = useState<UserAccount>(loadUserData);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(loadTransactions);
  const [bets, setBets] = useState<BetRecord[]>(loadBets);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(loadAdminSettings);
  const [team, setTeam] = useState<ReferralTeamMember[]>(loadTeam);

  const [activeTab, setActiveTab] = useState<MainTab>('lobby');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isLandingView, setIsLandingView] = useState<boolean>(false);
  
  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  
  const [language, setLanguage] = useState<'en' | 'ur' | 'hi'>('en');

  // Sync state to local storage
  useEffect(() => {
    saveUserData(user);
  }, [user]);

  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBets(bets);
  }, [bets]);

  useEffect(() => {
    saveAdminSettings(adminSettings);
  }, [adminSettings]);

  // Handle Game Bet Action
  const handleGameBet = (betAmount: number, winAmount: number, details: string) => {
    setUser((prev) => {
      const newBalance = Math.max(0, prev.balance - betAmount + winAmount);
      const newVipExp = prev.vipExp + Math.round(betAmount * 0.1);
      const newVipLevel = Math.min(10, Math.floor(newVipExp / 1500) + 1);

      return {
        ...prev,
        balance: newBalance,
        vipExp: newVipExp,
        vipLevel: Math.max(prev.vipLevel, newVipLevel),
        totalBetAmount: prev.totalBetAmount + betAmount,
        totalWonAmount: prev.totalWonAmount + winAmount,
      };
    });

    const newBet: BetRecord = {
      id: 'BET_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      gameId: activeGame || 'game',
      gameTitle: formatGameTitle(activeGame),
      betAmount,
      winAmount,
      multiplier: betAmount > 0 ? +(winAmount / betAmount).toFixed(2) : 0,
      timestamp: Date.now(),
      details,
    };

    setBets((prev) => [newBet, ...prev.slice(0, 49)]);
  };

  const formatGameTitle = (gameId: string | null) => {
    switch (gameId) {
      case 'slots_777':
        return 'Lucky 777 Slots';
      case 'crash_aviator':
        return 'Aviator Crash';
      case 'color_wingo':
        return 'WinGo Color Lottery';
      case 'mines_treasure':
        return 'Mines Treasure';
      case 'lucky_wheel':
        return 'Lucky Spin Wheel';
      case 'dragon_tiger':
        return 'Dragon vs Tiger';
      default:
        return 'Arcade Game';
    }
  };

  // Launch Game Handler (handles game selection from Landing Page or Lobby)
  const handleLaunchGame = (gameId: string) => {
    setIsLandingView(false);
    setActiveGame(gameId);
  };

  // Deposit Handler
  const handleDeposit = (amount: number, method: string, note?: string) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      unwithdrawnBalance: prev.unwithdrawnBalance + amount,
      totalDeposited: prev.totalDeposited + amount,
    }));

    const newTx: TransactionRecord = {
      id: 'TXN_' + Date.now(),
      type: 'deposit',
      amount,
      method,
      status: 'completed',
      timestamp: Date.now(),
      note,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Withdraw Handler
  const handleWithdraw = (
    amount: number,
    method: string,
    accountNumber: string,
    accountName: string
  ): boolean => {
    if (amount > user.balance) return false;

    setUser((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      unwithdrawnBalance: Math.max(0, prev.unwithdrawnBalance - amount),
      totalWithdrawn: prev.totalWithdrawn + amount,
    }));

    const newTx: TransactionRecord = {
      id: 'TXN_' + Date.now(),
      type: 'withdraw',
      amount,
      method,
      accountNumber,
      accountName,
      status: 'completed',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    return true;
  };

  // Agent Commission Claim
  const handleClaimCommission = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }));

    const newTx: TransactionRecord = {
      id: 'TXN_' + Date.now(),
      type: 'commission',
      amount,
      method: 'Agent Tier Rebate Transfer',
      status: 'completed',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    alert(`₨ ${amount} commission transferred to your wallet balance!`);
  };

  // Daily Streak Check-in
  const handleDailyCheckIn = (day: number, reward: number) => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + reward,
      dailyStreak: Math.min(7, prev.dailyStreak + 1),
    }));

    const newTx: TransactionRecord = {
      id: 'TXN_' + Date.now(),
      type: 'checkin',
      amount: reward,
      method: `Day ${day} Sign-In Reward`,
      status: 'completed',
      timestamp: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    alert(`Day ${day} check-in bonus of ₨ ${reward} claimed!`);
  };

  // Reset/Refill Demo Balance
  const handleResetDemoBalance = () => {
    setUser((prev) => ({
      ...prev,
      balance: prev.balance + 2000,
    }));
  };

  // Transaction Admin Approvals
  const handleApproveTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'completed' } : t))
    );
  };

  const handleRejectTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <Header
        user={user}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onResetDemoBalance={handleResetDemoBalance}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Ticker Marquee */}
      <Marquee notice={adminSettings.systemNotice} />

      {/* View Switcher Header Bar (Landing vs Lobby vs APK) */}
      <div className="max-w-7xl w-full mx-auto px-2 sm:px-4 pt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => {
              setIsLandingView(false);
              setActiveGame(null);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              !isLandingView && !activeGame
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎮 Games Lobby
          </button>
          <button
            onClick={() => {
              setIsLandingView(true);
              setActiveGame(null);
            }}
            className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              isLandingView
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✨ Landing Page
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsDownloadOpen(true)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>📲 APK App</span>
          </button>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>👤 Switch User</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
        {activeGame ? (
          // Render Active Game
          <div>
            {activeGame === 'slots_777' && (
              <SlotsGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'crash_aviator' && (
              <CrashGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'color_wingo' && (
              <ColorPredictionGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'mines_treasure' && (
              <MinesGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'lucky_wheel' && (
              <LuckyWheelGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'dragon_tiger' && (
              <DragonTigerGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
          </div>
        ) : isLandingView ? (
          // Render Landing Page
          <LandingPage
            onPlayGame={handleLaunchGame}
            onOpenLobby={() => {
              setIsLandingView(false);
              setActiveTab('lobby');
            }}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenAppDownload={() => setIsDownloadOpen(true)}
            jackpotAmount={adminSettings.jackpotBalance || 7789420}
          />
        ) : (
          // Render Active Tab
          <div>
            {activeTab === 'lobby' && (
              <LobbyTab
                onSelectGame={(gameId) => setActiveGame(gameId)}
                onOpenDeposit={() => setIsDepositOpen(true)}
                language={language}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityTab
                user={user}
                onClaimDailyCheckIn={handleDailyCheckIn}
                onClaimVipReward={() => {}}
                language={language}
              />
            )}
            {activeTab === 'agent' && (
              <AgentTab
                user={user}
                team={team}
                onClaimCommission={handleClaimCommission}
                language={language}
              />
            )}
            {activeTab === 'wallet' && (
              <WalletTab
                user={user}
                transactions={transactions}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
                language={language}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                bets={bets}
                onOpenAdmin={() => setIsAdminOpen(true)}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onResetDemoBalance={handleResetDemoBalance}
                onOpenSupport={() => {}}
                language={language}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navbar (hidden inside active full game view) */}
      {!activeGame && (
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setIsLandingView(false);
            setActiveTab(tab);
          }}
          language={language}
        />
      )}

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
        user={user}
        onUpdateUserBalance={(newBal) => setUser((prev) => ({ ...prev, balance: newBal }))}
        transactions={transactions}
        onApproveTransaction={handleApproveTransaction}
        onRejectTransaction={handleRejectTransaction}
      />

      {/* Quick Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />

      {/* Quick Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        user={user}
        onWithdraw={handleWithdraw}
      />

      {/* Auth & Switch User Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
      />

      {/* Official APK & WebApp Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />
    </div>
  );
}

