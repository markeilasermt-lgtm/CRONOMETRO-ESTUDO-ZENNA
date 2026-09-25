import React, { useState } from 'react';
import { getTodayDateString } from '../utils/dateUtils';
import { Music, Clock } from 'lucide-react';

interface ManualSessionModalProps {
  initialDate: string;
  onClose: () => void;
  onSaveSession: (date: string, durationMinutes: number, startTime: string, notes?: string) => void;
}

export const ManualSessionModal: React.FC<ManualSessionModalProps> = ({
  initialDate,
  onClose,
  onSaveSession,
}) => {
  const [date, setDate] = useState<string>(initialDate || getTodayDateString());
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [startTime, setStartTime] = useState<string>('15:00');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (durationMinutes <= 0) return;
    onSaveSession(date, Number(durationMinutes), startTime, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-sans text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Music className="h-5 w-5 text-indigo-600" />
            <span>Adicionar Tempo de Prática</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Adicione o tempo de estudo musical realizado fora do aplicativo.
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
            <label className="block text-xs font-semibold text-neutral-700">
              Duração em Minutos
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="720"
                step="5"
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 tabular-nums font-mono"
              />
              <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">
                ({Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m)
              </span>
            </div>
            {/* Quick minute buttons */}
            <div className="mt-2 flex gap-1.5">
              {[15, 30, 45, 60, 90, 120].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setDurationMinutes(m)}
                  className={`px-2.5 py-1 text-xs rounded-md border ${
                    durationMinutes === m
                      ? 'border-neutral-900 bg-neutral-900 text-white font-semibold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {m}m
                </button>
              ))}
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
              placeholder="Ex: Treino de escalas, repertório clássico, estudo com metrônomo..."
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 placeholder-neutral-400"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              Salvar Tempo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
