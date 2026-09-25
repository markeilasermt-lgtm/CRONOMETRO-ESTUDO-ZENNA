import React, { useEffect } from 'react';
import { RewardCelebration } from '../types';
import {
  Trophy,
  Target,
  Sparkles,
  Award,
  Crown,
  Zap,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playRewardFanfare } from '../utils/audio';

interface RewardCelebrationModalProps {
  celebration: RewardCelebration;
  onClose: () => void;
  soundEnabled: boolean;
}

export const RewardCelebrationModal: React.FC<RewardCelebrationModalProps> = ({
  celebration,
  onClose,
  soundEnabled,
}) => {
  useEffect(() => {
    if (soundEnabled) {
      playRewardFanfare();
    }
    // Launch festive confetti bursts
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.2, y: 0.6 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.8, y: 0.6 },
        });
      }, 300);
    } catch {
      // quiet
    }
  }, [celebration, soundEnabled]);

  const getTierColors = (tier?: string) => {
    switch (tier) {
      case 'diamond':
        return {
          gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
          badgeBg: 'bg-cyan-50 border-cyan-300 text-cyan-700',
          ring: 'ring-cyan-400/40',
          text: 'text-cyan-900',
        };
      case 'platinum':
        return {
          gradient: 'from-slate-300 via-rose-400 to-indigo-500',
          badgeBg: 'bg-rose-50 border-rose-300 text-rose-700',
          ring: 'ring-rose-400/40',
          text: 'text-rose-900',
        };
      case 'gold':
        return {
          gradient: 'from-amber-300 via-yellow-500 to-amber-600',
          badgeBg: 'bg-amber-50 border-amber-300 text-amber-700',
          ring: 'ring-amber-400/40',
          text: 'text-amber-900',
        };
      case 'silver':
        return {
          gradient: 'from-slate-200 via-slate-400 to-zinc-500',
          badgeBg: 'bg-slate-50 border-slate-300 text-slate-700',
          ring: 'ring-slate-400/40',
          text: 'text-slate-900',
        };
      default:
        return {
          gradient: 'from-amber-600 via-orange-500 to-amber-700',
          badgeBg: 'bg-orange-50 border-orange-300 text-orange-700',
          ring: 'ring-orange-400/40',
          text: 'text-orange-900',
        };
    }
  };

  const colors = getTierColors(celebration.badgeTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 text-center text-neutral-900 shadow-2xl">
        {/* Radiant background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-56 rounded-full bg-gradient-to-b from-amber-200/50 via-indigo-200/30 to-transparent blur-2xl pointer-events-none" />

        {/* Floating emblem */}
        <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
          {/* Animated pulsing outer rings */}
          <div className="absolute inset-0 rounded-full animate-ping opacity-25 bg-amber-400 duration-1000" />
          <div className={`absolute -inset-1 rounded-full border-2 border-dashed border-amber-400/70 animate-spin [animation-duration:14s]`}></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-neutral-950 shadow-lg shadow-amber-400/30">
            {celebration.type === 'daily_goal' && <Target className="h-10 w-10 text-neutral-950" />}
            {celebration.type === 'monthly_goal' && <Trophy className="h-10 w-10 text-neutral-950" />}
            {celebration.type === 'level_up' && <Crown className="h-10 w-10 text-neutral-950" />}
            {celebration.type === 'achievement' && <Award className="h-10 w-10 text-neutral-950" />}
          </div>
        </div>

        {/* Tier or Category Tag */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900">
            <Sparkles className="h-3 w-3 text-amber-600" />
            {celebration.type === 'daily_goal'
              ? 'Meta Diária Conquistada'
              : celebration.type === 'monthly_goal'
              ? 'Marco Mensal Lendário'
              : celebration.type === 'level_up'
              ? 'Subida de Nível'
              : 'Conquista Desbloqueada'}
          </span>
        </div>

        {/* Main Title & Description */}
        <h2 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
          {celebration.title}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed max-w-sm mx-auto">
          {celebration.subtitle}
        </p>

        {/* Rewards earned highlight card */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4">
          <div className="grid grid-cols-2 divide-x divide-neutral-200 text-center">
            <div className="px-2">
              <span className="block text-xs text-neutral-500 font-medium">Recompensa</span>
              <span className="font-mono text-xl font-extrabold text-indigo-600 tabular-nums">
                +{celebration.pointsEarned} pts
              </span>
            </div>
            <div className="px-2">
              <span className="block text-xs text-neutral-500 font-medium">Status</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
                <CheckCircle2 className="h-4 w-4" />
                Colecionado
              </span>
            </div>
          </div>
        </div>

        {/* Level Up details if applicable */}
        {celebration.type === 'level_up' && celebration.levelNumber && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <span>Novo Título: <strong>Nível {celebration.levelNumber} - {celebration.levelTitle}</strong></span>
          </div>
        )}

        {/* Close / Collect button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-neutral-950 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-colors active:scale-98"
          >
            Coletar Recompensa
          </button>
        </div>
      </div>
    </div>
  );
};
