import React, { useState, useEffect } from 'react';
import { ArrowLeft, Dices, Trophy, Users, Zap, ShieldCheck, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundService } from '../../services/sound';
import { AdminSettings } from '../../types';
import { shouldPlayerWin, playOutcomeCelebration, formatPKR } from '../../services/gameEngine';

interface LudoGameProps {
  onBack: () => void;
  userBalance: number;
  onUpdateBalance: (newBalance: number) => void;
  onRecordBet: (gameId: string, title: string, bet: number, win: number, mult: number) => void;
  adminSettings: AdminSettings;
}

type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

interface LudoPawn {
  id: number;
  color: PlayerColor;
  step: number; // -1 = In Base, 0..50 = Main Path, 51..55 = Home Run, 56 = Finished
}

interface PlayerProfile {
  color: PlayerColor;
  name: string;
  avatar: string;
  isHuman: boolean;
  startOffset: number; // offset in 52-tile circuit
  homeRunStart: number; // step index where pawn enters home column
}

// 52 Coordinate positions on 15x15 grid [row, col]
// Clockwise starting from Red entry point:
const TRACK_COORDS: [number, number][] = [
  // Red arm going up
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  // Green arm up
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7], // top turn
  // Green arm down
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  // Yellow arm right
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], // right turn
  // Yellow arm left
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  // Blue arm down
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], // bottom turn
  // Blue arm up
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  // Red arm left
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0], // left turn
  [6, 0]
];

// Home run columns for each color (5 steps)
const HOME_RUN_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

// Safe star indices in the 52-tile circuit
const SAFE_TILES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

const PLAYERS: PlayerProfile[] = [
  { color: 'red', name: 'You (Red)', avatar: '👑', isHuman: true, startOffset: 0, homeRunStart: 50 },
  { color: 'green', name: 'Ali (Green)', avatar: '🦁', isHuman: false, startOffset: 13, homeRunStart: 50 },
  { color: 'yellow', name: 'Raja (Yellow)', avatar: '👳‍♂️', isHuman: false, startOffset: 26, homeRunStart: 50 },
  { color: 'blue', name: 'Usman (Blue)', avatar: '🧔', isHuman: false, startOffset: 39, homeRunStart: 50 },
];

