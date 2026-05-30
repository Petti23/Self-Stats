/* ============================================================
   QuickAddModal — Ultra-fast plate appearance registration
   Grouped design: outcomes by type (Hits, Outs/Error, Others)
   ============================================================ */

import React, { useState, useMemo } from 'react';
import { X, Plus, ChevronDown, Flame } from 'lucide-react';
import type { OutcomeType, Game } from '../types';
import { OUTCOMES } from '../types';
import { showToast, triggerConfetti } from './Toast';
import { isHit } from '../stats';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  activeTournamentId: string | null;
  onAddPA: (data: { gameId: string; outcome: OutcomeType; rbi: number; runs: number; inning: number; notes?: string }) => void;
  onCreateGame: (data: { tournamentId: string; opponent: string; date: string }) => Game;
}

const OUTCOME_BUTTON_STYLES: Record<string, string> = {
  '1B': 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white shadow-emerald-600/30',
  '2B': 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-300 text-white shadow-emerald-500/30',
  '3B': 'bg-teal-500 hover:bg-teal-400 active:bg-teal-300 text-white shadow-teal-500/30',
  'HR': 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/40 animate-pulse-glow',
  'OUT': 'bg-slate-600 hover:bg-slate-500 active:bg-slate-400 text-white shadow-slate-600/20',
  'K': 'bg-rose-600 hover:bg-rose-500 active:bg-rose-400 text-white shadow-rose-600/30',
  'BB': 'bg-blue-600 hover:bg-blue-500 active:bg-blue-400 text-white shadow-blue-600/20',
  'HBP': 'bg-orange-600 hover:bg-orange-500 active:bg-orange-400 text-white shadow-orange-600/20',
  'SF': 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-400 text-white shadow-indigo-600/20',
  'SAC': 'bg-violet-600 hover:bg-violet-500 active:bg-violet-400 text-white shadow-violet-600/20',
  'CI': 'bg-gray-600 hover:bg-gray-500 active:bg-gray-400 text-white shadow-gray-600/20',
  'ROE': 'bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-white shadow-amber-600/20',
};

