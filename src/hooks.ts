/* ============================================================
   Batting Tracker — Custom React Hooks
   ============================================================ */

import { useState, useCallback, useSyncExternalStore } from 'react';
import * as store from './store';
import { calculateStats } from './stats';
import type { Tournament, Game, PlateAppearance, BattingStats } from './types';

// ── Storage sync hook (re-renders on any data change) ───────

let listeners: Set<() => void> = new Set();

function emitChange() {
  listeners.forEach(fn => fn());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Snapshot IDs for external store
let snapshotId = 0;
function getSnapshot() {
  return snapshotId;
}

export function notifyDataChange() {
  snapshotId++;
  emitChange();
}

/** Hook that forces re-render when data changes */
export function useDataSync() {
  useSyncExternalStore(subscribe, getSnapshot);
}

// ── Data hooks ──────────────────────────────────────────────

export function useTournaments(): {
  tournaments: Tournament[];
  add: (data: Omit<Tournament, 'id'>) => Tournament;
  update: (id: string, data: Partial<Omit<Tournament, 'id'>>) => void;
  remove: (id: string) => void;
} {
  useDataSync();

  const tournaments = store.getTournaments();

  const add = useCallback((data: Omit<Tournament, 'id'>) => {
    const t = store.addTournament(data);
    notifyDataChange();
    return t;
  }, []);

  const update = useCallback((id: string, data: Partial<Omit<Tournament, 'id'>>) => {
    store.updateTournament(id, data);
    notifyDataChange();
  }, []);

  const remove = useCallback((id: string) => {
    store.deleteTournament(id);
    notifyDataChange();
  }, []);

  return { tournaments, add, update, remove };
}

export function useGames(tournamentId?: string): {
  games: Game[];
  add: (data: Omit<Game, 'id'>) => Game;
  update: (id: string, data: Partial<Omit<Game, 'id'>>) => void;
  remove: (id: string) => void;
} {
  useDataSync();

  const games = tournamentId
    ? store.getGamesByTournament(tournamentId)
    : store.getGames();

  const add = useCallback((data: Omit<Game, 'id'>) => {
    const g = store.addGame(data);
    notifyDataChange();
    return g;
  }, []);

  const update = useCallback((id: string, data: Partial<Omit<Game, 'id'>>) => {
    store.updateGame(id, data);
    notifyDataChange();
  }, []);

  const remove = useCallback((id: string) => {
    store.deleteGame(id);
    notifyDataChange();
  }, []);

  return { games, add, update, remove };
}

export function usePlateAppearances(gameId?: string): {
  appearances: PlateAppearance[];
  add: (data: Omit<PlateAppearance, 'id'>) => PlateAppearance;
  update: (id: string, data: Partial<Omit<PlateAppearance, 'id'>>) => void;
  remove: (id: string) => void;
} {
  useDataSync();

  const appearances = gameId
    ? store.getPlateAppearancesByGame(gameId)
    : store.getPlateAppearances();

  const add = useCallback((data: Omit<PlateAppearance, 'id'>) => {
    const pa = store.addPlateAppearance(data);
    notifyDataChange();
    return pa;
  }, []);

  const update = useCallback((id: string, data: Partial<Omit<PlateAppearance, 'id'>>) => {
    store.updatePlateAppearance(id, data);
    notifyDataChange();
  }, []);

  const remove = useCallback((id: string) => {
    store.deletePlateAppearance(id);
    notifyDataChange();
  }, []);

  return { appearances, add, update, remove };
}

export function useStats(tournamentId?: string): BattingStats {
  useDataSync();

  const appearances = tournamentId
    ? store.getPlateAppearancesByTournament(tournamentId)
    : store.getPlateAppearances();

  return calculateStats(appearances);
}

// ── Active tournament selection ─────────────────────────────

export function useActiveTournament(): {
  activeTournamentId: string | null;
  setActiveTournamentId: (id: string | null) => void;
} {
  const [activeTournamentId, setActive] = useState<string | null>(() => {
    return localStorage.getItem('bt_active_tournament') || null;
  });

  const setActiveTournamentId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem('bt_active_tournament', id);
    } else {
      localStorage.removeItem('bt_active_tournament');
    }
    setActive(id);
  }, []);

  return { activeTournamentId, setActiveTournamentId };
}
