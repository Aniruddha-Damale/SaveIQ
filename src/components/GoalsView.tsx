import React, { useState } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Goal, GoalCategory, GoalStatus, UserProfile } from '../types';

interface GoalsViewProps {
  goals: Goal[];
  profile: UserProfile;
  onOpenCreateGoal: () => void;
  onOpenAddSavings: (goal: Goal) => void;
  onOpenEditGoal: (goal: Goal) => void;
  onOpenGoalDetail: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  profile,
  onOpenCreateGoal,
  onOpenAddSavings,
  onOpenEditGoal,
  onOpenGoalDetail,
  onDeleteGoal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | GoalStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'target'>('deadline');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Compute status correctly
  const enrichedGoals = goals.map((g) => {
    const target = Number(g.targetAmount) || 0;
    const current = Number(g.currentSavings) || 0;
    const deadline = g.deadline ? new Date(g.deadline) : null;
    if (deadline) deadline.setHours(0, 0, 0, 0);

    let status: GoalStatus = g.status;
    let daysRemaining = 0;
    if (deadline) {
      daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    if (current >= target || g.status === 'Completed') {
      status = 'Completed';
    } else if (deadline && deadline < today) {
      status = 'Overdue';
    } else {
      status = 'Active';
    }

    const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const remaining = Math.max(0, target - current);

    return {
      ...g,
      computedStatus: status,
      daysRemaining,
      progressPct,
      remaining
    };
  });

  // Filter & Search
  const filteredGoals = enrichedGoals.filter((g) => {
    const matchesSearch =
      g.goalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || g.computedStatus === statusFilter;
    const matchesCategory = categoryFilter === 'All' || g.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort
  filteredGoals.sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (sortBy === 'progress') {
      return b.progressPct - a.progressPct;
    }
    if (sortBy === 'target') {
      return Number(b.targetAmount) - Number(a.targetAmount);
    }
    return 0;
  });

  const categories = [
    'All',
    'Emergency Fund',
    'Education',
    'Travel',
    'Vehicle',
    'Electronics',
    'Home',
    'Other'
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            My Savings Goals
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track individual goal velocity, monitor deadlines, and add savings contributions.
          </p>
        </div>

        <button
          onClick={onOpenCreateGoal}
          className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search goals by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            {(['All', 'Active', 'Completed', 'Overdue'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="deadline">Earliest Deadline</option>
              <option value="progress">Highest Progress %</option>
              <option value="target">Largest Target Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No savings goals match your filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
              setCategoryFilter('All');
            }}
            className="mt-3 text-xs text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => {
            const target = Number(goal.targetAmount) || 0;
            const current = Number(goal.currentSavings) || 0;

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top line metadata */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 font-medium">{goal.category}</span>
                    {goal.computedStatus === 'Completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    ) : goal.computedStatus === 'Overdue' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Overdue
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => onOpenGoalDetail(goal)}
                    className="font-bold text-base text-slate-900 dark:text-white mt-1 hover:text-emerald-600 cursor-pointer transition-colors"
                  >
                    {goal.goalName}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Numbers */}
                  <div className="mt-4 flex justify-between items-baseline">
                    <div>
                      <span className="text-[11px] text-slate-400">Saved</span>
                      <p className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        {profile.currency}{current.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400">Target</span>
                      <p className="text-sm font-semibold font-mono text-slate-500 tabular-nums">
                        {profile.currency}{target.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.computedStatus === 'Completed'
                          ? 'bg-emerald-500'
                          : goal.computedStatus === 'Overdue'
                          ? 'bg-rose-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${goal.progressPct}%` }}
                    />
                  </div>

                  {/* Math stats: Remaining, Days, Monthly Target */}
                  <div className="mt-3.5 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Remaining</span>
                      <span className="font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {profile.currency}{goal.remaining.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Days Left</span>
                      <span
                        className={`font-mono font-semibold tabular-nums ${
                          goal.daysRemaining < 0
                            ? 'text-rose-500'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {goal.daysRemaining < 0
                          ? `${Math.abs(goal.daysRemaining)}d overdue`
                          : `${goal.daysRemaining} days`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Monthly Target</span>
                      <span className="font-mono font-semibold text-teal-600 dark:text-teal-400 tabular-nums">
                        {profile.currency}{(goal.monthlyTarget || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons (Section 6: View, Add Savings, Edit, Delete) */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenGoalDetail(goal)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenEditGoal(goal)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${goal.goalName}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenAddSavings(goal)}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Savings</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
