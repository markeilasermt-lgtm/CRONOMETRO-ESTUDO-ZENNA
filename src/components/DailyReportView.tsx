import React, { useState } from 'react';
import { StudySession, DayRecord, UserGoals, RewardCelebration } from '../types';
import {
  formatDateLongPT,
  formatMinutesToReadable,
  formatSecondsToReadable,
  getSessionTotalSeconds,
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
  FileText,
  Pencil,
  Check,
  X,
} from 'lucide-react';

interface DailyReportViewProps {
  sessions: StudySession[];
  dayRecords: DayRecord[];
  goals: UserGoals;
  onOpenManualSession: (dateStr: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartTimerForToday: () => void;
  onTriggerCelebration: (celebration: RewardCelebration) => void;
  onUpdateSessionNotes?: (sessionId: string, newNotes: string) => void;
}

export const DailyReportView: React.FC<DailyReportViewProps> = ({
  sessions,
  goals,
  onOpenManualSession,
  onDeleteSession,
  onStartTimerForToday,
  onTriggerCelebration,
  onUpdateSessionNotes,
}) => {
  const todayStr = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // State for editing notes inline
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = useState<string>('');

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

  const handleGoToToday = () => {
    setSelectedDate(todayStr);
  };

  // Filter sessions for selected day
  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const dayTotalSeconds = daySessions.reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);
  const totalMinutes = Math.round(dayTotalSeconds / 60);
  const goalMinutes = goals.dailyMinutes;
  const goalPercentage = Math.round((totalMinutes / (goalMinutes || 1)) * 100);
  const isGoalMet = totalMinutes >= goalMinutes;

  // Filter sessions that have notes
  const sessionsWithNotes = daySessions.filter((s) => s.notes && s.notes.trim().length > 0);

  // Hourly distribution: divide 24 hours into buckets
  const hourlyBuckets = new Array(24).fill(0);
  daySessions.forEach((s) => {
    const [hh] = (s.startTime || '12:00').split(':').map(Number);
    const validHour = Math.min(23, Math.max(0, isNaN(hh) ? 12 : hh));
    hourlyBuckets[validHour] += getSessionTotalSeconds(s);
  });

  const maxHourSeconds = Math.max(...hourlyBuckets, 60);

  // Time periods calculation
  const morningSeconds = hourlyBuckets.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoonSeconds = hourlyBuckets.slice(12, 18).reduce((a, b) => a + b, 0);
  const eveningSeconds = hourlyBuckets.slice(18, 24).reduce((a, b) => a + b, 0);

  const handleTriggerDailyCelebration = () => {
    onTriggerCelebration({
      type: 'daily_goal',
      title: 'Meta Diária Batida!',
      subtitle: `Você praticou ${formatSecondsToReadable(dayTotalSeconds)} de música hoje, superando sua meta de ${formatMinutesToReadable(goalMinutes)}!`,
      pointsEarned: 0,
      badgeTier: 'bronze',
    });
  };

  const handleStartEdit = (session: StudySession) => {
    setEditingSessionId(session.id);
    setEditingNoteValue(session.notes || '');
  };

  const handleSaveEdit = (sessionId: string) => {
    if (onUpdateSessionNotes) {
      onUpdateSessionNotes(sessionId, editingNoteValue);
    }
    setEditingSessionId(null);
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingNoteValue('');
  };

