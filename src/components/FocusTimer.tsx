import React, { useState, useEffect, useRef } from 'react';
import { playCompletionChime, playTickSound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Music,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { formatMinutesToReadable } from '../utils/dateUtils';

interface FocusTimerProps {
  onSessionComplete: (durationMinutes: number, notes?: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  dailyMinutesToday: number;
  dailyGoalMinutes: number;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  onSessionComplete,
  soundEnabled,
  onToggleSound,
  dailyMinutesToday,
  dailyGoalMinutes,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [showFinishedNotice, setShowFinishedNotice] = useState<boolean>(false);
  const [lastSavedMinutes, setLastSavedMinutes] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Counting up effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  // Start counting
  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    if (soundEnabled) playTickSound();
  };

  // Pause / Resume
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    if (soundEnabled) playTickSound();
  };

  // Stop counting and save studied time
  const handleStop = () => {
    if (!isRunning && secondsElapsed === 0) return;

    setIsRunning(false);
    setIsPaused(false);

    // Calculate minutes (at least 1 min if studied for more than 20 seconds)
    const minutesStudied = secondsElapsed >= 20 ? Math.max(1, Math.round(secondsElapsed / 60)) : Math.floor(secondsElapsed / 60);

    if (minutesStudied > 0) {
      if (soundEnabled) playCompletionChime();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        });
      } catch {
        // quiet
      }

      setLastSavedMinutes(minutesStudied);
      setShowFinishedNotice(true);
      onSessionComplete(minutesStudied, notes.trim() || undefined);
    }

    // Reset stopwatch counter
    setSecondsElapsed(0);
  };

  // Reset without saving
  const handleReset = () => {
    if (secondsElapsed > 0 && !confirm('Deseja zerar a contagem sem salvar este tempo?')) {
      return;
    }
    setIsRunning(false);
    setIsPaused(false);
    setSecondsElapsed(0);
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatStopwatch = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`transition-all duration-300 ${isZenMode ? 'fixed inset-0 z-50 flex items-center justify-center bg-neutral-950 text-white p-6' : 'w-full'}`}>
      <div className={`mx-auto w-full ${isZenMode ? 'max-w-xl text-center' : 'max-w-2xl'}`}>
        
        {/* Top Control Bar in normal mode */}
        {!isZenMode && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-neutral-800" />
                <h2 className="font-sans text-2xl font-bold tracking-tight text-neutral-900">
                  Controle de Tempo de Estudo
                </h2>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                <span>Meta diária: {formatMinutesToReadable(dailyGoalMinutes)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-neutral-800">
                  Hoje: {formatMinutesToReadable(dailyMinutesToday)}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 font-semibold">
                  {Math.min(100, Math.round((dailyMinutesToday / (dailyGoalMinutes || 1)) * 100))}% atingido
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onToggleSound}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                title={soundEnabled ? 'Silenciar som' : 'Ativar som'}
              >
                {soundEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                    <span>Som ativado</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-neutral-400" />
                    <span>Mudo</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsZenMode(true)}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
                title="Modo Tela Cheia"
              >
                <Maximize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Modo Zen</span>
              </button>
            </div>
          </div>
        )}

        {/* Zen Mode Exit button */}
        {isZenMode && (
          <div className="absolute top-6 right-6 flex items-center gap-3">
            <button
              onClick={onToggleSound}
              className="rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5 text-emerald-400" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsZenMode(false)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Sair do Modo Zen</span>
            </button>
          </div>
        )}

        {/* Timer Card Container */}
        <div className={`rounded-3xl border p-8 sm:p-12 text-center transition-all ${
          isZenMode 
            ? 'border-neutral-800 bg-neutral-900/90 shadow-2xl' 
            : 'border-neutral-200 bg-white shadow-xs'
        }`}>
          
          {/* Status Label */}
          <div className="mb-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
              isRunning && !isPaused
                ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                : isPaused
                ? 'bg-amber-100 text-amber-800'
                : 'bg-neutral-100 text-neutral-600'
            }`}>
              {isRunning && !isPaused ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Estudando Música...</span>
                </>
              ) : isPaused ? (
                <span>Contagem Pausada</span>
              ) : (
                <span>Pronto para Começar</span>
              )}
            </span>
          </div>

          {/* Big Digital Counter */}
          <div className="my-6">
            <span
              className={`font-mono text-6xl sm:text-7xl md:text-8xl font-black tracking-tight tabular-nums select-none ${
                isZenMode ? 'text-white' : 'text-neutral-950'
              }`}
            >
              {formatStopwatch(secondsElapsed)}
            </span>

            <p className="mt-3 text-xs sm:text-sm text-neutral-500 font-medium">
              {isRunning
                ? `${Math.floor(secondsElapsed / 60)} min e ${secondsElapsed % 60}s estudados até o momento`
                : 'Clique em Iniciar para começar a contagem do tempo estudado'}
            </p>
          </div>

          {/* Primary Action Buttons: INICIAR and PARAR */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {!isRunning ? (
              /* INICIAR BUTTON */
              <button
                onClick={handleStart}
                className="flex items-center gap-3 rounded-2xl bg-neutral-950 px-9 py-4 text-lg font-bold text-white shadow-lg hover:bg-neutral-800 hover:scale-102 active:scale-98 transition-all focus-visible:outline-2"
              >
                <Play className="h-6 w-6 fill-current" />
                <span>Iniciar Estudo</span>
              </button>
            ) : (
              /* RUNNING CONTROLS: PARAR and PAUSAR */
              <>
                <button
                  onClick={handleTogglePause}
                  className={`flex items-center gap-2 rounded-2xl border px-6 py-4 text-base font-semibold transition-all ${
                    isZenMode
                      ? 'border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
                      : 'border-neutral-300 bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
                  }`}
                >
                  {isPaused ? <Play className="h-5 w-5 fill-current" /> : <Pause className="h-5 w-5 fill-current" />}
                  <span>{isPaused ? 'Retomar' : 'Pausar'}</span>
                </button>

                {/* PARAR BUTTON */}
                <button
                  onClick={handleStop}
                  className="flex items-center gap-3 rounded-2xl bg-red-600 px-8 py-4 text-lg font-bold text-white shadow-lg hover:bg-red-700 hover:scale-102 active:scale-98 transition-all"
                >
                  <Square className="h-5 w-5 fill-current" />
                  <span>Parar e Salvar</span>
                </button>
              </>
            )}

            {/* Reset button (visible when paused or seconds elapsed) */}
            {secondsElapsed > 0 && !isRunning && (
              <button
                onClick={handleReset}
                className={`flex items-center gap-1.5 rounded-2xl border px-5 py-4 text-sm font-semibold transition-colors ${
                  isZenMode
                    ? 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
                title="Zerar sem salvar"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Zerar</span>
              </button>
            )}
          </div>

          {/* Simple optional practice note */}
          <div className={`mt-10 border-t pt-5 text-left ${isZenMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
            <label className={`block text-xs font-semibold mb-1.5 ${isZenMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
              Anotação do Estudo Musical (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino de escalas, leitura de partitura, repertório, técnica..."
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 ${
                isZenMode
                  ? 'border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500'
                  : 'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400'
              }`}
            />
          </div>
        </div>

        {/* Modal: Finished Session Notification */}
        {showFinishedNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-center text-neutral-900">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-sans text-xl font-bold text-neutral-900">Estudo Salvo com Sucesso!</h3>
              <p className="mt-2 text-sm text-neutral-600">
                Você estudou <strong className="text-neutral-900">{formatMinutesToReadable(lastSavedMinutes)}</strong> de música.
              </p>
              <div className="mt-4 rounded-xl bg-neutral-50 p-3 border border-neutral-200 text-xs text-neutral-600 flex items-center justify-around">
                <div>
                  <span className="block text-neutral-400">Tempo Praticado</span>
                  <span className="text-base font-bold text-neutral-900 tabular-nums">{formatMinutesToReadable(lastSavedMinutes)}</span>
                </div>
                <div className="h-8 w-px bg-neutral-200" />
                <div>
                  <span className="block text-neutral-400">Calendário</span>
                  <span className="text-base font-bold text-emerald-600">Gravado no Dia ✓</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowFinishedNotice(false);
                  setNotes('');
                }}
                className="mt-6 w-full rounded-xl bg-neutral-900 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
