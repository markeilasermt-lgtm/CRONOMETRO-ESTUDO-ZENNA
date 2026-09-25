/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  StudySession,
  DayRecord,
  UserGoals,
  RewardCelebration,
} from './types';
import {
  loadSessions,
  saveSessions,
  loadDayRecords,
  saveDayRecords,
  loadGoals,
  saveGoals,
  DEFAULT_GOALS,
} from './utils/storage';
import {
  getTodayDateString,
  formatMinutesToReadable,
  formatSecondsToReadable,
  getSessionTotalSeconds,
} from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { FocusTimer } from './components/FocusTimer';
import { DailyReportView } from './components/DailyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { ManualSessionModal } from './components/ManualSessionModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { RewardCelebrationModal } from './components/RewardCelebrationModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dayRecords, setDayRecords] = useState<DayRecord[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);

  // Modals state
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualModalDate, setManualModalDate] = useState<string>(getTodayDateString());
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [celebrationModal, setCelebrationModal] = useState<RewardCelebration | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Initial load from storage (Starts 100% clean with no markings)
  useEffect(() => {
    setSessions(loadSessions());
    setDayRecords(loadDayRecords());
    setGoals(loadGoals());
  }, []);

  // Seconds and minutes studied today
  const todayStr = getTodayDateString();
  const dailySecondsToday = sessions
    .filter((s) => s.date === todayStr)
    .reduce((acc, s) => acc + getSessionTotalSeconds(s), 0);
  const dailyMinutesToday = Math.round(dailySecondsToday / 60);

  // Handle study session completed via Timer (Iniciar / Parar)
  const handleSessionComplete = (
    durationMinutes: number,
    durationSeconds: number,
    totalSeconds: number,
    notes?: string
  ) => {
    const newSession: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: todayStr,
      startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      durationMinutes,
      durationSeconds,
      totalSeconds,
      subject: 'Prática Musical',
      notes: notes || undefined,
      completedAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    saveSessions(newSessions);

    // Ensure day is marked as studied in the calendar
    let newDayRecords = [...dayRecords];
    const existingDayRecord = newDayRecords.find((dr) => dr.date === todayStr);
    if (!existingDayRecord) {
      newDayRecords.push({ date: todayStr, manualMarked: true });
    } else if (!existingDayRecord.manualMarked) {
      newDayRecords = newDayRecords.map((dr) => (dr.date === todayStr ? { ...dr, manualMarked: true } : dr));
    }
    setDayRecords(newDayRecords);
    saveDayRecords(newDayRecords);

    // Check if daily goal reached
    const prevDayMins = dailyMinutesToday;
    const newDayMins = prevDayMins + Math.round(totalSeconds / 60);

    if (goals.dailyMinutes > 0 && prevDayMins < goals.dailyMinutes && newDayMins >= goals.dailyMinutes) {
      setCelebrationModal({
        type: 'daily_goal',
        title: 'Meta Diária Conquistada!',
        subtitle: `Parabéns! Você alcançou ${formatSecondsToReadable(dailySecondsToday + totalSeconds)} de estudo musical hoje, cumprindo sua meta diária de ${formatMinutesToReadable(goals.dailyMinutes)}.`,
        pointsEarned: 0,
        badgeTier: 'bronze',
      });
    }

    showToast(`${formatSecondsToReadable(totalSeconds)} salvos no calendário com sucesso!`);
  };

  // Toggle manual day marked status in calendar
  // When unmarking: ZEROS the study time as requested!
  const handleToggleDayMarked = (dateStr: string) => {
    const existingRecord = dayRecords.find((dr) => dr.date === dateStr);
    const daySessions = sessions.filter((s) => s.date === dateStr);
    const isCurrentlyMarked = existingRecord?.manualMarked || daySessions.length > 0;

    if (isCurrentlyMarked) {
      // Unmarking: zeros the study time for this date!
      const newSessions = sessions.filter((s) => s.date !== dateStr);
      setSessions(newSessions);
      saveSessions(newSessions);

      const newDayRecords = dayRecords.filter((dr) => dr.date !== dateStr);
      setDayRecords(newDayRecords);
      saveDayRecords(newDayRecords);

      showToast(`Dia desmarcado e tempo de estudo zerado no calendário.`);
    } else {
      // Marking the day
      const newDayRecords = [
        ...dayRecords.filter((dr) => dr.date !== dateStr),
        { date: dateStr, manualMarked: true },
      ];
      setDayRecords(newDayRecords);
      saveDayRecords(newDayRecords);

      showToast('Dia marcado como estudado ✓');
    }
  };

  // Clear all markings from calendar
  const handleClearAllMarkings = () => {
    setSessions([]);
    saveSessions([]);
    setDayRecords([]);
    saveDayRecords([]);
    showToast('Calendário limpo: todas as marcações foram removidas.');
  };

  // Add manual session with minutes and seconds
  const handleSaveManualSession = (
    date: string,
    durationMinutes: number,
    durationSeconds: number,
    startTime: string,
    notes?: string
  ) => {
    const totalSeconds = durationMinutes * 60 + durationSeconds;
    const newSession: StudySession = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date,
      startTime,
      durationMinutes,
      durationSeconds,
      totalSeconds,
      subject: 'Prática Musical',
      notes: notes || undefined,
      completedAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    saveSessions(newSessions);

    // Ensure day is marked
    let newDayRecords = [...dayRecords];
    const existing = newDayRecords.find((dr) => dr.date === date);
    if (!existing) {
      newDayRecords.push({ date, manualMarked: true });
    } else if (!existing.manualMarked) {
      newDayRecords = newDayRecords.map((dr) => (dr.date === date ? { ...dr, manualMarked: true } : dr));
    }
    setDayRecords(newDayRecords);
    saveDayRecords(newDayRecords);

    showToast(`${formatSecondsToReadable(totalSeconds)} registrados no dia ${date}!`);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    const newSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(newSessions);
    saveSessions(newSessions);
    showToast('Sessão removida.');
  };

  // Update session notes
  const handleUpdateSessionNotes = (sessionId: string, newNotes: string) => {
    const newSessions = sessions.map((s) =>
      s.id === sessionId ? { ...s, notes: newNotes.trim() || undefined } : s
    );
    setSessions(newSessions);
    saveSessions(newSessions);
    showToast('Anotação atualizada com sucesso!');
  };

  // Save goals
  const handleSaveGoals = (newGoals: UserGoals) => {
    setGoals(newGoals);
    saveGoals(newGoals);
    showToast('Metas salvas com sucesso!');
  };

  // Export full JSON backup
  const handleExportAllData = () => {
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      sessions,
      dayRecords,
      goals,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `estudoflux_musica_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportAllData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
        saveSessions(data.sessions);
      }
      if (data.dayRecords && Array.isArray(data.dayRecords)) {
        setDayRecords(data.dayRecords);
        saveDayRecords(data.dayRecords);
      }
      if (data.goals) {
        setGoals(data.goals);
        saveGoals(data.goals);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  // Reset to default (Clean state)
  const handleResetToDefault = () => {
    localStorage.clear();
    setSessions([]);
    saveSessions([]);
    setDayRecords([]);
    saveDayRecords([]);
    setGoals(DEFAULT_GOALS);
    showToast('Calendário e dados limpos com sucesso.');
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 flex flex-col">
      {/* Top Bar Navigation with Resized Mobile Buttons */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Main Viewport Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-24 md:pb-8">
        {activeTab === 'calendar' && (
          <CalendarView
            sessions={sessions}
            dayRecords={dayRecords}
            goals={goals}
            onToggleDayMarked={handleToggleDayMarked}
            onDeleteSession={handleDeleteSession}
            onOpenManualSession={(dStr) => {
              setManualModalDate(dStr);
              setShowManualModal(true);
            }}
            onStartTimerForToday={() => setActiveTab('timer')}
            onClearAllMarkings={handleClearAllMarkings}
          />
        )}

        {activeTab === 'timer' && (
          <FocusTimer
            onSessionComplete={handleSessionComplete}
            onNavigateToCalendar={() => setActiveTab('calendar')}
            soundEnabled={goals.soundEnabled}
            onToggleSound={() => handleSaveGoals({ ...goals, soundEnabled: !goals.soundEnabled })}
            dailyMinutesToday={dailyMinutesToday}
            dailyGoalMinutes={goals.dailyMinutes}
          />
        )}

        {activeTab === 'daily' && (
          <DailyReportView
            sessions={sessions}
            dayRecords={dayRecords}
            goals={goals}
            onOpenManualSession={(dStr) => {
              setManualModalDate(dStr);
              setShowManualModal(true);
            }}
            onDeleteSession={handleDeleteSession}
            onStartTimerForToday={() => setActiveTab('timer')}
            onTriggerCelebration={setCelebrationModal}
            onUpdateSessionNotes={handleUpdateSessionNotes}
          />
        )}

        {activeTab === 'monthly' && (
          <MonthlyReportView
            sessions={sessions}
            dayRecords={dayRecords}
            goals={goals}
            onSelectDayForDetail={() => {
              setActiveTab('daily');
            }}
            onTriggerCelebration={setCelebrationModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200/80 bg-white py-4 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EstudoFlux · Estudo Musical & Controle de Tempo</span>
          <div className="flex items-center gap-4 text-neutral-600 font-medium">
            <button onClick={() => setActiveTab('calendar')} className="hover:text-neutral-950 cursor-pointer">
              Calendário
            </button>
            <button onClick={() => setActiveTab('timer')} className="hover:text-neutral-950 cursor-pointer">
              Cronômetro
            </button>
            <button onClick={() => setActiveTab('daily')} className="hover:text-neutral-950 cursor-pointer">
              Relatório Diário
            </button>
            <button onClick={() => setActiveTab('monthly')} className="hover:text-neutral-950 cursor-pointer">
              Relatório Mensal
            </button>
          </div>
        </div>
      </footer>

      {/* Manual Study Registration Modal */}
      {showManualModal && (
        <ManualSessionModal
          initialDate={manualModalDate}
          onClose={() => setShowManualModal(false)}
          onSaveSession={handleSaveManualSession}
        />
      )}

      {/* Goal Settings & Data Modal */}
      {showSettingsModal && (
        <GoalSettingsModal
          goals={goals}
          onSaveGoals={handleSaveGoals}
          onClose={() => setShowSettingsModal(false)}
          onExportAllData={handleExportAllData}
          onImportAllData={handleImportAllData}
          onResetToDefault={handleResetToDefault}
        />
      )}

      {/* Visual Celebration Modal */}
      {celebrationModal && (
        <RewardCelebrationModal
          celebration={celebrationModal}
          onClose={() => setCelebrationModal(null)}
          soundEnabled={goals.soundEnabled}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
