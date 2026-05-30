import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Trophy, Calendar } from 'lucide-react';
import type { Tournament } from '../types';

interface ManageTournamentsProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  onAdd: (data: Omit<Tournament, 'id'>) => void;
  onUpdate: (id: string, data: Partial<Omit<Tournament, 'id'>>) => void;
  onDelete: (id: string) => void;
}

const ManageTournaments: React.FC<ManageTournamentsProps> = ({ isOpen, onClose, tournaments, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { if (isOpen) { setShowForm(tournaments.length === 0); setEditId(null); setConfirmDelete(null); } }, [isOpen, tournaments.length]);

  if (!isOpen) return null;

  const resetForm = () => { setName(''); setDate(''); setDesc(''); setEditId(null); setShowForm(false); };

  const startEdit = (t: Tournament) => { setName(t.name); setDate(t.date); setDesc(t.description || ''); setEditId(t.id); setShowForm(true); };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editId) { onUpdate(editId, { name: name.trim(), date, description: desc || undefined }); }
    else { onAdd({ name: name.trim(), date: date || new Date().toISOString().split('T')[0], description: desc || undefined }); }
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
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2"><Trophy className="w-5 h-5 text-emerald-400" />Torneos</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          {/* Add button */}
          {!showForm && (
            <button onClick={() => { resetForm(); setShowForm(true); }} className="w-full mb-3 py-3 rounded-xl border-2 border-dashed border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/5 btn-press">
              <Plus className="w-4 h-4" />Nuevo Torneo
            </button>
          )}

          {/* Form */}
          {showForm && (
            <div className="glass-card-subtle p-4 mb-3 space-y-2 animate-slide-down">
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre del torneo" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500/50" autoFocus />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-emerald-500/50" />
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Descripción (opcional)" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500/50" />
              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={!name.trim()} className="flex-1 py-2 rounded-lg font-bold text-sm bg-emerald-600 text-white btn-press disabled:opacity-40">{editId ? 'Actualizar' : 'Crear'}</button>
                <button onClick={resetForm} className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:bg-white/5 btn-press">Cancelar</button>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-2">
            {tournaments.length === 0 && !showForm && <p className="text-center text-text-muted text-sm py-8">No hay torneos creados</p>}
            {tournaments.map(t => (
              <div key={t.id} className="glass-card-subtle p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted flex items-center gap-1"><Calendar className="w-3 h-3" />{t.date}</p>
                  {t.description && <p className="text-xs text-text-muted mt-0.5">{t.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(t)} className="p-2 rounded-lg hover:bg-white/10 btn-press"><Edit3 className="w-3.5 h-3.5 text-text-muted" /></button>
                  <button onClick={() => handleDelete(t.id)} className={`p-2 rounded-lg btn-press ${confirmDelete === t.id ? 'bg-rose-600 text-white' : 'hover:bg-rose-500/10'}`}>
                    <Trash2 className={`w-3.5 h-3.5 ${confirmDelete === t.id ? 'text-white' : 'text-rose-400/60'}`} />
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

export default ManageTournaments;
