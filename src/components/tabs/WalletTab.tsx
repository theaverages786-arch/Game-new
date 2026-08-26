import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Copy,
  Check,
  Building2,
  Smartphone,
  Coins
} from 'lucide-react';
import { UserAccount, TransactionRecord } from '../../types';
import { soundService } from '../../services/sound';

interface WalletTabProps {
  user: UserAccount;
  transactions: TransactionRecord[];
  onDeposit: (amount: number, method: string, note?: string) => void;
  onWithdraw: (amount: number, method: string, accountNumber: string, accountName: string) => void;
  language: 'en' | 'ur' | 'hi';
}

export const WalletTab: React.FC<WalletTabProps> = ({
  user,
  transactions,
  onDeposit,
  onWithdraw,
  language,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'deposit' | 'withdraw' | 'records'>('deposit');

  // Deposit Form State
  const [depositMethod, setDepositMethod] = useState<'jazzcash' | 'easypaisa' | 'bank' | 'usdt'>('jazzcash');
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [depositTxnId, setDepositTxnId] = useState<string>('');
  const [isDepositSubmitted, setIsDepositSubmitted] = useState(false);

  // Withdraw Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'jazzcash' | 'easypaisa' | 'bank'>('jazzcash');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [accountNumber, setAccountNumber] = useState<string>('03017779998');
  const [accountName, setAccountName] = useState<string>('Muhammad Ali');
  const [bankName, setBankName] = useState<string>('Meezan Bank Ltd');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const depositPresets = [500, 1000, 2000, 5000, 10000, 50000];
  const withdrawPresets = [500, 1000, 2500, 5000, 10000, 25000];

  const simulatedReceivers = {
    jazzcash: { name: '777 Official Merchant (JazzCash)', number: '0304-9876543', bank: 'JazzCash Wallet' },
    easypaisa: { name: '777 VIP Finance (EasyPaisa)', number: '0345-1234567', bank: 'EasyPaisa Wallet' },
    bank: { name: '777 Premier Fast Collect Ltd', number: '0102-998877665544', bank: 'Meezan Bank / HBL' },
    usdt: { name: 'TRC-20 USDT Wallet Address', number: 'TX777Prem999DepositTrc20AddressX9', bank: 'TRON TRC20' },
  };

  const handleExecuteDeposit = () => {
    if (depositAmount < 200) {
      alert('Minimum deposit is ₨ 200!');
      return;
    }
    soundService.playCoin();
    const methodName = depositMethod === 'jazzcash'
      ? 'JazzCash Fast Pay'
      : depositMethod === 'easypaisa'
      ? 'EasyPaisa Instant'
      : depositMethod === 'bank'
      ? 'Bank Transfer'
      : 'USDT (TRC20)';

    onDeposit(depositAmount, methodName, depositTxnId ? `TxID: ${depositTxnId}` : undefined);
    setIsDepositSubmitted(true);
    setTimeout(() => {
      setIsDepositSubmitted(false);
      setDepositTxnId('');
    }, 3000);
  };

  const handleExecuteWithdraw = () => {
    if (withdrawAmount < 500) {
      alert('Minimum withdrawal amount is ₨ 500!');
      return;
    }
    if (withdrawAmount > user.balance) {
      soundService.playBeep(300);
      alert('Insufficient available wallet balance!');
      return;
    }
    if (!accountNumber || !accountName) {
      alert('Please fill out account number and beneficiary name!');
      return;
    }

    soundService.playClick();
    const methodName = withdrawMethod === 'jazzcash'
      ? 'JazzCash'
      : withdrawMethod === 'easypaisa'
      ? 'EasyPaisa'
      : `Bank (${bankName})`;

    onWithdraw(withdrawAmount, methodName, accountNumber, accountName);
    setWithdrawSuccess(true);
    setTimeout(() => {
      setWithdrawSuccess(false);
    }, 3500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-r from-[#121828] via-[#1a233b] to-[#121828] border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-amber-400 font-extrabold flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" />
              Total Account Balance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                ₨ {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase">{user.currency}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Withdrawable: <strong className="text-emerald-400 font-mono">₨ {user.unwithdrawnBalance.toLocaleString()}</strong> &bull; Total Deposited: ₨ {user.totalDeposited.toLocaleString()}
            </p>
          </div>

          {/* Quick Subtab Switcher */}
          <div className="flex bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => {
                soundService.playClick();
                setActiveSubTab('deposit');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSubTab === 'deposit'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposit</span>
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveSubTab('withdraw');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSubTab === 'withdraw'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={() => {
                soundService.playClick();
                setActiveSubTab('records');
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                activeSubTab === 'records'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Records</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subtab 1: DEPOSIT */}
      {activeSubTab === 'deposit' && (
        <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-amber-400" />
              Select Payment Method
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
              +10% First Deposit Bonus
            </span>
          </div>

          {/* Payment Gateways */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'jazzcash', name: 'JazzCash', badge: 'FAST', color: 'from-red-600 to-amber-700' },
              { id: 'easypaisa', name: 'EasyPaisa', badge: 'AUTO', color: 'from-emerald-600 to-green-700' },
              { id: 'bank', name: 'Bank Transfer', badge: 'VIP', color: 'from-blue-600 to-indigo-800' },
              { id: 'usdt', name: 'USDT (TRC20)', badge: '0% FEE', color: 'from-teal-600 to-emerald-800' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => {
                  soundService.playClick();
                  setDepositMethod(method.id as any);
                }}
                className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  depositMethod === method.id
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white font-black text-xs shadow`}>
                    {method.name.charAt(0)}
                  </div>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-400 text-slate-950 rounded-full">
                    {method.badge}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-black text-white">{method.name}</div>
                  <div className="text-[10px] text-slate-400">1 - 3 Mins Instant</div>
                </div>
              </button>
            ))}
          </div>

          {/* Receiver Account Details Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">
              Official 777 Receiver Details:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Bank / Channel</span>
                <span className="font-bold text-amber-300">{simulatedReceivers[depositMethod].bank}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Account Title</span>
                <span className="font-bold text-white">{simulatedReceivers[depositMethod].name}</span>
              </div>
              <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">Account / Number</span>
                  <span className="font-bold text-emerald-400">{simulatedReceivers[depositMethod].number}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(simulatedReceivers[depositMethod].number);
                    alert('Account number copied!');
                  }}
                  className="p-1 text-slate-400 hover:text-amber-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              Deposit Amount (₨)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {depositPresets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    soundService.playClick();
                    setDepositAmount(amt);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    depositAmount === amt
                      ? 'bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-500/30'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  ₨ {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID / Reference (Optional) */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-300">Transaction ID (TID / Ref #)</span>
            <input
              type="text"
              placeholder="e.g. 984512998341"
              value={depositTxnId}
              onChange={(e) => setDepositTxnId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Success Banner */}
          {isDepositSubmitted && (
            <div className="bg-emerald-600 text-white p-3 rounded-2xl font-bold text-xs text-center animate-in zoom-in-95">
              ✓ Deposit of ₨ {depositAmount.toLocaleString()} credited successfully with bonus!
            </div>
          )}

          {/* Deposit Action */}
          <button
            onClick={handleExecuteDeposit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base shadow-xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer"
          >
            CONFIRM DEPOSIT (₨ {depositAmount.toLocaleString()})
          </button>
        </div>
      )}

      {/* Subtab 2: WITHDRAW */}
      {activeSubTab === 'withdraw' && (
        <div className="bg-[#0e1424] border border-emerald-500/30 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Withdrawal Center (Instant Payout)
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Fee: 0% &bull; Min: ₨ 500
            </span>
          </div>

          {/* Channel selector */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'jazzcash', name: 'JazzCash Wallet' },
              { id: 'easypaisa', name: 'EasyPaisa Wallet' },
              { id: 'bank', name: 'Bank Account' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundService.playClick();
                  setWithdrawMethod(m.id as any);
                }}
                className={`py-2.5 px-3 rounded-2xl text-xs font-black transition cursor-pointer border ${
                  withdrawMethod === m.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Account Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {withdrawMethod === 'bank' && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs font-bold text-slate-300">Bank Name</span>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300">Account / Mobile Number</span>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="03001234567"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300">Account Title (Full Name)</span>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Beneficiary Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Amount Presets */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase block mb-1.5">
              Withdrawal Amount (₨)
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {withdrawPresets.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    soundService.playClick();
                    setWithdrawAmount(amt);
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                    withdrawAmount === amt
                      ? 'bg-emerald-400 text-slate-950 scale-105 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  ₨ {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Withdraw Success Notice */}
          {withdrawSuccess && (
            <div className="bg-emerald-600 text-white p-3 rounded-2xl font-bold text-xs text-center animate-in zoom-in-95">
              ✓ Withdrawal request for ₨ {withdrawAmount.toLocaleString()} submitted! Funds will arrive in 5-15 mins.
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={handleExecuteWithdraw}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-base shadow-xl shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
          >
            SUBMIT WITHDRAWAL (₨ {withdrawAmount.toLocaleString()})
          </button>
        </div>
      )}

      {/* Subtab 3: TRANSACTION RECORDS */}
      {activeSubTab === 'records' && (
        <div className="bg-[#0e1424] border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Transaction Ledger ({transactions.length} Total Records)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">Channel / Method</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-900/40">
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          tx.type === 'deposit'
                            ? 'bg-amber-500/20 text-amber-300'
                            : tx.type === 'withdraw'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-bold text-white">₨ {tx.amount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-slate-300">{tx.method}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300 animate-pulse'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-500 text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
