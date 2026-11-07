import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Chip } from '../../components/ui/Chip';
import { calculateStudyStreak } from '../../utils/plannerLogic';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export const StatsScreen: React.FC = () => {
  const { studySessions, subjects, tasks, achievements, settings } = useStore();
  const lang = settings.language;
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week');

  const streak = calculateStudyStreak(studySessions);

  // 1. Calculate Daily Study Hours for Bar Chart (Last 7 Days)
  const barChartData = React.useMemo(() => {
    const data: { day: string; hours: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'short',
      });

      const dayMins = studySessions
        .filter((s) => s.date === dateStr && s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      data.push({
        day: dayLabel,
        hours: parseFloat((dayMins / 60).toFixed(1)),
      });
    }
    return data;
  }, [studySessions, lang]);

  // 2. Study Time Distribution by Subject (Donut Chart)
  const pieChartData = React.useMemo(() => {
    const subjectMins: Record<string, number> = {};
    for (const session of studySessions) {
      if (!session.completed) continue;
      subjectMins[session.subjectId] = (subjectMins[session.subjectId] || 0) + session.durationMinutes;
    }

    return Object.entries(subjectMins).map(([subId, mins]) => {
      const sub = subjects.find((s) => s.id === subId);
      return {
        name: sub?.name || 'Other',
        value: parseFloat((mins / 60).toFixed(1)),
        color: sub?.color || '#6C5CE7',
      };
    });
  }, [studySessions, subjects]);

  // 3. Consistency Heatmap (Last 28 Days)
  const heatmapDays = React.useMemo(() => {
    const days: { date: string; hours: number; intensity: number }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const mins = studySessions
        .filter((s) => s.date === dateStr && s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      const hours = mins / 60;
      let intensity = 0;
      if (hours > 0 && hours < 1) intensity = 1;
      else if (hours >= 1 && hours < 2.5) intensity = 2;
      else if (hours >= 2.5) intensity = 3;

      days.push({ date: dateStr, hours, intensity });
    }
    return days;
  }, [studySessions]);

  // Total metrics
  const totalMinutesStudied = studySessions.reduce((acc, s) => acc + (s.completed ? s.durationMinutes : 0), 0);
  const totalHours = (totalMinutesStudied / 60).toFixed(1);
  const completedTasksCount = tasks.filter((t) => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 100;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate(lang, 'stats.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'ar'
              ? 'متابعة دقيقة لساعات المذاكرة، الإنجازات، واستمرارية الجهد الأكاديمي'
              : 'Track cumulative study hours, cognitive focus patterns, and unlockable achievements'}
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {(['day', 'week', 'month'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === t
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {translate(lang, `stats.${t}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics 4-Card Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hours */}
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#6C5CE7]" />
            {translate(lang, 'stats.totalHours')}
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {totalHours}h
          </p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            +18% {translate(lang, 'stats.versusLastWeek')}
          </span>
        </Card>

        {/* Current Streak */}
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            {translate(lang, 'stats.consistency')}
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {streak} {translate(lang, 'exams.days')}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            {translate(lang, 'greetings.streakMotivation')}
          </span>
        </Card>

        {/* Task Completion Rate */}
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            {translate(lang, 'stats.completionRate')}
          </span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {taskCompletionRate}%
          </p>
          <span className="text-[11px] text-slate-400">
            {completedTasksCount} / {tasks.length} tasks
          </span>
        </Card>

        {/* Peak Study Time */}
        <Card className="space-y-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {translate(lang, 'stats.bestHours')}
          </span>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
            {settings.preferredStudyTime === 'morning'
              ? '08:00 - 12:00'
              : settings.preferredStudyTime === 'afternoon'
              ? '13:00 - 17:00'
              : '18:00 - 22:00'}
          </p>
          <span className="text-[11px] text-slate-400">
            {translate(lang, `onboarding.${settings.preferredStudyTime}`)}
          </span>
        </Card>
      </div>

      {/* 3. Charts Row: Study Time Bar Chart + Subject Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Bar Chart */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#6C5CE7]" />
              <span>{translate(lang, 'stats.studyTime')} ({translate(lang, 'exams.hours')})</span>
            </h3>
            <span className="text-xs text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(108, 92, 231, 0.08)' }}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} hrs`, translate(lang, 'stats.studyTime')]}
                />
                <Bar dataKey="hours" fill="#6C5CE7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Subject Donut Chart */}
        <Card className="space-y-4">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              {translate(lang, 'stats.bySubject')}
            </h3>
          </div>

          {pieChartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              No sessions logged yet
            </div>
          ) : (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} hrs`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Subject legend pills */}
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {pieChartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-bold text-slate-500 shrink-0">{item.value}h</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Consistency Heatmap (28 Days) */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-1">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            {translate(lang, 'stats.consistency')} (Last 4 Weeks)
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800" />
            <span className="w-3 h-3 rounded-xs bg-[#6C5CE7]/30" />
            <span className="w-3 h-3 rounded-xs bg-[#6C5CE7]/70" />
            <span className="w-3 h-3 rounded-xs bg-[#6C5CE7]" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-2">
          {heatmapDays.map((d, idx) => {
            const bgClass =
              d.intensity === 0
                ? 'bg-slate-100 dark:bg-slate-800'
                : d.intensity === 1
                ? 'bg-[#6C5CE7]/30'
                : d.intensity === 2
                ? 'bg-[#6C5CE7]/70'
                : 'bg-[#6C5CE7]';

            return (
              <div
                key={idx}
                title={`${d.date}: ${d.hours.toFixed(1)} hrs`}
                className={`h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer flex items-center justify-center text-[10px] font-bold ${bgClass} ${
                  d.intensity >= 2 ? 'text-white' : 'text-slate-500'
                }`}
              >
                {d.hours > 0 ? d.hours.toFixed(0) : ''}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 5. Achievements & Badges */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>{translate(lang, 'stats.achievements')}</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} {translate(lang, 'stats.unlocked')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                item.unlocked
                  ? 'bg-gradient-to-tr from-amber-500/5 to-amber-500/10 border-amber-500/30 dark:border-amber-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="text-2xl p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs shrink-0 select-none">
                {item.icon}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.titleKey}
                  </h4>
                  {item.unlocked ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-md">
                      ✓
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {item.descKey}
                </p>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.round((item.progress / item.maxProgress) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
