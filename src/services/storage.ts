import confetti from 'canvas-confetti';
import { UserAccount, TransactionRecord, BetRecord, AdminSettings, ReferralTeamMember } from '../types';

const STORAGE_KEYS = {
  USER: '777_user_account',
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

const defaultUser: UserAccount = {
  id: 'USR_777999_' + Math.floor(100000 + Math.random() * 900000),
  phone: '0300' + Math.floor(1000000 + Math.random() * 9000000),
  username: 'VIP_Player_' + Math.floor(1000 + Math.random() * 9000),
  avatar: '👑',
  balance: 2500, // starting demo test balance in PKR
  unwithdrawnBalance: 2500,
  vipLevel: 2,
  vipExp: 1450,
  referralCode: '8khvdc',
  referredBy: '8khvdc',
  currency: 'PKR',
  registeredAt: new Date().toISOString(),
  isLoggedIn: true,
  dailyStreak: 3,
  lastCheckInDate: '',
  totalDeposited: 3000,
  totalWithdrawn: 1200,
  totalBetAmount: 8450,
  totalWonAmount: 9150,
};

const defaultAdminSettings: AdminSettings = {
  rtpMode: 'fair',
  rtpPercentage: 96.5,
  crashCrashLimitMin: 1.1,
  crashCrashLimitMax: 15.0,
  slotsJackpotPool: 8887770,
  systemNotice: '🔥 Welcome to 777 Premier Portal! Daily 100% First Deposit Bonus & Instant Withdrawals active. Good luck!',
  allowSimulatedWithdrawals: true,
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

export const loadUserData = (): UserAccount => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultUser, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load user data', e);
  }
  const ref = getUrlReferralCode();
  const initial = { ...defaultUser, referralCode: ref || defaultUser.referralCode };
  saveUserData(initial);
  return initial;
};

export const saveUserData = (user: UserAccount) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
    if (raw) return { ...defaultAdminSettings, ...JSON.parse(raw) };
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