  return (
    <div className="space-y-6">
      {/* Date Header Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900 capitalize">
              {formatDateLongPT(selectedDate)}
            </h2>
            <div className="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 shadow-2xs">
              <button
                onClick={handlePrevDay}
                aria-label="Dia anterior"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleGoToToday}
                className="px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                onClick={handleNextDay}
                aria-label="Próximo dia"
                className="p-1 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-xs text-neutral-500">
            Relatório de estudo musical e anotações feitas no cronômetro.
          </p>
        </div>

        {/* Date input & manual add */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
          <button
            onClick={() => onOpenManualSession(selectedDate)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Tempo</span>
          </button>
        </div>
      </div>

      {/* Visual Banner when Goal is Met */}
      {isGoalMet ? (
        <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-neutral-950 shadow-md shadow-emerald-400/30">
                <Award className="h-8 w-8 text-neutral-950" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">✓</span>
              </div>
              <div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="rounded-md bg-emerald-200/60 px-2 py-0.5 text-[11px] font-bold text-emerald-900 uppercase">
                    Meta Diária Conquistada
                  </span>
                </div>
                <h3 className="font-sans text-lg font-extrabold text-neutral-950 mt-0.5">
                  Parabéns! Meta de Prática Concluída!
                </h3>
                <p className="text-xs text-neutral-600">
                  Você estudou {formatSecondsToReadable(dayTotalSeconds)} hoje (meta: {formatMinutesToReadable(goalMinutes)}).
                </p>
              </div>
            </div>

            <button
              onClick={handleTriggerDailyCelebration}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-neutral-950 px-4 py-2.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Ver Celebração</span>
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
              className="rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shrink-0 cursor-pointer"
            >
              Praticar Agora
            </button>
          )}
        </div>
      )}

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Time Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tempo Estudado</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
            {formatSecondsToReadable(dayTotalSeconds)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {daySessions.length} {daySessions.length === 1 ? 'sessão de prática' : 'sessões de prática'}
          </div>
        </div>

        {/* Goal Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Meta Diária</span>
            <Target className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-extrabold text-neutral-900 tabular-nums">
              {goalPercentage}%
            </span>
            <span className="text-xs font-medium text-neutral-500">
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
            {dayTotalSeconds > 0 ? 'Dia Praticado' : 'Sem Prática'}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            {dayTotalSeconds > 0
              ? `${formatSecondsToReadable(dayTotalSeconds)} registrados no dia`
              : 'Inicie o cronômetro para registrar tempo neste dia'}
          </div>
        </div>
      </div>

      {/* PROMINENT DEDICATED SECTION: ANOTAÇÕES FEITAS NO CRONÔMETRO */}
      <div className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900 shadow-2xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-sans text-base font-bold text-neutral-900">
                Anotações Feitas no Cronômetro & Estudo
              </h3>
              <p className="text-xs text-neutral-600">
                Anotações registradas durante a contagem de tempo deste dia.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-amber-200/70 px-2.5 py-0.5 text-xs font-bold text-amber-900">
            {sessionsWithNotes.length} {sessionsWithNotes.length === 1 ? 'anotação' : 'anotações'}
          </span>
        </div>

        {sessionsWithNotes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-200 bg-white/70 p-6 text-center text-xs text-neutral-500">
            <FileText className="mx-auto h-6 w-6 text-amber-400 mb-1.5 opacity-80" />
            <p className="font-medium text-neutral-700">Nenhuma anotação registrada para este dia ainda.</p>
            <p className="mt-1 text-neutral-400 text-[11px]">
              Ao parar o cronômetro ou praticar, digite anotações sobre escalas, partituras ou exercícios e elas aparecerão aqui em destaque!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sessionsWithNotes.map((s, idx) => (
              <div
                key={s.id}
                className="rounded-xl border border-amber-200/80 bg-white p-4 shadow-2xs space-y-2 hover:border-amber-300 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-neutral-800">{s.startTime}</span>
                    <span>·</span>
                    <span className="font-bold text-emerald-700">
                      {formatSecondsToReadable(getSessionTotalSeconds(s))}
                    </span>
                  </div>

                  {onUpdateSessionNotes && (
                    <button
                      onClick={() => handleStartEdit(s)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 hover:underline cursor-pointer"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Editar</span>
                    </button>
                  )}
                </div>

                <div className="text-sm text-neutral-900 whitespace-pre-wrap font-medium">
                  {s.notes}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hourly Timeline Distribution Chart */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-sans text-base font-bold text-neutral-900 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-neutral-600" />
              <span>Distribuição do Tempo ao Longo do Dia</span>
            </h3>
            <p className="text-xs text-neutral-500">
              Volume de tempo estudado em cada hora (06h às 23h).
            </p>
          </div>
          <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md tabular-nums">
            Total: {formatSecondsToReadable(dayTotalSeconds)}
          </span>
        </div>

        {/* Hour Bars */}
        <div className="h-36 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 border-b border-neutral-100">
          {Array.from({ length: 18 }).map((_, i) => {
            const hour = i + 6; // 06:00 to 23:00
            const secs = hourlyBuckets[hour] || 0;
            const pct = maxHourSeconds > 0 ? (secs / maxHourSeconds) * 100 : 0;
            const heightPct = secs > 0 ? Math.max(12, pct) : 0;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip on hover */}
                {secs > 0 && (
                  <div className="absolute -top-8 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                    <span className="rounded bg-neutral-900 text-white text-[10px] px-1.5 py-0.5 font-bold whitespace-nowrap shadow-md">
                      {formatSecondsToReadable(secs)}
                    </span>
                  </div>
                )}

                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    secs > 0
                      ? 'bg-neutral-900 group-hover:bg-neutral-800'
                      : 'bg-neutral-100 group-hover:bg-neutral-200'
                  }`}
                  style={{ height: `${heightPct}%`, minHeight: secs > 0 ? '8px' : '3px' }}
                />
              </div>
            );
          })}
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between text-[10px] text-neutral-400 mt-2 font-mono">
          <span>06:00</span>
          <span>09:00</span>
          <span>12:00</span>
          <span>15:00</span>
          <span>18:00</span>
          <span>21:00</span>
          <span>23:00</span>
        </div>

        {/* Morning, Afternoon, Evening Breakdown */}
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-neutral-100 pt-4 text-center">
          <div className="rounded-xl bg-neutral-50 p-2.5">
            <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Manhã (06h - 12h)</span>
            <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
              {formatSecondsToReadable(morningSeconds)}
            </span>
          </div>
          <div className="rounded-xl bg-neutral-50 p-2.5">
            <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Tarde (12h - 18h)</span>
            <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
              {formatSecondsToReadable(afternoonSeconds)}
            </span>
          </div>
          <div className="rounded-xl bg-neutral-50 p-2.5">
            <span className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Noite (18h - 24h)</span>
            <span className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
              {formatSecondsToReadable(eveningSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Sessions List with Visible Notes */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="font-sans text-base font-bold text-neutral-900">
              Sessões Praticadas no Dia ({daySessions.length})
            </h3>
            <p className="text-xs text-neutral-500">
              Registro completo de cada prática com horário, tempo e anotações.
            </p>
          </div>
          {selectedDate === todayStr && (
            <button
              onClick={onStartTimerForToday}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
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
              Use o cronômetro ou adicione o tempo manualmente.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => onOpenManualSession(selectedDate)}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-2xs cursor-pointer"
              >
                Adicionar Tempo Manual
              </button>
              {selectedDate === todayStr && (
                <button
                  onClick={onStartTimerForToday}
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 shadow-2xs cursor-pointer"
                >
                  Abrir Cronômetro
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {daySessions.map((session) => {
              const isEditing = editingSessionId === session.id;

              return (
                <div
                  key={session.id}
                  className="py-4 first:pt-0 last:pb-0 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 shrink-0">
                        <Music className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-neutral-900">
                            Prática Musical
                          </span>
                          <span className="text-xs text-neutral-500 font-medium">
                            · Horário: {session.startTime}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                          Duração: {formatSecondsToReadable(getSessionTotalSeconds(session))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(session)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Editar anotação"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                        title="Excluir sessão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Edit Mode */}
                  {isEditing ? (
                    <div className="mt-2 rounded-xl bg-neutral-50 p-3 border border-neutral-300 space-y-2">
                      <label className="block text-xs font-bold text-neutral-800">
                        Editar Anotação da Prática:
                      </label>
                      <textarea
                        rows={2}
                        value={editingNoteValue}
                        onChange={(e) => setEditingNoteValue(e.target.value)}
                        placeholder="Ex: Treino de escalas em dó maior, leitura de partitura, repertório..."
                        className="w-full rounded-lg border border-neutral-300 p-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-white"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-neutral-200 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Cancelar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(session.id)}
                          className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-neutral-900 text-white font-semibold hover:bg-neutral-800 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Salvar Anotação</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Note Block */
                    <div className="ml-11">
                      {session.notes ? (
                        <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 p-3 text-xs text-amber-950">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                            <FileText className="h-3.5 w-3.5 text-amber-700" />
                            <span className="uppercase tracking-wider text-[11px]">Anotação do Cronômetro:</span>
                          </div>
                          <p className="text-neutral-900 font-medium pl-5 whitespace-pre-wrap leading-relaxed">
                            {session.notes}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(session)}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 hover:underline cursor-pointer italic"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Adicionar anotação a esta sessão</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
