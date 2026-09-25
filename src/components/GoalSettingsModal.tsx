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
  const [dailyHours, setDailyHours] = useState<number>(Math.floor(goals.dailyMinutes / 60));
  const [dailyMinutes, setDailyMinutes] = useState<number>(goals.dailyMinutes % 60);
  const [monthlyHours, setMonthlyHours] = useState<number>(goals.monthlyHours);
  const [weeklyHours, setWeeklyHours] = useState<number>(goals.weeklyHours || 12);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(goals.soundEnabled);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalDailyMins = dailyHours * 60 + dailyMinutes;
    onSaveGoals({
      dailyMinutes: Math.max(15, totalDailyMins),
      monthlyHours: Math.max(1, monthlyHours),
      weeklyHours: Math.max(1, weeklyHours),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl text-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="font-sans text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Settings className="h-5 w-5 text-neutral-700" />
            <span>Configurações & Metas</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Daily Goal Settings */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
              Meta Diária de Foco
            </label>
            <p className="text-xs text-neutral-500 mb-2">
              Quanto tempo você planeja estudar por dia para manter o ritmo e ganhar bônus de XP.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-neutral-600">Horas</label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-neutral-600">Minutos</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>
            </div>
          </div>

          {/* Monthly & Weekly Goals */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Meta Mensal (h)
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={monthlyHours}
                onChange={(e) => setMonthlyHours(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider mb-1">
                Meta Semanal (h)
              </label>
              <input
                type="number"
                min="1"
                max="80"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 tabular-nums font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
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
                <span className="text-xs font-semibold text-neutral-900 block">Sons & Chimes do Cronômetro</span>
                <span className="text-[11px] text-neutral-500">Tocar sinal ao concluir sessões de foco</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
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
                  if (confirm('Deseja restaurar os dados de exemplo padrão?')) {
                    onResetToDefault();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restaurar Padrão</span>
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
              className="rounded-lg px-3.5 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
