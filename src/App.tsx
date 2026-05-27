import React, { useState } from 'react';
import {
  Plus, Settings, Trophy, Swords, ChevronDown, Globe,
} from 'lucide-react';
import { useTournaments, useGames, usePlateAppearances, useStats, useActiveTournament } from './hooks';
import { getTournament, getGamesByTournament } from './store';
import type { PlateAppearance, Game } from './types';
import StatsCards from './components/StatsCards';
import QuickAddModal from './components/QuickAddModal';
import EditPAModal from './components/EditPAModal';
import RecentPlays from './components/RecentPlays';
import ManageTournaments from './components/ManageTournaments';
import ManageGames from './components/ManageGames';
import SettingsPanel from './components/SettingsPanel';
import { ToastContainer, showToast } from './components/Toast';

const App: React.FC = () => {
  // Data hooks
  const { activeTournamentId, setActiveTournamentId } = useActiveTournament();
  const { tournaments, add: addTournament, update: updateTournament, remove: removeTournament } = useTournaments();
  const { games: allGames, add: addGame, update: updateGame, remove: removeGame } = useGames(activeTournamentId || undefined);
  const { add: addPA, update: updatePA, remove: removePA } = usePlateAppearances();
  const stats = useStats(activeTournamentId || undefined);

  // UI state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTournamentPicker, setShowTournamentPicker] = useState(false);
  const [editingPA, setEditingPA] = useState<PlateAppearance | null>(null);

  const activeTournament = activeTournamentId ? getTournament(activeTournamentId) : null;
  const currentGames = activeTournamentId ? getGamesByTournament(activeTournamentId) : allGames;

  const handleAddPA = (data: { gameId: string; outcome: PlateAppearance['outcome']; rbi: number; runs: number; inning: number; notes?: string }) => {
    addPA(data);
  };

  const handleCreateGame = (data: { tournamentId: string; opponent: string; date: string }): Game => {
    return addGame(data);
  };

  const handleDeletePA = (id: string) => {
    removePA(id);
    showToast('info', '🗑️ Turno eliminado');
  };

  const handleEditPA = (id: string, data: Partial<Omit<PlateAppearance, 'id'>>) => {
    updatePA(id, data);
    showToast('success', '✏️ Turno actualizado');
  };

  return (
    <div className="min-h-dvh bg-bg-primary">
      <ToastContainer />

      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-bg-primary/80 border-b border-border-subtle">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight text-text-primary flex items-center gap-1.5">
              <span className="text-emerald-400">⚾</span>
              Batting Tracker
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowTournaments(true)} className="p-2 rounded-xl hover:bg-white/5 btn-press" title="Torneos">
              <Trophy className="w-5 h-5 text-text-secondary" />
            </button>
            {activeTournamentId && (
              <button onClick={() => setShowGames(true)} className="p-2 rounded-xl hover:bg-white/5 btn-press" title="Partidos">
                <Swords className="w-5 h-5 text-text-secondary" />
              </button>
            )}
            <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl hover:bg-white/5 btn-press" title="Ajustes">
              <Settings className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 pb-28 pt-4 space-y-5">
        {/* Tournament filter */}
        <div className="relative">
          <button
            onClick={() => setShowTournamentPicker(!showTournamentPicker)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass-card-subtle text-sm font-medium text-text-primary btn-press"
          >
            <span className="flex items-center gap-2">
              {activeTournament ? (
                <><Trophy className="w-4 h-4 text-emerald-400" />{activeTournament.name}</>
              ) : (
                <><Globe className="w-4 h-4 text-cyan-400" />Todas las Estadísticas</>
              )}
            </span>
            <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${showTournamentPicker ? 'rotate-180' : ''}`} />
          </button>
          {showTournamentPicker && (
            <div className="absolute top-full left-0 right-0 mt-1 glass-card p-2 z-20 animate-slide-down">
              <button
                onClick={() => { setActiveTournamentId(null); setShowTournamentPicker(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeTournamentId ? 'bg-emerald-600/20 text-emerald-400' : 'text-text-secondary hover:bg-white/5'}`}
              >
                <Globe className="w-3.5 h-3.5 inline mr-2" />Global
              </button>
              {tournaments.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setActiveTournamentId(t.id); setShowTournamentPicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeTournamentId === t.id ? 'bg-emerald-600/20 text-emerald-400' : 'text-text-secondary hover:bg-white/5'}`}
                >
                  <Trophy className="w-3.5 h-3.5 inline mr-2" />{t.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Recent plays */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-3">
            Turnos Recientes
          </h2>
          <RecentPlays
            games={currentGames}
            onDelete={handleDeletePA}
            onEdit={(pa) => setEditingPA(pa)}
          />
        </div>
      </main>

      {/* FAB */}
      {activeTournamentId && (
        <button
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-fab flex items-center justify-center btn-press z-40 hover:shadow-glow-emerald transition-shadow animate-pulse-glow"
          id="fab-add-pa"
        >
          <Plus className="w-7 h-7" strokeWidth={2.5} />
        </button>
      )}

      {/* No tournament selected hint */}
      {!activeTournamentId && tournaments.length === 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setShowTournaments(true)}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-fab btn-press animate-pulse-glow flex items-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Crear tu primer Torneo
          </button>
        </div>
      )}

      {!activeTournamentId && tournaments.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="px-5 py-3 rounded-2xl glass-card text-text-secondary text-sm font-medium text-center animate-fade-in">
            Selecciona un torneo para registrar turnos
          </div>
        </div>
      )}

      {/* Modals */}
      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        games={currentGames}
        activeTournamentId={activeTournamentId}
        onAddPA={handleAddPA}
        onCreateGame={handleCreateGame}
      />

      <EditPAModal
        isOpen={!!editingPA}
        pa={editingPA}
        onClose={() => setEditingPA(null)}
        onSave={handleEditPA}
      />

      <ManageTournaments
        isOpen={showTournaments}
        onClose={() => setShowTournaments(false)}
        tournaments={tournaments}
        onAdd={(d) => { const t = addTournament(d); setActiveTournamentId(t.id); }}
        onUpdate={updateTournament}
        onDelete={(id) => { removeTournament(id); if (activeTournamentId === id) setActiveTournamentId(null); }}
      />

      <ManageGames
        isOpen={showGames}
        onClose={() => setShowGames(false)}
        tournament={activeTournament || null}
        games={currentGames}
        onAdd={addGame}
        onUpdate={updateGame}
        onDelete={removeGame}
      />

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

export default App;
