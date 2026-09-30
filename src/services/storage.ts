import { Goal, GoalStatus, SavingsTransaction, UserProfile, AppNotification } from '../types';

const STORAGE_KEYS = {
  GOALS: 'saveiq_goals_v1',
  TRANSACTIONS: 'saveiq_transactions_v1',
  PROFILE: 'saveiq_profile_v1',
  NOTIFICATIONS: 'saveiq_notifications_v1',
};

// Initial realistic sample data adhering to Section 26
const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_main_01',
  name: 'Aniruddha Damale',
  email: 'aniruddhadamale001@gmail.com',
  currency: '₹',
  monthlyIncome: 85000,
  monthlySavingTarget: 25000,
  notificationPreference: 'all',
  reminderPreference: 'daily',
  groqApiKey: '',
  googleSheetId: '',
  gasWebAppUrl: '',
  theme: 'light'
};

const DEFAULT_GOALS: Goal[] = [
  {
    id: 'goal_efund_01',
    userId: 'usr_main_01',
    goalName: 'Emergency Fund',
    category: 'Emergency Fund',
    targetAmount: 100000,
    currentSavings: 65000,
    deadline: '2026-12-31',
    monthlyTarget: 10000,
    description: '6 months essential runway for medical emergencies and unexpected contingencies.',
    status: 'Active',
    createdAt: '2026-01-15T10:00:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z'
  },
  {
    id: 'goal_travel_02',
    userId: 'usr_main_01',
    goalName: 'Travel Fund',
    category: 'Travel',
    targetAmount: 50000,
    currentSavings: 32000,
    deadline: '2026-11-15',
    monthlyTarget: 9000,
    description: 'Year-end expedition and cultural retreat to Himachal Pradesh and Spiti Valley.',
    status: 'Active',
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-09-18T11:20:00.000Z'
  },
  {
    id: 'goal_edu_03',
    userId: 'usr_main_01',
    goalName: 'Education Fund',
    category: 'Education',
    targetAmount: 80000,
    currentSavings: 48000,
    deadline: '2026-10-30',
    monthlyTarget: 16000,
    description: 'Advanced Cloud Architect and Machine Learning Professional Certifications.',
    status: 'Active',
    createdAt: '2026-04-10T12:00:00.000Z',
    updatedAt: '2026-09-10T09:45:00.000Z'
  },
  {
    id: 'goal_veh_04',
    userId: 'usr_main_01',
    goalName: 'Vehicle Fund',
    category: 'Vehicle',
    targetAmount: 150000,
    currentSavings: 45000,
    deadline: '2027-04-15',
    monthlyTarget: 15000,
    description: 'Down payment for an eco-friendly electric compact commuter vehicle.',
    status: 'Active',
    createdAt: '2026-02-20T16:00:00.000Z',
    updatedAt: '2026-08-25T15:10:00.000Z'
  }
];

const DEFAULT_TRANSACTIONS: SavingsTransaction[] = [
  {
    id: 'tx_01',
    goalId: 'goal_efund_01',
    amount: 15000,
    date: '2026-09-15',
    note: 'Mid-month savings deposit',
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'tx_02',
    goalId: 'goal_travel_02',
    amount: 8000,
    date: '2026-09-18',
    note: 'Discretionary weekend surplus allocated',
    createdAt: '2026-09-18T11:20:00.000Z'
  },
  {
    id: 'tx_03',
    goalId: 'goal_edu_03',
    amount: 12000,
    date: '2026-09-10',
    note: 'Freelance design stipend',
    createdAt: '2026-09-10T09:45:00.000Z'
  },
  {
    id: 'tx_04',
    goalId: 'goal_efund_01',
    amount: 10000,
    date: '2026-08-30',
    note: 'August salary savings allocation',
    createdAt: '2026-08-30T14:00:00.000Z'
  }
];

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_01',
    goalId: 'goal_edu_03',
    goalName: 'Education Fund',
    type: 'DEADLINE_REMINDER',
    title: 'Upcoming Deadline',
    message: 'Education Fund deadline is approaching on Oct 30, 2026. ₹32,000 remaining.',
    date: '2026-09-24T08:00:00.000Z',
    read: false,
    severity: 'warning'
  },
  {
    id: 'notif_02',
    goalId: 'goal_efund_01',
    goalName: 'Emergency Fund',
    type: 'MONTHLY_CHECKIN',
    title: 'Monthly Progress Milestone',
    message: 'Great work! You reached 65% of your Emergency Fund goal.',
    date: '2026-09-20T10:00:00.000Z',
    read: true,
    severity: 'success'
  },
  {
    id: 'notif_03',
    goalId: 'goal_travel_02',
    goalName: 'Travel Fund',
    type: 'DEADLINE_REMINDER',
    title: 'Travel Goal Deadline',
    message: 'Your Travel Fund is on track for November departure. ₹18,000 to reach target.',
    date: '2026-09-18T09:00:00.000Z',
    read: false,
    severity: 'info'
  }
];

