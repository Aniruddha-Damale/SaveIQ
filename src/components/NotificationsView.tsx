import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Mail,
  Check,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRunAudit: () => void;
  onOpenEmailPreview: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onRunAudit,
  onOpenEmailPreview
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'deadlines' | 'milestones'>('all');
  const [isAuditing, setIsAuditing] = useState(false);

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'deadlines') return n.type === 'DEADLINE_REMINDER' || n.type === 'OVERDUE';
    if (filter === 'milestones') return n.type === 'GOAL_COMPLETED' || n.type === 'MONTHLY_CHECKIN';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAuditClick = () => {
    setIsAuditing(true);
    setTimeout(() => {
      onRunAudit();
      setIsAuditing(false);
    }, 600);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
          badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200'
        };
      case 'warning':
        return {
          icon: <Clock className="w-4 h-4 text-amber-500 shrink-0" />,
          badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
        };
      case 'success':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-sky-500 shrink-0" />,
          badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200'
        };
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            Notifications & Audit Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated alerts triggered by Google Apps Script time-driven rules and Gmail services.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenEmailPreview}
            className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Preview Gmail Emails</span>
          </button>

          <button
            onClick={handleAuditClick}
            disabled={isAuditing}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing Goals...' : 'Run Daily Audit Now'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Bulk Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
          {(['all', 'unread', 'deadlines', 'milestones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'all' ? `All (${notifications.length})` : tab === 'unread' ? `Unread (${unreadCount})` : tab}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {filteredNotifs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            No notifications in this filter view.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((n) => {
            const styles = getSeverityStyles(n.severity);
            const dateStr = new Date(n.date).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  n.read
                    ? 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 opacity-80'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{styles.icon}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h4>
                      {n.goalName && (
                        <span className="text-[11px] font-medium text-slate-500">
                          · {n.goalName}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {dateStr}
                    </span>
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => onMarkAsRead(n.id)}
                    className="p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
