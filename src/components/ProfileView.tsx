import React, { useState } from 'react';
import { User, Mail, DollarSign, Bell, Clock, CheckCircle2, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, onSaveProfile }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);

  const currencies = [
    { code: 'INR', symbol: '₹', label: '₹ Indian Rupee' },
    { code: 'USD', symbol: '$', label: '$ US Dollar' },
    { code: 'EUR', symbol: '€', label: '€ Euro' },
    { code: 'GBP', symbol: '£', label: '£ British Pound' },
    { code: 'JPY', symbol: '¥', label: '¥ Japanese Yen' },
    { code: 'CAD', symbol: 'C$', label: 'C$ Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', label: 'A$ Australian Dollar' },
    { code: 'AED', symbol: 'د.إ', label: 'AED UAE Dirham' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onSaveProfile(formData);
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
          User Financial Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Customize currency preferences, income benchmarks, and alert schedules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        {/* Avatar & Summary */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-500/20 font-display">
            {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
              {formData.name || 'User Profile'}
            </h3>
            <p className="text-xs text-slate-500">{formData.email}</p>
            <span className="text-[11px] font-semibold text-emerald-600 mt-1 inline-block">
              SaveIQ Standard Member
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Base Currency *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Income */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Monthly Income ({formData.currency})
            </label>
            <div className="relative">
              <span className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 font-bold font-mono text-xs">
                {formData.currency}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="85000"
                value={formData.monthlyIncome || ''}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyIncome: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Monthly Saving Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Overall Monthly Saving Target ({formData.currency})
            </label>
            <div className="relative">
              <span className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 font-bold font-mono text-xs">
                {formData.currency}
              </span>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="25000"
                value={formData.monthlySavingTarget || ''}
                onChange={(e) =>
                  setFormData({ ...formData, monthlySavingTarget: parseFloat(e.target.value) || 0 })
                }
                className="w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Reminder Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reminder Schedule
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={formData.reminderPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reminderPreference: e.target.value as any
                  })
                }
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="daily">Daily 8:00 AM Audit (Recommended)</option>
                <option value="weekly">Weekly Digest on Monday</option>
                <option value="biweekly">Bi-weekly Check-in</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Notification Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'all', title: 'All Alerts', desc: 'Deadlines, pace warnings, and milestone celebrations' },
              { id: 'important', title: 'Important Only', desc: 'Only overdue goals and completion milestones' },
              { id: 'none', title: 'Muted', desc: 'No automated reminders or email dispatches' }
            ].map((option) => (
              <label
                key={option.id}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.notificationPreference === option.id
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="notifPref"
                    checked={formData.notificationPreference === option.id}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        notificationPreference: option.id as any
                      })
                    }
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {option.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 pl-5">
                  {option.desc}
                </p>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
