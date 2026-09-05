import { GameRoom, RoomPlayer } from './types.js';

export type LudoColor = 'red' | 'green' | 'yellow' | 'blue';

export interface LudoPawn {
  id: number;
  color: LudoColor;
  step: number; // -1 = base, 0..50 = main track, 51..55 = home corridor, 56 = home
}

export interface LudoGameState {
  currentTurnColor: LudoColor;
  turnOrder: LudoColor[];
  diceValue: number;
  hasRolled: boolean;
  consecutiveSixes: number;
  pawns: Record<LudoColor, LudoPawn[]>;
  winners: LudoColor[];
  pot: number;
  log: string[];
}

export const SAFE_SQUARES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const COLOR_OFFSETS: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export class LudoEngine {
  public static initializeGame(room: GameRoom): LudoGameState {
    const activeColors: LudoColor[] = ['red', 'green', 'yellow', 'blue'].slice(0, room.players.length) as LudoColor[];
    
    // Assign colors to players
    room.players.forEach((p, idx) => {
      p.ludoColor = activeColors[idx];
    });

    const pawns: Record<LudoColor, LudoPawn[]> = {
      red: [0, 1, 2, 3].map(id => ({ id, color: 'red', step: -1 })),
      green: [0, 1, 2, 3].map(id => ({ id, color: 'green', step: -1 })),
      yellow: [0, 1, 2, 3].map(id => ({ id, color: 'yellow', step: -1 })),
      blue: [0, 1, 2, 3].map(id => ({ id, color: 'blue', step: -1 })),
    };

    // Auto put 1 pawn on field for fast, snappy fun
    activeColors.forEach(c => {
      pawns[c][0].step = 0;
    });

    return {
      currentTurnColor: activeColors[0],
      turnOrder: activeColors,
      diceValue: 6,
      hasRolled: false,
      consecutiveSixes: 0,
      pawns,
      winners: [],
      pot: room.stake * room.players.length,
      log: ['Game started! Roll dice to begin.'],
    };
  }

  public static canPawnMove(pawn: LudoPawn, roll: number): boolean {
    if (pawn.step === 56) return false;
    if (pawn.step === -1) return roll === 6;
    if (pawn.step + roll > 56) return false;
    return true;
  }

  public static getMovablePawns(state: LudoGameState, color: LudoColor, roll: number): LudoPawn[] {
    return state.pawns[color].filter(p => this.canPawnMove(p, roll));
  }

  public static rollDice(state: LudoGameState, color: LudoColor): { roll: number; canMove: boolean } {
    if (state.hasRolled || state.currentTurnColor !== color) {
      return { roll: state.diceValue, canMove: false };
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    state.diceValue = roll;
    state.hasRolled = true;

    if (roll === 6) {
      state.consecutiveSixes += 1;
    } else {
      state.consecutiveSixes = 0;
    }

    // 3 consecutive sixes forfeits turn
    if (state.consecutiveSixes >= 3) {
      state.log.push(`${color.toUpperCase()} rolled three 6s! Turn skipped.`);
      this.advanceTurn(state, false);
      return { roll, canMove: false };
    }

    const movable = this.getMovablePawns(state, color, roll);
    state.log.push(`${color.toUpperCase()} rolled a ${roll}.`);

    if (movable.length === 0) {
      // Pass turn after delay
      this.advanceTurn(state, roll === 6);
      return { roll, canMove: false };
    }

    return { roll, canMove: true };
  }

  public static movePawn(state: LudoGameState, color: LudoColor, pawnId: number): { captured: boolean; won: boolean } {
    const pawn = state.pawns[color].find(p => p.id === pawnId);
    if (!pawn || !this.canPawnMove(pawn, state.diceValue)) {
      return { captured: false, won: false };
    }

    let nextStep = pawn.step === -1 ? 0 : pawn.step + state.diceValue;
    pawn.step = nextStep;

    let captured = false;

    // Check knockout capture on main track (0..50)
    if (nextStep >= 0 && nextStep <= 50) {
      const myGlobalPos = (COLOR_OFFSETS[color] + nextStep) % 52;
      if (!SAFE_SQUARES.has(myGlobalPos)) {
        // Check opponent pawns
        for (const oppColor of state.turnOrder) {
          if (oppColor !== color) {
            for (const oppPawn of state.pawns[oppColor]) {
              if (oppPawn.step >= 0 && oppPawn.step <= 50) {
                const oppGlobalPos = (COLOR_OFFSETS[oppColor] + oppPawn.step) % 52;
                if (oppGlobalPos === myGlobalPos) {
                  // Capture! Send back to base
                  oppPawn.step = -1;
                  captured = true;
                  state.log.push(`💥 ${color.toUpperCase()} captured ${oppColor.toUpperCase()}'s pawn!`);
                }
              }
            }
          }
        }
      }
    }

    // Check if player won (2 pawns finished is a quick win for play-money arcade)
    const homeCount = state.pawns[color].filter(p => p.step === 56).length;
    if (homeCount >= 2 && !state.winners.includes(color)) {
      state.winners.push(color);
      state.log.push(`🏆 ${color.toUpperCase()} reached Home and won the match!`);
      return { captured, won: true };
    }

    // Next turn or extra turn on 6 or capture
    const extraTurn = state.diceValue === 6 || captured;
    this.advanceTurn(state, extraTurn);

    return { captured, won: false };
  }

  public static advanceTurn(state: LudoGameState, extraTurn: boolean) {
    state.hasRolled = false;
    if (extraTurn) {
      state.log.push(`Extra roll awarded to ${state.currentTurnColor.toUpperCase()}!`);
      return;
    }
    const idx = state.turnOrder.indexOf(state.currentTurnColor);
    const nextIdx = (idx + 1) % state.turnOrder.length;
    state.currentTurnColor = state.turnOrder[nextIdx];
    state.consecutiveSixes = 0;
  }
}