const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  games,
  activeTournamentId,
  onAddPA,
  onCreateGame,
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<OutcomeType | null>(null);
  const [rbi, setRbi] = useState(0);
  const [scoredRun, setScoredRun] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  const [showNewGame, setShowNewGame] = useState(false);
  const [newOpponent, setNewOpponent] = useState('');
  const [showGamePicker, setShowGamePicker] = useState(false);

  // Auto-select latest game
  const sortedGames = useMemo(() => {
    return [...games].sort((a, b) => b.date.localeCompare(a.date));
  }, [games]);

  const activeGameId = selectedGameId || sortedGames[0]?.id || '';
  const activeGame = games.find(g => g.id === activeGameId);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedOutcome(null);
      setRbi(0);
      setScoredRun(false);

      const lastCreatedId = localStorage.getItem('bt_last_created_game_id');
      const hasLastCreated = lastCreatedId && games.some(g => g.id === lastCreatedId);
      setSelectedGameId(hasLastCreated ? lastCreatedId : (sortedGames[0]?.id || ''));

      setShowNewGame(games.length === 0);
      setNewOpponent('');
      setShowGamePicker(false);
    }
  }, [isOpen, games, sortedGames]);

  const handleSave = () => {
    if (!selectedOutcome) return;

    let gameId = activeGameId;

    // Create quick game if needed
    if (showNewGame && newOpponent.trim() && activeTournamentId) {
      const newGame = onCreateGame({
        tournamentId: activeTournamentId,
        opponent: newOpponent.trim(),
        date: new Date().toISOString().split('T')[0],
      });
      gameId = newGame.id;
    }

    if (!gameId) return;

    // Persist this game ID as the last used game
    localStorage.setItem('bt_last_created_game_id', gameId);

    onAddPA({
      gameId,
      outcome: selectedOutcome,
      rbi,
      runs: scoredRun ? 1 : 0,
      inning: 1,
    });

    // Show appropriate toast
    if (selectedOutcome === 'HR') {
      triggerConfetti();
      showToast('homerun', `💥 ¡HOME RUN! ${rbi > 0 ? `+${rbi} RBI` : ''}`, 4000);
    } else if (isHit(selectedOutcome)) {
      showToast('hit', `✅ ${OUTCOMES[selectedOutcome].label} registrado ${rbi > 0 ? `• ${rbi} RBI` : ''}`);
    } else if (selectedOutcome === 'K') {
      showToast('out', '⚡ Ponche registrado');
    } else {
      showToast('info', `📋 ${OUTCOMES[selectedOutcome].label} registrado`);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-modal animate-fade-in"
        onClick={onClose}
      />

      {/* Modal content — slides up from bottom */}
      <div className="relative w-full max-w-lg bg-bg-secondary/95 backdrop-blur-2xl border-t border-border-glass rounded-t-3xl animate-slide-up z-10 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            Registrar Turno
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors btn-press"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Game selector */}
        <div className="px-5 pb-3">
          {!showNewGame && games.length > 0 ? (
            <div className="relative">
              <button
                onClick={() => setShowGamePicker(!showGamePicker)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass-card-subtle text-sm font-medium text-text-primary btn-press"
              >
                <span>
                  {activeGame ? `vs ${activeGame.opponent}` : 'Seleccionar juego'}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showGamePicker ? 'rotate-180' : ''}`} />
              </button>
              {showGamePicker && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-card p-2 z-20 max-h-40 overflow-y-auto animate-slide-down">
                  {sortedGames.map(g => (
                    <button
                      key={g.id}
                      onClick={() => {
                        setSelectedGameId(g.id);
                        localStorage.setItem('bt_last_created_game_id', g.id);
                        setShowGamePicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        g.id === activeGameId
                          ? 'bg-emerald-600/20 text-emerald-400'
                          : 'text-text-secondary hover:bg-white/5'
                      }`}
                    >
                      vs {g.opponent} • {g.date}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setShowNewGame(true);
                      setShowGamePicker(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-600/10 transition-colors mt-1"
                  >
                    <Plus className="w-4 h-4" /> Nuevo juego
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nombre del oponente..."
                value={newOpponent}
                onChange={(e) => setNewOpponent(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-border-subtle text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
                autoFocus
              />
              {games.length > 0 && (
                <button
                  onClick={() => setShowNewGame(false)}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  ← Seleccionar juego existente
                </button>
              )}
            </div>
          )}
        </div>

        {/* Outcome grid */}
        <div className="px-5 pb-3 space-y-4">
          {/* Group 1: Hits */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
              🔥 Hits (Batazos)
            </p>
            <div className="grid grid-cols-4 gap-2">
              {(['1B', '2B', '3B', 'HR'] as OutcomeType[]).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setSelectedOutcome(code);
                    if (code === 'HR') setScoredRun(true);
                  }}
                  className={`
                    relative py-3 rounded-xl font-black text-sm shadow-lg btn-press
                    transition-all duration-150
                    ${OUTCOME_BUTTON_STYLES[code]}
                    ${selectedOutcome === code
                      ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-bg-secondary scale-105 z-10'
                      : 'opacity-90 hover:opacity-100'
                    }
                  `}
                >
                  {code}
                  <span className="block text-[9px] font-semibold opacity-85 mt-0.5">
                    {OUTCOMES[code].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Group 2: Outs y Error */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2">
              🛡️ Outs y Error en Campo
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['OUT', 'K', 'ROE'] as OutcomeType[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedOutcome(code)}
                  className={`
                    relative py-2.5 rounded-xl font-bold text-sm shadow-md btn-press
                    transition-all duration-150
                    ${OUTCOME_BUTTON_STYLES[code]}
                    ${selectedOutcome === code
                      ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-bg-secondary scale-105 z-10'
                      : 'opacity-85 hover:opacity-100'
                    }
                  `}
                >
                  {code}
                  <span className="block text-[9px] font-medium opacity-85 mt-0.5">
                    {code === 'ROE' ? 'Error' : OUTCOMES[code].label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Otros Avances */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
              📋 Otros Avances / Sacrificios
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {(['BB', 'HBP', 'SF', 'SAC', 'CI'] as OutcomeType[]).map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedOutcome(code)}
                  className={`
                    relative py-2 rounded-xl font-bold text-xs shadow-sm btn-press
                    transition-all duration-150
                    ${OUTCOME_BUTTON_STYLES[code]}
                    ${selectedOutcome === code
                      ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-bg-secondary scale-105 z-10'
                      : 'opacity-80 hover:opacity-100'
                    }
                  `}
                >
                  {code}
                  <span className="block text-[8px] font-normal opacity-80 mt-0.5 truncate px-0.5">
                    {code === 'CI' ? 'Interf.' : code === 'HBP' ? 'Golpe' : OUTCOMES[code].label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RBI + Run scored row */}
        <div className="px-5 pb-3 flex gap-4">
          {/* RBI selector */}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              RBI (Carreras Empujadas)
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setRbi(n)}
                  className={`
                    flex-1 py-2.5 rounded-lg font-bold text-sm btn-press transition-all
                    ${rbi === n
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Run scored toggle */}
          <div className="w-28">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
              Anoté
            </p>
            <button
              onClick={() => setScoredRun(!scoredRun)}
              className={`
                w-full py-2.5 rounded-lg font-bold text-sm btn-press transition-all
                ${scoredRun
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-white/5 text-text-secondary hover:bg-white/10'
                }
              `}
            >
              {scoredRun ? '✓ Sí' : 'No'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-8 pt-2">
          <button
            onClick={handleSave}
            disabled={!selectedOutcome || (!activeGameId && !newOpponent.trim())}
            className={`
              w-full py-4 rounded-2xl font-bold text-base btn-press transition-all
              ${selectedOutcome
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/40 active:scale-[0.98]'
                : 'bg-white/5 text-text-muted cursor-not-allowed'
              }
            `}
          >
            {selectedOutcome
              ? `Guardar ${OUTCOMES[selectedOutcome].label}`
              : 'Selecciona un resultado'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
