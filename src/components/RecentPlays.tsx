/* ============================================================
   RecentPlays — Plate appearances grouped by game
   ============================================================ */

import React, { useState } from 'react';
import { Trash2, Edit3, ChevronDown, ChevronUp } from 'lucide-react';
import type { Game, PlateAppearance, OutcomeType } from '../types';
import { OUTCOMES } from '../types';
import { isHit } from '../stats';
import * as store from '../store';

interface RecentPlaysProps {
  games: Game[];
  onDelete: (id: string) => void;
  onEdit: (pa: PlateAppearance) => void;
}

const RecentPlays: React.FC<RecentPlaysProps> = ({ games, onDelete, onEdit }) => {
  const [expandedGame, setExpandedGame] = useState<string | null>(null);

  if (games.length === 0) {
    return (
      <div className="glass-card p-6 text-center animate-fade-in">
        <p className="text-text-muted text-sm">No hay turnos registrados aún.</p>
        <p className="text-text-muted text-xs mt-1">Usa el botón + para agregar uno</p>
      </div>
    );
  }

  const sortedGames = [...games].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-2 animate-fade-in-up">
      {sortedGames.map((game) => {
        const appearances = store.getPlateAppearancesByGame(game.id);
        const isExpanded = expandedGame === game.id;

        return (
          <div key={game.id} className="glass-card overflow-hidden">
            {/* Game header */}
            <button
              onClick={() => setExpandedGame(isExpanded ? null : game.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors btn-press"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-text-primary">
                    vs {game.opponent}
                  </span>
                  <span className="text-xs text-text-muted">{game.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Quick hits summary */}
                <div className="flex gap-1">
                  {appearances.slice(-6).map((pa) => (
                    <span
                      key={pa.id}
                      className={`
                        w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold
                        ${isHit(pa.outcome)
                          ? pa.outcome === 'HR'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-text-muted'
                        }
                      `}
                    >
                      {pa.outcome}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-text-muted">
                  {appearances.length} PA
                </span>
                {isExpanded
                  ? <ChevronUp className="w-4 h-4 text-text-muted" />
                  : <ChevronDown className="w-4 h-4 text-text-muted" />
                }
              </div>
            </button>

            {/* Expanded PA list */}
            {isExpanded && (
              <div className="border-t border-border-subtle animate-slide-down">
                {appearances.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-text-muted">Sin turnos en este juego</p>
                ) : (
                  appearances.map((pa, idx) => (
                    <PARow
                      key={pa.id}
                      pa={pa}
                      index={idx + 1}
                      onDelete={() => onDelete(pa.id)}
                      onEdit={() => onEdit(pa)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Individual PA row ───────────────────────────────────────

interface PARowProps {
  pa: PlateAppearance;
  index: number;
  onDelete: () => void;
  onEdit: () => void;
}

const PARow: React.FC<PARowProps> = ({ pa, index, onDelete, onEdit }) => {
  const info = OUTCOMES[pa.outcome];
  const hit = isHit(pa.outcome);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle last:border-b-0 hover:bg-white/[0.02] transition-colors">
      {/* Index */}
      <span className="text-xs text-text-muted w-5 text-right font-mono">
        {index}
      </span>

      {/* Outcome badge */}
      <span
        className={`
          px-2 py-1 rounded-lg text-xs font-bold min-w-[38px] text-center
          ${info.colorClass} text-white
        `}
      >
        {pa.outcome}
      </span>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${hit ? 'text-emerald-400' : 'text-text-primary'}`}>
          {info.label}
        </span>
        <div className="flex gap-2 text-xs text-text-muted">
          {pa.rbi > 0 && <span className="text-emerald-400">{pa.rbi} RBI</span>}
          {pa.runs > 0 && <span className="text-cyan-400">R</span>}
          {pa.notes && <span className="truncate">{pa.notes}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors btn-press"
        >
          <Edit3 className="w-3.5 h-3.5 text-text-muted" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-rose-500/10 transition-colors btn-press"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-400/60" />
        </button>
      </div>
    </div>
  );
};

export default RecentPlays;
