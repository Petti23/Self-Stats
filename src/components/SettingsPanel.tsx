import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, Database, AlertTriangle } from 'lucide-react';
import { downloadBackup, uploadBackup, clearAllData } from '../store';
import { showToast } from './Toast';
import { notifyDataChange } from '../hooks';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => { downloadBackup(); showToast('success', '📦 Backup descargado'); };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadBackup(file);
      notifyDataChange();
      showToast('success', '✅ Datos importados correctamente');
      onClose();
    } catch {
      showToast('error', '❌ Error al importar datos');
    }
    e.target.value = '';
  };

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 4000); return; }
    clearAllData();
    notifyDataChange();
    showToast('info', '🗑️ Todos los datos han sido eliminados');
    setConfirmClear(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-modal animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-bg-secondary/95 backdrop-blur-2xl border border-border-glass rounded-2xl animate-scale-in z-10">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-text-primary flex items-center gap-2"><Database className="w-5 h-5 text-emerald-400" />Ajustes</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>
        <div className="px-5 pb-6 space-y-3">
          <button onClick={handleExport} className="w-full py-3 rounded-xl font-semibold text-sm bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center gap-2 btn-press hover:bg-emerald-600/20">
            <Download className="w-4 h-4" />Exportar Backup (.json)
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl font-semibold text-sm bg-blue-600/10 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-2 btn-press hover:bg-blue-600/20">
            <Upload className="w-4 h-4" />Importar Backup (.json)
          </button>
          <button onClick={handleClear} className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 btn-press transition-all ${confirmClear ? 'bg-rose-600 text-white animate-pulse' : 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'}`}>
            {confirmClear ? <><AlertTriangle className="w-4 h-4" />¿Seguro? Toca de nuevo</> : <><Trash2 className="w-4 h-4" />Limpiar Todos los Datos</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
