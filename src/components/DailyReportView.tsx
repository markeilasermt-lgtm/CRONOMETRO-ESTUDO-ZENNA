import React, { useState } from 'react';
import { StudySession, DayRecord, UserGoals, RewardCelebration } from '../types';
import {
  formatDateLongPT,
  formatMinutesToReadable,
  getTodayDateString,
  formatDateToISO,
  parseISODate,
} from '../utils/dateUtils';
import {
  Clock,
  Target,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  Music,
  BarChart2,
  CheckCircle2,
} from 'lucide-react';

interface DailyReportViewProps {
  sessions: StudySession[];
  dayRecords: DayRecord[];
  goals: UserGoals;
  onOpenManualSession: (dateStr: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartTimerForToday: () => void;
  onTriggerCelebration: (celebration: RewardCelebration) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  sessions,
  goals,
  onOpenManualSession,
  onDeleteSession,
  onStartTimerForToday,
  onTriggerCelebration,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const handlePrevDay = () => {
    const d = parseISODate(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(formatDateToISO(d));
  };

  const handleNextDay = () => {
    const d = parseISODate(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatDateToISO(d));
  };

  const handleGoToday = () => {
    setSelectedDate(todayStr);
  };

  // Filter sessions for selected day
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const goalMinutes = goals.dailyMinutes;
  const goalPercentage = Math.round((totalMinutes / (goalMinutes || 1)) * 100);
  const isGoalMet = totalMinutes >= goalMinutes;

  // Hourly distribution (06h to 23h)
  const hoursDistribution: { hour: number; label: string; minutes: number }[] = [];
  for (let h = 6; h <= 23; h++) {
    hoursDistribution.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}h`,
      minutes: 0,
    });
  }

  daySessions.forEach((session) => {
    let startHour = 10;
    if (session.startTime) {
      const parts = session.startTime.split(':');
      if (parts[0]) startHour = parseInt(parts[0], 10);
    }
    const bucket = hoursDistribution.find((b) => b.hour === startHour);
    if (bucket) {
      bucket.minutes += session.durationMinutes;
    } else if (startHour >= 0 && startHour < 6) {
      if (hoursDistribution[0]) hoursDistribution[0].minutes += session.durationMinutes;
    }
  });

  const maxHourMinutes = Math.max(...hoursDistribution.map((h) => h.minutes), 45);

  const handleTriggerDailyCelebration = () => {
    onTriggerCelebration({
      type: 'daily_goal',
      title: 'Meta Diária Batida!',
      subtitle: `Você praticou ${formatMinutesToReadable(totalMinutes)} de música hoje, superando sua meta de ${formatMinutesToReadable(goalMinutes)}!`,
      pointsEarned: 50,
      badgeTier: 'bronze',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Day Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
              Relatório Diário de Prática
            </h2>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5">
              <button
                onClick={handlePrevDay}
                aria-label="Dia anterior"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleGoToday}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDate === todayStr ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Hoje
              </button>
              <button
                onClick={handleNextDay}
                aria-label="Próximo dia"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {formatDateLongPT(selectedDate)}
          </p>
        </div>

        {/* Date Selector & Add Session */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button
            onClick={() => onOpenManualSession(selectedDate)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Tempo</span>
          </button>
        </div>
      </div>

      {/* Visual Reward Banner: Appears when Goal is Met */}
      {isGoalMet ? (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-neutral-950 shadow-md shadow-amber-400/30">
                <Award className="h-8 w-8 text-neutral-950" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
                    Meta Diária Conquistada
                  </span>
                  <span className="text-xs text-amber-800 font-semibold">+50 Pts Bônus</span>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-neutral-950 mt-0.5">
                  Parabéns! Meta de Prática Concluída!
                </h3>
                <p className="text-xs text-neutral-600">
                  Você estudou {formatMinutesToReadable(totalMinutes)} hoje (meta: {formatMinutesToReadable(goalMinutes)}).
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerDailyCelebration}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Ver Badge de Vitória</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-900 block">
                Faltam {formatMinutesToReadable(Math.max(0, goalMinutes - totalMinutes))} para bater a meta de hoje
              </span>
              <span className="text-neutral-500">
                Meta do dia: {formatMinutesToReadable(goalMinutes)} · Concluído: {goalPercentage}%
              </span>
            </div>
          </div>
          {selectedDate === todayStr && (
            <button
              onClick={onStartTimerForToday}
              className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shrink-0"
            >
              Praticar Agora
            </button>
          )}
        </div>
      )}

      {/* Simple KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Time Studied */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Total Estudado</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
            {formatMinutesToReadable(totalMinutes)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {daySessions.length} {daySessions.length === 1 ? 'sessão de prática' : 'sessões de prática'}
          </div>
        </div>

        {/* Daily Goal Status */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Meta Diária ({formatMinutesToReadable(goalMinutes)})</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
              {goalPercentage}%
            </span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                isGoalMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isGoalMet ? 'Batida ✓' : 'Em Andamento'}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGoalMet ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, goalPercentage)}%` }}
            />
          </div>
        </div>

