/* ============================================================
   Batting Tracker — Statistics Calculation Engine
   Implements official baseball/softball batting formulas
   ============================================================ */

import type { PlateAppearance, BattingStats, OutcomeType } from './types';

/** Outcomes that do NOT count as official at-bats */
const NON_AB_OUTCOMES: OutcomeType[] = ['BB', 'HBP', 'SF', 'SAC', 'CI'];

/** Outcomes that count as hits */
const HIT_OUTCOMES: OutcomeType[] = ['1B', '2B', '3B', 'HR'];

/**
 * Calculate all batting statistics from a list of plate appearances.
 * Implements:
 *   PA  = total plate appearances
 *   AB  = PA - BB - HBP - SF - SAC - CI
 *   H   = 1B + 2B + 3B + HR
 *   TB  = 1B + 2×2B + 3×3B + 4×HR
 *   AVG = H / AB
 *   OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
 *   SLG = TB / AB
 *   OPS = OBP + SLG
 */
export function calculateStats(appearances: PlateAppearance[]): BattingStats {
  const counts: Record<OutcomeType, number> = {
    '1B': 0, '2B': 0, '3B': 0, 'HR': 0,
    'OUT': 0, 'K': 0, 'BB': 0, 'HBP': 0,
    'SF': 0, 'SAC': 0, 'CI': 0,
  };

  let totalRbi = 0;
  let totalRuns = 0;

  for (const pa of appearances) {
    counts[pa.outcome]++;
    totalRbi += pa.rbi;
    totalRuns += pa.runs;
  }

  const pa = appearances.length;
  const bb = counts['BB'];
  const hbp = counts['HBP'];
  const sf = counts['SF'];
  const sac = counts['SAC'];
  const ci = counts['CI'];

  const ab = pa - bb - hbp - sf - sac - ci;

  const singles = counts['1B'];
  const doubles = counts['2B'];
  const triples = counts['3B'];
  const hr = counts['HR'];

  const h = singles + doubles + triples + hr;
  const tb = singles + (2 * doubles) + (3 * triples) + (4 * hr);

  // AVG = H / AB (0 if no AB)
  const avg = ab > 0 ? h / ab : 0;

  // OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
  const obpDenom = ab + bb + hbp + sf;
  const obp = obpDenom > 0 ? (h + bb + hbp) / obpDenom : 0;

  // SLG = TB / AB
  const slg = ab > 0 ? tb / ab : 0;

  // OPS = OBP + SLG
  const ops = obp + slg;

  return {
    pa,
    ab,
    h,
    singles,
    doubles,
    triples,
    hr,
    bb,
    hbp,
    k: counts['K'],
    sf,
    sac,
    ci,
    outs: counts['OUT'],
    rbi: totalRbi,
    runs: totalRuns,
    tb,
    avg,
    obp,
    slg,
    ops,
  };
}

/**
 * Format a batting average as a 3-decimal string with leading dot.
 * e.g. 0.35 → ".350", 0 → ".000", 1.0 → "1.000"
 */
export function formatAvg(value: number): string {
  if (value >= 1) return value.toFixed(3);
  return '.' + value.toFixed(3).split('.')[1];
}

/**
 * Format OBP/SLG/OPS as 3-decimal string.
 * These can exceed 1.000, so show full number.
 */
export function formatRate(value: number): string {
  if (value >= 1) return value.toFixed(3);
  return '.' + value.toFixed(3).split('.')[1];
}

/**
 * Check if outcome is a hit
 */
export function isHit(outcome: OutcomeType): boolean {
  return HIT_OUTCOMES.includes(outcome);
}

/**
 * Check if outcome counts as an at-bat
 */
export function isAtBat(outcome: OutcomeType): boolean {
  return !NON_AB_OUTCOMES.includes(outcome);
}
