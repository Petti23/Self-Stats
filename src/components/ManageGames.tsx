import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Swords, Calendar } from 'lucide-react';
import type { Game, Tournament } from '../types';

interface ManageGamesProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament | null;
  games: Game[];
  onAdd: (data: Omit<Game, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Game, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const ManageGames: React.FC<ManageGamesProps> = ({ isOpen, onClose, tournament, games, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { if (isOpen) { setShowForm(false); setEditId(null); setConfirmDelete(null); } }, [isOpen]);

  if (!isOpen || !tournament) return null;

  const resetForm = () => { setOpponent(''); setDate(''); setNotes(''); setEditId(null); setShowForm(false); };
  const startEdit = (g: Game) => { setOpponent(g.opponent); setDate(g.date); setNotes(g.notes || ''); setEditId(g.id); setShowForm(true); };

  const handleSubmit = () => {
    if (!opponent.trim()) return;
    if (editId) { onUpdate(editId, { opponent: opponent.trim(), date, notes: notes || undefined }); }
    else { onAdd({ tournamentId: tournament.id, opponent: opponent.trim(), date: date || new Date().toISOString().split('T')[0], notes: notes || undefined }); }
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirmDelete === id) { onDelete(id); setConfirmDelete(null); }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-modal animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-secondary/95 backdrop-blur-2xl border border-border-glass rounded-2xl animate-scale-in z-10 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2"><Swords className="w-5 h-5 text-emerald-400" />Partidos</h2>
            <p className="text-xs text-text-muted">{tournament.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="w-full mb-3 py-3 rounded-xl border-2 border-dashed border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/5 btn-press">
              <Plus className="w-4 h-4" />Nuevo Partido
            </button>
          )}

          {showForm && (
            <div className="glass-card-subtle p-4 mb-3 space-y-2 animate-slide-down">
              <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="Oponente" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500/50" autoFocus />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-emerald-500/50" />
              <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas (opcional)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500/50" />
              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={!opponent.trim()} className="flex-1 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white btn-press disabled:opacity-40">{editId ? 'Actualizar' : 'Crear'}</button>
                <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 btn-press">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {games.length === 0 && !showForm && <p className="text-center text-text-muted text-sm py-8">No hay partidos en este torneo</p>}
            {[...games].sort((a,b) => b.date.localeCompare(a.date)).map(g => (
              <div key={g.id} className="glass-card-subtle p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">vs {g.opponent}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" />{g.date}</p>
                  {g.notes && <p className="text-xs text-text-muted mt-0.5">{g.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(g)} className="p-2 rounded-lg hover:bg-white/10 btn-press"><Edit3 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => handleDelete(g.id)} className={`p-2 rounded-lg btn-press ${confirmDelete === g.id ? 'bg-rose-600 text-white' : 'hover:bg-rose-500/10'}`}>
                    <Trash2 className={`w-3.5 h-3.5 ${confirmDelete === g.id ? 'text-white' : 'text-rose-400/60'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageGames;
