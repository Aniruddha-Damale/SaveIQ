import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { AICoachView } from './components/AICoachView';
import { AnalyticsView } from './components/AnalyticsView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { CreateGoalModal } from './components/CreateGoalModal';
import { AddSavingsModal } from './components/AddSavingsModal';
import { GoalDetailModal } from './components/GoalDetailModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { Toast, ToastMessage } from './components/Toast';
import { storage } from './services/storage';
import { Goal, SavingsTransaction, UserProfile, AppNotification } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
  const [profile, setProfile] = useState<UserProfile>(storage.getProfile());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAddSavingsOpen, setIsAddSavingsOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Initialize data from storage
  useEffect(() => {
    setGoals(storage.getGoals());
    setTransactions(storage.getTransactions());
    const prof = storage.getProfile();
    setProfile(prof);
    setNotifications(storage.getNotifications());
    if (prof.theme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleTheme = () => {
    const nextTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const updated: UserProfile = { ...profile, theme: nextTheme };
    setProfile(updated);
    storage.saveProfile(updated);
  };

  const handleSaveGoal = (
    goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }
  ) => {
    if (goalData.id) {
      // Editing existing goal
      const existing = goals.find((g) => g.id === goalData.id);
      if (existing) {
        const updated: Goal = {
          ...existing,
          goalName: goalData.goalName,
          category: goalData.category,
          targetAmount: goalData.targetAmount,
          currentSavings: goalData.currentSavings,
          deadline: goalData.deadline,
          monthlyTarget: goalData.monthlyTarget,
          description: goalData.description
        };
        storage.updateGoal(updated);
        setGoals(storage.getGoals());
        addToast(`Updated goal "${goalData.goalName}"!`, 'success');
      }
    } else {
      // Creating new goal
      const newGoal = storage.createGoal(goalData);
      setGoals(storage.getGoals());
      setTransactions(storage.getTransactions());
      addToast(`Created savings goal "${newGoal.goalName}"!`, 'success');
    }
    setIsCreateOpen(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    storage.deleteGoal(goalId);
    setGoals(storage.getGoals());
    addToast(`Deleted goal "${goal?.goalName || 'Goal'}"`, 'info');
  };

  const handleAddSavings = (goalId: string, amount: number, date: string, note: string) => {
    try {
      const result = storage.addSavingsToGoal(goalId, amount, date, note);
      setGoals(storage.getGoals());
      setTransactions(storage.getTransactions());
      setNotifications(storage.getNotifications());

      if (result.completed) {
        addToast(`🎉 Milestone reached! You completed "${result.goal.goalName}"!`, 'success');
      } else {
        addToast(
          `Savings added successfully! +${profile.currency}${amount.toLocaleString()} to ${result.goal.goalName}`,
          'success'
        );
      }
    } catch (e: any) {
      addToast(e.message || 'Failed to add savings', 'error');
    }
  };

  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
    addToast('Profile changes saved successfully!', 'success');
  };

  const handleResetDemoData = () => {
    storage.resetDemoData();
    setGoals(storage.getGoals());
    setTransactions(storage.getTransactions());
    setNotifications(storage.getNotifications());
    setProfile(storage.getProfile());
  };

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
    setNotifications(storage.getNotifications());
  };

  const handleMarkAllAsRead = () => {
    storage.markAllNotificationsAsRead();
    setNotifications(storage.getNotifications());
    addToast('Marked all notifications as read', 'info');
  };

  const handleRunAudit = async () => {
    try {
      const res = await fetch('/api/notifications/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          userEmail: profile.email,
          currency: profile.currency
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.generatedNotifications) {
          data.data.generatedNotifications.forEach((n: any) => {
            storage.addNotification({
              goalId: n.goalId,
              goalName: n.goalName,
              type: n.type,
              title: n.title,
              message: n.message,
              severity: n.severity
            });
          });
          setNotifications(storage.getNotifications());
        }
      }
      addToast(`Daily audit complete. Inspected ${goals.length} active goals.`, 'success');
    } catch (err) {
      addToast('Audit completed locally.', 'info');
    }
  };

  const handleTriggerTestEmail = (type: string, goalName: string) => {
    storage.addNotification({
      type: type as any,
      title: 'Gmail Alert Dispatched',
      message: `Automated ${type.replace(/_/g, ' ')} for "${goalName}" sent to ${profile.email}.`,
      severity: 'info'
    });
    setNotifications(storage.getNotifications());
    addToast(`Automated notification email simulated to ${profile.email}`, 'success');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // If user chooses landing page view
  if (currentTab === 'landing') {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <LandingPage
          onGetStarted={() => setCurrentTab('dashboard')}
          onViewDemo={() => setCurrentTab('dashboard')}
        />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenCreateModal={() => {
            setEditingGoal(null);
            setIsCreateOpen(true);
          }}
          unreadCount={unreadCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar Header (Top Bar Contract 3 zones) */}
          <Header
            currentTab={currentTab}
            profile={profile}
            unreadCount={unreadCount}
            onOpenNotifications={() => setCurrentTab('notifications')}
            onOpenCreateGoal={() => {
              setEditingGoal(null);
              setIsCreateOpen(true);
            }}
            onOpenProfile={() => setCurrentTab('profile')}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />

          {/* View Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
            {currentTab === 'dashboard' && (
              <DashboardView
                goals={goals}
                transactions={transactions}
                profile={profile}
                onOpenCreateGoal={() => {
                  setEditingGoal(null);
                  setIsCreateOpen(true);
                }}
                onOpenAddSavings={(goal) => {
                  setActiveGoal(goal);
                  setIsAddSavingsOpen(true);
                }}
                onOpenGoalDetail={(goal) => {
                  setActiveGoal(goal);
                  setIsDetailOpen(true);
                }}
                onNavigateTab={setCurrentTab}
                onRunAudit={handleRunAudit}
              />
            )}

            {currentTab === 'goals' && (
              <GoalsView
                goals={goals}
                profile={profile}
                onOpenCreateGoal={() => {
                  setEditingGoal(null);
                  setIsCreateOpen(true);
                }}
                onOpenAddSavings={(goal) => {
                  setActiveGoal(goal);
                  setIsAddSavingsOpen(true);
                }}
                onOpenEditGoal={(goal) => {
                  setEditingGoal(goal);
                  setIsCreateOpen(true);
                }}
                onOpenGoalDetail={(goal) => {
                  setActiveGoal(goal);
                  setIsDetailOpen(true);
                }}
                onDeleteGoal={handleDeleteGoal}
              />
            )}

            {currentTab === 'coach' && (
              <AICoachView goals={goals} profile={profile} />
            )}

            {currentTab === 'analytics' && (
              <AnalyticsView
                goals={goals}
                transactions={transactions}
                profile={profile}
              />
            )}

            {currentTab === 'notifications' && (
              <NotificationsView
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onRunAudit={handleRunAudit}
                onOpenEmailPreview={() => setIsEmailPreviewOpen(true)}
              />
            )}

            {currentTab === 'profile' && (
              <ProfileView profile={profile} onSaveProfile={handleSaveProfile} />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                profile={profile}
                goals={goals}
                transactions={transactions}
                onSaveProfile={handleSaveProfile}
                onResetDemoData={handleResetDemoData}
                onShowToast={addToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Modals */}
      <CreateGoalModal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        profile={profile}
        initialData={editingGoal}
      />

      <AddSavingsModal
        isOpen={isAddSavingsOpen}
        onClose={() => {
          setIsAddSavingsOpen(false);
          setActiveGoal(null);
        }}
        goal={activeGoal}
        goals={goals}
        profile={profile}
        onAddSavings={handleAddSavings}
      />

      <GoalDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setActiveGoal(null);
        }}
        goal={activeGoal}
        transactions={transactions}
        profile={profile}
        onOpenAddSavings={(goal) => {
          setActiveGoal(goal);
          setIsAddSavingsOpen(true);
        }}
        onOpenEditGoal={(goal) => {
          setEditingGoal(goal);
          setIsCreateOpen(true);
        }}
        onDeleteGoal={handleDeleteGoal}
      />

      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        goals={goals}
        profile={profile}
        onTriggerTestEmail={handleTriggerTestEmail}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
