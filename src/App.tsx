import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navbar, MainTab } from './components/Navbar';
import { DrawerMenu } from './components/DrawerMenu';

// Main Tabs
import { LobbyTab } from './components/tabs/LobbyTab';
import { ActivityTab } from './components/tabs/ActivityTab';
import { AgentTab } from './components/tabs/AgentTab';
import { SupportTab } from './components/tabs/SupportTab';
import { ProfileTab } from './components/tabs/ProfileTab';
import { WalletTab } from './components/tabs/WalletTab';

// Modals
import { DepositModal } from './components/modals/DepositModal';
import { WithdrawModal } from './components/modals/WithdrawModal';
import { AdminModal } from './components/admin/AdminModal';
import { AuthModal } from './components/auth/AuthModal';
import { LiveChatModal } from './components/modals/LiveChatModal';
import { AppDownloadModal } from './components/modals/AppDownloadModal';
import { RoomLobbyModal } from './components/lobby/RoomLobbyModal';
import { FreeCoinsModal } from './components/modals/FreeCoinsModal';
import { RulesModal } from './components/modals/RulesModal';

// Storage & Services
import {
  loadUserData,
  saveUserData,
  loadTransactions,
  saveTransactions,
  loadBets,
  saveBets,
  loadTeam,
  loadAdminSettings,
  saveAdminSettings,
  triggerWinConfetti,
} from './services/storage';
import { soundService } from './services/sound';
import { UserAccount, BetRecord, TransactionRecord, ReferralTeamMember, AdminSettings } from './types';

// All 45 Game Components
import { LudoGame } from './components/games/LudoGame';
import { TeenPattiGame } from './components/games/TeenPattiGame';
import { TeenPatti2020Game } from './components/games/TeenPatti2020Game';
import { RummyGame } from './components/games/RummyGame';
import { CrashGame } from './components/games/CrashGame';
import { SlotsGame } from './components/games/SlotsGame';
import { SuperAceGame } from './components/games/SuperAceGame';
import { FortuneGemsGame } from './components/games/FortuneGemsGame';
import { MoneyComingGame } from './components/games/MoneyComingGame';
import { Crazy777Game } from './components/games/Crazy777Game';
import { RomaSlotGame } from './components/games/RomaSlotGame';
import { FruitPartySlotGame } from './components/games/FruitPartySlotGame';
import { AztecGemsSlotGame } from './components/games/AztecGemsSlotGame';
import { MegaWinSlotGame } from './components/games/MegaWinSlotGame';
import { GoldenEmpireSlotGame } from './components/games/GoldenEmpireSlotGame';
import { FortuneTreeSlotGame } from './components/games/FortuneTreeSlotGame';
import { FortuneGarudaGame } from './components/games/FortuneGarudaGame';
import { FortunePGSlotGame } from './components/games/FortunePGSlotGame';
import { BoxingKingSlotGame } from './components/games/BoxingKingSlotGame';
import { FCThreePigsGame } from './components/games/FCThreePigsGame';
import { PPCleopatraGame } from './components/games/PPCleopatraGame';
import { AndarBaharGame } from './components/games/AndarBaharGame';
import { DragonTigerGame } from './components/games/DragonTigerGame';
import { TexasHoldemGame } from './components/games/TexasHoldemGame';
import { BlackjackGame } from './components/games/BlackjackGame';
import { BaccaratGame } from './components/games/BaccaratGame';
import { SevenUpDownGame } from './components/games/SevenUpDownGame';
import { RouletteGame } from './components/games/RouletteGame';
import { ZooRouletteGame } from './components/games/ZooRouletteGame';
import { CarRouletteGame } from './components/games/CarRouletteGame';
import { SicBoGame } from './components/games/SicBoGame';
import { DiceMasterGame } from './components/games/DiceMasterGame';
import { HiLoGame } from './components/games/HiLoGame';
import { RedVsBlackGame } from './components/games/RedVsBlackGame';
import { JILICardsGame } from './components/games/JILICardsGame';
import { MinesGame } from './components/games/MinesGame';
import { ChickenRoadGame } from './components/games/ChickenRoadGame';
import { PlinkoGame } from './components/games/PlinkoGame';
import { ColorPredictionGame } from './components/games/ColorPredictionGame';
import { SportsbookGame } from './components/games/SportsbookGame';
import { LiveCasinoGame } from './components/games/LiveCasinoGame';
import { CaiShenFishingGame } from './components/games/CaiShenFishingGame';
import { FishingGame } from './components/games/FishingGame';
import { PiggyBankGame } from './components/games/PiggyBankGame';
import { LuckyWheelGame } from './components/games/LuckyWheelGame';
import { ArcadePage } from './components/arcade/ArcadePage';

