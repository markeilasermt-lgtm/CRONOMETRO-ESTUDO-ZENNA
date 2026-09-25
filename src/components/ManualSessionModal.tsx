import React, { useState } from 'react';
import { getTodayDateString, formatSecondsToReadable } from '../utils/dateUtils';
import { Music, Clock } from 'lucide-react';

interface ManualSessionModalProps {
  initialDate: string;
  onClose: () => void;
  onSaveSession: (date: string, durationMinutes: number, durationSeconds: number, startTime: string, notes?: string) => void;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({
  initialDate,
  onClose,
  onSaveSession,
}) => {
  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [startTime, setStartTime] = useState<string>('15:00');
  const [notes, setNotes] = useState<string>('');

  const totalSecs = (Number(durationMinutes) || 0) * 60 + (Number(durationSeconds) || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalSecs <= 0) return;
    onSaveSession(date, Number(durationMinutes) || 0, Number(durationSeconds) || 0, startTime, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-sans text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Music className="h-5 w-5 text-indigo-600" />
            <span>Adicionar Tempo de Estudo</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Adicione o tempo de estudo musical em minutos e segundos realizado fora do cronômetro.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700">Data do Estudo</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700">Horário</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-neutral-700">
                Duração (Minutos e Segundos)
              </label>
              <span className="text-xs text-neutral-600 font-bold tabular-nums">
                Total: {formatSecondsToReadable(totalSecs)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Minutos</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="720"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 tabular-nums font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">min</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 mb-0.5">Segundos</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    required
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 tabular-nums font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">seg</span>
                </div>
              </div>
            </div>

            {/* Quick minute buttons */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[5, 15, 30, 45, 60].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    setDurationMinutes(m);
                    setDurationSeconds(0);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer ${
                    durationMinutes === m && durationSeconds === 0
                      ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {m} min
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDurationMinutes(0);
                  setDurationSeconds(30);
                }}
                className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer ${
                  durationMinutes === 0 && durationSeconds === 30
                    ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                30 seg
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700">
              Anotações da Prática (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino de escalas, partitura, repertório..."
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder-neutral-400"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
            >
              Salvar Tempo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
