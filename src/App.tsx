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
  RewardItem,
  RedemptionRecord,
  Achievement,
  RewardCelebration,
} from './types';
import {
  loadSessions,
  saveSessions,
  loadDayRecords,
  saveDayRecords,
  loadGoals,
  saveGoals,
  loadRewards,
  saveRewards,
  loadRedemptions,
  saveRedemptions,
  loadPoints,
  savePoints,
  loadAchievements,
  saveAchievements,
  calculateStreak,
  DEFAULT_GOALS,
  DEFAULT_REWARDS,
  INITIAL_ACHIEVEMENTS,
} from './utils/storage';
import { getTodayDateString, formatMinutesToReadable } from './utils/dateUtils';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { FocusTimer } from './components/FocusTimer';
import { DailyReportView } from './components/DailyReportView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { RewardsView } from './components/RewardsView';
import { ManualSessionModal } from './components/ManualSessionModal';
import { GoalSettingsModal } from './components/GoalSettingsModal';
import { RewardCelebrationModal } from './components/RewardCelebrationModal';
import confetti from 'canvas-confetti';
import { playRewardFanfare } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [dayRecords, setDayRecords] = useState<DayRecord[]>([]);
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

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

  // Initial load from storage
  useEffect(() => {
    setSessions(loadSessions());
    setDayRecords(loadDayRecords());
    setGoals(loadGoals());
    setRewards(loadRewards());
    setRedemptions(loadRedemptions());
    setPoints(loadPoints());
    setAchievements(loadAchievements());
  }, []);

  // Compute studied dates set for streak calculation
  const studiedDatesSet = new Set<string>();
  sessions.forEach((s) => studiedDatesSet.add(s.date));
  dayRecords.filter((dr) => dr.manualMarked).forEach((dr) => studiedDatesSet.add(dr.date));

  const { currentStreak, bestStreak } = calculateStreak(studiedDatesSet);

  // Minutes studied today
  const todayStr = getTodayDateString();
  const dailyMinutesToday = sessions
    .filter((s) => s.date === todayStr)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Total study minutes across all time
  const totalStudyMinutes = sessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Check achievements helper
  const evaluateAchievements = (
    currentSessions: StudySession[],
    streak: number,
    totalMins: number,
    currentDayMins: number
  ) => {
    let updated = false;
    const nowIso = new Date().toISOString();
    const newAchievements = achievements.map((ach) => {
      if (ach.unlockedAt) return ach;

      let shouldUnlock = false;
      if (ach.id === 'ach-first' && currentSessions.length >= 1) shouldUnlock = true;
      if (ach.id === 'ach-deep' && currentSessions.some((s) => s.durationMinutes >= 45)) shouldUnlock = true;
      if (ach.id === 'ach-daily-hit' && currentDayMins >= goals.dailyMinutes) shouldUnlock = true;
      if (ach.id === 'ach-streak-3' && streak >= 3) shouldUnlock = true;
      if (ach.id === 'ach-streak-7' && streak >= 7) shouldUnlock = true;
      if (ach.id === 'ach-streak-14' && streak >= 14) shouldUnlock = true;
      if (ach.id === 'ach-hours-10' && totalMins >= 10 * 60) shouldUnlock = true;
      if (ach.id === 'ach-hours-25' && totalMins >= 25 * 60) shouldUnlock = true;
      if (ach.id === 'ach-hours-50' && totalMins >= 50 * 60) shouldUnlock = true;

      if (shouldUnlock) {
        updated = true;
        showToast(`🏆 Conquista Desbloqueada: ${ach.title}!`);
        return { ...ach, unlockedAt: nowIso };
      }
      return ach;
    });

    if (updated) {
      setAchievements(newAchievements);
      saveAchievements(newAchievements);
    }
  };

  // Handle focus session completed via Timer (Iniciar / Parar)
  const handleSessionComplete = (durationMinutes: number, notes?: string) => {
    const newSession: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date: todayStr,
      startTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      durationMinutes,
      subject: 'Prática Musical',
      notes: notes || undefined,
      completedAt: new Date().toISOString(),
    };

    const newSessions = [newSession, ...sessions];
    setSessions(newSessions);
    saveSessions(newSessions);

    // Ensure day is marked as studied
    let newDayRecords = [...dayRecords];
    const existingDayRecord = newDayRecords.find((dr) => dr.date === todayStr);
    if (!existingDayRecord) {
      newDayRecords.push({ date: todayStr, manualMarked: true });
    } else if (!existingDayRecord.manualMarked) {
      newDayRecords = newDayRecords.map((dr) => (dr.date === todayStr ? { ...dr, manualMarked: true } : dr));
    }
    setDayRecords(newDayRecords);
    saveDayRecords(newDayRecords);

    // Calculate points earned (1 min = 1 point)
    let pointsEarned = durationMinutes;
    const prevDayMins = dailyMinutesToday;
    const newDayMins = prevDayMins + durationMinutes;

    // Check if daily goal reached for first time today -> trigger visual reward celebration!
    if (prevDayMins < goals.dailyMinutes && newDayMins >= goals.dailyMinutes) {
      pointsEarned += 50;
      setCelebrationModal({
        type: 'daily_goal',
        title: 'Meta Diária Conquistada!',
        subtitle: `Parabéns! Você alcançou ${formatMinutesToReadable(newDayMins)} de estudo musical hoje, cumprindo sua meta diária de ${formatMinutesToReadable(goals.dailyMinutes)}.`,
        pointsEarned: 50,
        badgeTier: 'bronze',
      });
    } else {
      showToast(`+${durationMinutes} pontos de foco adicionados ao seu saldo!`);
    }

    const updatedPoints = points + pointsEarned;
    setPoints(updatedPoints);
    savePoints(updatedPoints);

    // Evaluate achievements
    const newDatesSet = new Set(studiedDatesSet);
    newDatesSet.add(todayStr);
    const { currentStreak: newStreak } = calculateStreak(newDatesSet);
    evaluateAchievements(newSessions, newStreak, totalStudyMinutes + durationMinutes, newDayMins);
  };

  // Toggle manual day marked status
  const handleToggleDayMarked = (dateStr: string) => {
    let newRecords: DayRecord[];
    const existing = dayRecords.find((dr) => dr.date === dateStr);

    if (existing) {
      newRecords = dayRecords.map((dr) =>
        dr.date === dateStr ? { ...dr, manualMarked: !dr.manualMarked } : dr
      );
    } else {
      newRecords = [...dayRecords, { date: dateStr, manualMarked: true }];
    }

    setDayRecords(newRecords);
    saveDayRecords(newRecords);

    const isNowMarked = newRecords.find((dr) => dr.date === dateStr)?.manualMarked;
    showToast(isNowMarked ? 'Dia marcado como praticado ✓' : 'Marcação do dia removida.');
  };

  // Add manual session
  const handleSaveManualSession = (
    date: string,
    durationMinutes: number,
    startTime: string,
    notes?: string
  ) => {
    const newSession: StudySession = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      date,
      startTime,
      durationMinutes,
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

    // Add points
    const updatedPoints = points + durationMinutes;
    setPoints(updatedPoints);
    savePoints(updatedPoints);

    showToast(`${durationMinutes}m de prática registrados com sucesso (+${durationMinutes} pts)!`);

    const newDatesSet = new Set(studiedDatesSet);
    newDatesSet.add(date);
    const { currentStreak: newStreak } = calculateStreak(newDatesSet);
    evaluateAchievements(newSessions, newStreak, totalStudyMinutes + durationMinutes, dailyMinutesToday);
  };

  // Delete session
  const handleDeleteSession = (sessionId: string) => {
    const newSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(newSessions);
    saveSessions(newSessions);
    showToast('Sessão removida.');
  };

  // Redeem reward
  const handleRedeemReward = (reward: RewardItem) => {
    if (points < reward.costPoints) return;

    const newPoints = points - reward.costPoints;
    setPoints(newPoints);
    savePoints(newPoints);

    const updatedRewards = rewards.map((r) =>
      r.id === reward.id ? { ...r, redeemedCount: r.redeemedCount + 1 } : r
    );
    setRewards(updatedRewards);
    saveRewards(updatedRewards);

    const newRedemption: RedemptionRecord = {
      id: `red-${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      costPoints: reward.costPoints,
      redeemedAt: new Date().toISOString(),
    };
    const updatedRedemptions = [newRedemption, ...redemptions];
    setRedemptions(updatedRedemptions);
    saveRedemptions(updatedRedemptions);

    showToast(`Recompensa resgatada: "${reward.title}"! Aproveite seu descanso!`);
  };

  // Add custom reward
  const handleAddCustomReward = (customReward: Omit<RewardItem, 'id' | 'redeemedCount'>) => {
    const newReward: RewardItem = {
      ...customReward,
      id: `rew-${Date.now()}`,
      redeemedCount: 0,
    };
    const updated = [newReward, ...rewards];
    setRewards(updated);
    saveRewards(updated);
    showToast(`Recompensa "${newReward.title}" cadastrada na loja!`);
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
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions,
      dayRecords,
      goals,
      rewards,
      redemptions,
      points,
      achievements,
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
      if (data.rewards && Array.isArray(data.rewards)) {
        setRewards(data.rewards);
        saveRewards(data.rewards);
      }
      if (data.redemptions && Array.isArray(data.redemptions)) {
        setRedemptions(data.redemptions);
        saveRedemptions(data.redemptions);
      }
      if (typeof data.points === 'number') {
        setPoints(data.points);
        savePoints(data.points);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    localStorage.clear();
    setSessions(loadSessions());
    setDayRecords(loadDayRecords());
    setGoals(DEFAULT_GOALS);
    setRewards(DEFAULT_REWARDS);
    setRedemptions([]);
    setPoints(480);
    setAchievements(INITIAL_ACHIEVEMENTS);
    showToast('Dados restaurados para o padrão.');
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 font-sans text-neutral-900 flex flex-col">
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakCount={currentStreak}
        points={points}
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
          />
        )}

        {activeTab === 'timer' && (
          <FocusTimer
            onSessionComplete={handleSessionComplete}
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

        {activeTab === 'rewards' && (
          <RewardsView
            points={points}
            totalStudyMinutes={totalStudyMinutes}
            streakCount={currentStreak}
            bestStreak={bestStreak}
            rewards={rewards}
            redemptions={redemptions}
            achievements={achievements}
            goals={goals}
            onRedeemReward={handleRedeemReward}
            onAddCustomReward={handleAddCustomReward}
            onOpenSettings={() => setShowSettingsModal(true)}
            onTriggerCelebration={setCelebrationModal}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200/80 bg-white py-4 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EstudoFlux · Estudo Musical & Controle de Tempo</span>
          <div className="flex items-center gap-4 text-neutral-500">
            <button onClick={() => setActiveTab('calendar')} className="hover:text-neutral-900">
              Calendário
            </button>
            <button onClick={() => setActiveTab('timer')} className="hover:text-neutral-900">
              Tempo
            </button>
            <button onClick={() => setActiveTab('daily')} className="hover:text-neutral-900">
              Relatório Diário
            </button>
            <button onClick={() => setActiveTab('monthly')} className="hover:text-neutral-900">
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

      {/* Visual Reward Celebration Modal */}
      {celebrationModal && (
        <RewardCelebrationModal
          celebration={celebrationModal}
          onClose={() => setCelebrationModal(null)}
          soundEnabled={goals.soundEnabled}
        />
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
