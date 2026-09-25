/**
 * Date utilities for calendar grids, formatting in pt-BR, and time conversions
 */

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEKDAYS_SHORT_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAYS_FULL_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function getTodayDateString(): string {
  const now = new Date();
  return formatDateToISO(now);
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatMinutesToReadable(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) {
    return `${h}h`;
  }
  return `${h}h ${m}m`;
}

export function formatSecondsToTimer(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatDateLongPT(dateStr: string): string {
  const d = parseISODate(dateStr);
  const weekday = WEEKDAYS_FULL_PT[d.getDay()];
  const day = d.getDate();
  const month = MONTH_NAMES_PT[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday}, ${day} de ${month} de ${year}`;
}

export function getMonthCalendarDays(year: number, month: number) {
  // month is 0-indexed (0 = Janeiro, 8 = Setembro, etc.)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday

  // Days from previous month to fill the first row
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const prevDays = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, dayNum);
    prevDays.push({
      dateStr: formatDateToISO(prevDate),
      dayNumber: dayNum,
      isCurrentMonth: false,
    });
  }

  // Days of current month
  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const currDate = new Date(year, month, i);
    currentDays.push({
      dateStr: formatDateToISO(currDate),
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // Days from next month to complete standard 35 or 42 grid cells
  const totalSoFar = prevDays.length + currentDays.length;
  const targetTotal = totalSoFar > 35 ? 42 : 35;
  const nextDaysCount = targetTotal - totalSoFar;
  const nextDays = [];
  for (let i = 1; i <= nextDaysCount; i++) {
    const nextDate = new Date(year, month + 1, i);
    nextDays.push({
      dateStr: formatDateToISO(nextDate),
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  return [...prevDays, ...currentDays, ...nextDays];
}
