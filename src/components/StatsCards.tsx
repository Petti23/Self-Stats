/* ============================================================
   StatsCards — Glassmorphism stat display cards
   ============================================================ */

import React from 'react';
import type { BattingStats } from '../types';
import { formatRate } from '../stats';
import StatGauge from './StatGauge';
import {
  TrendingUp, Zap, CircleDot
} from 'lucide-react';

interface StatsCardsProps {
  stats: BattingStats;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Main gauges row */}
      <div className="glass-card p-5">
        <div className="flex justify-around items-start">
          <StatGauge
            value={stats.avg}
            label="AVG"
            maxValue={0.500}
            colorFrom="#10b981"
            colorTo="#34d399"
            size={130}
          />
          <StatGauge
            value={stats.obp}
            label="OBP"
            maxValue={0.600}
            colorFrom="#06b6d4"
            colorTo="#22d3ee"
            size={130}
          />
        </div>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStatCard
          label="SLG"
          value={formatRate(stats.slg)}
          icon={<Zap className="w-4 h-4" />}
          accent="text-amber-400"
        />
        <MiniStatCard
          label="OPS"
          value={formatRate(stats.ops)}
          icon={<TrendingUp className="w-4 h-4" />}
          accent="text-emerald-400"
        />
        <MiniStatCard
          label="TB"
          value={stats.tb.toString()}
          icon={<CircleDot className="w-4 h-4" />}
          accent="text-cyan-400"
        />
      </div>

      {/* Detailed breakdown */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
          Desglose de Turnos
        </h3>
        <div className="grid grid-cols-4 gap-y-3 gap-x-2">
          <StatPill label="PA" value={stats.pa} />
          <StatPill label="AB" value={stats.ab} />
          <StatPill label="H" value={stats.h} accent />
          <StatPill label="HR" value={stats.hr} gold />
          
          <StatPill label="2B" value={stats.doubles} />
          <StatPill label="3B" value={stats.triples} />
          <StatPill label="RBI" value={stats.rbi} accent />
          <StatPill label="R" value={stats.runs} accent />
          
          <StatPill label="BB" value={stats.bb} />
          <StatPill label="HBP" value={stats.hbp} />
          <StatPill label="SF" value={stats.sf} />
          <StatPill label="SAC" value={stats.sac} />

          <StatPill label="K" value={stats.k} danger />
          <StatPill label="ROE" value={stats.roe} warning />
          <StatPill label="CI" value={stats.ci} />
          <StatPill label="OUT" value={stats.outs} />
        </div>
      </div>
    </div>
  );
};

// ── Mini stat card ──────────────────────────────────────────

interface MiniStatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: string;
}

const MiniStatCard: React.FC<MiniStatCardProps> = ({ label, value, icon, accent = 'text-text-secondary' }) => (
  <div className="glass-card-subtle p-3 flex flex-col items-center gap-1">
    <div className={`${accent}`}>{icon}</div>
    <span className="stat-number text-xl font-black text-text-primary">{value}</span>
    <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{label}</span>
  </div>
);

// ── Stat pill ───────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: number;
  accent?: boolean;
  gold?: boolean;
  danger?: boolean;
  warning?: boolean;
}

const StatPill: React.FC<StatPillProps> = ({ label, value, accent, gold, danger, warning }) => {
  let valueColor = 'text-text-primary';
  if (accent) valueColor = 'text-emerald-400';
  if (gold) valueColor = 'text-amber-400';
  if (danger && value > 0) valueColor = 'text-rose-400';
  if (warning && value > 0) valueColor = 'text-amber-500';

  return (
    <div className="flex flex-col items-center">
      <span className={`stat-number text-lg font-bold ${valueColor}`}>{value}</span>
      <span className="text-[10px] font-medium uppercase text-text-muted">{label}</span>
    </div>
  );
};

export default StatsCards;
