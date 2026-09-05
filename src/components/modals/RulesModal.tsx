import React, { useState } from 'react';
import { X, BookOpen, ShieldCheck, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundService } from '../../services/sound';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ludo' | 'teen_patti' | 'rummy' | 'about'>('ludo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e1424] border border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-4 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
              Official Game Rules & Educational Guide
            </h3>
          </div>
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="grid grid-cols-4 gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-black">
          {[
            { id: 'ludo', label: '🎲 Ludo Rules' },
            { id: 'teen_patti', label: '🂡 Teen Patti' },
            { id: 'rummy', label: '🃏 Rummy 13' },
            { id: 'about', label: 'ℹ️ About & Math' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundService.playClick();
                setActiveTab(t.id as any);
              }}
              className={`py-2 rounded-xl text-center transition cursor-pointer ${
                activeTab === t.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Ludo Content */}
        {activeTab === 'ludo' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <h4 className="text-sm font-black text-amber-300">Official 15×15 Board Ludo Mechanics</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2">
                <span className="text-amber-400 font-black">1.</span>
                <div>
                  <strong className="text-white">Exiting the Base:</strong> A player must roll a <strong className="text-amber-400">6</strong> to release a pawn from their home base to the starting position (Step 0).
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2">
                <span className="text-amber-400 font-black">2.</span>
                <div>
                  <strong className="text-white">Safe Star Tiles:</strong> Squares marked with ★ (0, 8, 13, 21, 26, 34, 39, 47) are safe. Multiple pawns can safely coexist here without fear of capture.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2">
                <span className="text-amber-400 font-black">3.</span>
                <div>
                  <strong className="text-white">Knockout Captures:</strong> If your pawn lands on an opponent's pawn that is on an unsafe square, the opponent's pawn is knocked out and returned to its base, and you receive an <strong className="text-emerald-400">extra bonus roll</strong>!
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex gap-2">
                <span className="text-amber-400 font-black">4.</span>
                <div>
                  <strong className="text-white">Extra Turns:</strong> Rolling a 6 or capturing an opponent's pawn gives an extra roll. 3 consecutive sixes automatically ends your turn.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teen Patti Content */}
        {activeTab === 'teen_patti' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <h4 className="text-sm font-black text-amber-300">Teen Patti (3-Card Poker) Hand Hierarchy</h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30 flex justify-between items-center">
                <span className="text-amber-300 font-bold">1. Trail / Trio (Three of a Kind)</span>
                <span className="text-slate-400">A-A-A (Highest), 2-2-2 (Lowest)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-cyan-300 font-bold">2. Pure Sequence (Straight Flush)</span>
                <span className="text-slate-400">A-K-Q of same suit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-emerald-300 font-bold">3. Sequence (Straight)</span>
                <span className="text-slate-400">5-6-7 off-suit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-yellow-300 font-bold">4. Color (Flush)</span>
                <span className="text-slate-400">3 cards of same suit, not in sequence</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-blue-300 font-bold">5. Pair (Two of a Kind)</span>
                <span className="text-slate-400">K-K-9</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-rose-300 font-bold">6. High Card</span>
                <span className="text-slate-400">A-J-4 highest single value</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              <strong className="text-white">Blind vs. Chaal:</strong> Playing Blind costs 1x stake. After seeing your cards, playing Chaal costs 2x the current stake.
            </p>
          </div>
        )}

        {/* Rummy Content */}
        {activeTab === 'rummy' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <h4 className="text-sm font-black text-amber-300">13-Card Indian Rummy Rules</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-emerald-400 block mb-1">Requirement 1: Pure Sequence (Mandatory)</strong>
                A consecutive run of 3 or more cards of the exact same suit without any joker (e.g. 7♥ - 8♥ - 9♥). Without this, your declaration is invalid!
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-cyan-400 block mb-1">Requirement 2: Second Sequence</strong>
                Another sequence of 3 or 4 cards, which can be pure or can use a Wild/Printed Joker (e.g. 4♠ - 5♠ - JKR).
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <strong className="text-amber-400 block mb-1">Requirement 3: Sets & Remaining Melds</strong>
                Remaining cards must be arranged in valid sets (same rank, different suits like 9♠ - 9♥ - 9♦) or additional sequences.
              </div>
            </div>
          </div>
        )}

        {/* About & Educational Content */}
        {activeTab === 'about' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/30 space-y-2">
              <div className="flex items-center gap-2 text-indigo-300 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Educational & Portfolio Project</span>
              </div>
              <p>
                <strong>KhelClub Arena</strong> is built strictly with play-money virtual tokens and points. There are no deposits, real-money transactions, or cash payouts.
              </p>
              <p>
                Synthesizing features from top open-source projects including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 font-mono text-[11px]">
                <li><strong className="text-white">CyberCitizen01/LUDO:</strong> 15x15 board geometry, coordinate offsets, safe star checks, and knockout captures.</li>
                <li><strong className="text-white">floatinghotpot/casino-server:</strong> Card room seat management, blind/chaal pot logic, turn timeouts, and showdown handling.</li>
                <li><strong className="text-white">CardSharp & Rummy Evaluators:</strong> Hand rank hierarchy, flush/sequence validations, and pure run checks.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl cursor-pointer transition"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
