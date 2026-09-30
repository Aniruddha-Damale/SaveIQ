export type GoalCategory =
  | 'Emergency Fund'
  | 'Education'
  | 'Travel'
  | 'Vehicle'
  | 'Electronics'
  | 'Home'
  | 'Other';

export type GoalStatus = 'Active' | 'Completed' | 'Overdue';

export interface SavingsTransaction {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  note: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  goalName: string;
  category: GoalCategory;
  targetAmount: number;
  currentSavings: number;
  deadline: string; // ISO date YYYY-MM-DD
  monthlyTarget: number;
  description: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  monthlyIncome?: number;
  monthlySavingTarget?: number;
  notificationPreference: 'all' | 'important' | 'none';
  reminderPreference: 'daily' | 'weekly' | 'biweekly';
  groqApiKey?: string;
  googleSheetId?: string;
  gasWebAppUrl?: string;
  theme?: 'light' | 'dark' | 'system';
}

export interface AppNotification {
  id: string;
  goalId?: string;
  goalName?: string;
  type: 'DEADLINE_REMINDER' | 'PROGRESS_WARNING' | 'GOAL_COMPLETED' | 'MONTHLY_CHECKIN' | 'OVERDUE' | 'SYSTEM';
  title: string;
  message: string;
  date: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface AICoachResponse {
  aiInsight: string;
  recommendedAction: string;
  whyItMatters: string;
  suggestedNextStep: string;
  disclaimer: string;
  provider?: string;
}

export interface DashboardMetrics {
  totalSavings: number;
  totalTarget: number;
  overallProgress: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals: number;
}
