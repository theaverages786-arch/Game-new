import confetti from 'canvas-confetti';
import { UserAccount, TransactionRecord, BetRecord, AdminSettings, ReferralTeamMember } from '../types';

const STORAGE_KEYS = {
  USER: '777_user_account',
  ALL_USERS: '777_all_users_list',
  TRANSACTIONS: '777_transactions',
  BETS: '777_bets',
  ADMIN_SETTINGS: '777_admin_settings',
  TEAM: '777_referral_team',
};

// Check for initial URL query referral code (e.g. ?dl=8khvdc)
export const getUrlReferralCode = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    return params.get('dl') || params.get('ref') || '8khvdc';
  }
  return '8khvdc';
};

export const defaultPresetUsers: UserAccount[] = [
  {
    id: 'USR_777_ADMIN',
    phone: '03001234777',
    username: 'Master_Admin_777',
    avatar: '🛡️',
    balance: 150000,
    unwithdrawnBalance: 150000,
    vipLevel: 10,
    vipExp: 88000,
    referralCode: '8khvdc',
    referredBy: '',
    currency: 'PKR',
    registeredAt: '2026-08-01T10:00:00.000Z',
    isLoggedIn: true,
    role: 'admin',
    isFrozen: false,
    pin: '777999',
    password: 'password123',
    dailyStreak: 7,
    totalDeposited: 500000,
    totalWithdrawn: 120000,
    totalBetAmount: 980000,
    totalWonAmount: 1150000,
  },
  {
    id: 'USR_777_VIP5',
    phone: '03049876543',
    username: 'HighRoller_Ali',
    avatar: '💎',
    balance: 45000,
    unwithdrawnBalance: 45000,
    vipLevel: 5,
    vipExp: 28500,
    referralCode: 'vip999',
    referredBy: '8khvdc',
    currency: 'PKR',
    registeredAt: '2026-08-10T14:30:00.000Z',
    isLoggedIn: true,
    role: 'user',
    isFrozen: false,
    pin: '123456',
    password: 'password123',
    dailyStreak: 5,
    totalDeposited: 80000,
    totalWithdrawn: 45000,
    totalBetAmount: 185000,
    totalWonAmount: 192000,
  },
  {
    id: 'USR_777_DEMO',
    phone: '03127654321',
    username: 'LuckyPlayer_777',
    avatar: '👑',
    balance: 5000,
    unwithdrawnBalance: 5000,
    vipLevel: 2,
    vipExp: 1850,
    referralCode: '8khvdc',
    referredBy: '8khvdc',
    currency: 'PKR',
    registeredAt: new Date().toISOString(),
    isLoggedIn: true,
    role: 'user',
    isFrozen: false,
    pin: '000000',
    password: 'password123',
    dailyStreak: 3,
    totalDeposited: 6000,
    totalWithdrawn: 2000,
    totalBetAmount: 12400,
    totalWonAmount: 13800,
  },
];

const defaultAdminSettings: AdminSettings = {
  rtpMode: 'fair',
  rtpPercentage: 96.5,
  globalWinRate: 65,
  masterOutcomeMode: 'normal',
  gameRtpOverrides: {
    slots_super_ace: 97,
    slots_fortune_gems: 96,
    slots_money_coming: 96,
    slots_roma: 95,
    slots_fruit_party: 96,
    slots_aztec_gems: 95,
    slots_mega_win: 98,
    slots_golden_empire: 96,
    slots_fortune_tree: 96,
    slots_boxing_king: 95,
    wg_crazy777: 96,
    slots_777: 97,
    cards_teen_patti: 95,
    teen_patti_2020: 95,
    dragon_tiger: 96,
    cards_andar_bahar: 95,
    cards_rummy: 94,
    cards_texas_holdem: 95,
    cards_blackjack: 98,
    cards_baccarat: 98,
    arcade_ludo: 95,
    casino_roulette: 97,
    zoo_roulette: 95,
    car_roulette: 95,
    seven_up_down: 96,
    dice_master: 97,
    red_vs_black: 95,
    sic_bo: 96,
    crash_aviator: 96,
    mines_treasure: 95,
    hilo_game: 96,
    arcade_plinko: 96,
    color_wingo: 95,
    fishing_ocean_king: 95,
    caishen_fishing: 95,
  },
  crashCrashLimitMin: 1.1,
  crashCrashLimitMax: 15.0,
  slotsJackpotPool: 8887770,
  systemNotice: '🔥 Welcome to P999 Premier Portal! Daily 100% First Deposit Bonus & Instant Withdrawals active. Good luck!',
  allowSimulatedWithdrawals: true,
  maintenanceMode: false,
  forcedResults: {
    slots: 'random',
    crash: 'random',
    wingo: 'random',
    dragonTiger: 'random',
    teenPatti: 'random',
    roulette: 'random',
    mines: 'random',
    baccarat: 'random',
    sevenUpDown: 'random',
    zooRoulette: 'random',
    carRoulette: 'random',
    sicBo: 'random',
    hiLo: 'random',
  },
  referralTier1Rate: 30,
  referralTier2Rate: 20,
  referralTier3Rate: 10,
};

