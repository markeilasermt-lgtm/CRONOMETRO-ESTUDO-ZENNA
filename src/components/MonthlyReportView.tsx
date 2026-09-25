import React, { useState } from 'react';
import { StudySession, DayRecord, UserGoals, RewardCelebration } from '../types';
import {
  MONTH_NAMES_PT,
  formatMinutesToReadable,
  formatSecondsToReadable,
  getSessionTotalSeconds,
} from '../utils/dateUtils';
import {
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart3,
  Flame,
  Trophy,
  Sparkles,
  Music,
  Grid3X3,
  Calendar,
} from 'lucide-react';

interface MonthlyReportViewProps {
  sessions: StudySession[];
  dayRecords: DayRecord[];
  goals: UserGoals;
  onSelectDayForDetail: (dateStr: string) => void;
  onTriggerCelebration: (celebration: RewardCelebration) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  sessions,
  dayRecords,
  goals,
  onSelectDayForDetail,
  onTriggerCelebration,
}) => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0-11
  const [activeView, setActiveView] = useState<'bars' | 'heatmap'>('bars');

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
  };

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Month sessions
  const monthSessions = sessions.filter((s) => s.date.startsWith(monthPrefix));
  const totalSecondsMonth = monthSessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);
  const totalMinutesMonth = Math.round(totalSecondsMonth / 60);
  const totalHoursMonth = Math.round((totalSecondsMonth / 3600) * 10) / 10;

  // Active days count
  const activeDaysSet = new Set<string>();
  monthSessions.forEach((s) => activeDaysSet.add(s.date));
  dayRecords
    .filter((dr) => dr.date.startsWith(monthPrefix) && dr.manualMarked)
    .forEach((dr) => activeDaysSet.add(dr.date));

  const activeDaysCount = activeDaysSet.size;
  const consistencyPercent = Math.round((activeDaysCount / daysInMonth) * 100);

  // Daily average on active days
  const averageMinutesPerActiveDay = activeDaysCount > 0 ? Math.round(totalMinutesMonth / activeDaysCount) : 0;

  // Monthly goal progress
  const monthlyGoalHours = goals.monthlyHours || 0;
  const monthlyGoalMinutes = monthlyGoalHours * 60;
  const monthlyGoalPercent = monthlyGoalMinutes > 0 ? Math.round((totalMinutesMonth / monthlyGoalMinutes) * 100) : 0;
  const isMonthlyGoalMet = monthlyGoalMinutes > 0 && totalMinutesMonth >= monthlyGoalMinutes;

  // Remaining days in month
  const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();
  const daysPassed = isCurrentMonth ? today.getDate() : daysInMonth;
  const daysRemaining = Math.max(1, daysInMonth - daysPassed);
  const hoursRemaining = Math.max(0, monthlyGoalHours - totalHoursMonth);

  // Daily time distribution
  const dailyData: { day: number; dateStr: string; minutes: number }[] = [];
  let bestDay = { day: 0, dateStr: '', minutes: 0 };

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${monthPrefix}-${String(d).padStart(2, '0')}`;
    const dayMins = monthSessions
      .filter((s) => s.date === dStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    dailyData.push({
      day: d,
      dateStr: dStr,
      minutes: dayMins,
    });

    if (dayMins > bestDay.minutes) {
      bestDay = { day: d, dateStr: dStr, minutes: dayMins };
    }
  }

  const maxDayMinutes = Math.max(...dailyData.map((d) => d.minutes), goals.dailyMinutes, 60);

  // Weekly breakdown
  const weeksSummary = [
    { label: 'Semana 1', range: 'Dias 01 - 07', minutes: 0 },
    { label: 'Semana 2', range: 'Dias 08 - 14', minutes: 0 },
    { label: 'Semana 3', range: 'Dias 15 - 21', minutes: 0 },
    { label: 'Semana 4', range: 'Dias 22 - 28', minutes: 0 },
    { label: 'Semana 5', range: `Dias 29 - ${daysInMonth}`, minutes: 0 },
  ];

  dailyData.forEach((item) => {
    if (item.day <= 7) weeksSummary[0].minutes += item.minutes;
    else if (item.day <= 14) weeksSummary[1].minutes += item.minutes;
    else if (item.day <= 21) weeksSummary[2].minutes += item.minutes;
    else if (item.day <= 28) weeksSummary[3].minutes += item.minutes;
    else weeksSummary[4].minutes += item.minutes;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Data', 'Estudo', 'Horario', 'Duracao (min)', 'Anotacoes'],
      ...monthSessions.map((s) => [s.date, 'Prática Musical', s.startTime, s.durationMinutes, s.notes || '']),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_musica_${monthPrefix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTriggerMonthlyCelebration = () => {
    onTriggerCelebration({
      type: 'monthly_goal',
      title: 'Meta Mensal de Música Batida!',
      subtitle: `Incrível dedicação! Você completou ${totalHoursMonth} horas de prática musical em ${MONTH_NAMES_PT[selectedMonth]}!`,
      pointsEarned: 200,
      badgeTier: 'gold',
    });
  };

  const getHeatmapColor = (minutes: number) => {
    if (minutes === 0) return 'bg-neutral-100 text-neutral-400';
    if (minutes < 45) return 'bg-indigo-100 text-indigo-800';
    if (minutes < 90) return 'bg-indigo-300 text-indigo-950 font-semibold';
    if (minutes < 150) return 'bg-indigo-500 text-white font-semibold';
    return 'bg-indigo-700 text-white font-bold shadow-xs';
  };

  return (
    <div className="space-y-6">
      {/* Month Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
              Relatório Mensal de Prática
            </h2>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5">
              <button
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleCurrentMonth}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              >
                Mês Atual
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Próximo mês"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {MONTH_NAMES_PT[selectedMonth]} de {selectedYear} · {daysInMonth} dias no período
          </p>
        </div>

        {/* Export action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Visual Reward Banner: Appears when Monthly Goal is Met */}
      {isMonthlyGoalMet ? (
        <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-neutral-950 shadow-md shadow-amber-400/30">
                <Trophy className="h-8 w-8 text-neutral-950" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="rounded-md bg-amber-200/60 px-2 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
                    Badge Mensal Conquistado
                  </span>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-neutral-950 mt-0.5">
                  Meta Mensal de {monthlyGoalHours} Horas Batida!
                </h3>
                <p className="text-xs text-neutral-600">
                  Você acumulou {totalHoursMonth} horas de estudo musical em {MONTH_NAMES_PT[selectedMonth]}.
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerMonthlyCelebration}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-xs"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Ver Celebração</span>
            </button>
          </div>
        </div>
      ) : monthlyGoalHours > 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-900 block">
                Progresso Mensal: {totalHoursMonth}h de {monthlyGoalHours}h ({monthlyGoalPercent}%)
              </span>
              <span className="text-neutral-500">
                Faltam {hoursRemaining.toFixed(1)}h nos próximos {daysRemaining} dias para bater a meta.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-xs text-neutral-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-neutral-400 shrink-0" />
            <div>
              <span className="font-semibold text-neutral-900 block">
                Meta Mensal não configurada (Zerada)
              </span>
              <span className="text-neutral-500">
                Você pode definir sua meta mensal de horas nas configurações (ícone de engrenagem) quando desejar.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Monthly KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Month Hours */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total no Mês</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
              {totalHoursMonth}h
            </span>
            <span className="text-xs text-neutral-500">({formatSecondsToReadable(totalSecondsMonth)})</span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {monthSessions.length} sessões de música concluídas
          </div>
        </div>

        {/* Monthly Goal Progress */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Meta {monthlyGoalHours > 0 ? `(${monthlyGoalHours}h)` : ''}
            </span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          {monthlyGoalHours > 0 ? (
            <>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
                  {monthlyGoalPercent}%
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    monthlyGoalPercent >= 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {monthlyGoalPercent >= 100 ? 'Batida!' : `${hoursRemaining.toFixed(1)}h restantes`}
                </span>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthlyGoalPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, monthlyGoalPercent)}%` }}
                />
              </div>
            </>
          ) : (
            <div>
              <span className="text-lg font-bold text-neutral-700 block">Zerada (0h)</span>
              <span className="text-xs text-neutral-400 mt-1 block">
                Insira sua meta nas configurações
              </span>
            </div>
          )}
        </div>

        {/* Consistency & Active Days */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Dias Praticados</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
              {activeDaysCount} <span className="text-lg font-normal text-neutral-500">/ {daysInMonth} dias</span>
            </span>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {consistencyPercent}% dos dias com estudo registrado
          </div>
        </div>

        {/* Daily Average & Best Day */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Média por Dia Ativo</span>
            <Music className="h-4 w-4 text-neutral-700" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
            {formatMinutesToReadable(averageMinutesPerActiveDay)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 truncate">
            {bestDay.minutes > 0 ? (
              <span>Melhor dia: <strong>Dia {bestDay.day}</strong> ({formatMinutesToReadable(bestDay.minutes)})</span>
            ) : (
              <span>Sem registros neste mês</span>
            )}
          </div>
        </div>
      </div>

      {/* Simple Daily Time Chart Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="font-sans text-base font-bold text-neutral-900">
              Tempo de Estudo por Dia do Mês
            </h3>
            <p className="text-xs text-neutral-500">
              Quanto tempo você estudou música em cada dia de {MONTH_NAMES_PT[selectedMonth]}.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
            <button
              onClick={() => setActiveView('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeView === 'bars'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Gráfico de Barras</span>
            </button>
            <button
              onClick={() => setActiveView('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeView === 'heatmap'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
              <span>Visão Calendário</span>
            </button>
          </div>
        </div>

        {/* View 1: Simple Daily Bars */}
        {activeView === 'bars' && (
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
              <span>Clique em qualquer barra para ir aos detalhes do dia</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-indigo-600" />
                  <span>Tempo Praticado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-xs bg-emerald-500" />
                  <span>Meta Diária Batida</span>
                </div>
              </div>
            </div>

            <div className="relative pt-6 pb-2">
              {/* Daily goal reference line */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-amber-400 pointer-events-none z-10"
                style={{
                  bottom: `${(goals.dailyMinutes / maxDayMinutes) * 190 + 32}px`,
                }}
              >
                <span className="absolute -top-3.5 right-0 text-[10px] font-semibold text-amber-600 bg-white px-1">
                  Meta Diária: {formatMinutesToReadable(goals.dailyMinutes)}
                </span>
              </div>

              <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-52 border-b border-neutral-200 pb-1">
                {dailyData.map((item) => {
                  const heightPercent = maxDayMinutes > 0 ? (item.minutes / maxDayMinutes) * 100 : 0;
                  const isGoalMet = item.minutes >= goals.dailyMinutes;

                  return (
                    <div
                      key={item.day}
                      onClick={() => onSelectDayForDetail(item.dateStr)}
                      className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="rounded-lg bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg whitespace-nowrap">
                          <span>Dia {item.day}: </span>
                          <strong className="text-indigo-300 font-mono">
                            {item.minutes > 0 ? formatMinutesToReadable(item.minutes) : 'Sem prática'}
                          </strong>
                        </div>
                        <div className="h-1 w-2 bg-neutral-900 rotate-45 -mt-0.5" />
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                          item.minutes === 0
                            ? 'bg-neutral-100 group-hover:bg-neutral-200 h-1'
                            : isGoalMet
                            ? 'bg-emerald-500 group-hover:bg-emerald-600'
                            : 'bg-indigo-600 group-hover:bg-indigo-700'
                        }`}
                        style={{ height: item.minutes > 0 ? `${Math.max(6, heightPercent)}%` : '4px' }}
                      />

                      {/* Day Label */}
                      <span className="mt-1 text-[10px] text-neutral-400 group-hover:text-neutral-900 font-mono">
                        {item.day % 2 === 1 || daysInMonth <= 20 ? item.day : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Simple Calendar Matrix */}
        {activeView === 'heatmap' && (
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
              <span>Intensidade de Prática por Dia</span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span>Menos</span>
                <span className="h-3 w-3 rounded-xs bg-neutral-100" />
                <span className="h-3 w-3 rounded-xs bg-indigo-100" />
                <span className="h-3 w-3 rounded-xs bg-indigo-300" />
                <span className="h-3 w-3 rounded-xs bg-indigo-500" />
                <span className="h-3 w-3 rounded-xs bg-indigo-700" />
                <span>Mais</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((wd, i) => (
                <div key={i} className="text-xs font-bold text-neutral-400">
                  {wd}
                </div>
              ))}

              {Array.from({ length: new Date(selectedYear, selectedMonth, 1).getDay() }).map((_, i) => (
                <div key={`pad-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
              ))}

              {dailyData.map((item) => (
                <button
                  key={item.day}
                  onClick={() => onSelectDayForDetail(item.dateStr)}
                  className={`flex flex-col items-center justify-center h-10 sm:h-12 rounded-xl transition-all hover:scale-105 ${getHeatmapColor(
                    item.minutes
                  )}`}
                  title={`Dia ${item.day}: ${item.minutes > 0 ? formatMinutesToReadable(item.minutes) : 'Sem estudo'}`}
                >
                  <span className="text-xs">{item.day}</span>
                  {item.minutes > 0 && (
                    <span className="text-[10px] opacity-90 hidden sm:inline">
                      {Math.round((item.minutes / 60) * 10) / 10}h
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Simple Weekly Breakdown */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <h3 className="font-sans text-base font-bold text-neutral-900 mb-1">
          Tempo Praticado por Semana
        </h3>
        <p className="text-xs text-neutral-500 mb-4">
          Ritmo musical acumulado em cada semana de {MONTH_NAMES_PT[selectedMonth]}.
        </p>

        <div className="divide-y divide-neutral-100">
          {weeksSummary.map((week) => (
            <div key={week.label} className="flex items-center justify-between py-2.5">
              <div>
                <span className="text-sm font-semibold text-neutral-900">{week.label}</span>
                <span className="block text-xs text-neutral-400">{week.range}</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-sm font-bold text-indigo-600 tabular-nums">
                  {formatMinutesToReadable(week.minutes)}
                </span>
                <span className="block text-xs text-neutral-400">
                  {goals.weeklyHours > 0
                    ? `${Math.round((week.minutes / (goals.weeklyHours * 60)) * 100)}% da meta semanal`
                    : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
