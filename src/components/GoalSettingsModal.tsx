import React, { useState } from 'react';
import { UserGoals } from '../types';
import {
  Settings,
  Target,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Eraser,
} from 'lucide-react';

interface GoalSettingsModalProps {
  goals: UserGoals;
  onSaveGoals: (goals: UserGoals) => void;
  onClose: () => void;
  onExportAllData: () => void;
  onImportAllData: (jsonData: string) => boolean;
  onResetToDefault: () => void;
}

export const GoalSettingsModal: React.FC<GoalSettingsModalProps> = ({
  goals,
  onSaveGoals,
  onClose,
  onExportAllData,
  onImportAllData,
  onResetToDefault,
}) => {
  const [dailyHours, setDailyHours] = useState<number | ''>(Math.floor((goals.dailyMinutes || 0) / 60));
  const [dailyMinutes, setDailyMinutes] = useState<number | ''>((goals.dailyMinutes || 0) % 60);
  const [monthlyHours, setMonthlyHours] = useState<number | ''>(goals.monthlyHours || 0);
  const [weeklyHours, setWeeklyHours] = useState<number | ''>(goals.weeklyHours || 0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(goals.soundEnabled);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleClearAllGoals = () => {
    setDailyHours(0);
    setDailyMinutes(0);
    setMonthlyHours(0);
    setWeeklyHours(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dH = dailyHours === '' ? 0 : Math.max(0, Number(dailyHours));
    const dM = dailyMinutes === '' ? 0 : Math.max(0, Number(dailyMinutes));
    const mH = monthlyHours === '' ? 0 : Math.max(0, Number(monthlyHours));
    const wH = weeklyHours === '' ? 0 : Math.max(0, Number(weeklyHours));

    const totalDailyMins = dH * 60 + dM;
    onSaveGoals({
      dailyMinutes: totalDailyMins,
      monthlyHours: mH,
      weeklyHours: wH,
      soundEnabled,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportAllData(content);
      if (success) {
        setImportStatus('Dados restaurados com sucesso!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Arquivo inválido ou corrompido.');
        setTimeout(() => setImportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-sans text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-neutral-700" />
            <span>Configurações & Metas</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Quick button to clear all goals to zero */}
        <div className="mt-3 flex items-center justify-between bg-neutral-50 rounded-xl p-2.5 border border-neutral-200">
          <div className="text-xs text-neutral-600">
            <span className="font-semibold text-neutral-800 block">Deixar metas zeradas:</span>
            <span className="text-[11px] text-neutral-500">Zere os campos para inserir sua própria meta.</span>
          </div>
          <button
            type="button"
            onClick={handleClearAllGoals}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors shadow-2xs cursor-pointer"
          >
            <Eraser className="h-3.5 w-3.5 text-neutral-500" />
            <span>Zerar Tudo (0)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Daily Goal Settings */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Meta Diária de Estudo
              </label>
              <button
                type="button"
                onClick={() => {
                  setDailyHours(0);
                  setDailyMinutes(0);
                }}
                className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
              >
                Zerar Diária (0)
              </button>
            </div>
            <p className="text-xs text-neutral-500 mb-2">
              Quanto tempo você planeja estudar por dia. Insira suas horas e minutos desejados.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-600">Horas</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={dailyHours}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value;
                      setDailyHours(val === '' ? '' : Math.max(0, Number(val)));
                    }}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">h</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600">Minutos</label>
                <div className="relative mt-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="5"
                    value={dailyMinutes}
                    placeholder="0"
                    onChange={(e) => {
                      const val = e.target.value;
                      setDailyMinutes(val === '' ? '' : Math.max(0, Math.min(59, Number(val))));
                    }}
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                  <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">min</span>
                </div>
              </div>
            </div>

            {/* Quick shortcuts for daily */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setDailyHours(0);
                  setDailyMinutes(0);
                }}
                className="px-2 py-0.5 text-[11px] rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                0 min (zerado)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDailyHours(0);
                  setDailyMinutes(30);
                }}
                className="px-2 py-0.5 text-[11px] rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                30 min
              </button>
              <button
                type="button"
                onClick={() => {
                  setDailyHours(1);
                  setDailyMinutes(0);
                }}
                className="px-2 py-0.5 text-[11px] rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                1h
              </button>
              <button
                type="button"
                onClick={() => {
                  setDailyHours(2);
                  setDailyMinutes(0);
                }}
                className="px-2 py-0.5 text-[11px] rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                2h
              </button>
            </div>
          </div>

          {/* Monthly & Weekly Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Meta Mensal (h)
                </label>
                <button
                  type="button"
                  onClick={() => setMonthlyHours(0)}
                  className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                >
                  Zerar
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={monthlyHours}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setMonthlyHours(val === '' ? '' : Math.max(0, Number(val)));
                  }}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">horas</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Meta Semanal (h)
                </label>
                <button
                  type="button"
                  onClick={() => setWeeklyHours(0)}
                  className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                >
                  Zerar
                </button>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weeklyHours}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    setWeeklyHours(val === '' ? '' : Math.max(0, Number(val)));
                  }}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
                <span className="absolute right-3 top-2 text-xs text-neutral-400 font-medium">horas</span>
              </div>
            </div>
          </div>

          {/* Sound Preferences */}
          <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 border border-neutral-200">
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <VolumeX className="h-5 w-5 text-neutral-400" />
              )}
              <div>
                <span className="text-xs font-semibold text-neutral-900 block">Sons do Cronômetro</span>
                <span className="text-[11px] text-neutral-500">Tocar sinal ao concluir o tempo de estudo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                soundEnabled ? 'bg-neutral-900' : 'bg-neutral-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Backup & Data Actions */}
          <div className="border-t border-neutral-100 pt-4 space-y-2">
            <span className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
              Backup e Dados
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <label className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                <span>Importar Backup</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja restaurar as configurações padrão (com metas zeradas)?')) {
                    onResetToDefault();
                    handleClearAllGoals();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Padrão (Zerado)</span>
              </button>
            </div>
            {importStatus && (
              <p className="text-xs font-semibold text-emerald-600">{importStatus}</p>
            )}
          </div>

          {/* Submit Actions */}
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
              Salvar Metas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
