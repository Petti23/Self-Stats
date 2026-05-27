import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { OutcomeType, PlateAppearance } from '../types';
import { OUTCOMES } from '../types';

interface EditPAModalProps {
  isOpen: boolean;
  pa: PlateAppearance | null;
  onClose: () => void;
  onSave: (id: string, data: Partial<Omit<PlateAppearance, 'id'>>) => void;
}

const OUTCOME_GRID: OutcomeType[] = ['1B','2B','3B','HR','OUT','K','BB','HBP','SF','SAC','CI'];

const EditPAModal: React.FC<EditPAModalProps> = ({ isOpen, pa, onClose, onSave }) => {
  const [outcome, setOutcome] = useState<OutcomeType>('OUT');
  const [rbi, setRbi] = useState(0);
  const [runs, setRuns] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (pa) { setOutcome(pa.outcome); setRbi(pa.rbi); setRuns(pa.runs); setNotes(pa.notes || ''); }
  }, [pa]);

  if (!isOpen || !pa) return null;

  const handleSave = () => { onSave(pa.id, { outcome, rbi, runs, notes: notes || undefined }); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-modal animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-bg-secondary/95 backdrop-blur-2xl border border-border-glass rounded-2xl animate-scale-in z-10 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary">Editar Turno</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>
        <div className="px-5 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Resultado</p>
          <div className="grid grid-cols-4 gap-1.5">
            {OUTCOME_GRID.map(c => (
              <button key={c} onClick={() => setOutcome(c)} className={`py-2 rounded-lg font-bold text-xs btn-press transition-all ${outcome === c ? `${OUTCOMES[c].colorClass} text-white ring-2 ring-white/30` : 'bg-white/5 text-text-secondary hover:bg-white/10'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">RBI</p>
          <div className="flex gap-1.5">
            {[0,1,2,3,4].map(n => (
              <button key={n} onClick={() => setRbi(n)} className={`flex-1 py-2 rounded-lg font-bold text-sm btn-press ${rbi === n ? 'bg-emerald-600 text-white' : 'bg-white/5 text-text-secondary'}`}>{n}</button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Anoté Carrera</p>
          <button onClick={() => setRuns(runs > 0 ? 0 : 1)} className={`w-full py-2 rounded-lg font-bold text-sm btn-press ${runs > 0 ? 'bg-emerald-600 text-white' : 'bg-white/5 text-text-secondary'}`}>{runs > 0 ? '✓ Sí' : 'No'}</button>
        </div>
        <div className="px-5 pb-3">
          <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas opcionales..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-emerald-500/50" />
        </div>
        <div className="px-5 pb-6 pt-2">
          <button onClick={handleSave} className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg btn-press flex items-center justify-center gap-2"><Save className="w-4 h-4" />Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditPAModal;
