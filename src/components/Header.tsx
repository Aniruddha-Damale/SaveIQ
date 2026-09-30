import React from 'react';
import { Bell, Plus, ShieldCheck, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  currentTab: string;
  profile: UserProfile;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenCreateGoal: () => void;
  onOpenProfile: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  unreadCount,
  onOpenNotifications,
  onOpenCreateGoal,
  onOpenProfile,
  theme,
  onToggleTheme
}) => {
  const getTabLabel = (id: string) => {
    switch (id) {
      case 'dashboard': return 'Dashboard';
      case 'goals': return 'My Savings Goals';
      case 'coach': return 'SaveIQ AI Coach';
      case 'analytics': return 'Financial Analytics';
      case 'notifications': return 'Notifications & Alerts';
      case 'profile': return 'User Profile';
      case 'settings': return 'System & Database Settings';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between z-30 sticky top-0">
      {/* Zone 1: Context Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">
          SaveIQ /
        </span>
        <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
          {getTabLabel(currentTab)}
        </h1>
      </div>

      {/* Zone 2: System Health Badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-full border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Sheets & Groq Sync Active</span>
      </div>

      {/* Zone 3: Actions & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <button
          onClick={onOpenCreateGoal}
          className="hidden sm:flex items-center gap-1.5 py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-85 transition-opacity cursor-pointer"
          title="View Profile"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-500/20">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden md:inline truncate max-w-[120px]">
            {profile.name || 'User'}
          </span>
        </button>
      </div>
    </header>
  );
};
