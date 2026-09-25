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
  formatSecondsToReadable,
  getSessionTotalSeconds,
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
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface CalendarViewProps {
  sessions: StudySession[];
  dayRecords: DayRecord[];
  goals: UserGoals;
  onToggleDayMarked: (dateStr: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onOpenManualSession: (dateStr: string) => void;
  onStartTimerForToday: () => void;
  onClearAllMarkings: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  dayRecords,
  goals,
  onToggleDayMarked,
  onDeleteSession,
  onOpenManualSession,
  onStartTimerForToday,
  onClearAllMarkings,
}) => {
  const todayStr = getTodayDateString();
  const todayDate = new Date();

  // Calendar navigation state
  const [currentYear, setCurrentYear] = useState<number>(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayDate.getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [dateToUnmarkConfirm, setDateToUnmarkConfirm] = useState<string | null>(null);

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
  const monthTotalSeconds = monthSessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);

  const monthStudiedDates = new Set<string>();
  monthSessions.forEach((s) => monthStudiedDates.add(s.date));
  dayRecords
    .filter((dr) => dr.date.startsWith(currentMonthPrefix) && dr.manualMarked)
    .forEach((dr) => monthStudiedDates.add(dr.date));

  // Selected date details
  const selectedDateSessions = sessionsByDate.get(selectedDateStr) || [];
  const selectedDateTotalSeconds = selectedDateSessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);
  const isSelectedDateMarked =
    dayRecordsMap.get(selectedDateStr)?.manualMarked || selectedDateSessions.length > 0;

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setShowDetailModal(true);
  };

  const handleConfirmClear = () => {
    if (confirm('Deseja limpar todas as marcações e tempos do calendário?')) {
      onClearAllMarkings();
    }
  };

  // Handle clicking to unmark or mark a day
  const handleDayClickToggle = (dateStr: string) => {
    const isMarked =
      dayRecordsMap.get(dateStr)?.manualMarked || (sessionsByDate.get(dateStr)?.length || 0) > 0;

    if (isMarked) {
      // Prompt confirmation with Sim or Não before unmarking
      setDateToUnmarkConfirm(dateStr);
    } else {
      onToggleDayMarked(dateStr);
    }
  };

  const handleConfirmUnmark = () => {
    if (dateToUnmarkConfirm) {
      onToggleDayMarked(dateToUnmarkConfirm);
      setDateToUnmarkConfirm(null);
    }
  };

  const handleCancelUnmark = () => {
    setDateToUnmarkConfirm(null);
  };

  const unmarkDateSessions = dateToUnmarkConfirm ? sessionsByDate.get(dateToUnmarkConfirm) || [] : [];
  const unmarkDateSeconds = unmarkDateSessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Month Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
              {MONTH_NAMES_PT[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="p-1 sm:p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleGoToToday}
                className="px-2 sm:px-3 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Próximo mês"
                className="p-1 sm:p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span>{monthStudiedDates.size} dias praticados</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-neutral-800">
              Total: {formatSecondsToReadable(monthTotalSeconds)}
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {monthStudiedDates.size > 0 && (
            <button
              onClick={handleConfirmClear}
              title="Limpar marcações do calendário"
              className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-500 hover:text-red-600 hover:bg-neutral-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Limpar Calendário</span>
            </button>
          )}

          <button
            onClick={() => onOpenManualSession(todayStr)}
            className="flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Tempo</span>
          </button>
          
          <button
            onClick={onStartTimerForToday}
            className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
          >
            <Clock className="h-4 w-4" />
            <span>Iniciar Prática</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-xs overflow-hidden">
        {/* Days of Week Row */}
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50/80 text-center py-2 text-xs font-bold text-neutral-600">
          {WEEKDAYS_SHORT_PT.map((w, idx) => (
            <div key={w} className={idx === 0 || idx === 6 ? 'text-neutral-400' : 'text-neutral-700'}>
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
            const dayTotalSeconds = daySessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);
            const isMarked = dayRecordsMap.get(dateStr)?.manualMarked || daySessions.length > 0;

            return (
              <div
                key={dateStr}
                onClick={() => handleSelectDay(dateStr)}
                className={`group relative min-h-[75px] sm:min-h-[100px] p-1.5 sm:p-2.5 transition-colors cursor-pointer select-none ${
                  !cell.isCurrentMonth
                    ? 'bg-neutral-50/30 text-neutral-300'
                    : isToday
                    ? 'bg-blue-50/40 ring-1 ring-inset ring-blue-200/50'
                    : 'bg-white hover:bg-neutral-50/80'
                }`}
              >
                {/* Header: Day number + Checkbox toggle */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday
                        ? 'bg-neutral-900 text-white font-bold'
                        : !cell.isCurrentMonth
                        ? 'text-neutral-300'
                        : 'text-neutral-700 group-hover:text-neutral-900'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Toggle button - unmarking zeros study time */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDayClickToggle(dateStr);
                    }}
                    title={isMarked ? 'Desmarcar dia e zerar tempo de estudo' : 'Marcar dia como estudado'}
                    className="p-0.5 rounded-full hover:bg-neutral-200/50 transition-colors cursor-pointer"
                  >
                    {isMarked ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-neutral-200 group-hover:text-neutral-400" />
                    )}
                  </button>
                </div>

                {/* Day Study Content: Time appears here after being saved */}
                <div className="mt-1.5 sm:mt-2 space-y-1">
                  {dayTotalSeconds > 0 ? (
                    <div className="flex items-center">
                      <span
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-100/90 text-emerald-900 px-1.5 py-0.5 text-[10px] sm:text-xs font-bold tabular-nums shadow-2xs"
                      >
                        <Clock className="h-3 w-3 text-emerald-700 shrink-0" />
                        <span className="truncate">{formatSecondsToReadable(dayTotalSeconds)}</span>
                      </span>
                    </div>
                  ) : isMarked ? (
                    <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-emerald-700">
                      Estudado ✓
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="font-sans text-lg font-bold text-neutral-900 capitalize">
                  {formatDateLongPT(selectedDateStr)}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedDateTotalSeconds > 0
                    ? `Tempo total registrado: ${formatSecondsToReadable(selectedDateTotalSeconds)}`
                    : isSelectedDateMarked
                    ? 'Dia marcado manualmente como estudado'
                    : 'Nenhum estudo registrado neste dia'}
                </p>
              </div>

              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Toggle Status Row */}
            <div className="my-4 flex items-center justify-between gap-2 rounded-xl bg-neutral-50 p-3 border border-neutral-200/80">
              <div>
                <span className="text-xs font-semibold text-neutral-700 block">
                  Status no Calendário:
                </span>
                <span className="text-[11px] text-neutral-500">
                  {isSelectedDateMarked
                    ? 'Desmarcar zera o tempo estudado deste dia'
                    : 'Marque para registrar estudo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDayClickToggle(selectedDateStr)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isSelectedDateMarked
                      ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                  }`}
                  title={isSelectedDateMarked ? 'Desmarcar dia e zerar tempo' : 'Marcar dia'}
                >
                  {isSelectedDateMarked ? (
                    <>
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Desmarcar e Zerar Tempo</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Marcar como Estudado</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recorded Sessions on this Date */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Sessões de Estudo ({selectedDateSessions.length})
                </span>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    onOpenManualSession(selectedDateStr);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-800 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Adicionar Sessão</span>
                </button>
              </div>

              {selectedDateSessions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-400">
                  Nenhum tempo salvo para este dia ainda.
                </div>
              ) : (
                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                  {selectedDateSessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50/50 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200 text-neutral-700">
                          <Music className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-neutral-900">
                            {formatSecondsToReadable(getSessionTotalSeconds(s))}
                          </div>
                          <div className="text-[11px] text-neutral-500">
                            Horário: {s.startTime}
                            {s.notes && ` · ${s.notes}`}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteSession(s.id)}
                        title="Remover sessão"
                        className="rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  onStartTimerForToday();
                }}
                className="flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Ir para Cronômetro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal to Unmark a Day (with SIM and NÃO) */}
      {dateToUnmarkConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-center text-neutral-900">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <h3 className="font-sans text-lg font-bold text-neutral-900">
              Deseja desmarcar este dia?
            </h3>
            
            <p className="mt-2 text-xs text-neutral-600 leading-relaxed">
              Você está prestes a desmarcar o dia <strong className="text-neutral-900 capitalize">{formatDateLongPT(dateToUnmarkConfirm)}</strong>.
              {unmarkDateSeconds > 0 ? (
                <span className="block mt-2 rounded-lg bg-red-50 p-2 text-red-700 font-semibold border border-red-200">
                  Todo o tempo de estudo ({formatSecondsToReadable(unmarkDateSeconds)}) será zerado deste dia.
                </span>
              ) : (
                <span className="block mt-1 text-neutral-500">
                  A marcação de dia estudado será removida.
                </span>
              )}
            </p>

            <p className="mt-3 text-[11px] text-neutral-500 font-medium">
              Confirma a desmarcação?
            </p>

            {/* Sim e Não Buttons */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCancelUnmark}
                className="flex-1 rounded-xl border border-neutral-300 bg-white py-2.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition-colors shadow-2xs cursor-pointer"
              >
                Não
              </button>
              <button
                type="button"
                onClick={handleConfirmUnmark}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-md cursor-pointer"
              >
                Sim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
