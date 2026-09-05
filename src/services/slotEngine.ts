/**
 * Modular Slot Machine Engine
 * 
 * Standalone multi-dimensional array generator, payline evaluator, 
 * JSON symbol weight configs, and RTP controller math.
 */

export interface SlotSymbol {
  id: string;
  name: string;
  payout3: number;
  payout4?: number;
  payout5?: number;
  icon: string;
  weight: number; // Higher weight = higher hit probability
  isWild?: boolean;
  isScatter?: boolean;
  color?: string;
}

export interface SlotPayline {
  id: number;
  name: string;
  coords: [number, number][]; // [col, row]
}

export interface SlotThemeConfig {
  id: string;
  title: string;
  reels: number;
  rows: number;
  rtpDefault: number; // e.g. 96.5%
  symbols: SlotSymbol[];
  paylines: SlotPayline[];
  bonusReel?: boolean;
}

// 1. Classic 777 (3x3, 5 Paylines)
export const CLASSIC_777_CONFIG: SlotThemeConfig = {
  id: 'slots_777',
  title: 'Classic 777 Las Vegas',
  reels: 3,
  rows: 3,
  rtpDefault: 96.5,
  symbols: [
    { id: '7_red', name: 'Red 7', payout3: 50, icon: '7️⃣', weight: 4, color: 'text-red-500' },
    { id: 'diamond', name: 'Diamond Wild', payout3: 100, icon: '💎', weight: 2, isWild: true, color: 'text-cyan-400' },
    { id: 'bar3', name: 'Triple Bar', payout3: 20, icon: '🎰', weight: 8, color: 'text-yellow-400' },
    { id: 'bell', name: 'Golden Bell', payout3: 15, icon: '🔔', weight: 12, color: 'text-amber-400' },
    { id: 'cherry', name: 'Cherry', payout3: 8, icon: '🍒', weight: 18, color: 'text-rose-500' },
    { id: 'coin', name: 'Gold Coin', payout3: 5, icon: '🪙', weight: 24, color: 'text-amber-300' },
  ],
  paylines: [
    { id: 1, name: 'Center Line', coords: [[0, 1], [1, 1], [2, 1]] },
    { id: 2, name: 'Top Line', coords: [[0, 0], [1, 0], [2, 0]] },
    { id: 3, name: 'Bottom Line', coords: [[0, 2], [1, 2], [2, 2]] },
    { id: 4, name: 'Diagonal Down', coords: [[0, 0], [1, 1], [2, 2]] },
    { id: 5, name: 'Diagonal Up', coords: [[0, 2], [1, 1], [2, 0]] },
  ],
};

// 2. Fortune Gems (3x3 + 4th Multiplier Reel)
export const FORTUNE_GEMS_CONFIG: SlotThemeConfig = {
  id: 'slots_fortune_gems',
  title: 'Fortune Gems',
  reels: 3,
  rows: 3,
  rtpDefault: 97.0,
  bonusReel: true,
  symbols: [
    { id: 'garuda_wild', name: 'Garuda Wild', payout3: 25, icon: '🦅', weight: 3, isWild: true },
    { id: 'red_ruby', name: 'Red Ruby', payout3: 15, icon: '🔴', weight: 6 },
    { id: 'blue_sapphire', name: 'Blue Sapphire', payout3: 10, icon: '🔷', weight: 10 },
    { id: 'green_emerald', name: 'Green Emerald', payout3: 8, icon: '🟢', weight: 14 },
    { id: 'ace', name: 'Ace', payout3: 5, icon: '🅰️', weight: 18 },
    { id: 'king', name: 'King', payout3: 4, icon: '👑', weight: 22 },
    { id: 'queen', name: 'Queen', payout3: 3, icon: '👸', weight: 26 },
  ],
  paylines: [
    { id: 1, name: 'Top Horizontal', coords: [[0, 0], [1, 0], [2, 0]] },
    { id: 2, name: 'Center Horizontal', coords: [[0, 1], [1, 1], [2, 1]] },
    { id: 3, name: 'Bottom Horizontal', coords: [[0, 2], [1, 2], [2, 2]] },
    { id: 4, name: 'Diagonal Down', coords: [[0, 0], [1, 1], [2, 2]] },
    { id: 5, name: 'Diagonal Up', coords: [[0, 2], [1, 1], [2, 0]] },
  ],
};

