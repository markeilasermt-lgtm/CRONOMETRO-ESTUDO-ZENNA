import React, { useState } from 'react';
import {
  StudySession,
  DayRecord,
  UserGoals,
} from '../types';
import {
  MONTH_NAMES_PT,
  WEEKDAYS_SHORT_PT,
  formatDateLongPT,
  getMonthCalendarDays,
  formatMinutesToReadable,
  getTodayDateString,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Plus,
  Clock,
  Trash2,
  Music,
  Award,
} from 'lucide-react';

interface CalendarViewProps {
  sessions: StudySession[];
  dayRecords: DayRecord[];
  goals: UserGoals;
  onToggleDayMarked: (dateStr: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenManualSession: (dateStr: string) => void;
  onStartTimerForToday: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  dayRecords,
  goals,
  onToggleDayMarked,
  onDeleteSession,
  onOpenManualSession,
  onStartTimerForToday,
}) => {
  const todayStr = getTodayDateString();
  const todayDate = new Date();

  // Calendar navigation state
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(todayDate.getFullYear());
    setCurrentMonth(todayDate.getMonth());
    setSelectedDateStr(todayStr);
  };

  // Day records map: date -> DayRecord
  const dayRecordsMap = new Map<string, DayRecord>();
  dayRecords.forEach((dr) => dayRecordsMap.set(dr.date, dr));

  // Sessions map: date -> StudySession[]
  const sessionsByDate = new Map<string, StudySession[]>();
  sessions.forEach((s) => {
    const list = sessionsByDate.get(s.date) || [];
    list.push(s);
    sessionsByDate.set(s.date, list);
  });

  const calendarDays = getMonthCalendarDays(currentYear, currentMonth);

  // Month statistics
  const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthSessions = sessions.filter((s) => s.date.startsWith(currentMonthPrefix));
  const monthTotalMinutes = monthSessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  const monthStudiedDates = new Set<string>();
  monthSessions.forEach((s) => monthStudiedDates.add(s.date));
  dayRecords
    .filter((dr) => dr.date.startsWith(currentMonthPrefix) && dr.manualMarked)
    .forEach((dr) => monthStudiedDates.add(dr.date));

  // Selected date details
  const selectedDateSessions = sessionsByDate.get(selectedDateStr) || [];
  const selectedDateTotalMinutes = selectedDateSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const isSelectedDateMarked =
    dayRecordsMap.get(selectedDateStr)?.manualMarked || selectedDateSessions.length > 0;
  const isSelectedDateGoalMet = selectedDateTotalMinutes >= goals.dailyMinutes;

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Month Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
              {MONTH_NAMES_PT[currentMonth]} {currentYear}
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
                onClick={handleGoToToday}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors"
              >
                Hoje
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
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
            <span>{monthStudiedDates.size} dias com prática</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-neutral-800">Total: {formatMinutesToReadable(monthTotalMinutes)}</span>
            <span aria-hidden="true">·</span>
            <span>Meta: {goals.monthlyHours}h</span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenManualSession(todayStr)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Tempo</span>
          </button>
          <button
            onClick={onStartTimerForToday}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Clock className="h-4 w-4" />
            <span>Iniciar Prática</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/70 text-center py-2.5 text-xs font-semibold text-neutral-500">
          {WEEKDAYS_SHORT_PT.map((w, idx) => (
            <div key={w} className={idx === 0 || idx === 6 ? 'text-neutral-400' : 'text-neutral-600'}>
              {w}
            </div>
          ))}
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-neutral-100">
          {calendarDays.map((cell) => {
            const dateStr = cell.dateStr;
            const isToday = dateStr === todayStr;
            const daySessions = sessionsByDate.get(dateStr) || [];
            const dayMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
            const isMarked = dayRecordsMap.get(dateStr)?.manualMarked || daySessions.length > 0;
            const isGoalMet = dayMinutes >= goals.dailyMinutes;

            return (
              <div
                key={dateStr}
                onClick={() => handleSelectDay(dateStr)}
                className={`group relative min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 transition-colors cursor-pointer select-none ${
                  !cell.isCurrentMonth
                    ? 'bg-neutral-50/40 text-neutral-300'
                    : isToday
                    ? 'bg-indigo-50/30'
                    : 'bg-white hover:bg-neutral-50/70'
                }`}
              >
                {/* Header: Day number + Checkbox toggle */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? 'bg-neutral-900 text-white'
                        : !cell.isCurrentMonth
                        ? 'text-neutral-300'
                        : 'text-neutral-700 group-hover:text-neutral-900'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleDayMarked(dateStr);
                    }}
                    title={isMarked ? 'Desmarcar dia' : 'Marcar dia como estudado'}
                    className="p-0.5 rounded-full hover:bg-neutral-200/50 transition-colors"
                  >
                    {isMarked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-4 w-4 text-neutral-200 group-hover:text-neutral-400" />
                    )}
                  </button>
                </div>

                {/* Day Study Content */}
                <div className="mt-2 space-y-1">
                  {dayMinutes > 0 && (
                    <div className="flex items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${
                          isGoalMet
                            ? 'bg-emerald-100/80 text-emerald-800'
                            : 'bg-indigo-100/80 text-indigo-800'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        {formatMinutesToReadable(dayMinutes)}
                      </span>
                    </div>
                  )}

                  {isMarked && dayMinutes === 0 && (
                    <span className="inline-block text-[11px] font-medium text-emerald-700">
                      Estudado ✓
                    </span>
                  )}
                </div>

                {/* Star icon if goal met */}
                {isGoalMet && (
                  <div className="absolute bottom-1.5 right-1.5 text-amber-500" title="Meta diária batida!">
                    <Award className="h-3.5 w-3.5 fill-amber-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 pt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Dia praticado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Meta batida (≥ {Math.floor(goals.dailyMinutes / 60)}h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-900" />
            <span>Hoje</span>
          </div>
        </div>
        <span>Clique no dia para ver o tempo praticado ou marcar presença</span>
      </div>

      {/* Day Inspector Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Detalhes da Prática
                </span>
                <h3 className="font-sans text-xl font-bold text-neutral-900">
                  {formatDateLongPT(selectedDateStr)}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                ✕
              </button>
            </div>

            {/* Day Status & Toggle */}
            <div className="my-5 flex items-center justify-between rounded-xl bg-neutral-50 p-4 border border-neutral-200">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onToggleDayMarked(selectedDateStr)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-100 shadow-2xs transition-colors"
                >
                  {isSelectedDateMarked ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-neutral-400" />
                  )}
                </button>
                <div>
                  <h4 className="text-sm font-semibold text-neutral-900">
                    {isSelectedDateMarked ? 'Dia Marcado como Praticado' : 'Dia Não Marcado'}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {isSelectedDateMarked
                      ? 'Parabéns pela dedicação musical!'
                      : 'Clique no ícone para marcar manualmente ou adicione uma sessão.'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="block text-xs text-neutral-500">Tempo Total</span>
                <span className="font-mono text-lg font-bold text-neutral-900 tabular-nums">
                  {formatMinutesToReadable(selectedDateTotalMinutes)}
                </span>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Sessões de Música ({selectedDateSessions.length})
                </h4>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onOpenManualSession(selectedDateStr);
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Tempo Manual</span>
                </button>
              </div>

              {selectedDateSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-500">
                  Nenhuma sessão registrada nesta data.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {selectedDateSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-neutral-900">
                            Prática Musical
                          </span>
                          <span className="text-[11px] text-neutral-400">· {session.startTime}</span>
                        </div>
                        {session.notes && (
                          <p className="text-xs text-neutral-600">{session.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-indigo-600 tabular-nums">
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

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Fechar
              </button>
              {selectedDateStr === todayStr && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onStartTimerForToday();
                  }}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                >
                  Abrir Cronômetro Agora
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
