import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, MainTab } from './components/Navbar';
import { Marquee } from './components/Marquee';

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
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
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
  ) => {
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
          onSelectTab={setActiveTab}
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
    </div>
  );
}