const defaultInitialTransactions: TransactionRecord[] = [
  {
    id: 'TXN_' + Date.now() + '_1',
    type: 'deposit',
    amount: 1000,
    method: 'JazzCash Fast Pay',
    accountNumber: '0301****892',
    accountName: 'Agent Deposit',
    status: 'completed',
    timestamp: Date.now() - 3600000 * 5,
    note: 'Initial Top-up + 10% Welcome Bonus',
  },
  {
    id: 'TXN_' + Date.now() + '_2',
    type: 'vip_reward',
    amount: 200,
    method: 'System VIP Level 2 Gift',
    status: 'completed',
    timestamp: Date.now() - 3600000 * 2,
  },
  {
    id: 'TXN_' + Date.now() + '_3',
    type: 'commission',
    amount: 350,
    method: 'Direct Referral Tier 1 Rebate',
    status: 'completed',
    timestamp: Date.now() - 3600000,
  },
];

const defaultTeam: ReferralTeamMember[] = [
  {
    id: 'TM_101',
    phoneMasked: '0312****451',
    level: 1,
    betTotal: 14500,
    commissionEarned: 435,
    joinDate: '2026-08-20',
  },
  {
    id: 'TM_102',
    phoneMasked: '0345****998',
    level: 1,
    betTotal: 8200,
    commissionEarned: 246,
    joinDate: '2026-08-22',
  },
  {
    id: 'TM_103',
    phoneMasked: '0308****332',
    level: 2,
    betTotal: 25000,
    commissionEarned: 500,
    joinDate: '2026-08-24',
  },
  {
    id: 'TM_104',
    phoneMasked: '0321****119',
    level: 3,
    betTotal: 6000,
    commissionEarned: 60,
    joinDate: '2026-08-25',
  },
];

export const loadAllUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load all users', e);
  }
  saveAllUsers(defaultPresetUsers);
  return defaultPresetUsers;
};

export const saveAllUsers = (users: UserAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save all users', e);
  }
};

export const loadUserData = (): UserAccount => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultPresetUsers[2], ...parsed };
    }
  } catch (e) {
    console.error('Failed to load user data', e);
  }
  const ref = getUrlReferralCode();
  const initial = { ...defaultPresetUsers[2], referralCode: ref || defaultPresetUsers[2].referralCode };
  saveUserData(initial);
  return initial;
};

export const saveUserData = (user: UserAccount) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    // Also sync to all users list
    const all = loadAllUsers();
    const idx = all.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      all[idx] = user;
    } else {
      all.push(user);
    }
    saveAllUsers(all);
  } catch (e) {
    console.error('Failed to save user data', e);
  }
};

export const loadTransactions = (): TransactionRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load transactions', e);
  }
  return defaultInitialTransactions;
};

export const saveTransactions = (txs: TransactionRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

export const loadBets = (): BetRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BETS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load bets', e);
  }
  return [];
};

export const saveBets = (bets: BetRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save bets', e);
  }
};

export const loadAdminSettings = (): AdminSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { 
        ...defaultAdminSettings, 
        ...parsed,
        forcedResults: { ...defaultAdminSettings.forcedResults, ...(parsed.forcedResults || {}) }
      };
    }
  } catch (e) {
    console.error('Failed to load admin settings', e);
  }
  return defaultAdminSettings;
};

export const saveAdminSettings = (settings: AdminSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save admin settings', e);
  }
};

export const loadTeam = (): ReferralTeamMember[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAM);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load team', e);
  }
  return defaultTeam;
};

export const triggerWinConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#3b82f6'],
    });
  } catch {
    // fallback if canvas not available
  }
};

