import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  BarChart3,
  MoreHorizontal,
  Plus,
  GraduationCap,
  Timer,
  Calendar,
  Settings,
  X,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, openQuickAdd, settings } = useStore();
  const lang = settings.language;
  const [moreOpen, setMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: translate(lang, 'nav.dashboard'), icon: LayoutDashboard },
    { id: 'timetable', label: translate(lang, 'nav.timetable'), icon: CalendarDays },
    { id: 'tasks', label: translate(lang, 'nav.tasks'), icon: CheckSquare },
    { id: 'stats', label: translate(lang, 'nav.stats'), icon: BarChart3 },
  ] as const;

  const moreItems = [
    { id: 'exams', label: translate(lang, 'nav.exams'), icon: GraduationCap },
    { id: 'timer', label: translate(lang, 'nav.timer'), icon: Timer },
    { id: 'calendar', label: translate(lang, 'nav.calendar'), icon: Calendar },
    { id: 'settings', label: translate(lang, 'nav.settings'), icon: Settings },
  ] as const;

  const handleSelectMore = (id: typeof activeTab) => {
    setActiveTab(id);
    setMoreOpen(false);
  };

  const isMoreActive = ['exams', 'timer', 'calendar', 'settings'].includes(activeTab);

  return (
    <>
      {/* Mobile More Sheet Modal */}
      {moreOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center p-0"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 pb-24 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                {translate(lang, 'nav.more')}
              </h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMore(item.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                      active
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300'
                        : 'border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 glass-panel border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 transition-colors duration-200"
      >
        <div className="flex items-center justify-around relative">
          {/* First two items */}
          {mainTabs.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'text-[#6C5CE7] dark:text-indigo-400 font-bold'
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* Floating Center Quick-Add Button */}
          <div className="relative -top-4 flex items-center justify-center">
            <button
              type="button"
              onClick={() => openQuickAdd()}
              aria-label={translate(lang, 'app.quickAdd')}
              className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6C5CE7] to-[#00B894] text-white flex items-center justify-center shadow-lg shadow-[#6C5CE7]/40 hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Third main tab (Stats) */}
          {mainTabs.slice(2, 3).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
                  active
                    ? 'text-[#6C5CE7] dark:text-indigo-400 font-bold'
                    : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </button>
            );
          })}

          {/* More Menu Tab */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl transition-all cursor-pointer ${
              isMoreActive
                ? 'text-[#6C5CE7] dark:text-indigo-400 font-bold'
                : 'text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{translate(lang, 'nav.more')}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
