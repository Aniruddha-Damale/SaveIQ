import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Calendar, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Goal, UserProfile } from '../types';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  goals: Goal[];
  profile: UserProfile;
  onAddSavings: (goalId: string, amount: number, date: string, note: string) => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({
  isOpen,
  onClose,
  goal,
  goals,
  profile,
  onAddSavings
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (goal) {
      setSelectedGoalId(goal.id);
    } else if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNote('');
    setError('');
  }, [goal, goals, isOpen]);

  if (!isOpen) return null;

  const activeGoal = goals.find((g) => g.id === selectedGoalId) || goal;
  const numAmount = parseFloat(amount) || 0;
  const currentSaved = activeGoal ? activeGoal.currentSavings : 0;
  const targetAmount = activeGoal ? activeGoal.targetAmount : 0;
  const projectedSaved = currentSaved + numAmount;
  const projectedPct = targetAmount > 0 ? Math.min(100, Math.round((projectedSaved / targetAmount) * 100)) : 0;
  const isCompleting = projectedSaved >= targetAmount && currentSaved < targetAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) {
      setError('Please select a goal');
      return;
    }
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid deposit amount');
      return;
    }

    if (isCompleting) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Safe failover
      }
    }

    onAddSavings(selectedGoalId, numAmount, date, note || 'Savings contribution');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
                Add Savings Contribution
              </h2>
              <p className="text-[11px] text-slate-500">Record a new savings transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Goal Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Goal
            </label>
            <select
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.goalName} ({profile.currency}{g.currentSavings.toLocaleString()} / {profile.currency}{g.targetAmount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Contribution Amount ({profile.currency}) *
            </label>
            <div className="relative">
              <span className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 font-bold font-mono text-sm">
                {profile.currency}
              </span>
              <input
                type="number"
                min="1"
                step="any"
                placeholder="5000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                autoFocus
                className="w-full pl-9 pr-3 py-2.5 text-base font-mono font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            {error && <p className="text-[11px] text-rose-500 mt-1 font-medium">{error}</p>}
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Note (optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Salary cut, bonus..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Projected Progress Preview */}
          {activeGoal && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Projected Progress</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {profile.currency}{projectedSaved.toLocaleString()} / {profile.currency}{targetAmount.toLocaleString()} ({projectedPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${projectedPct}%` }}
                />
              </div>
              {isCompleting && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  This contribution will complete this goal!
                </p>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Confirm Savings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
