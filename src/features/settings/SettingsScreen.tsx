import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Language, ThemeMode } from '../../types';
import {
  Settings as SettingsIcon,
  Globe,
  Palette,
  Calendar,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Smartphone,
  Info,
  Check,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    setLanguage,
    resetToDemoData,
    wipeData,
    exportJSON,
    importJSON,
    addToast,
  } = useStore();

  const lang = settings.language;

  // Local form states
  const [name, setName] = useState(settings.name);
  const [avatar, setAvatar] = useState(settings.avatar);

  // Modals
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [wipeConfirmOpen, setWipeConfirmOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);

  // PWA install event
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      addToast(
        lang === 'ar'
          ? 'التطبيق جاهز للتثبيت من قائمة المتصفح (Add to Home screen)'
          : 'App can be installed via your browser menu (Add to Home Screen)',
        'info'
      );
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ name, avatar });
    addToast(lang === 'ar' ? 'تم حفظ التغييرات' : 'Settings saved', 'success');
  };

  const handleExport = () => {
    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `waqti_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(lang === 'ar' ? 'تم تنزيل النسخة الاحتياطية' : 'Backup downloaded', 'success');
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = importJSON(importJsonText);
    if (success) {
      addToast(lang === 'ar' ? 'تم استيراد البيانات بنجاح' : 'Data imported successfully', 'success');
      setImportModalOpen(false);
      setImportJsonText('');
    } else {
      addToast(lang === 'ar' ? 'ملف JSON غير صالح' : 'Invalid JSON data', 'error');
    }
  };

  const handleResetData = () => {
    resetToDemoData();
    setResetConfirmOpen(false);
    addToast(lang === 'ar' ? 'تمت استعادة البيانات التجريبية' : 'Restored demo data', 'success');
  };

  const handleWipeData = () => {
    wipeData();
    setWipeConfirmOpen(false);
    addToast(lang === 'ar' ? 'تم مسح كافة البيانات' : 'Wiped all data', 'info');
  };

  const emojis = ['🎓', '📚', '⚡', '💡', '🧠', '🚀', '🌟', '🎯', '🪐', '💻'];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {translate(lang, 'settings.title')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {lang === 'ar'
            ? 'تخصيص تجربة الاستخدام، تفضيلات الوقت، وإدارة البيانات'
            : 'Personalize your study experience, time defaults, and data backups'}
        </p>
      </div>

      {/* 2. Profile Customization */}
      <Card className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          {translate(lang, 'settings.profile')}
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {translate(lang, 'settings.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {translate(lang, 'settings.avatar')}
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {emojis.slice(0, 5).map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setAvatar(em)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform ${
                      avatar === em
                        ? 'bg-[#6C5CE7]/15 ring-2 ring-[#6C5CE7] scale-105'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="sm">
              {translate(lang, 'common.save')}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Localization & Preferences */}
      <Card className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          {translate(lang, 'settings.language')} & {translate(lang, 'settings.theme')}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>{translate(lang, 'settings.language')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'ar' as Language, label: 'العربية' },
                { code: 'fr' as Language, label: 'Français' },
                { code: 'en' as Language, label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                    lang === item.code
                      ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300 ring-1 ring-[#6C5CE7]'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#00B894]" />
              <span>{translate(lang, 'settings.theme')}</span>
            </label>
            <select
              value={settings.theme}
              onChange={(e) => {
                const mode = e.target.value as ThemeMode;
                updateSettings({ theme: mode });
                if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="system">{translate(lang, 'settings.themeOptions.system')}</option>
              <option value="light">{translate(lang, 'settings.themeOptions.light')}</option>
              <option value="dark">{translate(lang, 'settings.themeOptions.dark')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Week Start Day */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{translate(lang, 'settings.weekStart')}</span>
            </label>
            <select
              value={settings.weekStartDay}
              onChange={(e) => updateSettings({ weekStartDay: Number(e.target.value) as 0 | 1 | 6 })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value={1}>{translate(lang, 'settings.days.monday')}</option>
              <option value={0}>{translate(lang, 'settings.days.sunday')}</option>
              <option value={6}>{translate(lang, 'settings.days.saturday')}</option>
            </select>
          </div>

          {/* Time Format */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{translate(lang, 'settings.timeFormat')}</span>
            </label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSettings({ timeFormat: e.target.value as '12h' | '24h' })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="24h">{translate(lang, 'settings.24h')}</option>
              <option value="12h">{translate(lang, 'settings.12h')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* 4. Pomodoro Defaults */}
      <Card className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          {translate(lang, 'settings.pomodoroDefaults')}
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'settings.workDuration')}
            </label>
            <input
              type="number"
              min="10"
              max="90"
              value={settings.pomodoroSettings.workMinutes}
              onChange={(e) =>
                updateSettings({
                  pomodoroSettings: {
                    ...settings.pomodoroSettings,
                    workMinutes: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'settings.shortBreakDuration')}
            </label>
            <input
              type="number"
              min="2"
              max="30"
              value={settings.pomodoroSettings.shortBreakMinutes}
              onChange={(e) =>
                updateSettings({
                  pomodoroSettings: {
                    ...settings.pomodoroSettings,
                    shortBreakMinutes: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'settings.longBreakDuration')}
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.pomodoroSettings.longBreakMinutes}
              onChange={(e) =>
                updateSettings({
                  pomodoroSettings: {
                    ...settings.pomodoroSettings,
                    longBreakMinutes: Number(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </Card>

      {/* 5. PWA Install & Data Management */}
      <Card className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">
          {translate(lang, 'settings.dataManagement')} & PWA
        </h3>

        {/* Install PWA Button */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-[#6C5CE7]" />
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isInstalled ? translate(lang, 'settings.pwaInstalled') : translate(lang, 'settings.installPWA')}
              </p>
              <p className="text-xs text-slate-400">
                {lang === 'ar' ? 'تشغيل التطبيق أوفلاين كبرنامج مثبت على الجهاز' : 'Install for offline access and native feel'}
              </p>
            </div>
          </div>
          {!isInstalled && (
            <Button size="sm" onClick={handleInstallPWA}>
              {translate(lang, 'settings.installPWA')}
            </Button>
          )}
        </div>

        {/* Export / Import */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
          >
            {translate(lang, 'settings.exportJSON')}
          </Button>

          <Button
            variant="outline"
            icon={<Upload className="w-4 h-4" />}
            onClick={() => setImportModalOpen(true)}
          >
            {translate(lang, 'settings.importJSON')}
          </Button>
        </div>

        {/* Clear demo & Wipe actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={() => setResetConfirmOpen(true)}
          >
            {translate(lang, 'settings.clearDemo')}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-rose-500 hover:text-rose-600"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setWipeConfirmOpen(true)}
          >
            {translate(lang, 'settings.clearAll')}
          </Button>
        </div>
      </Card>

      {/* 6. About */}
      <div className="text-center text-xs text-slate-400 py-4 space-y-1">
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          {translate(lang, 'settings.about')} • {translate(lang, 'settings.version')}
        </p>
        <p className="text-[11px] text-slate-400">
          {lang === 'ar' ? 'صُمم خصيصاً للطلاب لمضاعفة الإنتاجية الأكاديمية' : 'Designed specifically for students to maximize academic performance'}
        </p>
      </div>

      {/* Import Modal */}
      {importModalOpen && (
        <Modal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          title={translate(lang, 'settings.importJSON')}
        >
          <form onSubmit={handleImportSubmit} className="space-y-4">
            <textarea
              rows={8}
              required
              placeholder="Paste JSON export contents here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setImportModalOpen(false)}>
                {translate(lang, 'common.cancel')}
              </Button>
              <Button type="submit">
                {translate(lang, 'settings.importJSON')}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <Modal
          isOpen={resetConfirmOpen}
          onClose={() => setResetConfirmOpen(false)}
          title={translate(lang, 'settings.clearDemo')}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lang === 'ar'
              ? 'هل ترغب في استعادة المواد والجدول والواجبات التجريبية الافتراضية؟'
              : 'Restore initial demo courses, timetable, homework tasks, and exams?'}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setResetConfirmOpen(false)}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button onClick={handleResetData}>
              {translate(lang, 'common.save')}
            </Button>
          </div>
        </Modal>
      )}

      {/* Wipe Confirmation Modal */}
      {wipeConfirmOpen && (
        <Modal
          isOpen={wipeConfirmOpen}
          onClose={() => setWipeConfirmOpen(false)}
          title={translate(lang, 'settings.clearAll')}
        >
          <p className="text-sm text-rose-600">
            {lang === 'ar'
              ? 'تحذير: سيتم مسح كافة البيانات بشكل لا رجعة فيه!'
              : 'Warning: This will permanently wipe all courses, timetable, and study data!'}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setWipeConfirmOpen(false)}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleWipeData}>
              {translate(lang, 'settings.clearAll')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
