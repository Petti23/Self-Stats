/* ============================================================
   Batting Tracker — LocalStorage Data Store
   CRUD operations with automatic persistence
   ============================================================ */

import type { Tournament, Game, PlateAppearance, AppData } from './types';

const STORAGE_KEYS = {
  tournaments: 'bt_tournaments',
  games: 'bt_games',
  plateAppearances: 'bt_plate_appearances',
} as const;

const APP_VERSION = '1.0.0';

// ── Generic helpers ─────────────────────────────────────────

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ── Tournaments ─────────────────────────────────────────────

export function getTournaments(): Tournament[] {
  return read<Tournament>(STORAGE_KEYS.tournaments);
}

export function getTournament(id: string): Tournament | undefined {
  return getTournaments().find(t => t.id === id);
}

export function addTournament(data: Omit<Tournament, 'id'>): Tournament {
  const tournament: Tournament = { ...data, id: generateId() };
  const all = getTournaments();
  all.push(tournament);
  write(STORAGE_KEYS.tournaments, all);
  return tournament;
}

export function updateTournament(id: string, data: Partial<Omit<Tournament, 'id'>>): Tournament | undefined {
  const all = getTournaments();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data };
  write(STORAGE_KEYS.tournaments, all);
  return all[idx];
}

export function deleteTournament(id: string): void {
  // Remove tournament
  write(STORAGE_KEYS.tournaments, getTournaments().filter(t => t.id !== id));
  // Cascade: remove games and PAs
  const games = getGames().filter(g => g.tournamentId === id);
  const gameIds = new Set(games.map(g => g.id));
  write(STORAGE_KEYS.games, getGames().filter(g => g.tournamentId !== id));
  write(
    STORAGE_KEYS.plateAppearances,
    getPlateAppearances().filter(pa => !gameIds.has(pa.gameId))
  );
}

// ── Games ───────────────────────────────────────────────────

export function getGames(): Game[] {
  return read<Game>(STORAGE_KEYS.games);
}

export function getGamesByTournament(tournamentId: string): Game[] {
  return getGames().filter(g => g.tournamentId === tournamentId);
}

export function getGame(id: string): Game | undefined {
  return getGames().find(g => g.id === id);
}

export function addGame(data: Omit<Game, 'id'>): Game {
  const game: Game = { ...data, id: generateId() };
  const all = getGames();
  all.push(game);
  write(STORAGE_KEYS.games, all);
  return game;
}

export function updateGame(id: string, data: Partial<Omit<Game, 'id'>>): Game | undefined {
  const all = getGames();
  const idx = all.findIndex(g => g.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data };
  write(STORAGE_KEYS.games, all);
  return all[idx];
}

export function deleteGame(id: string): void {
  write(STORAGE_KEYS.games, getGames().filter(g => g.id !== id));
  // Cascade: remove PAs
  write(
    STORAGE_KEYS.plateAppearances,
    getPlateAppearances().filter(pa => pa.gameId !== id)
  );
}

// ── Plate Appearances ───────────────────────────────────────

export function getPlateAppearances(): PlateAppearance[] {
  return read<PlateAppearance>(STORAGE_KEYS.plateAppearances);
}

export function getPlateAppearancesByGame(gameId: string): PlateAppearance[] {
  return getPlateAppearances().filter(pa => pa.gameId === gameId);
}

export function getPlateAppearancesByTournament(tournamentId: string): PlateAppearance[] {
  const gameIds = new Set(getGamesByTournament(tournamentId).map(g => g.id));
  return getPlateAppearances().filter(pa => gameIds.has(pa.gameId));
}

export function addPlateAppearance(data: Omit<PlateAppearance, 'id'>): PlateAppearance {
  const pa: PlateAppearance = { ...data, id: generateId() };
  const all = getPlateAppearances();
  all.push(pa);
  write(STORAGE_KEYS.plateAppearances, all);
  return pa;
}

export function updatePlateAppearance(id: string, data: Partial<Omit<PlateAppearance, 'id'>>): PlateAppearance | undefined {
  const all = getPlateAppearances();
  const idx = all.findIndex(pa => pa.id === id);
  if (idx === -1) return undefined;
  all[idx] = { ...all[idx], ...data };
  write(STORAGE_KEYS.plateAppearances, all);
  return all[idx];
}

export function deletePlateAppearance(id: string): void {
  write(STORAGE_KEYS.plateAppearances, getPlateAppearances().filter(pa => pa.id !== id));
}

// ── Backup / Restore ────────────────────────────────────────

export function exportData(): AppData {
  return {
    version: APP_VERSION,
    exportDate: new Date().toISOString(),
    tournaments: getTournaments(),
    games: getGames(),
    plateAppearances: getPlateAppearances(),
  };
}

export function importData(data: AppData): void {
  if (!data.tournaments || !data.games || !data.plateAppearances) {
    throw new Error('Formato de datos inválido');
  }
  write(STORAGE_KEYS.tournaments, data.tournaments);
  write(STORAGE_KEYS.games, data.games);
  write(STORAGE_KEYS.plateAppearances, data.plateAppearances);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.tournaments);
  localStorage.removeItem(STORAGE_KEYS.games);
  localStorage.removeItem(STORAGE_KEYS.plateAppearances);
}

export function downloadBackup(): void {
  const data = exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `batting-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function uploadBackup(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as AppData;
        importData(data);
        resolve();
      } catch (err) {
        reject(new Error('Error al leer el archivo de respaldo'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}
