/* ============================================================
   Batting Tracker — Type Definitions
   ============================================================ */

/** Possible outcomes of a plate appearance */
export type OutcomeType =
  | '1B'
  | '2B'
  | '3B'
  | 'HR'
  | 'OUT'
  | 'K'
  | 'BB'
  | 'HBP'
  | 'SF'
  | 'SAC'
  | 'CI'
  | 'ROE';

/** A tournament / season / league */
export interface Tournament {
  id: string;
  name: string;
  date: string;
  description?: string;
}

/** A game within a tournament */
export interface Game {
  id: string;
  tournamentId: string;
  opponent: string;
  date: string;
  notes?: string;
}

/** A single plate appearance record */
export interface PlateAppearance {
  id: string;
  gameId: string;
  outcome: OutcomeType;
  rbi: number;
  runs: number;
  inning: number;
  notes?: string;
}

/** Computed batting statistics */
export interface BattingStats {
  pa: number;   // Plate Appearances
  ab: number;   // At-Bats
  h: number;    // Hits
  singles: number;
  doubles: number;
  triples: number;
  hr: number;   // Home Runs
  bb: number;   // Walks
  hbp: number;  // Hit By Pitch
  k: number;    // Strikeouts
  sf: number;   // Sacrifice Flies
  sac: number;  // Sacrifice Bunts
  ci: number;   // Catcher Interference
  outs: number; // Defensive outs (groundout/flyout)
  roe: number;  // Reach on Error
  rbi: number;  // Runs Batted In
  runs: number; // Runs Scored
  tb: number;   // Total Bases
  avg: number;
  obp: number;
  slg: number;
  ops: number;
}

/** Full application data for export/import */
export interface AppData {
  version: string;
  exportDate: string;
  tournaments: Tournament[];
  games: Game[];
  plateAppearances: PlateAppearance[];
}

/** Outcome metadata for UI display */
export interface OutcomeInfo {
  code: OutcomeType;
  label: string;
  isHit: boolean;
  isAtBat: boolean;
  colorClass: string;
}

/** All outcome info map */
export const OUTCOMES: Record<OutcomeType, OutcomeInfo> = {
  '1B': { code: '1B', label: 'Sencillo', isHit: true, isAtBat: true, colorClass: 'bg-emerald-500' },
  '2B': { code: '2B', label: 'Doble', isHit: true, isAtBat: true, colorClass: 'bg-emerald-400' },
  '3B': { code: '3B', label: 'Triple', isHit: true, isAtBat: true, colorClass: 'bg-teal-400' },
  'HR': { code: 'HR', label: 'Home Run', isHit: true, isAtBat: true, colorClass: 'bg-amber-500' },
  'OUT': { code: 'OUT', label: 'Out', isHit: false, isAtBat: true, colorClass: 'bg-slate-500' },
  'K': { code: 'K', label: 'Ponche', isHit: false, isAtBat: true, colorClass: 'bg-rose-500' },
  'BB': { code: 'BB', label: 'Base por Bolas', isHit: false, isAtBat: false, colorClass: 'bg-blue-500' },
  'HBP': { code: 'HBP', label: 'Golpeado', isHit: false, isAtBat: false, colorClass: 'bg-orange-500' },
  'SF': { code: 'SF', label: 'Fly Sacrificio', isHit: false, isAtBat: false, colorClass: 'bg-indigo-500' },
  'SAC': { code: 'SAC', label: 'Toque Sacrificio', isHit: false, isAtBat: false, colorClass: 'bg-violet-500' },
  'CI': { code: 'CI', label: 'Interferencia', isHit: false, isAtBat: false, colorClass: 'bg-gray-500' },
  'ROE': { code: 'ROE', label: 'Alcanzó por Error', isHit: false, isAtBat: true, colorClass: 'bg-amber-600' },
};