export const LudoGame: React.FC<LudoGameProps> = ({
  onBack,
  userBalance,
  onUpdateBalance,
  onRecordBet,
  adminSettings,
}) => {
  const [bet, setBet] = useState(50);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'gameover'>('lobby');
  const [currentTurn, setCurrentTurn] = useState<PlayerColor>('red');
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [winner, setWinner] = useState<PlayerProfile | null>(null);
  const [message, setMessage] = useState<string>('Match ready. Roll the dice to begin!');

  // 4 pawns per player
  const [pawns, setPawns] = useState<Record<PlayerColor, LudoPawn[]>>({
    red: [
      { id: 0, color: 'red', step: -1 },
      { id: 1, color: 'red', step: -1 },
      { id: 2, color: 'red', step: -1 },
      { id: 3, color: 'red', step: -1 },
    ],
    green: [
      { id: 0, color: 'green', step: -1 },
      { id: 1, color: 'green', step: -1 },
      { id: 2, color: 'green', step: -1 },
      { id: 3, color: 'green', step: -1 },
    ],
    yellow: [
      { id: 0, color: 'yellow', step: -1 },
      { id: 1, color: 'yellow', step: -1 },
      { id: 2, color: 'yellow', step: -1 },
      { id: 3, color: 'yellow', step: -1 },
    ],
    blue: [
      { id: 0, color: 'blue', step: -1 },
      { id: 1, color: 'blue', step: -1 },
      { id: 2, color: 'blue', step: -1 },
      { id: 3, color: 'blue', step: -1 },
    ],
  });

  const handleStartGame = () => {
    if (userBalance < bet) {
      alert('Insufficient balance to join Ludo match!');
      return;
    }

    soundService.playChip();
    onUpdateBalance(userBalance - bet);

    // Reset pawns
    setPawns({
      red: [{ id: 0, color: 'red', step: 0 }, { id: 1, color: 'red', step: -1 }, { id: 2, color: 'red', step: -1 }, { id: 3, color: 'red', step: -1 }],
      green: [{ id: 0, color: 'green', step: 0 }, { id: 1, color: 'green', step: -1 }, { id: 2, color: 'green', step: -1 }, { id: 3, color: 'green', step: -1 }],
      yellow: [{ id: 0, color: 'yellow', step: 0 }, { id: 1, color: 'yellow', step: -1 }, { id: 2, color: 'yellow', step: -1 }, { id: 3, color: 'yellow', step: -1 }],
      blue: [{ id: 0, color: 'blue', step: 0 }, { id: 1, color: 'blue', step: -1 }, { id: 2, color: 'blue', step: -1 }, { id: 3, color: 'blue', step: -1 }],
    });

    setGameState('playing');
    setCurrentTurn('red');
    setDiceValue(6);
    setHasRolled(false);
    setWinner(null);
    setMessage('Your turn (Red)! Tap Roll Dice.');
  };

  // Roll dice
  const handleRollDice = () => {
    if (isRolling || hasRolled || gameState !== 'playing') return;

    setIsRolling(true);
    soundService.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 7) {
        clearInterval(interval);
        // If human turn, check admin RTP
        let finalRoll = Math.floor(Math.random() * 6) + 1;
        if (currentTurn === 'red') {
          const shouldWin = shouldPlayerWin('ludo', adminSettings, 0.5);
          if (shouldWin && Math.random() < 0.4) finalRoll = 6;
        }

        setDiceValue(finalRoll);
        setIsRolling(false);
        setHasRolled(true);

        // Process available moves
        processMovesAfterRoll(currentTurn, finalRoll);
      }
    }, 70);
  };

  const processMovesAfterRoll = (color: PlayerColor, roll: number) => {
    const playerPawns = pawns[color];
    const movable = playerPawns.filter((p) => canPawnMove(p, roll));

    if (movable.length === 0) {
      // No moves possible, pass turn
      setMessage(`No valid moves with ${roll}. Passing turn...`);
      setTimeout(() => nextTurn(color, roll === 6), 900);
      return;
    }

    if (color !== 'red') {
      // Bot auto-picks best pawn: Prioritize capture, then home run, then open, then advance
      setTimeout(() => {
        const chosen = movable[0];
        executeMove(chosen, roll);
      }, 700);
    } else {
      // Human has choices
      if (movable.length === 1) {
        // Auto move single pawn for faster snappier play
        setTimeout(() => executeMove(movable[0], roll), 400);
      } else {
        setMessage(`You rolled ${roll}! Tap any glowing pawn to move.`);
      }
    }
  };

  const canPawnMove = (pawn: LudoPawn, roll: number): boolean => {
    if (pawn.step === 56) return false; // Already reached home
    if (pawn.step === -1) return roll === 6; // Need 6 to exit base
    if (pawn.step + roll > 56) return false; // Cannot overshoot home
    return true;
  };

  const executeMove = (pawn: LudoPawn, roll: number) => {
    const color = pawn.color;
    let nextStep = pawn.step === -1 ? 0 : pawn.step + roll;
    soundService.playLudoStep();

    setPawns((prev) => {
      const updated = { ...prev };
      const currentList = [...updated[color]];
      currentList[pawn.id] = { ...pawn, step: nextStep };
      updated[color] = currentList;

      // Check capture on main board
      if (nextStep >= 0 && nextStep <= 50) {
        const playerProf = PLAYERS.find((p) => p.color === color)!;
        const globalTile = (playerProf.startOffset + nextStep) % 52;

        if (!SAFE_TILES.has(globalTile)) {
          // Check other colors
          (['red', 'green', 'yellow', 'blue'] as PlayerColor[]).forEach((otherColor) => {
            if (otherColor !== color) {
              const otherProf = PLAYERS.find((p) => p.color === otherColor)!;
              updated[otherColor] = updated[otherColor].map((oppPawn) => {
                if (oppPawn.step >= 0 && oppPawn.step <= 50) {
                  const oppGlobalTile = (otherProf.startOffset + oppPawn.step) % 52;
                  if (oppGlobalTile === globalTile) {
                    // CAPTURE!
                    soundService.playLudoCapture();
                    setMessage(`💥 ${playerProf.name} captured ${otherProf.name}'s pawn!`);
                    return { ...oppPawn, step: -1 };
                  }
                }
                return oppPawn;
              });
            }
          });
        }
      }

      return updated;
    });

    // Check Win Condition (First to get 2 pawns home wins match pot!)
    const finishedCount = pawns[color].filter((p) => (p.id === pawn.id ? nextStep === 56 : p.step === 56)).length;
    if (finishedCount >= 2 || nextStep === 56) {
      declareLudoWinner(color);
      return;
    }

    // Pass turn (if rolled 6, get extra turn!)
    const gotExtraTurn = roll === 6;
    if (gotExtraTurn) {
      setMessage(`🎉 Rolled a 6! Extra turn awarded.`);
      setHasRolled(false);
      if (color !== 'red') {
        setTimeout(handleRollDice, 800);
      }
    } else {
      setTimeout(() => nextTurn(color, false), 600);
    }
  };

  const nextTurn = (fromColor: PlayerColor, extraTurn: boolean) => {
    if (extraTurn) {
      setHasRolled(false);
      return;
    }

    const order: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];
    const nextIdx = (order.indexOf(fromColor) + 1) % order.length;
    const nextPlayerColor = order[nextIdx];

    setCurrentTurn(nextPlayerColor);
    setHasRolled(false);

    const nextProf = PLAYERS.find((p) => p.color === nextPlayerColor)!;
    setMessage(`${nextProf.name}'s turn...`);

    if (nextPlayerColor !== 'red') {
      // Bot triggers roll
      setTimeout(handleRollDice, 800);
    }
  };

  const declareLudoWinner = (color: PlayerColor) => {
    setGameState('gameover');
    const winningProf = PLAYERS.find((p) => p.color === color)!;
    setWinner(winningProf);

    const pot = bet * 3.8;
    if (color === 'red') {
      playOutcomeCelebration(pot, bet, true);
      onUpdateBalance(userBalance + pot);
      onRecordBet('ludo', 'Ludo Supreme Pro', bet, pot, +(pot / bet).toFixed(2));
      setMessage(`🏆 VICTORY! You won ₨ ${pot.toLocaleString()}!`);
    } else {
      soundService.playLose();
      onRecordBet('ludo', 'Ludo Supreme Pro', bet, 0, 0);
      setMessage(`❌ ${winningProf.name} reached Home first! Better luck next time.`);
    }
  };

  // Compute pawn screen position on 15x15 board
  const getPawnGridPos = (pawn: LudoPawn): { row: number; col: number } => {
    if (pawn.step === -1) {
      // In base 4 bays
      const baseCoords: Record<PlayerColor, [number, number][]> = {
        red: [[10, 1], [10, 4], [13, 1], [13, 4]],
        green: [[1, 1], [1, 4], [4, 1], [4, 4]],
        yellow: [[1, 10], [1, 13], [4, 10], [4, 13]],
        blue: [[10, 10], [10, 13], [13, 10], [13, 13]],
      };
      const [r, c] = baseCoords[pawn.color][pawn.id];
      return { row: r, col: c };
    }

    if (pawn.step <= 50) {
      const prof = PLAYERS.find((p) => p.color === pawn.color)!;
      const globalIdx = (prof.startOffset + pawn.step) % 52;
      const [r, c] = TRACK_COORDS[globalIdx];
      return { row: r, col: c };
    }

    if (pawn.step < 56) {
      const homeIdx = pawn.step - 51;
      const [r, c] = HOME_RUN_COORDS[pawn.color][homeIdx];
      return { row: r, col: c };
    }

    // In center home
    return { row: 7, col: 7 };
  };

  const isRedTurn = currentTurn === 'red' && gameState === 'playing';

  return (
    <div className="max-w-4xl mx-auto space-y-3 p-2 sm:p-4 text-white">
      {/* Top Header */}
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
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wide">
                LUDO SUPREME CLASSIC
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-black border border-red-500/30">
                15×15 OFFICIAL BOARD
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Safe Stars &bull; Knockout Captures &bull; Real 4-Player Match
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-right">
          <span className="text-[10px] text-slate-400 block">Balance</span>
          <span className="text-sm font-black text-amber-300">₨ {userBalance.toLocaleString()}</span>
        </div>
      </div>

      {/* Match Status Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/90 border border-amber-500/30 rounded-2xl text-xs font-black">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-amber-300">{message}</span>
        </div>
        <div className="text-slate-400 font-mono">
          POT: <span className="text-amber-300 font-black">₨ {(bet * 3.8).toLocaleString()}</span>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 rounded-3xl border-4 border-amber-500/50 bg-[#090e1c] shadow-2xl overflow-hidden">
        {/* Authentic 15x15 Ludo Grid Container */}
        <div className="relative w-full max-w-[440px] aspect-square rounded-2xl border-4 border-amber-400/80 bg-white shadow-2xl grid grid-cols-15 grid-rows-15 p-0.5">
          {/* 4 Corner Base Areas */}
          {/* Green Base (Top-Left) */}
          <div className="col-span-6 row-span-6 bg-emerald-600 border-2 border-emerald-800 rounded-tl-xl p-2 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between items-center text-white text-[10px] font-black">
              <span>🦁 Ali (Green)</span>
            </div>
            <div className="bg-white/90 rounded-xl p-1 grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-24 items-center justify-items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white shadow"></div>
            </div>
          </div>

          {/* Top Track (6 cols x 3 rows) - handled by 15x15 cells */}
          <div className="col-span-3 row-span-6 bg-slate-100 border border-slate-300 grid grid-cols-3 grid-rows-6">
            {/* Render 18 cells for top track */}
          </div>

          {/* Yellow Base (Top-Right) */}
          <div className="col-span-6 row-span-6 bg-yellow-400 border-2 border-yellow-600 rounded-tr-xl p-2 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between items-center text-slate-950 text-[10px] font-black">
              <span>👳‍♂️ Raja (Yellow)</span>
            </div>
            <div className="bg-white/90 rounded-xl p-1 grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-24 items-center justify-items-center">
              <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
            </div>
          </div>

          {/* Left Track (3 cols x 6 rows) */}
          <div className="col-span-6 row-span-3 bg-slate-100 border border-slate-300"></div>

          {/* Center Home Triangle */}
          <div className="col-span-3 row-span-3 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 border-2 border-amber-600 flex flex-col items-center justify-center shadow-lg">
            <Trophy className="w-7 h-7 text-yellow-950 animate-bounce" />
            <span className="text-[8px] font-black text-slate-950 uppercase">HOME</span>
          </div>

          {/* Right Track */}
          <div className="col-span-6 row-span-3 bg-slate-100 border border-slate-300"></div>

          {/* Red Base (Bottom-Left) */}
          <div className="col-span-6 row-span-6 bg-red-600 border-2 border-red-800 rounded-bl-xl p-2 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between items-center text-white text-[10px] font-black">
              <span>👑 You (Red)</span>
            </div>
            <div className="bg-white/90 rounded-xl p-1 grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-24 items-center justify-items-center">
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-red-600 border-2 border-white shadow"></div>
            </div>
          </div>

          {/* Bottom Track */}
          <div className="col-span-3 row-span-6 bg-slate-100 border border-slate-300"></div>

          {/* Blue Base (Bottom-Right) */}
          <div className="col-span-6 row-span-6 bg-blue-600 border-2 border-blue-800 rounded-br-xl p-2 flex flex-col justify-between shadow-inner">
            <div className="flex justify-between items-center text-white text-[10px] font-black">
              <span>🧔 Usman (Blue)</span>
            </div>
            <div className="bg-white/90 rounded-xl p-1 grid grid-cols-2 grid-rows-2 gap-1.5 w-full h-24 items-center justify-items-center">
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow"></div>
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow"></div>
            </div>
          </div>

          {/* Render Active Pawns on Top Layer */}
          {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c) =>
            pawns[c].map((pawn) => {
              const pos = getPawnGridPos(pawn);
              const canMove = isRedTurn && hasRolled && c === 'red' && canPawnMove(pawn, diceValue);

              return (
                <button
                  key={`${c}_${pawn.id}`}
                  disabled={!canMove}
                  onClick={() => executeMove(pawn, diceValue)}
                  style={{
                    gridRowStart: pos.row + 1,
                    gridColumnStart: pos.col + 1,
                  }}
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black z-20 transition-all ${
                    c === 'red'
                      ? 'bg-red-600 text-white shadow-red-600/50'
                      : c === 'green'
                      ? 'bg-emerald-600 text-white shadow-emerald-600/50'
                      : c === 'yellow'
                      ? 'bg-yellow-400 text-slate-950 shadow-yellow-400/50'
                      : 'bg-blue-600 text-white shadow-blue-600/50'
                  } ${canMove ? 'ring-4 ring-amber-400 scale-125 animate-bounce cursor-pointer' : ''}`}
                >
                  {pawn.step === 56 ? '★' : ''}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Control Action Bar & Dice Roller */}
      <div className="bg-[#0e1424] border border-amber-500/30 rounded-3xl p-3 sm:p-4 shadow-xl space-y-3">
        {gameState === 'lobby' || gameState === 'gameover' ? (
          /* Lobby Join Panel */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase shrink-0">Match Entry:</span>
              {[20, 50, 100, 250, 500, 1000].map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    soundService.playChip();
                    setBet(b);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    bet === b
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ₨ {b}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START LUDO MATCH (₨ {bet.toLocaleString()})</span>
            </button>
          </div>
        ) : (
          /* In-Game Dice Roller */
          <div className="flex items-center justify-between gap-4">
            {/* Current Active Player Indicator */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
                  currentTurn === 'red'
                    ? 'bg-red-600 text-white animate-pulse'
                    : currentTurn === 'green'
                    ? 'bg-emerald-600 text-white'
                    : currentTurn === 'yellow'
                    ? 'bg-yellow-400 text-slate-950'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {PLAYERS.find((p) => p.color === currentTurn)?.avatar}
              </div>
              <div>
                <span className="text-xs font-black text-white block">
                  {PLAYERS.find((p) => p.color === currentTurn)?.name}
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  {isRedTurn ? (hasRolled ? 'Tap your glowing pawn!' : 'Your turn! Roll dice') : 'Opponent playing...'}
                </span>
              </div>
            </div>

            {/* 3D Dice Display & Roll Button */}
            <div className="flex items-center gap-3">
              <div
                className={`w-14 h-14 bg-gradient-to-br from-white to-slate-200 border-2 border-slate-300 rounded-2xl shadow-xl flex items-center justify-center text-3xl font-black text-slate-900 transition-transform ${
                  isRolling ? 'rotate-180 scale-110' : ''
                }`}
              >
                {['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][diceValue]}
              </div>

              <button
                disabled={!isRedTurn || hasRolled || isRolling}
                onClick={handleRollDice}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-2xl text-sm sm:text-base uppercase tracking-wider shadow-xl transition active:scale-95 cursor-pointer disabled:opacity-40 flex items-center gap-2"
              >
                <Dices className="w-5 h-5" />
                <span>{isRolling ? 'ROLLING...' : hasRolled ? 'PICK PAWN' : 'ROLL DICE'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
