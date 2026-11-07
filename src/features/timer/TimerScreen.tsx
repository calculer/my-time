import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { soundEngine, sendNotification } from '../../utils/audio';
import { AmbientSoundType } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Coffee,
  Wind,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TimerScreen: React.FC = () => {
  const { subjects, tasks, settings, addStudySession, addToast } = useStore();
  const lang = settings.language;
  const pomodoro = settings.pomodoroSettings;

  // Mode: work | shortBreak | longBreak
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [isRunning, setIsRunning] = useState(false);

  // Linked subject and task
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Durations
  const getDurationSeconds = (m: 'work' | 'shortBreak' | 'longBreak') => {
    if (m === 'work') return pomodoro.workMinutes * 60;
    if (m === 'shortBreak') return pomodoro.shortBreakMinutes * 60;
    return pomodoro.longBreakMinutes * 60;
  };

  const [timeLeft, setTimeLeft] = useState(() => getDurationSeconds('work'));
  const [completedSessionsCount, setCompletedSessionsCount] = useState(0);

  // Ambient sound state
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState(0.5);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // Sync duration on mode change
  useEffect(() => {
    setTimeLeft(getDurationSeconds(mode));
    setIsRunning(false);
  }, [mode, pomodoro.workMinutes, pomodoro.shortBreakMinutes, pomodoro.longBreakMinutes]);

  // Handle ambient sound playback
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      soundEngine.setAmbient(ambientSound, volume);
    } else {
      soundEngine.stopAmbient();
    }
    return () => {
      soundEngine.stopAmbient();
    };
  }, [isRunning, ambientSound, volume]);

  // Timer interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode, selectedSubjectId, selectedTaskId]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    soundEngine.stopAmbient();

    if (mode === 'work') {
      // Log session
      addStudySession({
        subjectId: selectedSubjectId || (subjects[0]?.id ?? 'sub-1'),
        taskId: selectedTaskId || undefined,
        date: new Date().toISOString().slice(0, 10),
        durationMinutes: pomodoro.workMinutes,
        type: 'pomodoro',
        completed: true,
        timestamp: Date.now(),
      });

      // Play chime
      soundEngine.playChime('workComplete');

      // Send browser notification
      sendNotification(
        lang === 'ar' ? 'جلسة التركيز اكتملت! 🎯' : 'Focus Session Finished! 🎯',
        lang === 'ar' ? 'أحسنت! حان وقت استراحة قصيرة لتجديد طاقتك.' : 'Great job! Time for a well-deserved break.'
      );

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6C5CE7', '#00B894', '#FDCB6E'],
        });
      } catch {
        // Fallback
      }

      addToast(translate(lang, 'timer.sessionLogged'), 'success');

      const nextCount = completedSessionsCount + 1;
      setCompletedSessionsCount(nextCount);

      // Transition to break
      if (nextCount % pomodoro.longBreakInterval === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      soundEngine.playChime('breakComplete');
      sendNotification(
        lang === 'ar' ? 'انتهت الاستراحة! ⏰' : 'Break Finished! ⏰',
        lang === 'ar' ? 'هل أنت مستعد للجلسة القادمة؟' : 'Ready to start your next focus session?'
      );
      setMode('work');
    }
  };

  const handleTogglePlay = () => {
    if (!isRunning) {
      soundEngine.playChime('start');
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    soundEngine.stopAmbient();
    setTimeLeft(getDurationSeconds(mode));
  };

  const handleSkip = () => {
    setIsRunning(false);
    soundEngine.stopAmbient();
    if (mode === 'work') {
      setMode('shortBreak');
    } else {
      setMode('work');
    }
  };

  const handleAddFiveMins = () => {
    setTimeLeft((prev) => prev + 300);
  };

  // Percentage for progress ring
  const totalSeconds = getDurationSeconds(mode);
  const progressPercent = Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);

  // Minutes and seconds display
  const displayMins = Math.floor(timeLeft / 60);
  const displaySecs = timeLeft % 60;
  const formattedTime = `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;

  const modeColors = {
    work: selectedSubject?.color || '#6C5CE7',
    shortBreak: '#00B894',
    longBreak: '#0984E3',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {translate(lang, 'timer.title')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {lang === 'ar'
            ? 'جلسات تركيز عميقة تتخللها استراحات منتظمة لتعزيز الحفظ والفهم'
            : 'Deep work intervals with restorative breaks to maximize cognitive retention'}
        </p>
      </div>

      {/* 2. Mode Tabs */}
      <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl max-w-sm mx-auto">
        <button
          onClick={() => setMode('work')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'work'
              ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {translate(lang, 'timer.work')}
        </button>
        <button
          onClick={() => setMode('shortBreak')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'shortBreak'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {translate(lang, 'timer.shortBreak')}
        </button>
        <button
          onClick={() => setMode('longBreak')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'longBreak'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {translate(lang, 'timer.longBreak')}
        </button>
      </div>

      {/* 3. Main Circular Timer Card */}
      <Card className="flex flex-col items-center justify-center py-10 px-6 space-y-8 relative overflow-hidden">
        {/* Progress Ring with Large Countdown */}
        <div className="relative">
          <ProgressRing
            progress={progressPercent}
            size={270}
            strokeWidth={14}
            color={modeColors[mode]}
          >
            <div className="space-y-1 select-none">
              <span className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {formattedTime}
              </span>
              <span
                className="block text-xs font-bold uppercase tracking-wider"
                style={{ color: modeColors[mode] }}
              >
                {translate(lang, `timer.${mode}`)}
              </span>
            </div>
          </ProgressRing>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleReset}
            title={translate(lang, 'timer.reset')}
            className="p-3 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleTogglePlay}
            style={{ backgroundColor: modeColors[mode] }}
            className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-white" />
            ) : (
              <Play className="w-7 h-7 fill-white ms-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            title={translate(lang, 'timer.skip')}
            className="p-3 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <SkipForward className="w-5 h-5 rtl-flip" />
          </button>
        </div>

        {/* Quick +5 Min Extension */}
        <button
          type="button"
          onClick={handleAddFiveMins}
          className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تمديد 5 دقائق' : '+5 minutes'}</span>
        </button>
      </Card>

      {/* 4. Subject Link & Ambient Sound Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Link Session to Subject */}
        <Card className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            {translate(lang, 'timer.sessionLinked')}
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>

          {/* Optional Task Link */}
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="">{lang === 'ar' ? '— ربط بمهمة دراسية محددة (اختياري) —' : '— Link to task (optional) —'}</option>
            {tasks
              .filter((t) => t.status !== 'done')
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
          </select>
        </Card>

        {/* Ambient Sound Selector */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {translate(lang, 'timer.ambientSound')}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {translate(lang, `timer.sounds.${ambientSound}`)}
            </span>
          </div>

          {/* Ambient Sound Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'none' as const, label: translate(lang, 'timer.sounds.none'), icon: VolumeX },
              { id: 'rain' as const, label: translate(lang, 'timer.sounds.rain'), icon: CloudRain },
              { id: 'cafe' as const, label: translate(lang, 'timer.sounds.cafe'), icon: Coffee },
              { id: 'whitenoise' as const, label: translate(lang, 'timer.sounds.whitenoise'), icon: Wind },
            ].map((snd) => {
              const Icon = snd.icon;
              const isActive = ambientSound === snd.id;
              return (
                <button
                  key={snd.id}
                  onClick={() => setAmbientSound(snd.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                    isActive
                      ? 'border-[#6C5CE7] bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span className="truncate">{snd.label}</span>
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {ambientSound !== 'none' && (
            <div className="flex items-center gap-2 pt-1 text-slate-400">
              <Volume2 className="w-4 h-4 shrink-0" />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-[#6C5CE7]"
              />
            </div>
          )}
        </Card>
      </div>

      {/* Completed counter indicator */}
      <div className="text-center text-xs text-slate-400">
        <span>{translate(lang, 'timer.completedSessions')}: </span>
        <span className="font-bold text-slate-700 dark:text-slate-200">{completedSessionsCount}</span>
      </div>
    </div>
  );
};