export default function App() {
  // Global State
  const [user, setUser] = useState<UserAccount>(loadUserData);
  const [bets, setBets] = useState<BetRecord[]>(loadBets);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(loadTransactions);
  const [team] = useState<ReferralTeamMember[]>(loadTeam);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(loadAdminSettings);

  const [activeTab, setActiveTab] = useState<MainTab | 'wallet'>('lobby');
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [, setActiveRoomCode] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<'en' | 'ur' | 'hi'>('en');

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isFreeCoinsModalOpen, setIsFreeCoinsModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Sync state to persistence
  useEffect(() => {
    saveUserData(user);
  }, [user]);

  useEffect(() => {
    saveAdminSettings(adminSettings);
  }, [adminSettings]);

  // Handlers
  const handleUpdateBalance = (newBalance: number) => {
    setUser((prev) => {
      const updated = { ...prev, balance: Math.max(0, Math.round(newBalance)) };
      saveUserData(updated);
      return updated;
    });
  };

  const handleRecordBet = (
    gameId: string,
    title: string,
    bet: number,
    win: number,
    mult: number
  ) => {
    const record: BetRecord = {
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      gameId,
      gameTitle: title,
      betAmount: bet,
      winAmount: win,
      multiplier: mult,
      timestamp: Date.now(),
      details: win > bet ? `Win ${mult}x` : 'Loss',
    };
    const updated = [record, ...bets].slice(0, 100);
    setBets(updated);
    saveBets(updated);

    // Update user stats
    setUser((prev) => ({
      ...prev,
      totalBetAmount: (prev.totalBetAmount || 0) + bet,
      totalWonAmount: (prev.totalWonAmount || 0) + win,
      vipExp: (prev.vipExp || 0) + Math.floor(bet / 10),
    }));
  };

  const handleDeposit = (
    amount: number,
    method: string,
    accountNumber?: string,
    tid?: string
  ) => {
    const txn: TransactionRecord = {
      id: tid || 'tx_dep_' + Date.now(),
      type: 'deposit',
      amount,
      method,
      status: 'completed',
      timestamp: Date.now(),
      accountNumber: accountNumber || '03012345678',
      note: 'Instant Deposit + 5% Bonus',
    };
    const updatedTxns = [txn, ...transactions];
    setTransactions(updatedTxns);
    saveTransactions(updatedTxns);

    setUser((prev) => {
      const bonus = Math.floor(amount * 0.05);
      const updated = {
        ...prev,
        balance: prev.balance + amount + bonus,
        totalDeposited: (prev.totalDeposited || 0) + amount,
        vipExp: (prev.vipExp || 0) + amount,
      };
      saveUserData(updated);
      return updated;
    });

    triggerWinConfetti();
    soundService.playSuccess();
    setIsDepositOpen(false);
  };

  const handleWithdraw = (
    amount: number,
    method: string,
    accountNumber: string,
    accountName: string
  ): boolean => {
    if (user.balance < amount) {
      soundService.playError();
      return false;
    }
    const txn: TransactionRecord = {
      id: 'tx_wd_' + Date.now(),
      type: 'withdraw',
      amount,
      method,
      status: 'pending',
      timestamp: Date.now(),
      accountNumber,
      accountName,
      note: 'Withdrawal under manual review',
    };
    const updatedTxns = [txn, ...transactions];
    setTransactions(updatedTxns);
    saveTransactions(updatedTxns);

    setUser((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance - amount,
        totalWithdrawn: (prev.totalWithdrawn || 0) + amount,
      };
      saveUserData(updated);
      return updated;
    });

    soundService.playSuccess();
    setIsWithdrawOpen(false);
    return true;
  };

  const handleResetDemoBalance = () => {
    setUser((prev) => {
      const updated = { ...prev, balance: 50000 };
      saveUserData(updated);
      return updated;
    });
    soundService.playSuccess();
  };

  const handleAddFreeCoins = (amount: number) => {
    handleUpdateBalance(user.balance + amount);
    triggerWinConfetti();
    soundService.playSuccess();
  };

  const handleClaimDailyCheckIn = (day: number, reward: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + reward,
        lastCheckInDate: new Date().toISOString().split('T')[0],
        dailyStreak: Math.min(7, (prev.dailyStreak || 0) + 1),
      };
      saveUserData(updated);
      return updated;
    });
    soundService.playSuccess();
    triggerWinConfetti();
  };

  const handleClaimVipReward = (level: number, amount: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + amount,
        vipLevel: Math.max(prev.vipLevel || 1, level),
      };
      saveUserData(updated);
      return updated;
    });
    soundService.playSuccess();
    triggerWinConfetti();
  };

  const handleClaimCommission = (amount: number) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        balance: prev.balance + amount,
      };
      saveUserData(updated);
      return updated;
    });
    soundService.playSuccess();
    triggerWinConfetti();
  };

  const handleApproveTransaction = (id: string) => {
    const updated = transactions.map((t) =>
      t.id === id ? { ...t, status: 'completed' as const } : t
    );
    setTransactions(updated);
    saveTransactions(updated);
    soundService.playSuccess();
  };

  const handleRejectTransaction = (id: string) => {
    const updated = transactions.map((t) => {
      if (t.id === id) {
        if (t.type === 'withdraw') {
          handleUpdateBalance(user.balance + t.amount);
        }
        return { ...t, status: 'rejected' as const };
      }
      return t;
    });
    setTransactions(updated);
    saveTransactions(updated);
    soundService.playSuccess();
  };

  const handleSelectGameRoom = (gameType: string, roomCode?: string) => {
    setActiveRoomCode(roomCode);
    setActiveGame(gameType);
    setIsRoomModalOpen(false);
  };

  const handleBackToLobby = () => {
    soundService.playClick();
    setActiveGame(null);
  };

  // Helper for Group B games (CrashGame, SlotsGame, DragonTigerGame, MinesGame, ColorPredictionGame, LuckyWheelGame)
  const handleGroupBBet = (gameId: string, title: string) => {
    return (amount: number, winAmount: number, details: string) => {
      const newBal = Math.max(0, user.balance - amount + winAmount);
      handleUpdateBalance(newBal);
      const mult = amount > 0 ? Number((winAmount / amount).toFixed(2)) : 0;
      handleRecordBet(gameId, title, amount, winAmount, mult);
    };
  };

  // Render Any of the 45 Active Games
  const renderActiveGame = () => {
    if (!activeGame) return null;

    const commonProps = {
      userBalance: user.balance,
      onUpdateBalance: handleUpdateBalance,
      onRecordBet: handleRecordBet,
      onBack: handleBackToLobby,
      adminSettings,
    };

    switch (activeGame) {
      // 1. Ludo Multiplayer
      case 'arcade_ludo':
      case 'ludo':
        return <LudoGame {...commonProps} />;

      // 2. Teen Patti Classic
      case 'cards_teen_patti':
      case 'teen_patti':
        return <TeenPattiGame {...commonProps} />;

      // 3. Teen Patti 20-20
      case 'teen_patti_2020':
        return <TeenPatti2020Game {...commonProps} />;

      // 4. Indian Rummy
      case 'cards_rummy':
      case 'rummy':
        return <RummyGame {...commonProps} />;

      // 5. Crash / SPRIBE Aviator / Jet
      case 'spribe_aviator':
      case 'wg_aviator':
      case '2j_aviator':
      case 'mg_flyx':
      case 'crash':
        return (
          <CrashGame
            balance={user.balance}
            onBet={handleGroupBBet(activeGame, 'Aviator Rocket')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      // 6. Super Ace
      case 'slots_super_ace':
        return <SuperAceGame {...commonProps} />;

      // 7. Fortune Gems
      case 'slots_fortune_gems':
        return <FortuneGemsGame {...commonProps} />;

      // 8. Money Coming
      case 'slots_money_coming':
        return <MoneyComingGame {...commonProps} />;

      // 9. Roma Slot
      case 'slots_roma':
        return <RomaSlotGame {...commonProps} />;

      // 10. Fruit Party
      case 'slots_fruit_party':
        return <FruitPartySlotGame {...commonProps} />;

      // 11. Aztec Gems
      case 'slots_aztec_gems':
        return <AztecGemsSlotGame {...commonProps} />;

      // 12. Mega Win Slots
      case 'slots_mega_win':
        return <MegaWinSlotGame {...commonProps} />;

      // 13. Golden Empire
      case 'slots_golden_empire':
      case 'golden_empire':
        return <GoldenEmpireSlotGame {...commonProps} />;

      // 14. Fortune Tree
      case 'slots_fortune_tree':
        return <FortuneTreeSlotGame {...commonProps} />;

      // 15. Boxing King
      case 'slots_boxing_king':
      case 'boxing_king':
        return <BoxingKingSlotGame {...commonProps} />;

      // 16. Crazy 777
      case 'wg_crazy777':
      case 'slots_crazy777':
        return <Crazy777Game {...commonProps} />;

      // 17. Classic 777 Slots
      case 'slots_777':
      case 'slots':
        return (
          <SlotsGame
            balance={user.balance}
            onBet={handleGroupBBet(activeGame, 'Classic 777 Slots')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      // 18. Fortune Garuda
      case 'jili_fortune_garuda':
      case 'slots_fortune_garuda':
        return <FortuneGarudaGame {...commonProps} />;

      // 19. Fortune PG (Ox & Tiger)
      case 'slots_fortune_pg':
      case 'pg_fortune_ox':
      case 'pg_fortune_tiger':
        return <FortunePGSlotGame {...commonProps} />;

      // 20. Three Little Pigs
      case 'fc_three_pigs':
        return <FCThreePigsGame {...commonProps} />;

      // 21. Cleopatra
      case 'pp_cleopatra':
        return <PPCleopatraGame {...commonProps} />;

      // 22. Andar Bahar
      case 'cards_andar_bahar':
      case 'andar_bahar':
        return <AndarBaharGame {...commonProps} />;

      // 23. Dragon vs Tiger
      case 'dragon_tiger':
        return (
          <DragonTigerGame
            balance={user.balance}
            onBet={handleGroupBBet('dragon_tiger', 'Dragon vs Tiger')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      // 24. Texas Hold'em
      case 'cards_texas_holdem':
      case 'texas_holdem':
        return <TexasHoldemGame {...commonProps} />;

      // 25. Blackjack 21
      case 'cards_blackjack':
      case 'blackjack':
        return <BlackjackGame {...commonProps} />;

      // 26. Baccarat VIP
      case 'cards_baccarat':
      case 'baccarat':
        return <BaccaratGame {...commonProps} />;

      // 27. 7 Up 7 Down
      case 'seven_up_down':
        return <SevenUpDownGame {...commonProps} />;

      // 28. European Roulette
      case 'casino_roulette':
      case 'roulette':
        return <RouletteGame {...commonProps} />;

      // 29. Zoo Roulette
      case 'zoo_roulette':
        return <ZooRouletteGame {...commonProps} />;

      // 30. Car Roulette
      case 'car_roulette':
        return <CarRouletteGame {...commonProps} />;

      // 31. Macau Sic Bo
      case 'sic_bo':
        return <SicBoGame {...commonProps} />;

      // 32. Dice Master
      case 'dice_master':
        return <DiceMasterGame {...commonProps} />;

      // 33. Hi-Lo Predictor
      case 'hi_lo':
      case 'hilo_game':
        return <HiLoGame {...commonProps} />;

      // 34. Red vs Black
      case 'red_vs_black':
        return <RedVsBlackGame {...commonProps} />;

      // 35. JILI Cards
      case 'jili_cards':
        return <JILICardsGame {...commonProps} />;

      // 36. Spribe Mines
      case 'spribe_mines':
      case 'mines':
        return (
          <MinesGame
            balance={user.balance}
            onBet={handleGroupBBet(activeGame, 'Spribe Mines')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      // 37. Chicken Road
      case 'inout_chicken_road':
      case 'chicken_road':
        return <ChickenRoadGame {...commonProps} />;

      // 38. Plinko Master
      case 'arcade_plinko':
      case 'plinko':
        return <PlinkoGame {...commonProps} />;

      // Arcade Unified Suite (Aviator, Mines, Chicken Road, Plinko)
      case 'arcade':
      case 'arcade_suite':
      case 'spribe_arcade':
        return <ArcadePage {...commonProps} />;

      // 39. Color Prediction / WinGo
      case 'color_wingo':
      case 'color_prediction':
        return (
          <ColorPredictionGame
            balance={user.balance}
            onBet={handleGroupBBet(activeGame, 'WinGo Color')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      // 40. Sportsbook
      case '9wickets_sports':
      case 'saba_sports':
      case 'sbovip_sports':
      case 'sportsbook':
        return (
          <SportsbookGame
            {...commonProps}
            provider={activeGame.includes('saba') ? 'SABA Sports' : '9Wickets'}
          />
        );

      // 41. Live Casino
      case 'live_casino':
      case 'tg_live':
      case 'pp_live':
      case 'sexy_live':
        return (
          <LiveCasinoGame
            {...commonProps}
            dealerType={
              activeGame.includes('sexy')
                ? 'Sexy Live'
                : activeGame.includes('pp')
                ? 'Pragmatic Play Live'
                : 'TG VIP Live'
            }
          />
        );

      // 42. Cai Shen Fishing
      case 'jili_cai_shen_fishing':
      case 'wg_caishen_fishing':
      case 'cai_shen_fishing':
        return <CaiShenFishingGame {...commonProps} />;

      // 43. Happy Ocean Fishing
      case 'jili_happy_fishing':
      case 'happy_fishing':
      case 'ygr_fishing':
      case 'fishing_game':
        return <FishingGame {...commonProps} />;

      // 44. JDB Piggy Bank
      case 'jdb_piggy_bank':
      case 'piggy_bank':
        return <PiggyBankGame {...commonProps} />;

      // 45. Lucky Prize Wheel
      case 'lucky_wheel':
        return (
          <LuckyWheelGame
            balance={user.balance}
            onBet={handleGroupBBet('lucky_wheel', 'Lucky Prize Wheel')}
            onBack={handleBackToLobby}
            adminSettings={adminSettings}
          />
        );

      default:
        return <SuperAceGame {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b16] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 1. Global Header Bar (Always available or within game) */}
      {!activeGame && (
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
      )}

      {/* 2. Main Portal Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6">
        {activeGame ? (
          /* Active Interactive Game View */
          <div className="w-full transition-all duration-300">
            {renderActiveGame()}
          </div>
        ) : (
          /* Main Platform Tabs */
          <div className="w-full">
            {activeTab === 'lobby' && (
              <LobbyTab
                onSelectGame={(gameId) => {
                  soundService.playClick();
                  setActiveGame(gameId);
                }}
                onOpenDeposit={() => setIsDepositOpen(true)}
                onOpenSupport={() => setIsLiveChatOpen(true)}
                onOpenDownload={() => setIsDownloadOpen(true)}
                onOpenInvite={() => setActiveTab('agent')}
                onOpenSpinWheel={() => setActiveGame('lucky_wheel')}
                onOpenRoomModal={() => setIsRoomModalOpen(true)}
                onOpenFreeCoins={() => setIsFreeCoinsModalOpen(true)}
                onOpenRules={() => setIsRulesModalOpen(true)}
                language={language}
              />
            )}

            {activeTab === 'activity' && (
              <ActivityTab
                user={user}
                onClaimDailyCheckIn={handleClaimDailyCheckIn}
                onClaimVipReward={handleClaimVipReward}
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
                onOpenSupport={() => setIsLiveChatOpen(true)}
                onResetDemoBalance={handleResetDemoBalance}
                onSelectTab={(tab) => setActiveTab(tab)}
                onOpenAuth={() => setIsAuthOpen(true)}
                onBack={() => setActiveTab('lobby')}
                language={language}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletTab
                user={user}
                transactions={transactions}
                onDeposit={(amount, method, note) => handleDeposit(amount, method, undefined, note)}
                onWithdraw={handleWithdraw}
                language={language}
              />
            )}
          </div>
        )}
      </main>

      {/* 3. Bottom Sticky Navbar (Shown when in main lobby / tabs) */}
      {!activeGame && (
        <Navbar
          activeTab={activeTab === 'wallet' ? 'profile' : activeTab}
          onSelectTab={(tab) => {
            soundService.playClick();
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          language={language}
        />
      )}

      {/* 4. Drawer Menu */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setIsDrawerOpen(false);
          setActiveGame(null);
        }}
        onSelectCategory={() => {
          setActiveTab('lobby');
          setActiveGame(null);
          setIsDrawerOpen(false);
        }}
        onOpenDeposit={() => {
          setIsDrawerOpen(false);
          setIsDepositOpen(true);
        }}
        onOpenAdmin={() => {
          setIsDrawerOpen(false);
          setIsAdminOpen(true);
        }}
        onOpenDownload={() => {
          setIsDrawerOpen(false);
          setIsDownloadOpen(true);
        }}
        onOpenAuth={() => {
          setIsDrawerOpen(false);
          setIsAuthOpen(true);
        }}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* 5. Deposit Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={handleDeposit}
      />

      {/* 6. Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        user={user}
        onWithdraw={handleWithdraw}
      />

      {/* 7. Master Admin Control Panel */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        adminSettings={adminSettings}
        onUpdateAdminSettings={setAdminSettings}
        user={user}
        onUpdateUserBalance={handleUpdateBalance}
        onSwitchUser={(newUser) => setUser(newUser)}
        transactions={transactions}
        onApproveTransaction={handleApproveTransaction}
        onRejectTransaction={handleRejectTransaction}
        onResetDatabase={handleResetDemoBalance}
      />

      {/* 8. Auth / Switch User Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsAuthOpen(false);
          soundService.playSuccess();
        }}
      />

      {/* 9. 24/7 Live Support Chat Modal */}
      <LiveChatModal
        isOpen={isLiveChatOpen}
        onClose={() => setIsLiveChatOpen(false)}
        userId={user.id}
      />

      {/* 10. APK / Mobile App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadOpen}
        onClose={() => setIsDownloadOpen(false)}
      />

      {/* 11. Multiplayer Room Lobby Modal */}
      <RoomLobbyModal
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        userCoins={user.balance}
        onSelectGameRoom={handleSelectGameRoom}
      />

      {/* 12. Free Practice Coins Faucet Modal */}
      <FreeCoinsModal
        isOpen={isFreeCoinsModalOpen}
        onClose={() => setIsFreeCoinsModalOpen(false)}
        userCoins={user.balance}
        onAddCoins={handleAddFreeCoins}
      />

      {/* 13. Game Rules & How to Play Modal */}
      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />
    </div>
  );
}
