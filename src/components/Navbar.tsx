import React from 'react';
import { ActiveTab } from '../types';
import {
  Calendar,
  Clock,
  CalendarCheck,
  BarChart3,
  Settings,
  Music2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
}) => {
  const navItems: { id: ActiveTab; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
    {
      id: 'calendar',
      label: 'Calendário',
      mobileLabel: 'Calendário',
      icon: <Calendar className="h-5 w-5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'timer',
      label: 'Cronômetro',
      mobileLabel: 'Cronômetro',
      icon: <Clock className="h-5 w-5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'daily',
      label: 'Relatório Diário',
      mobileLabel: 'Diário',
      icon: <CalendarCheck className="h-5 w-5 sm:h-5 sm:w-5" />,
    },
    {
      id: 'monthly',
      label: 'Relatório Mensal',
      mobileLabel: 'Mensal',
      icon: <BarChart3 className="h-5 w-5 sm:h-5 sm:w-5" />,
    },
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Logo / Title */}
          <button
            onClick={() => setActiveTab('calendar')}
            className="flex items-center gap-2.5 text-left font-sans text-lg sm:text-xl font-black tracking-tight text-neutral-900 transition-opacity hover:opacity-85 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white shadow-xs">
              <Music2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">EstudoFlux</span>
              <span className="text-[10px] font-medium text-neutral-500 leading-none">Estudo Musical</span>
            </div>
          </button>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-xl cursor-pointer ${
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

          {/* Header Action: Only Settings (No points, No focus button, No rewards) */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              title="Configurações & Metas"
              className="flex items-center justify-center h-10 w-10 rounded-xl border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 cursor-pointer"
              aria-label="Configurações de Metas"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Subheader Navigation - Resized with large, highly visible buttons */}
        <div className="md:hidden border-t border-neutral-100 bg-neutral-50/90 px-2 py-2.5">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-97 ${
                    isActive
                      ? 'bg-neutral-900 text-white font-bold shadow-md ring-2 ring-neutral-900'
                      : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 font-semibold'
                  }`}
                >
                  <div className={`mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {item.icon}
                  </div>
                  <span className={`text-[11px] sm:text-xs leading-none tracking-tight truncate w-full text-center ${
                    isActive ? 'font-black text-white' : 'font-medium text-neutral-600'
                  }`}>
                    {item.mobileLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Bar - Extra comfortable thumb-level buttons for smartphone use */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-neutral-200/90 px-2 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4 gap-1.5 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-neutral-950 font-black'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <div
                  className={`flex h-9 w-full max-w-[64px] items-center justify-center rounded-xl transition-all mb-1 ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-sm scale-105'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {item.icon}
                </div>
                <span className={`text-[11px] leading-tight truncate text-center w-full ${
                  isActive ? 'font-black text-neutral-950' : 'font-medium text-neutral-500'
                }`}>
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