// 3. Aztec Gems (3x3 + Multiplier Reel)
export const AZTEC_GEMS_CONFIG: SlotThemeConfig = {
  id: 'slots_aztec_gems',
  title: 'Aztec Gems Deluxe',
  reels: 3,
  rows: 3,
  rtpDefault: 96.5,
  bonusReel: true,
  symbols: [
    { id: 'mask_wild', name: 'Golden Mask Wild', payout3: 25, icon: '👺', weight: 4, isWild: true },
    { id: 'red_stone', name: 'Crimson Gem', payout3: 15, icon: '🟥', weight: 8 },
    { id: 'purple_stone', name: 'Amethyst Gem', payout3: 10, icon: '🟪', weight: 12 },
    { id: 'blue_stone', name: 'Lapis Gem', payout3: 8, icon: '🟦', weight: 16 },
    { id: 'green_stone', name: 'Jade Gem', payout3: 5, icon: '🟩', weight: 20 },
    { id: 'gold_stone', name: 'Topaz Gem', payout3: 3, icon: '🟨', weight: 24 },
  ],
  paylines: [
    { id: 1, name: 'Middle', coords: [[0, 1], [1, 1], [2, 1]] },
    { id: 2, name: 'Top', coords: [[0, 0], [1, 0], [2, 0]] },
    { id: 3, name: 'Bottom', coords: [[0, 2], [1, 2], [2, 2]] },
    { id: 4, name: 'V-Shape', coords: [[0, 0], [1, 1], [2, 0]] },
    { id: 5, name: 'Inverted V', coords: [[0, 2], [1, 1], [2, 2]] },
  ],
};

/**
 * Weighted Random Symbol Picker
 */
export function pickWeightedSymbol(symbols: SlotSymbol[]): SlotSymbol {
  const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const s of symbols) {
    if (random < s.weight) return s;
    random -= s.weight;
  }
  return symbols[symbols.length - 1];
}

/**
 * Multi-Dimensional Array Grid Generator
 * Returns grid: [reelIndex][rowIndex]
 */
export function generateSlotGrid(config: SlotThemeConfig): SlotSymbol[][] {
  const grid: SlotSymbol[][] = [];
  for (let c = 0; c < config.reels; c++) {
    const reel: SlotSymbol[] = [];
    for (let r = 0; r < config.rows; r++) {
      reel.push(pickWeightedSymbol(config.symbols));
    }
    grid.push(reel);
  }
  return grid;
}

export interface WinningLineResult {
  payline: SlotPayline;
  symbol: SlotSymbol;
  matchCount: number;
  multiplier: number;
  winAmount: number;
}

/**
 * Evaluates Winning Paylines & Multipliers
 */
export function evaluatePaylines(
  grid: SlotSymbol[][],
  config: SlotThemeConfig,
  betPerLine: number
): {
  winningLines: WinningLineResult[];
  totalMultiplier: number;
  totalWin: number;
} {
  const winningLines: WinningLineResult[] = [];
  let totalMultiplier = 0;
  let totalWin = 0;

  for (const line of config.paylines) {
    const coords = line.coords;
    if (coords.length < 3) continue;

    // First symbol on the line
    const firstSym = grid[coords[0][0]][coords[0][1]];
    let matchCount = 1;
    let matchSym = firstSym;

    for (let i = 1; i < coords.length; i++) {
      const currentSym = grid[coords[i][0]][coords[i][1]];
      if (currentSym.id === matchSym.id || currentSym.isWild) {
        matchCount++;
      } else if (matchSym.isWild) {
        matchSym = currentSym;
        matchCount++;
      } else {
        break;
      }
    }

    if (matchCount >= 3) {
      let lineMult = matchSym.payout3;
      if (matchCount === 4 && matchSym.payout4) lineMult = matchSym.payout4;
      if (matchCount === 5 && matchSym.payout5) lineMult = matchSym.payout5;

      const lineWin = Math.round(betPerLine * lineMult);
      totalMultiplier += lineMult;
      totalWin += lineWin;

      winningLines.push({
        payline: line,
        symbol: matchSym,
        matchCount,
        multiplier: lineMult,
        winAmount: lineWin,
      });
    }
  }

  return { winningLines, totalMultiplier, totalWin };
}

/**
 * Win Celebration Category
 */
export type WinTier = 'none' | 'regular' | 'big' | 'mega' | 'super';

export function getWinTier(multiplier: number): WinTier {
  if (multiplier <= 0) return 'none';
  if (multiplier < 3) return 'regular';
  if (multiplier < 10) return 'big';
  if (multiplier < 35) return 'mega';
  return 'super';
}
