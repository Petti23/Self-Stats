/* ============================================================
   Toast — Notification system with HR celebration
   ============================================================ */

import React, { useEffect, useState, useCallback } from 'react';
import { X, Zap, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';

export type ToastType = 'hit' | 'homerun' | 'out' | 'info' | 'error' | 'success';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastListener: ((toast: ToastData) => void) | null = null;

export function showToast(type: ToastType, message: string, duration = 3000) {
  const toast: ToastData = {
    id: Date.now().toString(36),
    type,
    message,
    duration,
  };
  toastListener?.(toast);
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  hit: {
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/40',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  },
  homerun: {
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/50',
    icon: <Trophy className="w-5 h-5 text-amber-400" />,
  },
  out: {
    bg: 'bg-slate-800/80',
    border: 'border-slate-500/30',
    icon: <Zap className="w-5 h-5 text-slate-400" />,
  },
  info: {
    bg: 'bg-blue-950/80',
    border: 'border-blue-500/30',
    icon: <Zap className="w-5 h-5 text-blue-400" />,
  },
  error: {
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/30',
    icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
  },
  success: {
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/30',
    icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
  },
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  const removeToast = useCallback((id: string) => {
    setExiting(prev => new Set(prev).add(id));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExiting(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300);
  }, []);

  useEffect(() => {
    toastListener = (toast) => {
      setToasts(prev => [toast, ...prev].slice(0, 5));
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => removeToast(toast.id), toast.duration);
      }
    };
    return () => { toastListener = null; };
  }, [removeToast]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        const isExiting = exiting.has(toast.id);
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl
              backdrop-blur-xl border shadow-lg
              ${style.bg} ${style.border}
              ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
              ${toast.type === 'homerun' ? 'animate-hr-glow' : ''}
            `}
          >
            {style.icon}
            <span className="flex-1 text-sm font-medium text-white/90">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ── Confetti for Home Runs ──────────────────────────────────

const CONFETTI_COLORS = ['#f59e0b', '#fbbf24', '#34d399', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'];

export function triggerConfetti() {
  const count = 40;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.top = `-10px`;
    el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.animationDelay = `${Math.random() * 0.8}s`;
    el.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    el.style.width = `${6 + Math.random() * 8}px`;
    el.style.height = `${6 + Math.random() * 8}px`;
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}
