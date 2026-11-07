import React from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Timer,
  Calendar,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';
import { calculateStudyStreak } from '../../utils/plannerLogic';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, settings, studySessions } = useStore();
  const lang = settings.language;
  const streak = calculateStudyStreak(studySessions);

  const navItems = [
    { id: 'dashboard', label: translate(lang, 'nav.dashboard'), icon: LayoutDashboard },
    { id: 'timetable', label: translate(lang, 'nav.timetable'), icon: CalendarDays },
    { id: 'tasks', label: translate(lang, 'nav.tasks'), icon: CheckSquare },
    { id: 'exams', label: translate(lang, 'nav.exams'), icon: GraduationCap },
    { id: 'timer', label: translate(lang, 'nav.timer'), icon: Timer },
    { id: 'calendar', label: translate(lang, 'nav.calendar'), icon: Calendar },
    { id: 'stats', label: translate(lang, 'nav.stats'), icon: BarChart3 },
    { id: 'settings', label: translate(lang, 'nav.settings'), icon: Settings },
  ] as const;

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-e border-slate-200/80 dark:border-slate-800/80 p-4 justify-between h-[calc(100vh-61px)] sticky top-[61px] transition-colors duration-200">
      <div className="space-y-6">
        {/* User Mini Profile & Streak Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl select-none" role="img" aria-label="avatar">
              {settings.avatar || '🎓'}
            </span>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                {settings.name || 'Student'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {settings.dailyStudyGoalHours}h {translate(lang, 'dashboard.studyGoal')}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0"
            title={`${streak} days streak`}
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{streak}</span>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#6C5CE7] text-white shadow-sm shadow-[#6C5CE7]/30 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer shortcut helper */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 dark:text-slate-500">
        <p className="leading-relaxed">{translate(lang, 'common.keyboardShortcuts')}</p>
      </div>
    </aside>
  );
};
