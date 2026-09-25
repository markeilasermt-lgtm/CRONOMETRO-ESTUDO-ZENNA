import {
  StudySession,
  DayRecord,
  SubjectItem,
  UserGoals,
  RewardItem,
  RedemptionRecord,
  Achievement,
} from '../types';
import { formatDateToISO } from './dateUtils';

const STORAGE_KEYS = {
  SESSIONS: 'estudoflux_clean_sessions_v3',
  DAY_RECORDS: 'estudoflux_clean_day_records_v3',
  SUBJECTS: 'estudoflux_subjects_v3',
  GOALS: 'estudoflux_goals_v3',
  REWARDS: 'estudoflux_rewards_v3',
  REDEMPTIONS: 'estudoflux_redemptions_v3',
  POINTS: 'estudoflux_points_v3',
  ACHIEVEMENTS: 'estudoflux_achievements_v3',
};

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: 'sub-1', name: 'Programação & Dev', color: '#3B82F6' },
  { id: 'sub-2', name: 'Matemática & Lógica', color: '#10B981' },
  { id: 'sub-3', name: 'Inglês & Idiomas', color: '#F59E0B' },
  { id: 'sub-4', name: 'Concursos & Legislação', color: '#8B5CF6' },
  { id: 'sub-5', name: 'Faculdade / Leitura', color: '#EC4899' },
  { id: 'sub-6', name: 'Geral & Revisões', color: '#06B6D4' },
];

export const DEFAULT_GOALS: UserGoals = {
  dailyMinutes: 120, // 2 horas por dia
  monthlyHours: 45, // 45 horas por mês
  weeklyHours: 12,
  soundEnabled: true,
};

export const DEFAULT_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: '1 Episódio da Série Favorita',
    description: 'Assistir sem culpa ao próximo capítulo após bater meta.',
    costPoints: 120,
    category: 'lazer',
    icon: 'Tv',
    redeemedCount: 3,
  },
  {
    id: 'rew-2',
    title: 'Café Especial / Sobremesa',
    description: 'Pausa deliciosa em cafeteria ou doce artesanal favorito.',
    costPoints: 80,
    category: 'comida',
    icon: 'Coffee',
    redeemedCount: 5,
  },
  {
    id: 'rew-3',
    title: '1 Hora de Videogame / Jogos',
    description: 'Jogatina tranquila sabendo que os estudos estão em dia.',
    costPoints: 180,
    category: 'lazer',
    icon: 'Gamepad2',
    redeemedCount: 2,
  },
  {
    id: 'rew-4',
    title: 'Comprar um Livro ou Presente',
    description: 'Recompensa maior por alcançar metas de longo prazo.',
    costPoints: 900,
    category: 'compras',
    icon: 'ShoppingBag',
    redeemedCount: 1,
  },
  {
    id: 'rew-5',
    title: 'Tarde / Noite Totalmente Livre',
    description: 'Zero obrigações no fim de semana para relaxar a mente.',
    costPoints: 400,
    category: 'descanso',
    icon: 'Sun',
    redeemedCount: 2,
  },
];

