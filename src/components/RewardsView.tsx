import React, { useState } from 'react';
import {
  RewardItem,
  RedemptionRecord,
  Achievement,
  UserGoals,
  RewardCelebration,
} from '../types';
import { calculateUserLevel, ALL_LEVEL_RANKS } from '../utils/storage';
import { playRewardFanfare } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Flame,
  Award,
  Plus,
  ShoppingBag,
  Tv,
  Coffee,
  Gamepad2,
  Sun,
  Lock,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Crown,
  ShieldCheck,
  Trophy,
  CheckCheck,
  Compass,
  BookOpen,
  Filter,
} from 'lucide-react';

interface RewardsViewProps {
  points: number;
  totalStudyMinutes: number;
  streakCount: number;
  bestStreak: number;
  rewards: RewardItem[];
  redemptions: RedemptionRecord[];
  achievements: Achievement[];
  goals: UserGoals;
  onRedeemReward: (reward: RewardItem) => void;
  onAddCustomReward: (reward: Omit<RewardItem, 'id' | 'redeemedCount'>) => void;
  onOpenSettings: () => void;
  onTriggerCelebration: (celebration: RewardCelebration) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({
  points,
  totalStudyMinutes,
  streakCount,
  bestStreak,
  rewards,
  redemptions,
  achievements,
  goals,
  onRedeemReward,
  onAddCustomReward,
  onOpenSettings,
  onTriggerCelebration,
}) => {
  const [showAddRewardModal, setShowAddRewardModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newPoints, setNewPoints] = useState<number>(100);
  const [newCategory, setNewCategory] = useState<'lazer' | 'comida' | 'compras' | 'descanso'>('lazer');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'goals' | 'streak' | 'hours' | 'sessions'>('all');
  const [inspectAchievement, setInspectAchievement] = useState<Achievement | null>(null);

  const userLevel = calculateUserLevel(totalStudyMinutes);

  const getRewardIcon = (iconName: string) => {
    switch (iconName) {
      case 'Tv':
        return <Tv className="h-5 w-5 text-indigo-500" />;
      case 'Coffee':
        return <Coffee className="h-5 w-5 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="h-5 w-5 text-purple-500" />;
      case 'Sun':
        return <Sun className="h-5 w-5 text-orange-500" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-emerald-500" />;
    }
  };

  const getAchievementIcon = (iconName: string, tier?: string) => {
    const iconClass = tier === 'diamond' ? 'text-cyan-600' : tier === 'gold' ? 'text-amber-500' : tier === 'silver' ? 'text-slate-500' : 'text-amber-700';

    switch (iconName) {
      case 'Flame':
        return <Flame className={`h-6 w-6 ${iconClass}`} />;
      case 'Target':
        return <Target className={`h-6 w-6 ${iconClass}`} />;
      case 'Zap':
        return <Zap className={`h-6 w-6 ${iconClass}`} />;
      case 'Award':
        return <Award className={`h-6 w-6 ${iconClass}`} />;
      case 'Clock':
        return <Clock className={`h-6 w-6 ${iconClass}`} />;
      case 'Crown':
        return <Crown className={`h-6 w-6 ${iconClass}`} />;
      case 'ShieldCheck':
        return <ShieldCheck className={`h-6 w-6 ${iconClass}`} />;
      case 'Trophy':
        return <Trophy className={`h-6 w-6 ${iconClass}`} />;
      case 'CheckCheck':
        return <CheckCheck className={`h-6 w-6 ${iconClass}`} />;
      default:
        return <Sparkles className={`h-6 w-6 ${iconClass}`} />;
    }
  };

  const getTierLabel = (tier?: string) => {
    switch (tier) {
      case 'diamond':
        return { label: 'Diamante', bg: 'bg-cyan-100 text-cyan-900 border-cyan-300' };
      case 'platinum':
        return { label: 'Platina', bg: 'bg-rose-100 text-rose-900 border-rose-300' };
      case 'gold':
        return { label: 'Ouro', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'silver':
        return { label: 'Prata', bg: 'bg-slate-100 text-slate-800 border-slate-300' };
      default:
        return { label: 'Bronze', bg: 'bg-orange-100 text-orange-900 border-orange-300' };
    }
  };

  const handleRedeem = (reward: RewardItem) => {
    if (points < reward.costPoints) return;

    if (goals.soundEnabled) {
      playRewardFanfare();
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {
      // quiet fail
    }

    onRedeemReward(reward);
  };

  const handleCreateCustomReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddCustomReward({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Recompensa personalizada conquistada com foco!',
      costPoints: Number(newPoints) || 50,
      category: newCategory,
      icon: newCategory === 'comida' ? 'Coffee' : newCategory === 'lazer' ? 'Gamepad2' : newCategory === 'descanso' ? 'Sun' : 'ShoppingBag',
      isCustom: true,
    });

    setNewTitle('');
    setNewDesc('');
    setNewPoints(100);
    setShowAddRewardModal(false);
  };

  // Filtered achievements
  const filteredAchievements = achievements.filter((ach) => {
    if (achievementFilter === 'all') return true;
    return ach.category === achievementFilter;
  });

  const unlockedCount = achievements.filter((a) => Boolean(a.unlockedAt)).length;

  return (
    <div className="space-y-8">
      {/* Level & Points Header Dashboard */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Current Level Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950 font-black text-lg shadow-sm">
                {userLevel.level}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Insígnia de Nível
                  </span>
                  <span className="rounded-md bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                    Lvl {userLevel.level}
                  </span>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-neutral-900">
                  {userLevel.title}
                </h3>
              </div>
            </div>

            {/* XP progress bar */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs text-neutral-500">
                <span>{userLevel.xpInLevel} XP</span>
                <span className="font-semibold text-neutral-800">
                  Faltam {userLevel.xpNeeded - userLevel.xpInLevel} XP para Nível {userLevel.level + 1}
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-neutral-950 transition-all duration-500"
                  style={{ width: `${userLevel.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Points Wallet */}
          <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-indigo-50/30 p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Pontos de Foco Disponíveis</span>
            </div>
            <div className="font-mono text-3xl font-black text-indigo-950 tabular-nums">
              {points} <span className="text-base font-semibold text-indigo-600">pts</span>
            </div>
            <p className="mt-1 text-xs text-indigo-800/80">
              1 minuto estudado = 1 ponto · Bônus por bater metas
            </p>
          </div>

          {/* Streaks & Badges count */}
          <div className="rounded-2xl border border-amber-100 bg-gradient-to-b from-amber-50/70 to-amber-50/30 p-5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="h-4 w-4 fill-amber-500" />
              <span>Sequência & Conquistas</span>
            </div>
            <div className="font-mono text-3xl font-black text-amber-950 tabular-nums">
              {streakCount} <span className="text-base font-semibold text-amber-600">dias</span>
            </div>
            <p className="mt-1 text-xs text-amber-800/80">
              {unlockedCount} de {achievements.length} badges conquistados ({bestStreak}d recorde)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Rewards & Celebrations Quick Trigger Simulator */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-sans text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Demonstração de Recompensas Visuais (Metas & Níveis)</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Visualize como o sistema comemora e entrega medalhas quando você atinge metas ou sobe de nível.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                onTriggerCelebration({
                  type: 'daily_goal',
                  title: 'Meta Diária Batida!',
                  subtitle: `Você atingiu 100% da sua meta diária de estudos hoje (${Math.floor(goals.dailyMinutes / 60)}h ${goals.dailyMinutes % 60}m).`,
                  pointsEarned: 50,
                  badgeTier: 'bronze',
                })
              }
              className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
            >
              <Target className="h-3.5 w-3.5 text-amber-600" />
              <span>Meta Diária</span>
            </button>

            <button
              onClick={() =>
                onTriggerCelebration({
                  type: 'monthly_goal',
                  title: 'Meta Mensal Conquistada!',
                  subtitle: `Parabéns! Você concluiu a meta mensal de ${goals.monthlyHours} horas de estudo!`,
                  pointsEarned: 200,
                  badgeTier: 'gold',
                })
              }
              className="flex items-center gap-1 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-900 hover:bg-yellow-100 transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 text-yellow-600" />
              <span>Meta Mensal</span>
            </button>

            <button
              onClick={() =>
                onTriggerCelebration({
                  type: 'level_up',
                  title: 'Subiu de Nível!',
                  subtitle: 'Seu foco constante desbloqueou um novo patamar acadêmico.',
                  pointsEarned: 100,
                  levelNumber: userLevel.level + 1,
                  levelTitle: ALL_LEVEL_RANKS[Math.min(ALL_LEVEL_RANKS.length - 1, userLevel.level)]?.title || 'Lenda dos Estudos',
                  badgeTier: 'platinum',
                })
              }
              className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition-colors"
            >
              <Crown className="h-3.5 w-3.5 text-indigo-600" />
              <span>Subir de Nível</span>
            </button>
          </div>
        </div>
      </div>

      {/* ACHIEVEMENTS & BADGES SHOWCASE PANEL */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
                Painel de Conquistas & Insígnias
              </h2>
              <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-bold text-white">
                {unlockedCount} / {achievements.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Medalhas visuais desbloqueadas por atingir metas diárias, mensais, sequências e recordes de foco.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'goals', label: 'Metas Batidas' },
              { id: 'streak', label: 'Sequência' },
              { id: 'hours', label: 'Horas' },
              { id: 'sessions', label: 'Foco' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAchievementFilter(f.id as any)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  achievementFilter === f.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAchievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            const tierInfo = getTierLabel(ach.tier);

            return (
              <div
                key={ach.id}
                onClick={() => setInspectAchievement(ach)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                  isUnlocked
                    ? 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                    : 'border-dashed border-neutral-200 bg-neutral-50/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    {/* Visual Badge Emblem */}
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-transform group-hover:scale-105 ${
                        isUnlocked
                          ? 'bg-gradient-to-tr from-amber-50 to-orange-50 border-amber-200 shadow-2xs'
                          : 'bg-neutral-100 border-neutral-200 text-neutral-400'
                      }`}
                    >
                      {isUnlocked ? (
                        getAchievementIcon(ach.iconName, ach.tier)
                      ) : (
                        <Lock className="h-5 w-5 text-neutral-400" />
                      )}
                    </div>

                    {/* Tier badge */}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tierInfo.bg}`}
                    >
                      {tierInfo.label}
                    </span>
                  </div>

                  <h4 className="font-sans text-sm font-bold text-neutral-900 group-hover:text-indigo-600 transition-colors">
                    {ach.title}
                  </h4>
                  <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  {isUnlocked ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Desbloqueado</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-400 font-medium">
                      Requer {ach.requirement} {ach.category === 'hours' ? 'horas' : ach.category === 'streak' ? 'dias' : 'sessões'}
                    </span>
                  )}

                  <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-neutral-700 transition-colors">
                    Ver Emblema →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STUDENT RANKS & TIERS JOURNEY */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h2 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
            Jornada de Insígnias & Níveis Acadêmicos
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Avance de nível acumulando horas de estudo e dedicação na plataforma.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
          {ALL_LEVEL_RANKS.map((rk) => {
            const isReached = userLevel.level >= rk.level;
            const isCurrent = userLevel.level === rk.level;

            return (
              <div
                key={rk.level}
                className={`relative flex flex-col items-center rounded-2xl border p-3.5 text-center transition-all ${
                  isCurrent
                    ? 'border-2 border-neutral-950 bg-neutral-900 text-white shadow-md'
                    : isReached
                    ? 'border-neutral-200 bg-neutral-50 text-neutral-900'
                    : 'border-dashed border-neutral-200 bg-neutral-50/30 opacity-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 text-xs font-bold ${
                    isCurrent
                      ? 'bg-amber-400 text-neutral-950 font-black'
                      : isReached
                      ? 'bg-neutral-200 text-neutral-800'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {rk.level}
                </div>
                <span className="text-xs font-bold leading-tight block truncate w-full">
                  {rk.title}
                </span>
                <span
                  className={`mt-1 text-[10px] ${
                    isCurrent ? 'text-neutral-300' : 'text-neutral-400'
                  }`}
                >
                  {Math.round(rk.minXP / 60)}h+
                </span>

                {isCurrent && (
                  <span className="mt-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-neutral-950">
                    Atual
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PERSONAL REWARDS SHOP */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
              Loja de Recompensas Pessoais
            </h2>
            <p className="text-xs text-neutral-500">
              Troque seus Pontos de Foco por momentos de lazer, descanso e mimos que você mesmo define.
            </p>
          </div>

          <button
            onClick={() => setShowAddRewardModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Criar Recompensa</span>
          </button>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => {
            const canAfford = points >= reward.costPoints;

            return (
              <div
                key={reward.id}
                className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs hover:border-neutral-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200/80">
                      {getRewardIcon(reward.icon)}
                    </div>
                    <span className="font-mono text-xs font-bold px-2 py-1 rounded-md bg-neutral-100 text-neutral-800 tabular-nums">
                      {reward.costPoints} pts
                    </span>
                  </div>

                  <h3 className="font-sans text-base font-bold text-neutral-900 mb-1">
                    {reward.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    Resgatado {reward.redeemedCount} {reward.redeemedCount === 1 ? 'vez' : 'vezes'}
                  </span>

                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      canAfford
                        ? 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs active:scale-95'
                        : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'Resgatar' : `Faltam ${reward.costPoints - points} pts`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Redemption History */}
      {redemptions.length > 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <h3 className="font-sans text-base font-bold text-neutral-900 mb-3">
            Histórico de Recompensas Aproveitadas
          </h3>
          <div className="divide-y divide-neutral-100">
            {redemptions.slice(0, 5).map((red) => (
              <div key={red.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <span className="font-semibold text-neutral-800">{red.rewardTitle}</span>
                  <span className="block text-[11px] text-neutral-400">
                    {new Date(red.redeemedAt).toLocaleDateString('pt-BR')} às{' '}
                    {new Date(red.redeemedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span className="font-mono font-semibold text-neutral-600 tabular-nums">
                  -{red.costPoints} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Create Custom Reward */}
      {showAddRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900">
            <h3 className="font-sans text-lg font-bold text-neutral-900">
              Criar Recompensa Personalizada
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Defina um prêmio que te motiva de verdade (um lanche, tempo livre, compra, etc.).
            </p>

            <form onSubmit={handleCreateCustomReward} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700">Título da Recompensa</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Noite de Pizza, 2h de Cinema, Comprar fone novo..."
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">Descrição</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Ex: Saborear pizza artesanal após bater a meta semanal..."
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Custo em Pontos</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="lazer">Lazer / Jogos</option>
                    <option value="comida">Comida / Café</option>
                    <option value="descanso">Descanso / Sono</option>
                    <option value="compras">Compras / Presente</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddRewardModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
                >
                  Salvar Recompensa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Inspect Achievement Badge */}
      {inspectAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6 text-center text-neutral-900 shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950 shadow-md">
              {getAchievementIcon(inspectAchievement.iconName, inspectAchievement.tier)}
            </div>

            <span className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Badge {inspectAchievement.tier || 'Bronze'}
            </span>

            <h3 className="mt-2 font-sans text-xl font-extrabold text-neutral-950">
              {inspectAchievement.title}
            </h3>
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
              {inspectAchievement.description}
            </p>

            <div className="mt-5 rounded-xl bg-neutral-50 p-3 border border-neutral-100 text-xs">
              <span className="text-neutral-500 block">Status:</span>
              {inspectAchievement.unlockedAt ? (
                <span className="font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                  Conquistado em {new Date(inspectAchievement.unlockedAt).toLocaleDateString('pt-BR')}
                </span>
              ) : (
                <span className="font-medium text-neutral-500 block mt-0.5">
                  Ainda não desbloqueado. Continue seus estudos diários!
                </span>
              )}
            </div>

            <button
              onClick={() => setInspectAchievement(null)}
              className="mt-6 w-full rounded-xl bg-neutral-950 py-2.5 text-xs font-bold text-white hover:bg-neutral-800"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
