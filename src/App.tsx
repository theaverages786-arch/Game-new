import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, MainTab } from './components/Navbar';
import { Marquee } from './components/Marquee';
import { DrawerMenu } from './components/DrawerMenu';

// Landing & Auth
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';

// Tabs
import { LobbyTab } from './components/tabs/LobbyTab';
import { ActivityTab } from './components/tabs/ActivityTab';
import { AgentTab } from './components/tabs/AgentTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { SupportTab } from './components/tabs/SupportTab';

// Games
import { SlotsGame } from './components/games/SlotsGame';
import { CrashGame } from './components/games/CrashGame';
import { ColorPredictionGame } from './components/games/ColorPredictionGame';
import { MinesGame } from './components/games/MinesGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { DragonTigerGame } from './components/games/DragonTigerGame';
import { SuperAceGame } from './components/games/SuperAceGame';
import { FortuneGemsGame } from './components/games/FortuneGemsGame';
import { MoneyComingGame } from './components/games/MoneyComingGame';
import { TeenPattiGame } from './components/games/TeenPattiGame';
import { AndarBaharGame } from './components/games/AndarBaharGame';
import { RouletteGame } from './components/games/RouletteGame';
import { FishingGame } from './components/games/FishingGame';
import { PlinkoGame } from './components/games/PlinkoGame';
import { ChickenRoadGame } from './components/games/ChickenRoadGame';
import { PiggyBankGame } from './components/games/PiggyBankGame';
import { SportsbookGame } from './components/games/SportsbookGame';
import { FortunePGSlotGame } from './components/games/FortunePGSlotGame';
import { Crazy777Game } from './components/games/Crazy777Game';
import { FortuneGarudaGame } from './components/games/FortuneGarudaGame';
import { FCThreePigsGame } from './components/games/FCThreePigsGame';
import { PPCleopatraGame } from './components/games/PPCleopatraGame';
import { LiveCasinoGame } from './components/games/LiveCasinoGame';
import { JILICardsGame } from './components/games/JILICardsGame';
import { CaiShenFishingGame } from './components/games/CaiShenFishingGame';

// Extended Game Suite
import { TeenPatti2020Game } from './components/games/TeenPatti2020Game';
import { RummyGame } from './components/games/RummyGame';
import { TexasHoldemGame } from './components/games/TexasHoldemGame';
import { BlackjackGame } from './components/games/BlackjackGame';
import { BaccaratGame } from './components/games/BaccaratGame';
import { LudoGame } from './components/games/LudoGame';
import { RomaSlotGame } from './components/games/RomaSlotGame';
import { FruitPartySlotGame } from './components/games/FruitPartySlotGame';
import { AztecGemsSlotGame } from './components/games/AztecGemsSlotGame';
import { MegaWinSlotGame } from './components/games/MegaWinSlotGame';
import { GoldenEmpireSlotGame } from './components/games/GoldenEmpireSlotGame';
import { FortuneTreeSlotGame } from './components/games/FortuneTreeSlotGame';
import { BoxingKingSlotGame } from './components/games/BoxingKingSlotGame';
import { ZooRouletteGame } from './components/games/ZooRouletteGame';
import { CarRouletteGame } from './components/games/CarRouletteGame';
import { SevenUpDownGame } from './components/games/SevenUpDownGame';
import { DiceMasterGame } from './components/games/DiceMasterGame';
import { RedVsBlackGame } from './components/games/RedVsBlackGame';
import { SicBoGame } from './components/games/SicBoGame';
import { HiLoGame } from './components/games/HiLoGame';

