import React from 'react';
import {
  LayoutDashboard,
  Target,
  PlusCircle,
  Sparkles,
  BarChart3,
  Bell,
  User,
  Settings,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  unreadCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  unreadCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'goals', label: 'My Goals', icon: Target },
    { id: 'coach', label: 'AI Coach', icon: Sparkles, badge: 'LLaMA' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
              Save<span className="text-emerald-600 dark:text-emerald-400">IQ</span>
            </span>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
              Smart Savings Engine
            </p>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150 active:scale-[0.98] cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Goal</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.count && item.count > 0 ? (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 tabular-nums">
                  {item.count}
                </span>
              ) : null}

              {item.badge ? (
                <span className="text-[10px] tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Bank-Grade Encryption</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
          Google Sheets & Groq Sync
        </p>
      </div>
    </aside>
  );
};
