import React, { useState } from 'react';
import { ArrowDownLeft, X, Check, Copy } from 'lucide-react';
import { soundService } from '../../services/sound';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string) => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank' | 'USDT'>('JazzCash');
  const [amount, setAmount] = useState<number>(1000);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const presets = [500, 1000, 2000, 5000, 10000, 25000];

  const handleConfirm = () => {
    soundService.playCoin();
    onDeposit(amount, `${selectedMethod} Fast Pay`);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-md bg-[#0e1424] border border-amber-500/50 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Quick Top-Up &amp; Recharge</h3>
              <span className="text-[10px] text-emerald-400">Instant Automated Credit</span>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Method Selector */}
        <div className="grid grid-cols-4 gap-1.5">
          {(['JazzCash', 'EasyPaisa', 'Bank', 'USDT'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                soundService.playClick();
                setSelectedMethod(m);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                selectedMethod === m
                  ? 'bg-amber-400 text-slate-950 font-black border-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Presets */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase block mb-1.5">
            Select Amount (₨)
          </span>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  soundService.playClick();
                  setAmount(amt);
                }}
                className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  amount === amt
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                ₨ {amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {success ? (
          <div className="bg-emerald-600 text-white p-3 rounded-2xl font-bold text-xs text-center animate-in zoom-in-95">
            ✓ ₨ {amount.toLocaleString()} added to your account!
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 transition transform active:scale-95 cursor-pointer"
          >
            CONFIRM RECHARGE (₨ {amount.toLocaleString()})
          </button>
        )}
      </div>
    </div>
  );
};