export const ALL_LEVEL_RANKS = [
  { level: 1, title: 'Iniciante Curioso', minXP: 0, maxXP: 180, color: 'text-neutral-600', bg: 'bg-neutral-100', border: 'border-neutral-300', tier: 'bronze', icon: 'Seedling' },
  { level: 2, title: 'Estudante Focado', minXP: 180, maxXP: 420, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300', tier: 'bronze', icon: 'BookOpen' },
  { level: 3, title: 'Praticante Constante', minXP: 420, maxXP: 780, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', tier: 'silver', icon: 'Compass' },
  { level: 4, title: 'Devorador de Livros', minXP: 780, maxXP: 1260, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300', tier: 'silver', icon: 'Zap' },
  { level: 5, title: 'Mestre da Concentração', minXP: 1260, maxXP: 1900, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300', tier: 'gold', icon: 'Flame' },
  { level: 6, title: 'Sábio Disciplinado', minXP: 1900, maxXP: 2700, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', tier: 'gold', icon: 'Award' },
  { level: 7, title: 'Polímata em Ascensão', minXP: 2700, maxXP: 3700, color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300', tier: 'platinum', icon: 'ShieldCheck' },
  { level: 8, title: 'Lenda Acadêmica', minXP: 3700, maxXP: 5000, color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-400', tier: 'diamond', icon: 'Crown' },
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first',
    title: 'Primeiro Passo',
    description: 'Completou sua primeira sessão de foco de estudos.',
    iconName: 'Sparkles',
    category: 'sessions',
    tier: 'bronze',
    requirement: 1,
  },
  {
    id: 'ach-deep',
    title: 'Foco Profundo',
    description: 'Realizou uma sessão ininterrupta de 45 minutos ou mais.',
    iconName: 'Flame',
    category: 'sessions',
    tier: 'silver',
    requirement: 45,
  },
  {
    id: 'ach-daily-hit',
    title: 'Meta Diária Conquistada',
    description: 'Alcançou 100% da sua meta de tempo de estudo do dia.',
    iconName: 'Target',
    category: 'goals',
    tier: 'bronze',
    requirement: 1,
  },
  {
    id: 'ach-daily-triad',
    title: 'Tríade de Metas',
    description: 'Bateu a meta diária de estudos por 3 dias no mês.',
    iconName: 'CheckCheck',
    category: 'goals',
    tier: 'silver',
    requirement: 3,
  },
  {
    id: 'ach-monthly-hit',
    title: 'Mestre do Mês',
    description: 'Bateu a meta mensal de horas de estudo estabelecida.',
    iconName: 'Trophy',
    category: 'goals',
    tier: 'gold',
    requirement: 1,
  },
  {
    id: 'ach-streak-3',
    title: 'Trinca de Fogo',
    description: 'Manteve uma sequência ininterrupta de 3 dias seguidos estudando.',
    iconName: 'Zap',
    category: 'streak',
    tier: 'bronze',
    requirement: 3,
  },
  {
    id: 'ach-streak-7',
    title: 'Semana de Campeão',
    description: 'Alcançou uma sequência de 7 dias consecutivos de estudo.',
    iconName: 'Award',
    category: 'streak',
    tier: 'silver',
    requirement: 7,
  },
  {
    id: 'ach-streak-14',
    title: 'Hábito Inabalável',
    description: 'Manteve 14 dias seguidos de dedicação e disciplina aos estudos.',
    iconName: 'ShieldCheck',
    category: 'streak',
    tier: 'gold',
    requirement: 14,
  },
  {
    id: 'ach-streak-30',
    title: 'Muralha de Ferro',
    description: 'Incansável sequência de 30 dias de estudos ininterruptos.',
    iconName: 'Crown',
    category: 'streak',
    tier: 'diamond',
    requirement: 30,
  },
  {
    id: 'ach-hours-10',
    title: 'Ritmo Estabelecido',
    description: 'Acumulou mais de 10 horas totais de estudo registradas.',
    iconName: 'Clock',
    category: 'hours',
    tier: 'bronze',
    requirement: 10,
  },
  {
    id: 'ach-hours-25',
    title: 'Estudante Dedicado',
    description: 'Acumulou mais de 25 horas totais de estudo na plataforma.',
    iconName: 'Clock',
    category: 'hours',
    tier: 'silver',
    requirement: 25,
  },
  {
    id: 'ach-hours-50',
    title: 'Mestre da Disciplina',
    description: 'Acumulou mais de 50 horas totais de estudo focado.',
    iconName: 'Crown',
    category: 'hours',
    tier: 'gold',
    requirement: 50,
  },
  {
    id: 'ach-marathon-90',
    title: 'Maratonista de Foco',
    description: 'Completou uma sessão contínua extrema de 90 minutos de foco.',
    iconName: 'Zap',
    category: 'sessions',
    tier: 'platinum',
    requirement: 90,
  },
];

export function loadSessions(): StudySession[] {
  const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  if (!raw) {
    saveSessions([]);
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSessions(sessions: StudySession[]) {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function loadDayRecords(): DayRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.DAY_RECORDS);
  if (!raw) {
    saveDayRecords([]);
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDayRecords(records: DayRecord[]) {
  localStorage.setItem(STORAGE_KEYS.DAY_RECORDS, JSON.stringify(records));
}

export function loadSubjects(): SubjectItem[] {
  const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!raw) {
    saveSubjects(DEFAULT_SUBJECTS);
    return DEFAULT_SUBJECTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SUBJECTS;
  }
}

export function saveSubjects(subjects: SubjectItem[]) {
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
}

export function loadGoals(): UserGoals {
  const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
  if (!raw) {
    saveGoals(DEFAULT_GOALS);
    return DEFAULT_GOALS;
  }
  try {
    return { ...DEFAULT_GOALS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOALS;
  }
}

export function saveGoals(goals: UserGoals) {
  localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
}

export function loadRewards(): RewardItem[] {
  const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
  if (!raw) {
    saveRewards(DEFAULT_REWARDS);
    return DEFAULT_REWARDS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REWARDS;
  }
}

export function saveRewards(rewards: RewardItem[]) {
  localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
}

export function loadRedemptions(): RedemptionRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
  if (!raw) {
    saveRedemptions([]);
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRedemptions(redemptions: RedemptionRecord[]) {
  localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
}

export function loadPoints(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.POINTS);
  if (raw === null) {
    savePoints(0);
    return 0;
  }
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function savePoints(points: number) {
  localStorage.setItem(STORAGE_KEYS.POINTS, String(points));
}

export function loadAchievements(): Achievement[] {
  const raw = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  if (!raw) {
    saveAchievements(INITIAL_ACHIEVEMENTS);
    return INITIAL_ACHIEVEMENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACHIEVEMENTS;
  }
}

export function saveAchievements(achievements: Achievement[]) {
  localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
}

/**
 * Calculates current streak (consecutive days of study ending either today or yesterday)
 */
export function calculateStreak(studiedDatesSet: Set<string>): { currentStreak: number; bestStreak: number } {
  if (studiedDatesSet.size === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const sortedDates = Array.from(studiedDatesSet).sort();
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;

  // Check current streak ending today or yesterday
  const today = new Date();
  const todayStr = formatDateToISO(today);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateToISO(yesterday);

  // If studied today or yesterday, count backwards
  const anchorDate = studiedDatesSet.has(todayStr) ? today : (studiedDatesSet.has(yesterdayStr) ? yesterday : null);

  if (anchorDate) {
    let checkDate = new Date(anchorDate);
    while (studiedDatesSet.has(formatDateToISO(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate historical best streak
  let prevDate: Date | null = null;
  for (const dStr of sortedDates) {
    const [y, m, d] = dStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (prevDate) {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  return {
    currentStreak,
    bestStreak: Math.max(maxStreak, currentStreak),
  };
}

/**
 * Student Rank / Level calculation based on total studied minutes
 */
export function calculateUserLevel(totalMinutes: number) {
  // 1 hour = 60 XP. 
  // Levels: 
  // Lvl 1: 0 - 180 min (3h)
  // Lvl 2: 180 - 420 min (7h)
  // Lvl 3: 420 - 780 min (13h)
  // Lvl 4: 780 - 1260 min (21h)
  // Lvl 5: 1260 - 1860 min (31h)
  // Lvl 6+: increments of 700 min
  const ranks = [
    { level: 1, title: 'Iniciante Curioso', minXP: 0, maxXP: 180 },
    { level: 2, title: 'Estudante Focado', minXP: 180, maxXP: 420 },
    { level: 3, title: 'Praticante Constante', minXP: 420, maxXP: 780 },
    { level: 4, title: 'Devorador de Livros', minXP: 780, maxXP: 1260 },
    { level: 5, title: 'Mestre da Concentração', minXP: 1260, maxXP: 1900 },
    { level: 6, title: 'Sábio Disciplinado', minXP: 1900, maxXP: 2700 },
    { level: 7, title: 'Polímata em Ascensão', minXP: 2700, maxXP: 3700 },
    { level: 8, title: 'Lenda Acadêmica', minXP: 3700, maxXP: 5000 },
  ];

  let currentRank = ranks[0];
  for (const r of ranks) {
    if (totalMinutes >= r.minXP) {
      currentRank = r;
    }
  }

  const xpInLevel = Math.max(0, totalMinutes - currentRank.minXP);
  const xpNeeded = currentRank.maxXP - currentRank.minXP;
  const progressPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  return {
    ...currentRank,
    xpInLevel,
    xpNeeded,
    progressPercent,
  };
}
