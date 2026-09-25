export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  durationSeconds?: number;
  totalSeconds?: number;
  subject?: string;
  notes?: string;
  completedAt: string; // ISO
}

export interface DayRecord {
  date: string; // YYYY-MM-DD
  manualMarked: boolean; // explicitly checked as studied
  notes?: string;
}

export interface SubjectItem {
  id: string;
  name: string;
  color: string;
}

export interface UserGoals {
  dailyMinutes: number; // e.g., 120 (2h)
  monthlyHours: number; // e.g., 40h
  weeklyHours: number; // e.g., 14h
  soundEnabled: boolean;
}

export interface RewardItem {
  id: string;
  title: string;
  costPoints: number;
  description: string;
  category: 'lazer' | 'comida' | 'compras' | 'descanso';
  icon: string;
  redeemedCount: number;
  isCustom?: boolean;
}

export interface RedemptionRecord {
  id: string;
  rewardId: string;
  rewardTitle: string;
  costPoints: number;
  redeemedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'streak' | 'hours' | 'sessions' | 'goals';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  unlockedAt?: string;
  currentProgress?: number;
  maxProgress?: number;
}

export interface RewardCelebration {
  type: 'daily_goal' | 'monthly_goal' | 'level_up' | 'achievement';
  title: string;
  subtitle: string;
  pointsEarned: number;
  badgeName?: string;
  badgeTier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  badgeIcon?: string;
  levelNumber?: number;
  levelTitle?: string;
}

export type ActiveTab = 'calendar' | 'timer' | 'daily' | 'monthly';