// Modals
import { AdminModal } from './components/admin/AdminModal';
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { AppDownloadModal } from './components/modals/AppDownloadModal';
import { LiveChatModal } from './components/modals/LiveChatModal';

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  
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
      case 'slots_super_ace':
        return 'Super Ace 777';
      case 'slots_fortune_gems':
        return 'Fortune Gems 777';
      case 'slots_money_coming':
        return 'Money Coming 777';
      case 'crash_aviator':
        return 'Aviator Crash';
      case 'arcade_plinko':
        return 'Plinko Ball Drop';
      case 'color_wingo':
        return 'WinGo Color Lottery';
      case 'dragon_tiger':
        return 'Dragon vs Tiger';
      case 'cards_teen_patti':
        return 'Teen Patti 3-Card';
      case 'cards_andar_bahar':
        return 'Andar Bahar Live';
      case 'casino_roulette':
        return 'European Roulette';
      case 'fishing_ocean_king':
        return 'Fish Hunter 777';
      case 'mines_treasure':
        return 'Mines Gold';
      case 'lucky_wheel':
        return 'Lucky Spin Wheel';
      default:
        return 'Arcade Game';
    }
  };

  const handleUpdateUserBalance = (newBalance: number) => {
    setUser((prev) => ({
      ...prev,
      balance: Math.max(0, newBalance),
    }));
  };

  const handleRecordGameBet = (
    gameId: string,
    title: string,
    bet: number,
    win: number,
    mult: number
  ) => {
    setUser((prev) => {
      const newVipExp = prev.vipExp + Math.round(bet * 0.1);
      const newVipLevel = Math.min(10, Math.floor(newVipExp / 1500) + 1);
      return {
        ...prev,
        vipExp: newVipExp,
        vipLevel: Math.max(prev.vipLevel, newVipLevel),
        totalBetAmount: prev.totalBetAmount + bet,
        totalWonAmount: prev.totalWonAmount + win,
      };
    });

    const newBet: BetRecord = {
      id: 'BET_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      gameId,
      gameTitle: title,
      betAmount: bet,
      winAmount: win,
      multiplier: mult,
      timestamp: Date.now(),
      details: mult > 0 ? `Won x${mult}` : 'Lost',
    };

    setBets((prev) => [newBet, ...prev.slice(0, 49)]);
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
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenDrawer={() => setIsDrawerOpen(true)}
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
            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>📲 APK Bonus Rs 999</span>
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
            {(activeGame === 'spribe_aviator' ||
              activeGame === 'wg_aviator' ||
              activeGame === '2j_aviator' ||
              activeGame === 'wg_crash' ||
              activeGame === 'crash_aviator' ||
              activeGame === 'mg_flyx') && (
              <CrashGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'inout_chicken_road' && (
              <ChickenRoadGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'jdb_piggy_bank' && (
              <PiggyBankGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {(activeGame === '9wickets_sports' ||
              activeGame === 'saba_sports' ||
              activeGame === 'wg_sports') && (
              <SportsbookGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
                provider={
                  activeGame === '9wickets_sports'
                    ? '9wickets'
                    : activeGame === 'saba_sports'
                    ? 'saba'
                    : 'wg'
                }
              />
            )}
            {activeGame === 'pg_slot' && (
              <FortunePGSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'wg_crazy777' && (
              <Crazy777Game
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'jili_fortune_garuda' && (
              <FortuneGarudaGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'fc_slot' && (
              <FCThreePigsGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'pp_slot' && (
              <PPCleopatraGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {(activeGame === 'tg_live' ||
              activeGame === 'pp_live' ||
              activeGame === 'sexy_live') && (
              <LiveCasinoGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
                dealerType={
                  activeGame === 'tg_live'
                    ? 'tg'
                    : activeGame === 'pp_live'
                    ? 'pp'
                    : 'sexy'
                }
              />
            )}
            {(activeGame === 'jili_cards' || activeGame === 'kingmidas_cards') && (
              <JILICardsGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
                gameType={activeGame === 'kingmidas_cards' ? 'kingmidas' : '7up'}
              />
            )}
            {(activeGame === 'jili_happy_fishing' ||
              activeGame === 'wg_caishen_fishing' ||
              activeGame === 'ygr_fishing' ||
              activeGame === 'fishing_ocean_king') && (
              <CaiShenFishingGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
                theme={
                  activeGame === 'jili_happy_fishing'
                    ? 'happy'
                    : activeGame === 'ygr_fishing'
                    ? 'ygr'
                    : 'caishen'
                }
              />
            )}
            {(activeGame === 'spribe_mines' || activeGame === 'mines_treasure') && (
              <MinesGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_777' && (
              <SlotsGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_super_ace' && (
              <SuperAceGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_fortune_gems' && (
              <FortuneGemsGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_money_coming' && (
              <MoneyComingGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'arcade_plinko' && (
              <PlinkoGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
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
            {activeGame === 'dragon_tiger' && (
              <DragonTigerGame
                balance={user.balance}
                onBet={handleGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_teen_patti' && (
              <TeenPattiGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_andar_bahar' && (
              <AndarBaharGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'casino_roulette' && (
              <RouletteGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
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
            {activeGame === 'teen_patti_2020' && (
              <TeenPatti2020Game
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_rummy' && (
              <RummyGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_texas_holdem' && (
              <TexasHoldemGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_blackjack' && (
              <BlackjackGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'cards_baccarat' && (
              <BaccaratGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'arcade_ludo' && (
              <LudoGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_roma' && (
              <RomaSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_fruit_party' && (
              <FruitPartySlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_aztec_gems' && (
              <AztecGemsSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_mega_win' && (
              <MegaWinSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_golden_empire' && (
              <GoldenEmpireSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_fortune_tree' && (
              <FortuneTreeSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'slots_boxing_king' && (
              <BoxingKingSlotGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'zoo_roulette' && (
              <ZooRouletteGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'car_roulette' && (
              <CarRouletteGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'seven_up_down' && (
              <SevenUpDownGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'dice_master' && (
              <DiceMasterGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'red_vs_black' && (
              <RedVsBlackGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'sic_bo' && (
              <SicBoGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
                onBack={() => setActiveGame(null)}
                adminSettings={adminSettings}
              />
            )}
            {activeGame === 'hilo_game' && (
              <HiLoGame
                userBalance={user.balance}
                onUpdateBalance={handleUpdateUserBalance}
                onRecordBet={handleRecordGameBet}
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
                onOpenSupport={() => {
                  setActiveTab('support');
                }}
                language={language}
              />
            )}
            {activeTab === 'activity' && (
              <ActivityTab
                user={user}
                onClaimDailyCheckIn={handleDailyCheckIn}
                onClaimVipReward={() => {}}
                onBack={() => setActiveTab('lobby')}
                onOpenDeposit={() => setIsDepositOpen(true)}
                language={language}
              />
            )}
            {activeTab === 'agent' && (
              <AgentTab
                user={user}
                team={team}
                onClaimCommission={handleClaimCommission}
                onBack={() => setActiveTab('lobby')}
                language={language}
              />
            )}
            {activeTab === 'support' && (
              <SupportTab
                onBack={() => setActiveTab('lobby')}
                onOpenLiveChat={() => setIsLiveChatOpen(true)}
                language={language}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                bets={bets}
                onOpenAdmin={() => setIsAdminOpen(true)}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onOpenWithdraw={() => setIsWithdrawOpen(true)}
                onOpenSupport={() => {
                  setActiveTab('support');
                }}
                onResetDemoBalance={handleResetDemoBalance}
                onSelectTab={(tab) => setActiveTab(tab)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBack={() => setActiveTab('lobby')}
                language={language}
                onLanguageChange={setLanguage}
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

      {/* Sliding Navigation Left Drawer */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onSelectTab={(tab) => {
          setIsLandingView(false);
          setActiveTab(tab);
        }}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDownload={() => setIsDownloadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        language={language}
        onLanguageChange={setLanguage}
      />

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

      {/* 24/7 Live Customer Chat Modal */}
      <LiveChatModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        userId={user.id}
      />
    </div>
  );
}
