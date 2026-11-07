import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { translate, formatLocalizedDate, formatLocalizedTime } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { ProgressRing } from '../../components/ui/ProgressRing';
import { Chip } from '../../components/ui/Chip';
import { Button } from '../../components/ui/Button';
import {
  calculateDailyProgress,
  calculateStudyStreak,
  findFreeStudySlots,
  timeToMinutes,
} from '../../utils/plannerLogic';
import {
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  ArrowRight,
  BookOpen,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DashboardScreenProps {
  onOpenFreeSlots: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onOpenFreeSlots }) => {
  const {
    settings,
    subjects,
    classes,
    tasks,
    exams,
    studySessions,
    toggleTaskStatus,
    openQuickAdd,
    setActiveTab,
  } = useStore();

  const lang = settings.language;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const currentDayOfWeek = today.getDay(); // 0-6

  // Live timer for current minute
  const [nowMinute, setNowMinute] = useState(() => {
    return today.getHours() * 60 + today.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowMinute(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Streak & Progress calculations
  const streak = calculateStudyStreak(studySessions);
  const dailyProgress = calculateDailyProgress(tasks, todayStr);

  // Trigger celebratory confetti if user completes all daily tasks
  const handleToggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskStatus(taskId);
    if (dailyProgress.completed + 1 === dailyProgress.total && dailyProgress.total > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#6C5CE7', '#00B894', '#FDCB6E'],
        });
      } catch {
        // canvas-confetti fallback
      }
    }
  };

  // Classes for today
  const todayClasses = classes
    .filter((c) => c.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // Next upcoming class today
  const nextClass = todayClasses.find((c) => timeToMinutes(c.endTime) > nowMinute);
  const nextClassSubject = nextClass ? subjects.find((s) => s.id === nextClass.subjectId) : null;
  const minsUntilNext = nextClass ? timeToMinutes(nextClass.startTime) - nowMinute : null;

  // Next upcoming exam
  const upcomingExams = exams
    .map((exam) => {
      const examDate = new Date(exam.date);
      const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...exam, diffDays };
    })
    .filter((e) => e.diffDays >= 0)
    .sort((a, b) => a.diffDays - b.diffDays);

  // Time of day greeting
  const hour = today.getHours();
  const greetingKey =
    hour < 12 ? 'greetings.morning' : hour < 17 ? 'greetings.afternoon' : hour < 22 ? 'greetings.evening' : 'greetings.night';

  // Today study hours total
  const todayStudyMinutes = studySessions
    .filter((s) => s.date === todayStr && s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);
  const todayHoursStudied = (todayStudyMinutes / 60).toFixed(1);

  // Free slot recommendation
  const freeSlots = findFreeStudySlots(classes, currentDayOfWeek);
  const nextFreeSlot = freeSlots.find((s) => timeToMinutes(s.startTime) >= nowMinute);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header Greeting & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {translate(lang, greetingKey)}, {settings.name || 'Student'}! 👋
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span>{formatLocalizedDate(today, lang, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span className="italic">{translate(lang, 'greetings.motivation')}</span>
          </p>
        </div>

        {/* Streak & Study Goal Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 font-bold text-sm">
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500 animate-pulse" />
            <span>{translate(lang, 'greetings.streakDays', { count: streak })}</span>
          </div>

          <button
            onClick={() => setActiveTab('timer')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#6C5CE7] hover:bg-[#5b4bc4] text-white text-sm font-semibold shadow-sm transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span className="hidden sm:inline">{translate(lang, 'timer.start')}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Next Class / Live Countdown Card */}
        <Card
          className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/40 dark:from-slate-900 dark:to-indigo-950/20"
          highlightColor={nextClassSubject?.color || '#6C5CE7'}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6C5CE7] dark:text-indigo-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {translate(lang, 'greetings.nextClass')}
              </span>

              {nextClass && nextClassSubject ? (
                <div className="mt-2 space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {nextClassSubject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {nextClassSubject.code}
                    </span>
                    <span>•</span>
                    <span>{nextClass.room || 'Main Hall'}</span>
                    {nextClass.teacher && (
                      <>
                        <span>•</span>
                        <span>{nextClass.teacher}</span>
                      </>
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-2">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    {translate(lang, 'greetings.noMoreClassesToday')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {translate(lang, 'greetings.streakMotivation')}
                  </p>
                </div>
              )}
            </div>

            {/* Live Countdown Badge */}
            {nextClass && minsUntilNext !== null && (
              <div className="text-end shrink-0">
                <div className="inline-block px-3 py-1.5 rounded-xl bg-[#6C5CE7]/10 dark:bg-[#6C5CE7]/20 text-[#6C5CE7] dark:text-indigo-300 font-extrabold text-sm sm:text-base">
                  {minsUntilNext > 0
                    ? translate(lang, 'greetings.inMinutes', { mins: minsUntilNext })
                    : translate(lang, 'timetable.now')}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {formatLocalizedTime(nextClass.startTime, lang, settings.timeFormat === '12h')} -{' '}
                  {formatLocalizedTime(nextClass.endTime, lang, settings.timeFormat === '12h')}
                </p>
              </div>
            )}
          </div>

          {/* Quick Smart Study Recommendation Strip */}
          {nextFreeSlot && (
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium">
                <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
                <span>
                  {translate(lang, 'greetings.freeStudyRecommendation', {
                    duration: nextFreeSlot.durationMinutes,
                    time: nextFreeSlot.startTime,
                  })}
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenFreeSlots}
                className="text-xs text-[#6C5CE7] dark:text-indigo-400 hover:underline font-bold shrink-0"
              >
                {lang === 'ar' ? 'عرض الفترات' : 'View Slots'}
              </button>
            </div>
          )}
        </Card>

        {/* Daily Progress Ring Card */}
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {translate(lang, 'dashboard.todayProgress')}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {dailyProgress.percentage}%
            </span>
          </div>

          <ProgressRing progress={dailyProgress.percentage} size={116} strokeWidth={10} color="#00B894">
            <div className="space-y-0.5">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {dailyProgress.completed}/{dailyProgress.total}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                {lang === 'ar' ? 'مهام مكتملة' : 'tasks done'}
              </span>
            </div>
          </ProgressRing>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
            {dailyProgress.completed === dailyProgress.total && dailyProgress.total > 0
              ? translate(lang, 'dashboard.allDone')
              : translate(lang, 'dashboard.hoursStudied', {
                  studied: todayHoursStudied,
                  goal: settings.dailyStudyGoalHours,
                })}
          </p>
        </Card>
      </div>

      {/* 3. Upcoming Deadlines & Exams Strip */}
      {upcomingExams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{translate(lang, 'dashboard.upcomingDeadlines')}</span>
            </h3>
            <button
              onClick={() => setActiveTab('exams')}
              className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'جميع الاختبارات' : 'All Exams'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingExams.slice(0, 3).map((exam) => {
              const sub = subjects.find((s) => s.id === exam.subjectId);
              const daysLeft = exam.diffDays;
              const isUrgent = daysLeft <= 3;

              return (
                <div
                  key={exam.id}
                  onClick={() => setActiveTab('exams')}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs hover:border-[#6C5CE7] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: sub?.color || '#6C5CE7' }}
                    >
                      {sub?.code.slice(0, 4) || 'EXAM'}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-[#6C5CE7] transition-colors">
                        {sub?.name || 'Exam'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {exam.date} • {exam.location}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 ${
                      isUrgent
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-indigo-500/10 text-[#6C5CE7] dark:text-indigo-400'
                    }`}
                  >
                    {daysLeft === 0
                      ? translate(lang, 'dashboard.today')
                      : daysLeft === 1
                      ? translate(lang, 'dashboard.tomorrow')
                      : translate(lang, 'dashboard.daysLeft', { count: daysLeft })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Two-Column Layout: Today's Timeline & Priority Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule Timeline */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#6C5CE7]" />
              <span>{translate(lang, 'dashboard.timeline')}</span>
            </h3>
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1"
            >
              <span>{translate(lang, 'timetable.title')}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </button>
          </div>

          {todayClasses.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Calendar className="w-10 h-10 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">{translate(lang, 'dashboard.noEventsToday')}</p>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => openQuickAdd('class')}
              >
                {translate(lang, 'timetable.addClass')}
              </Button>
            </div>
          ) : (
            <div className="relative ps-6 border-s-2 border-slate-200 dark:border-slate-800 space-y-5 my-2">
              {todayClasses.map((cls) => {
                const sub = subjects.find((s) => s.id === cls.subjectId);
                const isPast = timeToMinutes(cls.endTime) < nowMinute;
                const isCurrent =
                  timeToMinutes(cls.startTime) <= nowMinute && timeToMinutes(cls.endTime) >= nowMinute;

                return (
                  <div key={cls.id} className="relative group">
                    {/* Timeline Node Dot */}
                    <div
                      className={`absolute -start-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 transition-all ${
                        isCurrent
                          ? 'ring-4 ring-[#6C5CE7]/30 scale-125'
                          : isPast
                          ? 'opacity-50'
                          : ''
                      }`}
                      style={{ backgroundColor: sub?.color || '#6C5CE7' }}
                    />

                    <div
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-[#6C5CE7]/5 border-[#6C5CE7]/40 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60'
                      } ${isPast ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {sub?.name}
                          </span>
                          {sub?.code && (
                            <Chip label={sub.code} color={sub.color} size="sm" variant="subtle" />
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {formatLocalizedTime(cls.startTime, lang, settings.timeFormat === '12h')} -{' '}
                          {formatLocalizedTime(cls.endTime, lang, settings.timeFormat === '12h')}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        {cls.room && <span>📍 {cls.room}</span>}
                        {cls.teacher && <span>👤 {cls.teacher}</span>}
                        {isCurrent && (
                          <span className="ms-auto text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7] bg-[#6C5CE7]/10 px-2 py-0.5 rounded-md">
                            {translate(lang, 'timetable.now')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Priority Tasks Checklist */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B894]" />
              <span>{translate(lang, 'nav.tasks')}</span>
            </h3>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl-flip" />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => {
              const sub = subjects.find((s) => s.id === task.subjectId);
              const isDone = task.status === 'done';

              return (
                <div
                  key={task.id}
                  onClick={(e) => handleToggleTask(task.id, e)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isDone
                      ? 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#6C5CE7]/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <button
                      type="button"
                      aria-label="Toggle task completion"
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                        isDone
                          ? 'bg-[#00B894] border-[#00B894] text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-[#6C5CE7]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4 fill-white text-white" />}
                    </button>

                    <div className="overflow-hidden">
                      <p
                        className={`text-sm font-semibold text-slate-800 dark:text-slate-100 truncate ${
                          isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span style={{ color: sub?.color || '#6C5CE7' }}>{sub?.name}</span>
                        {task.dueTime && <span>• {task.dueTime}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Chip
                      label={translate(lang, `tasks.priority.${task.priority}`)}
                      color={task.priority === 'high' ? '#E17055' : task.priority === 'medium' ? '#6C5CE7' : '#00B894'}
                      size="sm"
                      variant="subtle"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => openQuickAdd('task')}
            >
              {translate(lang, 'tasks.addTask')}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
