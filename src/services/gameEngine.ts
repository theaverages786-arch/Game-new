import { AdminSettings } from '../types';
import { soundService } from './sound';
import { triggerWinConfetti } from './storage';

/**
 * Universal Game Engine Core
 * Computes deterministic or probabilistic outcomes strictly honoring:
 * 1. masterOutcomeMode ('always_win' | 'always_lose' | 'normal')
 * 2. globalWinRate (0 - 100%)
 * 3. gameRtpOverrides[gameId] (5% - 99%)
 * 4. rtpMode ('fair' | 'high_win' | 'house_edge' | 'custom')
 */

export const COMMON_BET_CHIPS = [10, 50, 100, 500, 1000, 5000];

export function shouldPlayerWin(
  gameId: string,
  adminSettings: AdminSettings,
  defaultWinRate: number = 0.45
): boolean {
  if (!adminSettings) return Math.random() < defaultWinRate;

  // 1. Absolute Master Outcome Override
  if (adminSettings.masterOutcomeMode === 'always_win') {
    return true;
  }
  if (adminSettings.masterOutcomeMode === 'always_lose') {
    return false;
  }

  // 2. Specific Game RTP Override
  let effectiveWinProb = defaultWinRate;
  const gameRtp = adminSettings.gameRtpOverrides?.[gameId];
  if (typeof gameRtp === 'number' && !isNaN(gameRtp)) {
    // Map RTP (e.g. 96%) to hit rate probability
    effectiveWinProb = Math.min(0.95, Math.max(0.05, (gameRtp / 100) * 0.55));
  } else if (typeof adminSettings.rtpPercentage === 'number') {
    effectiveWinProb = Math.min(0.95, Math.max(0.05, (adminSettings.rtpPercentage / 100) * 0.5));
  }

  // 3. Global Win Rate Adjustment (slider 0% - 100%, default 65%)
  if (typeof adminSettings.globalWinRate === 'number') {
    const scaleFactor = adminSettings.globalWinRate / 60;
    effectiveWinProb = Math.min(0.96, Math.max(0.02, effectiveWinProb * scaleFactor));
  }

  // 4. General RTP Profile
  if (adminSettings.rtpMode === 'high_win') {
    effectiveWinProb = Math.min(0.92, effectiveWinProb * 1.45);
  } else if (adminSettings.rtpMode === 'house_edge') {
    effectiveWinProb = Math.max(0.10, effectiveWinProb * 0.55);
  }

  return Math.random() < effectiveWinProb;
}

/**
 * Plays the appropriate casino sound and triggers confetti on big wins
 */
export function playOutcomeCelebration(
  winAmount: number,
  betAmount: number,
  isJackpot: boolean = false
) {
  if (winAmount <= 0) {
    soundService.playLose();
    return;
  }

  const mult = betAmount > 0 ? winAmount / betAmount : 1;

  if (isJackpot || mult >= 10) {
    soundService.playJackpot();
    triggerWinConfetti();
  } else if (mult >= 2) {
    soundService.playWin();
    triggerWinConfetti();
  } else {
    soundService.playCoin();
  }
}

/**
 * Format currency in Pakistani Rupees (PKR)
 */
export function formatPKR(val: number): string {
  return `₨ ${Math.round(val).toLocaleString()}`;
}
