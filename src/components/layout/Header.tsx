import React from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Language, ThemeMode } from '../../types';
import {
  Clock,
  Search,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenFreeSlots: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenFreeSlots }) => {
  const { settings, setLanguage, updateSettings, openQuickAdd } = useStore();
  const lang = settings.language;

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const nextIdx = (modes.indexOf(settings.theme) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    updateSettings({ theme: nextMode });

    if (nextMode === 'dark' || (nextMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#00B894] flex items-center justify-center text-white shadow-sm shadow-[#6C5CE7]/30">
            <Clock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                {lang === 'ar' ? 'وقتي' : 'Waqti'}
              </h1>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-[#6C5CE7]/10 text-[#6C5CE7] dark:bg-[#6C5CE7]/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              {translate(lang, 'app.tagline')}
            </p>
          </div>
        </div>

        {/* Global Search Bar (desktop) or Search Button (mobile) */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 text-sm bg-slate-100/80 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 rounded-xl border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>{translate(lang, 'app.search')}</span>
            </div>
            <kbd className="hidden lg:inline-block text-[11px] font-semibold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              /
            </kbd>
          </button>
        </div>

        {/* Right Actions: Free slots finder, Theme toggle, Language switcher, Quick Add */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Free study slots finder button */}
          <button
            type="button"
            onClick={onOpenFreeSlots}
            aria-label="Find free study slots"
            title={translate(lang, 'app.freeSlots')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="hidden lg:inline">{translate(lang, 'app.freeSlots')}</span>
          </button>

          {/* Search Trigger for Mobile */}
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search"
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Theme Mode Cycle */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Current theme: ${settings.theme}. Click to switch`}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {settings.theme === 'light' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : settings.theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-400" />
            ) : (
              <Laptop className="w-5 h-5" />
            )}
          </button>

          {/* Flag-free Language Switcher */}
          <div className="relative inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {languages.map((item) => {
              const active = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            onClick={() => openQuickAdd()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-[#6C5CE7] hover:bg-[#5b4bc4] rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{translate(lang, 'app.quickAdd')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
