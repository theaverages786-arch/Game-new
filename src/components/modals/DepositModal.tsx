import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  X, 
  Check, 
  Copy, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  QrCode, 
  Receipt,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { soundService } from '../../services/sound';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string, accountNumber?: string, tid?: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank' | 'USDT'>('JazzCash');
  const [amount, setAmount] = useState<number>(1000);
  const [senderAccount, setSenderAccount] = useState<string>('03012345678');
  const [transactionId, setTransactionId] = useState<string>('TID' + Math.floor(10000000 + Math.random() * 90000000));
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const presets = [200, 500, 1000, 2000, 5000, 10000, 25000, 50000];

  const merchantDetails = {
    JazzCash: {
      account: '0308-7779991',
      title: '777 Official Merchant Pay (JazzCash)',
      bank: 'Mobilink Microfinance Bank',
    },
    EasyPaisa: {
      account: '0345-8887772',
      title: '777 Premier Fast Deposit (EasyPaisa)',
      bank: 'Telenor Microfinance Bank',
    },
    Bank: {
      account: 'PK76MEZN0099881122334455',
      title: '777 Gaming Network Portal Pvt Ltd',
      bank: 'Meezan Bank Ltd (Fast IBAN)',
    },
    USDT: {
      account: 'TY777PremierPortalTRC20OfficialDepositAddress999X',
      title: 'USDT TRC-20 Automated Gateway (Rate: ₨ 285/USDT)',
      bank: 'Tron Blockchain TRC20',
    },
  };

  const currentMerchant = merchantDetails[selectedMethod];

  const handleCopy = (text: string) => {
    soundService.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    soundService.playCoin();
    onDeposit(amount, `${selectedMethod} Fast Pay`, senderAccount, transactionId);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setStep(1);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#0f1424] border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-h-[92vh] overflow-y-auto"
        id="deposit-modal-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-md">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Instant Top-Up &amp; Deposit</h3>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                0% Fee &bull; +10% Bonus Active
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

        {step === 1 ? (
          <div className="space-y-3.5">
            {/* Method Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                1. Select Payment Channel
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['JazzCash', 'EasyPaisa', 'Bank', 'USDT'] as const).map((m) => (
                  <button
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

            {/* Presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  2. Select Amount (PKR)
                </span>
                <span className="text-[10px] font-bold text-amber-400">+10% Bonus</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      soundService.playClick();
                      setAmount(amt);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      amount === amt
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md scale-105'
                        : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    ₨ {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Merchant Account Details Box */}
            <div className="bg-[#0a0d18] border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-bold uppercase">Official Merchant Account:</span>
                <span className="text-emerald-400 font-bold">{currentMerchant.bank}</span>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                <div className="font-mono font-black text-amber-300 text-sm break-all select-all">
                  {currentMerchant.account}
                </div>
                <button
                  onClick={() => handleCopy(currentMerchant.account)}
                  className="ml-2 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Title: <span className="text-white font-bold">{currentMerchant.title}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundService.playClick();
                setStep(2);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer"
            >
              PROCEED TO CONFIRM PAYMENT (₨ {amount.toLocaleString()})
            </button>
          </div>
        ) : (
          /* STEP 2: TID / CONFIRMATION */
          <div className="space-y-3.5">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Method:</span>
                <span className="text-amber-300 font-bold">{selectedMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit Amount:</span>
                <span className="text-emerald-400 font-black font-mono">₨ {amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Welcome Bonus (+10%):</span>
                <span className="text-yellow-300 font-bold font-mono">+₨ {Math.round(amount * 0.1).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Your Sender Mobile / Account Number
              </label>
              <input
                type="text"
                value={senderAccount}
                onChange={(e) => setSenderAccount(e.target.value)}
                placeholder="03012345678"
                className="w-full bg-[#0a0d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Transaction ID (TID / Trx Hash)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter 11-digit TID from SMS"
                className="w-full bg-[#0a0d18] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />
            </div>

            {success ? (
              <div className="bg-emerald-600 text-white p-3.5 rounded-2xl font-black text-xs text-center space-y-1 animate-in zoom-in-95">
                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>PAYMENT APPROVED &amp; CREDITED!</span>
                </div>
                <div className="text-[11px] text-emerald-100 font-mono">
                  +₨ {(amount + Math.round(amount * 0.1)).toLocaleString()} Added to Balance
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs hover:bg-slate-700 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 transition transform active:scale-95 cursor-pointer"
                >
                  SUBMIT &amp; CREDIT (₨ {amount.toLocaleString()})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