        {/* Status of the Day */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Status do Dia</span>
            <Music className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="text-xl font-bold text-neutral-900">
            {totalMinutes > 0 ? 'Dia Praticado' : 'Sem Prática'}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {totalMinutes > 0 ? `${totalMinutes} pontos de foco adicionados` : 'Inicie o cronômetro para marcar este dia'}
          </div>
        </div>
      </div>

      {/* Simple Hourly Distribution Chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-neutral-600" />
              <span>Distribuição do Tempo ao Longo do Dia</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Horários em que você dedicou tempo à prática de música (06h - 23h).
            </p>
          </div>
        </div>

        {/* Hourly Bars */}
        <div className="pt-4 pb-1">
          <div className="flex items-end justify-between gap-1 sm:gap-2 h-36 border-b border-neutral-200 pb-1">
            {hoursDistribution.map((item) => {
              const heightPercent = maxHourMinutes > 0 ? (item.minutes / maxHourMinutes) * 100 : 0;

              return (
                <div
                  key={item.hour}
                  className="group relative flex-1 flex flex-col items-center h-full justify-end"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <div className="rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap">
                      <span>{item.label}: </span>
                      <strong className="text-indigo-300 font-mono">
                        {item.minutes > 0 ? formatMinutesToReadable(item.minutes) : '0 min'}
                      </strong>
                    </div>
                    <div className="h-1 w-2 bg-neutral-900 rotate-45 -mt-0.5" />
                  </div>

                  {/* The bar */}
                  <div
                    className={`w-full max-w-[24px] rounded-t-sm transition-all duration-300 ${
                      item.minutes === 0
                        ? 'bg-neutral-100 group-hover:bg-neutral-200 h-1'
                        : 'bg-indigo-600 group-hover:bg-indigo-700'
                    }`}
                    style={{ height: item.minutes > 0 ? `${Math.max(8, heightPercent)}%` : '4px' }}
                  />

                  {/* Hour label */}
                  <span className="mt-1 text-[10px] text-neutral-400 group-hover:text-neutral-900 font-mono">
                    {item.hour % 2 === 0 ? item.label : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simple Sessions List */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sans text-base font-bold text-neutral-900">
            Sessões Praticadas no Dia ({daySessions.length})
          </h3>
          {selectedDate === todayStr && (
            <button
              onClick={onStartTimerForToday}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Iniciar Nova Prática</span>
            </button>
          )}
        </div>

        {daySessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 p-10 text-center">
            <Clock className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
            <p className="text-sm font-medium text-neutral-700">Nenhum estudo registrado para este dia.</p>
            <p className="mt-1 text-xs text-neutral-400">
              Use o cronômetro regressivo ou adicione o tempo manualmente.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => onOpenManualSession(selectedDate)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs"
              >
                Adicionar Tempo Manual
              </button>
              {selectedDate === todayStr && (
                <button
                  onClick={onStartTimerForToday}
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-2xs"
                >
                  Abrir Cronômetro
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {daySessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-neutral-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-neutral-900">
                      Prática Musical
                    </span>
                    <span className="text-xs text-neutral-400">· {session.startTime}</span>
                  </div>
                  {session.notes ? (
                    <p className="text-xs text-neutral-600">{session.notes}</p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">Sem anotação de prática</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                    {formatMinutesToReadable(session.durationMinutes)}
                  </span>
                  <button
                    onClick={() => onDeleteSession(session.id)}
                    className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                    title="Excluir sessão"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