export const storage = {
  getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return stored ? { ...DEFAULT_PROFILE, ...JSON.parse(stored) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getGoals(): Goal[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
        return DEFAULT_GOALS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_GOALS;
    }
  },

  saveGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getGoalById(id: string): Goal | undefined {
    return this.getGoals().find(g => g.id === id);
  },

  createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: GoalStatus }): Goal {
    const goals = this.getGoals();
    const now = new Date().toISOString();
    const targetAmount = Number(goalData.targetAmount);
    const currentSavings = Number(goalData.currentSavings);

    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      targetAmount,
      currentSavings,
      status: currentSavings >= targetAmount ? 'Completed' : 'Active',
      createdAt: now,
      updatedAt: now
    };

    goals.unshift(newGoal);
    this.saveGoals(goals);

    if (currentSavings > 0) {
      this.addTransaction({
        goalId: newGoal.id,
        amount: currentSavings,
        date: now.split('T')[0],
        note: 'Initial goal allocation'
      });
    }

    return newGoal;
  },

  updateGoal(updated: Goal): void {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === updated.id);
    if (idx !== -1) {
      // Recalculate status
      const target = Number(updated.targetAmount);
      const current = Number(updated.currentSavings);
      const deadline = new Date(updated.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let status = updated.status;
      if (current >= target) {
        status = 'Completed';
      } else if (deadline < today) {
        status = 'Overdue';
      } else {
        status = 'Active';
      }

      goals[idx] = {
        ...updated,
        status,
        updatedAt: new Date().toISOString()
      };
      this.saveGoals(goals);
    }
  },

  deleteGoal(id: string): void {
    const goals = this.getGoals().filter(g => g.id !== id);
    this.saveGoals(goals);
  },

  getTransactions(): SavingsTransaction[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
        return DEFAULT_TRANSACTIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  },

  addTransaction(tx: Omit<SavingsTransaction, 'id' | 'createdAt'>): SavingsTransaction {
    const transactions = this.getTransactions();
    const newTx: SavingsTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };
    transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return newTx;
  },

  addSavingsToGoal(goalId: string, amount: number, date: string, note: string): { goal: Goal; completed: boolean } {
    const goals = this.getGoals();
    const idx = goals.findIndex(g => g.id === goalId);
    if (idx === -1) throw new Error('Goal not found');

    const goal = goals[idx];
    const previousSavings = goal.currentSavings;
    const newSavings = previousSavings + amount;
    const target = goal.targetAmount;
    const newlyCompleted = newSavings >= target && previousSavings < target;

    const updatedGoal: Goal = {
      ...goal,
      currentSavings: newSavings,
      status: newSavings >= target ? 'Completed' : goal.status,
      updatedAt: new Date().toISOString()
    };

    goals[idx] = updatedGoal;
    this.saveGoals(goals);

    this.addTransaction({
      goalId,
      amount,
      date: date || new Date().toISOString().split('T')[0],
      note: note || 'Savings contribution'
    });

    if (newlyCompleted) {
      this.addNotification({
        goalId: goal.id,
        goalName: goal.goalName,
        type: 'GOAL_COMPLETED',
        title: 'Goal Completed! 🎉',
        message: `Congratulations! You have reached 100% of your target for "${goal.goalName}".`,
        severity: 'success'
      });
    }

    return { goal: updatedGoal, completed: newlyCompleted };
  },

  getNotifications(): AppNotification[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
        return DEFAULT_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: AppNotification[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'date' | 'read'>): AppNotification {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toISOString(),
      read: false
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs);
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    this.saveNotifications(updated);
  },

  markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => ({ ...n, read: true }));
    this.saveNotifications(updated);
  },

  resetDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(DEFAULT_GOALS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(DEFAULT_PROFILE));
  }
};
