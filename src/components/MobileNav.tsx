import React from 'react';
import { LayoutDashboard, Target, Sparkles, BarChart3, User } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'coach', label: 'AI Coach', icon: Sparkles },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
              isActive
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[11px] leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
