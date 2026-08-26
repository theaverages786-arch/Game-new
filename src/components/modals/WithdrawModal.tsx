import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  X, 
  Check, 
  CreditCard, 
  AlertCircle, 
  ShieldCheck,
  Building,
  Smartphone,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { soundService } from '../../services/sound';
import { UserAccount } from '../../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount;
  onWithdraw: (amount: number, method: string, accountNumber: string, accountName: string) => boolean;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  user,
  onWithdraw,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank' | 'USDT'>('JazzCash');
  const [amount, setAmount] = useState<number>(500);
  const [accountNumber, setAccountNumber] = useState<string>(user.phone || '03001234567');
  const [accountName, setAccountName] = useState<string>(user.username || 'VIP Player');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const presets = [500, 1000, 2500, 5000, 10000, 25000];
  const minWithdraw = 300;
  const maxWithdraw = 100000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount < minWithdraw) {
      setError(`Minimum withdrawal amount is ₨ ${minWithdraw.toLocaleString()}`);
      soundService.playClick();
      return;
    }

    if (amount > user.balance) {
      setError(`Insufficient balance. Your current balance is ₨ ${user.balance.toLocaleString()}`);
      soundService.playClick();
      return;
    }

    if (!accountNumber.trim()) {
      setError('Please enter a valid recipient account/phone number');
      soundService.playClick();
      return;
    }

    const success = onWithdraw(amount, selectedMethod, accountNumber, accountName);
    if (success) {
      soundService.playCoin();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } else {
      setError('Withdrawal request failed. Please check your balance or KYC status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#0f1424] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-h-[92vh] overflow-y-auto"
        id="withdraw-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white font-black flex items-center justify-center shadow-md">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Withdraw Earnings</h3>
              <span className="text-[10px] text-amber-400">
                Available Balance: ₨ {user.balance.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white bg-slate-800/80 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border border-slate-700 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="bg-[#0b1b17] border border-emerald-500/50 p-5 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-300 uppercase tracking-wide">
                Withdrawal Request Submitted!
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                ₨ {amount.toLocaleString()} will be transferred to your {selectedMethod} account ({accountNumber}) within 5-10 minutes.
              </p>
            </div>
            <div className="text-[10px] text-amber-400 font-mono bg-slate-900/80 py-1.5 px-3 rounded-lg">
              Transaction reference logged in system
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 p-2.5 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Withdrawal Method */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                1. Select Payout Method
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['JazzCash', 'EasyPaisa', 'Bank', 'USDT'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedMethod(m);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedMethod === m
                        ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-md scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  2. Withdrawal Amount (PKR)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(user.balance)}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  Withdraw All
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mb-2">
                {presets.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => {
                      soundService.playClick();
                      setAmount(amt);
                    }}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      amount === amt
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    ₨ {amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0a0d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                min={minWithdraw}
                max={user.balance}
              />
            </div>

            {/* Recipient details */}
            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Recipient Account / Phone Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 03001234567 or IBAN"
                  required
                  className="w-full bg-[#0a0d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Account Holder Title / Full Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Muhammad Ali"
                  required
                  className="w-full bg-[#0a0d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Fast Processing Badge */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center gap-2 text-[10px] text-slate-400">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Automated 24/7 gateway processing. Average arrival time is under 15 minutes.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer"
            >
              REQUEST WITHDRAWAL (₨ {amount.toLocaleString()})
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
