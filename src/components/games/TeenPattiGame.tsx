import React, { useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, Sparkles, Trophy, Eye, EyeOff, ShieldCheck, Play } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface TeenPattiProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: number; // 2 - 14 (14 is Ace)
  label: string;
  color: 'red' | 'black';
}

export const TeenPattiGame: React.FC<TeenPattiProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bootBet, setBootBet] = useState(50);
  const [currentBet, setCurrentBet] = useState(50);
  const [pot, setPot] = useState(0);
  const [gameStage, setGameStage] = useState<'idle' | 'playing' | 'showdown'>('idle');
  const [seenCards, setSeenCards] = useState(false);
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [botCards, setBotCards] = useState<Card[]>([]);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [resultDesc, setResultDesc] = useState<string>('');

  const SUITS: ('♠' | '♥' | '♦' | '♣')[] = ['♠', '♥', '♦', '♣'];
  const LABELS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

  const getDeck = (): Card[] => {
    const deck: Card[] = [];
    SUITS.forEach((suit) => {
      LABELS.forEach((lbl, idx) => {
        deck.push({
          suit,
          value: idx + 2,
          label: lbl,
          color: suit === '♥' || suit === '♦' ? 'red' : 'black',
        });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const evaluateHand = (cards: Card[]): { rank: number; name: string } => {
    if (cards.length < 3) return { rank: 0, name: 'High Card' };
    const sorted = [...cards].sort((a, b) => b.value - a.value);
    const isFlush = cards.every((c) => c.suit === cards[0].suit);
    const isTrio = cards[0].value === cards[1].value && cards[1].value === cards[2].value;
    const isSeq =
      (sorted[0].value - sorted[1].value === 1 && sorted[1].value - sorted[2].value === 1) ||
      (sorted[0].value === 14 && sorted[1].value === 3 && sorted[2].value === 2); // A-2-3

    if (isTrio) return { rank: 6, name: `Trail / Trio (${sorted[0].label})` };
    if (isFlush && isSeq) return { rank: 5, name: 'Pure Sequence (Straight Flush)' };
    if (isSeq) return { rank: 4, name: 'Sequence (Straight)' };
    if (isFlush) return { rank: 3, name: 'Color (Flush)' };
    if (sorted[0].value === sorted[1].value || sorted[1].value === sorted[2].value) {
      return { rank: 2, name: 'Pair' };
    }
    return { rank: 1, name: `High Card (${sorted[0].label})` };
  };

  const startRound = () => {
    if (userBalance < bootBet) {
      alert('Insufficient balance for boot amount!');
      return;
    }

    soundService.playCardFlip();
    onUpdateBalance(userBalance - bootBet);

    const deck = getDeck();
    const pHand = [deck[0], deck[1], deck[2]];
    const bHand = [deck[3], deck[4], deck[5]];

    setPlayerCards(pHand);
    setBotCards(bHand);
    setSeenCards(false);
    setPot(bootBet * 2);
    setCurrentBet(bootBet);
    setGameStage('playing');
    setGameResult(null);
    setResultDesc('');
  };

  const handleChaal = () => {
    const cost = seenCards ? currentBet * 2 : currentBet;
    if (userBalance < cost) {
      alert('Insufficient balance for Chaal!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - cost);
    setPot((prev) => prev + cost * 2);
  };

  const handlePack = () => {
    soundService.playCardFlip();
    setGameStage('showdown');
    setGameResult('lose');
    setResultDesc('You packed (folded) the hand.');
    onRecordBet('cards_teen_patti', 'Teen Patti 3-Card', bootBet, 0, 0);
  };

  const handleShow = () => {
    soundService.playCardFlip();
    const pEval = evaluateHand(playerCards);
    let bEval = evaluateHand(botCards);

    // Admin rigging support
    let pWins = false;
    if (adminSettings.rtpMode === 'high_win') {
      pWins = Math.random() < 0.75;
    } else if (adminSettings.rtpMode === 'house_edge') {
      pWins = Math.random() < 0.25;
    } else {
      pWins = pEval.rank > bEval.rank || (pEval.rank === bEval.rank && playerCards[0].value >= botCards[0].value);
    }

    setGameStage('showdown');
    if (pWins) {
      soundService.playWin();
      onUpdateBalance(userBalance + pot);
      setGameResult('win');
      setResultDesc(`YOU WON THE POT! ${pEval.name} beats Banker`);
      onRecordBet('cards_teen_patti', 'Teen Patti 3-Card', currentBet, pot, Number((pot / currentBet).toFixed(2)));
    } else {
      soundService.playCrash();
      setGameResult('lose');
      setResultDesc(`BANKER WON! Banker has ${bEval.name}`);
      onRecordBet('cards_teen_patti', 'Teen Patti 3-Card', currentBet, 0, 0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0e1424] border border-amber-500/30 rounded-2xl p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundService.playClick();
              onBack();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base font-black text-amber-300 uppercase">TEEN PATTI 777</h2>
            <span className="text-[11px] text-slate-400">Classic Pakistani 3-Card Poker</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Table Felt */}
      <div className="bg-gradient-to-b from-[#0b3323] via-[#082418] to-[#04120b] border-4 border-amber-500/50 rounded-3xl p-4 sm:p-8 shadow-2xl relative">
        {/* Pot in Center */}
        <div className="text-center mb-6">
          <span className="inline-block bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow">
            💰 TOTAL POT: ₨ {pot.toLocaleString()}
          </span>
        </div>

        {/* Banker / Bot Cards */}
        <div className="text-center mb-8">
          <div className="text-xs text-slate-300 font-bold mb-2">BANKER HAND</div>
          <div className="flex justify-center gap-3">
            {(botCards.length > 0 ? botCards : [null, null, null]).map((c, i) => (
              <div
                key={i}
                className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-b from-blue-900 to-indigo-950 border-2 border-amber-400/60 flex flex-col items-center justify-center shadow-lg"
              >
                {gameStage === 'showdown' && c ? (
                  <div className={`text-center ${c.color === 'red' ? 'text-red-500' : 'text-slate-900'} bg-white w-full h-full rounded-lg flex flex-col justify-center`}>
                    <span className="text-sm sm:text-base font-black">{c.label}</span>
                    <span className="text-lg sm:text-xl">{c.suit}</span>
                  </div>
                ) : (
                  <span className="text-amber-300 text-xl font-black">777</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player Cards */}
        <div className="text-center">
          <div className="text-xs text-amber-300 font-bold mb-2 flex items-center justify-center gap-2">
            <span>YOUR HAND</span>
            {gameStage === 'playing' && !seenCards && (
              <button
                onClick={() => {
                  soundService.playCardFlip();
                  setSeenCards(true);
                }}
                className="px-2.5 py-0.5 bg-amber-400 text-slate-950 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" /> See Cards
              </button>
            )}
          </div>

          <div className="flex justify-center gap-3">
            {(playerCards.length > 0 ? playerCards : [null, null, null]).map((c, i) => (
              <div
                key={i}
                className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-amber-400 flex flex-col items-center justify-center shadow-xl transform transition-transform hover:-translate-y-1"
              >
                {(seenCards || gameStage === 'showdown') && c ? (
                  <div className={`text-center ${c.color === 'red' ? 'text-rose-600' : 'text-slate-950'}`}>
                    <span className="text-base sm:text-lg font-black">{c.label}</span>
                    <span className="text-xl sm:text-2xl block">{c.suit}</span>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-amber-700 to-yellow-900 rounded-lg flex items-center justify-center text-amber-200 font-black text-xs">
                    BLIND
                  </div>
                )}
              </div>
            ))}
          </div>

          {seenCards && playerCards.length === 3 && (
            <div className="mt-2 text-xs font-black text-yellow-300">
              {evaluateHand(playerCards).name}
            </div>
          )}
        </div>

        {/* Result Announcement */}
        {resultDesc && (
          <div
            className={`mt-6 p-3 rounded-2xl text-center font-black text-sm uppercase ${
              gameResult === 'win'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-rose-900 text-rose-200'
            }`}
          >
            {resultDesc}
          </div>
        )}
      </div>

      {/* Betting / Action Panel */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-4 shadow-xl space-y-3">
        {gameStage === 'idle' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold text-slate-400 uppercase">Boot (₨):</span>
              <div className="flex gap-1.5">
                {[20, 50, 100, 200, 500, 1000].map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      soundService.playChip();
                      setBootBet(b);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      bootBet === b
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'bg-slate-900 border border-slate-800 text-slate-400'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startRound}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-base uppercase tracking-wider shadow-lg cursor-pointer"
            >
              DEAL NEW HAND (BOOT ₨ {bootBet})
            </button>
          </div>
        ) : gameStage === 'playing' ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handlePack}
              className="py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-xs sm:text-sm uppercase cursor-pointer"
            >
              PACK (FOLD)
            </button>
            <button
              onClick={handleChaal}
              className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-xs sm:text-sm uppercase cursor-pointer"
            >
              CHAAL (+₨ {seenCards ? currentBet * 2 : currentBet})
            </button>
            <button
              onClick={handleShow}
              className="py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm uppercase cursor-pointer"
            >
              SHOW CARDS
            </button>
          </div>
        ) : (
          <button
            onClick={startRound}
            className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm uppercase tracking-wider cursor-pointer"
          >
            PLAY NEXT HAND
          </button>
        )}
      </div>
    </div>
  );
};
