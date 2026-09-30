import React from 'react';
import {
  Wallet,
  Target,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Goal, SavingsTransaction, UserProfile } from '../types';

interface DashboardViewProps {
  goals: Goal[];
  transactions: SavingsTransaction[];
  profile: UserProfile;
  onOpenCreateGoal: () => void;
  onOpenAddSavings: (goal: Goal) => void;
  onOpenGoalDetail: (goal: Goal) => void;
  onNavigateTab: (tab: string) => void;
  onRunAudit: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  goals,
  transactions,
  profile,
  onOpenCreateGoal,
  onOpenAddSavings,
  onOpenGoalDetail,
  onNavigateTab,
  onRunAudit
}) => {
  // Aggregate stats
  const totalSavings = goals.reduce((acc, g) => acc + (Number(g.currentSavings) || 0), 0);
  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSavings / totalTarget) * 100)) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeGoals = 0;
  let completedGoals = 0;
  let overdueGoals = 0;

  goals.forEach((g) => {
    const saved = Number(g.currentSavings) || 0;
    const target = Number(g.targetAmount) || 0;
    const deadline = g.deadline ? new Date(g.deadline) : null;
    if (deadline) deadline.setHours(0, 0, 0, 0);

    if (g.status === 'Completed' || saved >= target) {
      completedGoals++;
    } else if (deadline && deadline < today) {
      overdueGoals++;
    } else {
      activeGoals++;
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Empty state handling (Section 19)
  if (goals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <Target className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
          Start your savings journey
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Create your first savings goal and let SaveIQ help you stay on track with automated reminders and AI coaching.
        </p>
        <button
          onClick={onOpenCreateGoal}
          className="mt-6 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create My First Goal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            {getGreeting()}, {profile.name || 'Saver'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's your savings progress at a glance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRunAudit}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Run time-driven audit checks on deadlines and pacing"
          >
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Run Daily Audit</span>
          </button>

          <button
            onClick={onOpenCreateGoal}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Goal</span>
          </button>
        </div>
      </div>

      {/* 6 Statistic Cards (Section 5) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Savings */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Savings</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {profile.currency}{totalSavings.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">Accumulated wealth</span>
          </div>
        </div>

        {/* Total Target */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Target</span>
            <Target className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {profile.currency}{totalTarget.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Across {goals.length} goals</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Progress</span>
            <Percent className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-teal-600 dark:text-teal-400 tabular-nums">
              {overallProgress}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Weighted average</span>
          </div>
        </div>

        {/* Active Goals */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Goals</span>
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {activeGoals}
            </span>
            <span className="text-[10px] text-indigo-600 block mt-0.5 font-medium">In progression</span>
          </div>
        </div>

        {/* Completed Goals */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completed Goals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {completedGoals}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Achieved 100%</span>
          </div>
        </div>

        {/* Overdue Goals */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Goals</span>
            <AlertTriangle className={`w-4 h-4 ${overdueGoals > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-xl font-bold font-mono tabular-nums ${overdueGoals > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {overdueGoals}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Needs pace adjust</span>
          </div>
        </div>
      </div>

      {/* Large Overall Savings Progress Visualization (Section 5) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Portfolio Completion Rate
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-xs text-slate-500">Live aggregated savings</span>
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums">
                {profile.currency}{totalSavings.toLocaleString()}{' '}
                <span className="text-xl sm:text-2xl font-normal text-slate-400">
                  / {profile.currency}{totalTarget.toLocaleString()}
                </span>
              </span>
            </div>

            <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${overallProgress}%` }}
              />
            </div>

            <div className="mt-2.5 flex justify-between items-center text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {overallProgress}% completed
              </span>
              <span>
                {profile.currency}{Math.max(0, totalTarget - totalSavings).toLocaleString()} remaining to complete all goals
              </span>
            </div>
          </div>

          {/* Quick AI Coaching Teaser Card */}
          <div className="w-full md:w-72 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>SaveIQ Coach</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your saving velocity is on track for 3 of 4 milestones. Review personalized advice.
            </p>
            <button
              onClick={() => onNavigateTab('coach')}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <span>Ask AI Coach</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Goals Carousel + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Savings Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Active Goals ({goals.length})
            </h3>
            <button
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.slice(0, 4).map((g) => {
              const target = Number(g.targetAmount) || 0;
              const saved = Number(g.currentSavings) || 0;
              const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
              const remaining = Math.max(0, target - saved);

              return (
                <div
                  key={g.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium">{g.category}</span>
                        <h4
                          onClick={() => onOpenGoalDetail(g)}
                          className="font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 cursor-pointer transition-colors mt-0.5 truncate"
                        >
                          {g.goalName}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {pct}%
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs font-mono text-slate-500 mb-1">
                        <span>{profile.currency}{saved.toLocaleString()}</span>
                        <span>{profile.currency}{target.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {g.deadline ? `Due ${g.deadline}` : 'No deadline'}
                    </span>
                    <button
                      onClick={() => onOpenAddSavings(g)}
                      className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      + Add Savings
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Recent Savings Contributions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <span className="text-xs text-slate-400">{transactions.length} records</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {transactions.slice(0, 5).map((tx) => {
              const matchedGoal = goals.find((g) => g.id === tx.goalId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-b-0 text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {matchedGoal ? matchedGoal.goalName : 'Savings Contribution'}
                    </p>
                    <span className="text-[11px] text-slate-400">
                      {tx.date} · {tx.note || 'Deposit'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                    +{profile.currency}{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              );
            })}

            {transactions.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                No recent transactions logged yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
