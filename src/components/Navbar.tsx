import React from 'react';
import { ActiveTab } from '../types';
import {
  Settings,
  Flame,
  Calendar,
  Clock,
  CalendarCheck,
  BarChart3,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakCount: number;
  points?: number;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  streakCount,
  onOpenSettings,
}) => {
  const navItems: { id: ActiveTab; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'calendar',
      label: 'Calendário',
      mobileLabel: 'Calendário',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'timer',
      label: 'Cronômetro',
      mobileLabel: 'Tempo',
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: 'daily',
      label: 'Relatório Diário',
      mobileLabel: 'Diário',
      icon: <CalendarCheck className="h-5 w-5" />,
    },
    {
      id: 'monthly',
      label: 'Relatório Mensal',
      mobileLabel: 'Mensal',
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo / Title */}
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2 text-left font-sans text-lg sm:text-xl font-black tracking-tight text-neutral-900 transition-opacity hover:opacity-80 focus:outline-none"
          >
            <span>EstudoFlux</span>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-semibold transition-all rounded-xl focus-visible:outline-2 ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Actions & Settings */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              title="Sequência de dias estudados"
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 active:scale-95 whitespace-nowrap"
            >
              <Flame className="h-4 w-4 text-amber-600 fill-amber-500" />
              <span className="tabular-nums">{streakCount}</span>
              <span className="hidden sm:inline">dias</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Configurações & Metas"
              className="flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 active:scale-95"
              aria-label="Configurações de Metas"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile Top Segmented Bar (4 spacious columns) */}
        <div className="md:hidden border-t border-neutral-100 bg-neutral-50 px-2 py-2">
          <div className="grid grid-cols-4 gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white font-bold shadow-xs scale-102'
                      : 'bg-white text-neutral-600 border border-neutral-200 font-semibold active:bg-neutral-100'
                  }`}
                >
                  <div className="mb-1">{item.icon}</div>
                  <span className="text-xs leading-tight truncate w-full text-center">
                    {item.mobileLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Fixed Bottom Touch Navigation Bar for Mobile (4 spacious buttons) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-neutral-200 px-3 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all touch-manipulation ${
                  isActive
                    ? 'text-neutral-950 font-bold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div
                  className={`flex h-9 w-14 items-center justify-center rounded-xl transition-colors mb-1 ${
                    isActive ? 'bg-neutral-950 text-white shadow-xs' : 'text-neutral-600'
                  }`}
                >
                  {item.icon}
                </div>
                <span className={`text-[11px] tracking-tight leading-none ${isActive ? 'font-black text-neutral-950' : 'font-medium'}`}>
                  {item.mobileLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
