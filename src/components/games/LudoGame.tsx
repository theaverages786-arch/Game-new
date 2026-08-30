import React, { useState, useEffect } from 'react';
import { ArrowLeft, Dices, Trophy, Users, Zap, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';

interface LudoGameProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

type LudoMode = 'quick' | 'classic';

interface Token {
  id: number;
  position: number; // 0=Home Base, 1..52 Board, 53..57 Home Stretch, 58=Finished
  isHome: boolean;
}

export const LudoGame: React.FC<LudoGameProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [mode, setMode] = useState<LudoMode>('quick');
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'winner'>('lobby');
  const [currentTurn, setCurrentTurn] = useState<number>(0); // 0=Player(Red), 1=Green, 2=Yellow, 3=Blue
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [playerTokens, setPlayerTokens] = useState<Token[]>([
    { id: 1, position: 0, isHome: true },
    { id: 2, position: 0, isHome: true },
  ]);
  const [botTokens, setBotTokens] = useState<{ [key: number]: number[] }>({
    1: [0, 0],
    2: [0, 0],
    3: [0, 0],
  });
  const [winner, setWinner] = useState<string | null>(null);
  const [historyLog, setHistoryLog] = useState<string[]>(['Match started. Roll 6 to exit home!']);

  const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const handleStartMatch = () => {
    if (userBalance < bet) {
      alert('Insufficient balance to join Ludo match!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    setPlayerTokens([
      { id: 1, position: 0, isHome: true },
      { id: 2, position: 0, isHome: true },
    ]);
    setBotTokens({ 1: [0, 0], 2: [0, 0], 3: [0, 0] });
    setGameState('playing');
    setCurrentTurn(0);
    setWinner(null);
    setHistoryLog(['Match started. Your turn! Roll dice.']);
  };

  const handleRollDice = () => {
    if (isRolling || currentTurn !== 0 || gameState !== 'playing') return;

    setIsRolling(true);
    soundService.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalRoll);
        setIsRolling(false);
        processPlayerMove(finalRoll);
      }
    }, 80);
  };

  const processPlayerMove = (roll: number) => {
    setPlayerTokens(prev => {
      const tokens = [...prev];
      let moved = false;

      // Prioritize moving token on board
      for (let i = 0; i < tokens.length; i++) {
        if (!tokens[i].isHome && tokens[i].position < (mode === 'quick' ? 25 : 58)) {
          tokens[i].position += roll;
          moved = true;
          setHistoryLog(h => [`You moved Token #${tokens[i].id} by ${roll} steps`, ...h.slice(0, 5)]);
          soundService.playClick();
          break;
        }
      }

      // If no token on board, check if roll == 6 to open
      if (!moved && roll === 6) {
        const homeToken = tokens.find(t => t.isHome);
        if (homeToken) {
          homeToken.isHome = false;
          homeToken.position = 1;
          setHistoryLog(h => [`🎉 Token #${homeToken.id} entered board!`, ...h.slice(0, 5)]);
          soundService.playWin();
          moved = true;
        }
      }

      // Check win condition
      const targetPos = mode === 'quick' ? 25 : 58;
      if (tokens.some(t => t.position >= targetPos)) {
        handleGameWin(true);
      } else {
        // Next Bot turns
        setTimeout(playBotTurns, 800);
      }

      return tokens;
    });
  };

  const playBotTurns = () => {
    // Simulate other 3 players
    setCurrentTurn(1);
    setTimeout(() => {
      setCurrentTurn(2);
      setTimeout(() => {
        setCurrentTurn(3);
        setTimeout(() => {
          // Check if bot reached goal
          const rtp = adminSettings?.rtpRate ?? 92;
          const botWins = Math.random() * 100 > rtp && Math.random() < 0.2;
          if (botWins) {
            handleGameWin(false);
          } else {
            setCurrentTurn(0);
            setHistoryLog(h => ['Your turn! Roll the dice.', ...h.slice(0, 5)]);
          }
        }, 500);
      }, 500);
    }, 500);
  };

  const handleGameWin = (userWon: boolean) => {
    setGameState('winner');
    const pot = bet * 3.8;
    if (userWon) {
      onUpdateBalance(userBalance + pot);
      onRecordBet('ludo', `Ludo Champions (${mode.toUpperCase()})`, bet, pot, +(pot / bet).toFixed(2));
      setWinner(`🏆 VICTORY! You won the Ludo Pot: +Rs ${pot.toLocaleString()}`);
      soundService.playWin();
    } else {
      onRecordBet('ludo', `Ludo Champions (${mode.toUpperCase()})`, bet, 0, 0);
      setWinner('Player 3 (Green) reached Home first! Better luck next match.');
      soundService.playLose();
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-[#1c1204] via-[#2d1b06] to-[#0f0902] text-slate-100 rounded-3xl p-3 sm:p-5 border border-amber-600/40 shadow-2xl relative flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-800/60 pb-3">
        <button
          onClick={() => {
            soundService.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-lg font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            LUDO SUPREME CHAMPIONSHIP
          </h1>
          <span className="text-[10px] text-amber-300 font-medium">4 Players • Quick (1 Token Home) / Classic</span>
        </div>

        <div className="bg-black/60 px-3 py-1 rounded-xl border border-amber-500/30 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">BALANCE</span>
          <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
            Rs {userBalance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="my-auto bg-[#1a0f03] border-4 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between relative min-h-[380px]">
        {/* Opponent Avatars */}
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
            <span className="text-xl">🟢</span>
            <div className="text-left">
              <span className="text-xs font-bold text-emerald-300 block">Ali_Raza</span>
              <span className="text-[9px] text-slate-400">Score: 18/25</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 px-3 py-1.5 rounded-xl">
            <span className="text-xl">🔵</span>
            <div className="text-left">
              <span className="text-xs font-bold text-blue-300 block">Hamza_99</span>
              <span className="text-[9px] text-slate-400">Score: 12/25</span>
            </div>
          </div>
        </div>

        {/* Interactive Ludo Board Cross */}
        <div className="w-64 h-64 sm:w-72 sm:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-black border-4 border-amber-400/80 rounded-2xl grid grid-cols-3 grid-rows-3 p-1.5 gap-1 shadow-2xl relative">
          {/* Red Base (User) */}
          <div className="bg-red-600/80 border-2 border-red-400 rounded-xl flex items-center justify-center gap-2">
            {playerTokens.map(t => (
              <div
                key={t.id}
                className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-black text-[10px] shadow-lg ${
                  t.isHome ? 'bg-red-800 text-white' : 'bg-yellow-400 text-slate-950 ring-2 ring-white animate-bounce'
                }`}
              >
                🔴
              </div>
            ))}
          </div>

          {/* Top Track (Green Track) */}
          <div className="bg-emerald-950/80 border border-emerald-600/40 rounded-xl flex flex-col items-center justify-center text-xs font-black text-emerald-300">
            <span>⬆️ PATH</span>
          </div>

          {/* Green Base */}
          <div className="bg-emerald-600/80 border-2 border-emerald-400 rounded-xl flex items-center justify-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="text-lg">🟢</span>
          </div>

          {/* Left Track */}
          <div className="bg-red-950/80 border border-red-600/40 rounded-xl flex items-center justify-center text-xs font-black text-red-300">
            <span>START 🔴</span>
          </div>

          {/* Center Crown / Home Triangle */}
          <div className="bg-amber-500 border-2 border-yellow-300 rounded-xl flex flex-col items-center justify-center shadow-inner text-slate-950">
            <Trophy className="w-7 h-7 text-yellow-900 animate-pulse" />
            <span className="text-[9px] font-black uppercase">HOME</span>
          </div>

          {/* Right Track */}
          <div className="bg-blue-950/80 border border-blue-600/40 rounded-xl flex items-center justify-center text-xs font-black text-blue-300">
            <span>BLUE 🔵</span>
          </div>

          {/* Yellow Base */}
          <div className="bg-yellow-600/80 border-2 border-yellow-400 rounded-xl flex items-center justify-center gap-2">
            <span className="text-lg">🟡</span>
            <span className="text-lg">🟡</span>
          </div>

          {/* Bottom Track */}
          <div className="bg-yellow-950/80 border border-yellow-600/40 rounded-xl flex flex-col items-center justify-center text-xs font-black text-yellow-300">
            <span>⬇️ FINISH</span>
          </div>

          {/* Blue Base */}
          <div className="bg-blue-600/80 border-2 border-blue-400 rounded-xl flex items-center justify-center gap-2">
            <span className="text-lg">🔵</span>
            <span className="text-lg">🔵</span>
          </div>
        </div>

        {/* Active Log & Dice Box */}
        {gameState === 'playing' && (
          <div className="flex items-center justify-between w-full mt-3 bg-black/60 p-3 rounded-2xl border border-amber-500/30">
            <div className="text-left max-w-xs">
              <span className="text-[10px] text-amber-300 font-bold block">
                {currentTurn === 0 ? '👉 YOUR TURN (RED)' : '⏳ Opponents Rolling...'}
              </span>
              <span className="text-xs text-slate-300 truncate block">{historyLog[0]}</span>
            </div>

            {/* Rolling Dice */}
            <button
              onClick={handleRollDice}
              disabled={isRolling || currentTurn !== 0}
              className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-4xl shadow-xl transition-all duration-200 cursor-pointer ${
                currentTurn === 0
                  ? 'bg-gradient-to-br from-amber-400 to-yellow-500 border-yellow-200 text-slate-950 scale-105 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400 opacity-60'
              }`}
            >
              {diceFaces[diceValue - 1]}
            </button>
          </div>
        )}

        {/* Winner Announcement */}
        {winner && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 z-20">
            <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
            <h2 className="text-lg sm:text-xl font-black text-white text-center mb-4">{winner}</h2>
            <button
              onClick={() => setGameState('lobby')}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-xl hover:scale-105 transition cursor-pointer"
            >
              Play Another Match
            </button>
          </div>
        )}
      </div>

      {/* Betting / Join Bar */}
      <div className="bg-[#120802] border border-amber-700/50 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 mt-3">
        {gameState === 'lobby' ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Mode:</span>
              <button
                onClick={() => setMode('quick')}
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  mode === 'quick' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                ⚡ Quick (1 Token)
              </button>
              <button
                onClick={() => setMode('classic')}
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  mode === 'classic' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                👑 Classic (All Home)
              </button>
            </div>

            <div className="flex items-center gap-2">
              {[20, 50, 100, 200, 500].map(b => (
                <button
                  key={b}
                  onClick={() => setBet(b)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    bet === b ? 'bg-amber-400 text-slate-950 shadow' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Rs {b}
                </button>
              ))}
              <button
                onClick={handleStartMatch}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-sm shadow-lg hover:scale-105 transition cursor-pointer"
              >
                Join Table (Pot Rs {bet * 4})
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-amber-300 font-bold">
              Table Pot: Rs {(bet * 3.8).toLocaleString()}
            </span>
            <button
              onClick={() => setGameState('lobby')}
              className="px-4 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
            >
              Surrender / Leave
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
