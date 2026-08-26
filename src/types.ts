export type GameCategory = 'all' | 'slots' | 'crash' | 'lottery' | 'cards' | 'mini';

export type CurrencyType = 'PKR' | 'USDT' | 'INR';

export interface UserAccount {
  id: string;
  phone: string;
  username: string;
  avatar: string;
  balance: number;
  unwithdrawnBalance: number;
  vipLevel: number;
  vipExp: number;
  referralCode: string;
  referredBy?: string;
  currency: CurrencyType;
  registeredAt: string;
  isLoggedIn: boolean;
  dailyStreak: number;
  lastCheckInDate?: string;
  totalDeposited: number;
  totalWithdrawn: number;
  totalBetAmount: number;
  totalWonAmount: number;
}

export interface BetRecord {
  id: string;
  gameId: string;
  gameTitle: string;
  betAmount: number;
  winAmount: number;
  multiplier: number;
  timestamp: number;
  details?: string;
}

export type TransactionType = 'deposit' | 'withdraw' | 'commission' | 'vip_reward' | 'checkin';
export type TransactionStatus = 'completed' | 'pending' | 'rejected';

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: number;
  method: string;
  accountNumber?: string;
  accountName?: string;
  status: TransactionStatus;
  timestamp: number;
  note?: string;
}

export interface ReferralTeamMember {
  id: string;
  phoneMasked: string;
  level: 1 | 2 | 3;
  betTotal: number;
  commissionEarned: number;
  joinDate: string;
}

export interface AdminSettings {
  rtpMode: 'fair' | 'high_win' | 'house_edge';
  rtpPercentage: number;
  crashCrashLimitMin: number;
  crashCrashLimitMax: number;
  slotsJackpotPool: number;
  systemNotice: string;
  allowSimulatedWithdrawals: boolean;
}

export interface ColorPredictionRound {
  period: string;
  countdownSeconds: number;
  resultNumber?: number;
  resultColor?: 'red' | 'green' | 'violet' | 'red-violet' | 'green-violet';
  resultSize?: 'big' | 'small';
  price?: number;
}
