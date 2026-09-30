import React, { useState, useEffect } from 'react';
import { X, Calculator, Calendar, DollarSign, Target, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { Goal, GoalCategory, UserProfile } from '../types';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }) => void;
  profile: UserProfile;
  initialData?: Goal | null;
}

const CATEGORIES: GoalCategory[] = [
  'Emergency Fund',
  'Education',
  'Travel',
  'Vehicle',
  'Electronics',
  'Home',
  'Other'
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  profile,
  initialData
}) => {
  const [goalName, setGoalName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Emergency Fund');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [currentSavings, setCurrentSavings] = useState<string>('0');
  const [deadline, setDeadline] = useState<string>('');
  const [monthlyTarget, setMonthlyTarget] = useState<string>('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setGoalName(initialData.goalName);
      setCategory(initialData.category);
      setTargetAmount(String(initialData.targetAmount));
      setCurrentSavings(String(initialData.currentSavings));
      setDeadline(initialData.deadline);
      setMonthlyTarget(String(initialData.monthlyTarget || ''));
      setDescription(initialData.description || '');
    } else {
      setGoalName('');
      setCategory('Emergency Fund');
      setTargetAmount('');
      setCurrentSavings('0');
      // Set default deadline 6 months from now
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setDeadline(d.toISOString().split('T')[0]);
      setMonthlyTarget('');
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Real-time dynamic auto-calculations
  const numTarget = Math.max(0, parseFloat(targetAmount) || 0);
  const numCurrent = Math.max(0, parseFloat(currentSavings) || 0);
  const remainingAmount = Math.max(0, numTarget - numCurrent);
  const progressPct = numTarget > 0 ? Math.min(100, Math.round((numCurrent / numTarget) * 100)) : 0;

  // Calculate days & months remaining
  let daysRemaining = 0;
  let monthsRemaining = 1;
  let requiredMonthlySaving = 0;

  if (deadline) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadDate = new Date(deadline);
    deadDate.setHours(0, 0, 0, 0);
    const diffMs = deadDate.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    monthsRemaining = Math.max(1, daysRemaining / 30.4);
    requiredMonthlySaving = remainingAmount > 0 ? Math.round(remainingAmount / monthsRemaining) : 0;
  }

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!goalName.trim()) {
      newErrors.goalName = 'Goal name is required';
    }

    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      newErrors.targetAmount = 'Target amount must be a positive number';
    }

    if (currentSavings !== '' && (isNaN(Number(currentSavings)) || Number(currentSavings) < 0)) {
      newErrors.currentSavings = 'Current savings cannot be negative';
    }

    if (!deadline) {
      newErrors.deadline = 'Please select a valid deadline';
    } else {
      const selected = new Date(deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today && (!initialData || initialData.status !== 'Completed')) {
        newErrors.deadline = 'Deadline must be a future date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: initialData?.id,
      userId: profile.id || 'usr_main_01',
      goalName: goalName.trim(),
      category,
      targetAmount: numTarget,
      currentSavings: numCurrent,
      deadline,
      monthlyTarget: parseFloat(monthlyTarget) || requiredMonthlySaving,
      description: description.trim()
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {initialData ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set your target, deadline, and auto-calculate required monthly pacing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Goal Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Goal Name *
              </label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Emergency Fund, Japan Trip"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.goalName ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.goalName && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.goalName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GoalCategory)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Target Amount & Current Savings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Amount ({profile.currency}) *
              </label>
              <div className="relative">
                <span className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 font-bold font-mono text-xs">
                  {profile.currency}
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="100000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.targetAmount ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.targetAmount && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.targetAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Savings ({profile.currency})
              </label>
              <div className="relative">
                <span className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 font-bold font-mono text-xs">
                  {profile.currency}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                    errors.currentSavings ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.currentSavings && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.currentSavings}</p>
              )}
            </div>
          </div>

          {/* Row 3: Deadline & Monthly Target */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Deadline *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer ${
                    errors.deadline ? 'border-rose-400' : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.deadline && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.deadline}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Planned Monthly Target ({profile.currency})
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  placeholder={requiredMonthlySaving > 0 ? String(requiredMonthlySaving) : 'Auto-calculated'}
                  value={monthlyTarget}
                  onChange={(e) => setMonthlyTarget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Calculated minimum: {profile.currency}{requiredMonthlySaving.toLocaleString()}/mo
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Notes
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                placeholder="Why this goal matters, motivation, or specifics..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Real-time Math Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Real-Time Math Projections</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Remaining</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {profile.currency}{remainingAmount.toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-slate-400">Progress</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {progressPct}%
                </p>
              </div>

              <div>
                <span className="text-slate-400">Days Remaining</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {daysRemaining} days
                </p>
              </div>

              <div>
                <span className="text-slate-400">Monthly Pace</span>
                <p className="font-mono font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                  {profile.currency}{requiredMonthlySaving.toLocaleString()}/mo
                </p>
              </div>
            </div>

            {/* Visual Mini Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Create Savings Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
