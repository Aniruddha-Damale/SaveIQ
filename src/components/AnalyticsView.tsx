import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Goal, SavingsTransaction, UserProfile } from '../types';

interface AnalyticsViewProps {
  goals: Goal[];
  transactions: SavingsTransaction[];
  profile: UserProfile;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  goals,
  transactions,
  profile
}) => {
  const [timeRange, setTimeRange] = useState<'3M' | '6M' | '1Y' | 'ALL'>('ALL');

  // Compute Core Metrics
  const totalSavings = goals.reduce((acc, g) => acc + (Number(g.currentSavings) || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSavings / totalTarget) * 100)) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeCount = 0;
  let completedCount = 0;
  let overdueCount = 0;

  goals.forEach((g) => {
    const saved = Number(g.currentSavings) || 0;
    const target = Number(g.targetAmount) || 0;
    const deadline = g.deadline ? new Date(g.deadline) : null;
    if (deadline) deadline.setHours(0, 0, 0, 0);

    if (g.status === 'Completed' || saved >= target) {
      completedCount++;
    } else if (deadline && deadline < today) {
      overdueCount++;
    } else {
      activeCount++;
    }
  });

  // Category Distribution
  const categoryTotals: { [key: string]: number } = {};
  goals.forEach((g) => {
    const cat = g.category || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(g.currentSavings) || 0);
  });

  const categoryEntries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const categoryColors = [
    '#059669', // emerald
    '#0d9488', // teal
    '#0284c7', // sky
    '#4f46e5', // indigo
    '#d97706', // amber
    '#e11d48', // rose
    '#8b5cf6'  // violet
  ];

  // Monthly contributions aggregation
  const monthlyTotals: { [month: string]: number } = {};
  transactions.forEach((t) => {
    const monthKey = t.date ? t.date.substring(0, 7) : '2026-09';
    monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + (Number(t.amount) || 0);
  });

  // Sort months chronologically
  const sortedMonths = Object.keys(monthlyTotals).sort();
  const maxMonthly = Math.max(...Object.values(monthlyTotals), 1000);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Projections
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual breakdown of savings growth, goal velocity, and category allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            {(['3M', '6M', '1Y', 'ALL'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  timeRange === r
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500">Total Saved</span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {profile.currency}{totalSavings.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {overallProgress}% of portfolio target
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500">Total Commitment</span>
          <p className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
            {profile.currency}{totalTarget.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Across {goals.length} target milestones
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500">Active Goals</span>
          <p className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
            {activeCount} active
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {completedCount} completed · {overdueCount} overdue
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500">Monthly Contribution</span>
          <p className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
            {profile.currency}{(transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) / (sortedMonths.length || 1)).toFixed(0).toLocaleString()}/mo
          </p>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Historic deposit average
          </span>
        </div>
      </div>

      {/* Row 1 Charts: Goal Progress Comparison & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Goal Progress Comparison */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                Goal Progress Comparison
              </h3>
              <p className="text-xs text-slate-400">Current savings vs target amount</p>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-4 pt-2">
            {goals.map((goal, idx) => {
              const target = Number(goal.targetAmount) || 0;
              const saved = Number(goal.currentSavings) || 0;
              const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
              const color = categoryColors[idx % categoryColors.length];

              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {goal.goalName}
                    </span>
                    <span className="font-mono font-bold tabular-nums text-slate-600 dark:text-slate-400">
                      {profile.currency}{saved.toLocaleString()} / {profile.currency}{target.toLocaleString()} ({pct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Category Distribution */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                Category Distribution
              </h3>
              <p className="text-xs text-slate-400">Allocation breakdown across goal categories</p>
            </div>
            <PieIcon className="w-4 h-4 text-teal-600" />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulatedPercent = 0;
                  return categoryEntries.map(([cat, amount], idx) => {
                    const pct = totalSavings > 0 ? (amount / totalSavings) * 100 : 0;
                    const strokeDasharray = `${pct} ${100 - pct}`;
                    const strokeDashoffset = -accumulatedPercent;
                    accumulatedPercent += pct;
                    const color = categoryColors[idx % categoryColors.length];

                    return (
                      <circle
                        key={cat}
                        cx="18"
                        cy="18"
                        r="14"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="5"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute text-center">
                <span className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {categoryEntries.length}
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">
                  Categories
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2 w-full text-xs">
              {categoryEntries.map(([cat, amount], idx) => {
                const pct = totalSavings > 0 ? Math.round((amount / totalSavings) * 100) : 0;
                const color = categoryColors[idx % categoryColors.length];
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                        {cat}
                      </span>
                    </div>
                    <div className="font-mono text-slate-500 tabular-nums">
                      {profile.currency}{amount.toLocaleString()}{' '}
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Contributions Bar Chart & Goal Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Contributions (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                Monthly Savings Velocity
              </h3>
              <p className="text-xs text-slate-400">Total deposited per calendar month</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="pt-4">
            {sortedMonths.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">
                No monthly contributions recorded yet.
              </p>
            ) : (
              <div className="flex items-end gap-3 h-48 border-b border-slate-200 dark:border-slate-800 pb-2 px-2">
                {sortedMonths.map((month) => {
                  const val = monthlyTotals[month] || 0;
                  const heightPct = maxMonthly > 0 ? Math.max(10, Math.round((val / maxMonthly) * 100)) : 10;
                  const monthName = new Date(month + '-01').toLocaleString('default', { month: 'short' });

                  return (
                    <div key={month} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                        {profile.currency}{val.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg h-full flex items-end">
                        <div
                          className="w-full bg-emerald-600 hover:bg-emerald-500 rounded-t-lg transition-all duration-300"
                          style={{ height: `${heightPct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        {monthName}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Goal Status Breakdown (1 col) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
              Portfolio Status Breakdown
            </h3>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-950/80 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Completed</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {completedCount} ({goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0}%)
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-950/80 bg-sky-50/50 dark:bg-sky-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300 font-semibold">
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Active & Pacing</span>
              </div>
              <span className="font-mono font-bold text-sky-700 dark:text-sky-300 tabular-nums">
                {activeCount} ({goals.length > 0 ? Math.round((activeCount / goals.length) * 100) : 0}%)
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/50 dark:bg-rose-950/30 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Overdue Deadlines</span>
              </div>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-300 tabular-nums">
                {overdueCount} ({goals.length > 0 ? Math.round((overdueCount / goals.length) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
