/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from './store/useStore';
import { applyLanguageToDOM } from './utils/i18n';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { FreeSlotsModal } from './components/modals/FreeSlotsModal';
import { SearchModal } from './components/modals/SearchModal';
import { ToastContainer } from './components/ui/ToastContainer';

// Feature screens
import { DashboardScreen } from './features/dashboard/DashboardScreen';
import { TimetableScreen } from './features/timetable/TimetableScreen';
import { TasksScreen } from './features/tasks/TasksScreen';
import { ExamsScreen } from './features/exams/ExamsScreen';
import { TimerScreen } from './features/timer/TimerScreen';
import { CalendarScreen } from './features/calendar/CalendarScreen';
import { StatsScreen } from './features/stats/StatsScreen';
import { SettingsScreen } from './features/settings/SettingsScreen';
import { OnboardingWizard } from './features/onboarding/OnboardingWizard';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    settings,
    openQuickAdd,
    updateSettings,
  } = useStore();

  const [searchOpen, setSearchOpen] = useState(false);
  const [freeSlotsOpen, setFreeSlotsOpen] = useState(false);

  // Check ?autostart=1 or onboarding completion
  const urlParams = new URLSearchParams(window.location.search);
  const isAutostart = urlParams.get('autostart') === '1';
  const [showOnboarding, setShowOnboarding] = useState(
    !isAutostart && !settings.hasCompletedOnboarding
  );

  // Apply language, direction and theme to DOM on mount
  useEffect(() => {
    applyLanguageToDOM(settings.language);

    // Apply theme
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.language, settings.theme]);

  // Global Keyboard Shortcuts (N = New, / = Search, T = Today)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '/' || e.key === 'Search') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openQuickAdd();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openQuickAdd, setActiveTab]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Global Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
        onOpenFreeSlots={() => setFreeSlotsOpen(true)}
      />

      {/* 2. Main Layout Shell */}
      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Tablet & Desktop Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Screen Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardScreen onOpenFreeSlots={() => setFreeSlotsOpen(true)} />
          )}
          {activeTab === 'timetable' && <TimetableScreen />}
          {activeTab === 'tasks' && <TasksScreen />}
          {activeTab === 'exams' && <ExamsScreen />}
          {activeTab === 'timer' && <TimerScreen />}
          {activeTab === 'calendar' && <CalendarScreen />}
          {activeTab === 'stats' && <StatsScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>
      </div>

      {/* 3. Mobile Bottom Tab Navigation */}
      <BottomNav />

      {/* 4. Global Modals & Sheets */}
      <QuickAddModal />
      <FreeSlotsModal
        isOpen={freeSlotsOpen}
        onClose={() => setFreeSlotsOpen(false)}
      />
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* 5. Toasts Container */}
      <ToastContainer />

      {/* 6. Onboarding Wizard if not completed */}
      {showOnboarding && (
        <OnboardingWizard
          onComplete={() => {
            setShowOnboarding(false);
            updateSettings({ hasCompletedOnboarding: true });
          }}
        />
      )}
    </div>
  );
}
