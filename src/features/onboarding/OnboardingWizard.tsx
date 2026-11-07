import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { Language, StudyTimePreference } from '../../types';
import {
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  Target,
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { settings, updateSettings, setLanguage, subjects } = useStore();
  const lang = settings.language;

  const [step, setStep] = useState(1);
  const [name, setName] = useState(settings.name || '');
  const [dailyHours, setDailyHours] = useState(settings.dailyStudyGoalHours || 3);
  const [preferredTime, setPreferredTime] = useState<StudyTimePreference>(settings.preferredStudyTime || 'afternoon');

  const languages: { code: Language; label: string }[] = [
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  const handleFinish = () => {
    updateSettings({
      name: name.trim() || (lang === 'ar' ? 'طالب' : 'Student'),
      dailyStudyGoalHours: Number(dailyHours),
      preferredStudyTime: preferredTime,
      hasCompletedOnboarding: true,
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <Card className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#6C5CE7] to-[#00B894] flex items-center justify-center text-white">
              <Clock className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base text-slate-900 dark:text-white">
              {lang === 'ar' ? 'وقتي' : 'Waqti'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-7 h-1.5 rounded-full transition-all ${
                  step === s
                    ? 'bg-[#6C5CE7] w-10'
                    : step > s
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Welcome, Language, and Profile */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {translate(lang, 'onboarding.welcome')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translate(lang, 'onboarding.tagline')}
              </p>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {translate(lang, 'settings.language')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                      lang === l.code
                        ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300 ring-2 ring-[#6C5CE7]/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {translate(lang, 'settings.name')}
              </label>
              <input
                type="text"
                placeholder={translate(lang, 'onboarding.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Study Goals */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {translate(lang, 'onboarding.step2')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'ar'
                  ? 'حدد ساعات الدراسة المستهدفة وأوقاتك المفضلة لبناء خطتك المثالية'
                  : 'Set your target study hours to calibrate automated revision schedules'}
              </p>
            </div>

            {/* Daily Hours Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {translate(lang, 'onboarding.dailyGoalLabel')}
                </span>
                <span className="text-base font-extrabold text-[#6C5CE7]">
                  {dailyHours} {translate(lang, 'exams.hours')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-[#6C5CE7]"
              />
            </div>

            {/* Preferred Study Time */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                {translate(lang, 'onboarding.preferredTimeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['morning', 'afternoon', 'evening', 'night'] as const).map((pref) => {
                  const isSelected = preferredTime === pref;
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setPreferredTime(pref)}
                      className={`p-3 rounded-xl border text-xs font-semibold text-start transition-all ${
                        isSelected
                          ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300 ring-1 ring-[#6C5CE7]'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {translate(lang, `onboarding.${pref}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Subjects Preview */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {translate(lang, 'onboarding.step3')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {translate(lang, 'onboarding.subjectsIntro')}
              </p>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pe-1">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  style={{ borderInlineStartColor: sub.color, borderInlineStartWidth: '4px' }}
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{sub.name}</h4>
                    <p className="text-xs text-slate-400">{sub.code} • {sub.teacher || 'Prof'}</p>
                  </div>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4 rtl-flip" />}
              onClick={() => setStep(step - 1)}
            >
              {translate(lang, 'onboarding.back')}
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
            >
              {translate(lang, 'onboarding.skip')}
            </button>
          )}

          {step < 3 ? (
            <Button
              size="sm"
              icon={<ArrowRight className="w-4 h-4 rtl-flip" />}
              onClick={() => setStep(step + 1)}
            >
              {translate(lang, 'onboarding.next')}
            </Button>
          ) : (
            <Button
              size="sm"
              icon={<Check className="w-4 h-4" />}
              onClick={handleFinish}
            >
              {translate(lang, 'onboarding.startExploring')}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
