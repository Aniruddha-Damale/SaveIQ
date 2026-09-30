import React from 'react';
import {
  X,
  PlusCircle,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { Goal, SavingsTransaction, UserProfile } from '../types';

interface GoalDetailModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  transactions: SavingsTransaction[];
  profile: UserProfile;
  onOpenAddSavings: (goal: Goal) => void;
  onOpenEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  goal,
  isOpen,
  onClose,
  transactions,
  profile,
  onOpenAddSavings,
  onOpenEditGoal,
  onDeleteGoal
}) => {
  if (!isOpen || !goal) return null;

  const target = Number(goal.targetAmount) || 0;
  const current = Number(goal.currentSavings) || 0;
  const remaining = Math.max(0, target - current);
  const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  // Calculate days remaining
  let daysRemaining = 0;
  let isOverdue = false;
  if (goal.deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(goal.deadline);
    deadline.setHours(0, 0, 0, 0);
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    daysRemaining = diff;
    if (diff < 0 && goal.status !== 'Completed') {
      isOverdue = true;
    }
  }

  const goalTx = transactions.filter((t) => t.goalId === goal.id);

  const getStatusBadge = () => {
    if (goal.status === 'Completed' || current >= target) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed</span>
        </span>
      );
    }
    if (isOverdue || goal.status === 'Overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Overdue</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
        <span>Active</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {goal.category}
              </span>
              <span>·</span>
              {getStatusBadge()}
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {goal.goalName}
            </h2>
            {goal.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                {goal.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Progress Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 mb-3">
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Savings Progress
                </span>
                <div className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                  {profile.currency}{current.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-slate-400">
                    / {profile.currency}{target.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {progressPct}%
                </span>
                <p className="text-[11px] text-slate-500">
                  {profile.currency}{remaining.toLocaleString()} remaining
                </p>
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500">Target Amount</span>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                {profile.currency}{target.toLocaleString()}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500">Deadline</span>
              <p className="text-base font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                {goal.deadline || 'None'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500">Days Remaining</span>
              <p className={`text-base font-bold font-mono mt-1 tabular-nums ${daysRemaining < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d Overdue` : `${daysRemaining} days`}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-500">Monthly Target</span>
              <p className="text-base font-bold font-mono text-teal-600 dark:text-teal-400 mt-1 tabular-nums">
                {profile.currency}{(goal.monthlyTarget || 0).toLocaleString()}/mo
              </p>
            </div>
          </div>

          {/* Savings History Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Savings History & Deposits
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {goalTx.length} contribution{goalTx.length !== 1 ? 's' : ''}
              </span>
            </div>

            {goalTx.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                No savings transactions recorded yet for this goal.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Note</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {goalTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {tx.date}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 font-sans">
                          {tx.note || 'Contribution'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          +{profile.currency}{Number(tx.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${goal.goalName}"?`)) {
                onDeleteGoal(goal.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Goal</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onOpenEditGoal(goal);
                onClose();
              }}
              className="flex items-center gap-1.5 py-2 px-3.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onOpenAddSavings(goal);
                onClose();
              }}
              className="flex items-center gap-1.5 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Savings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
