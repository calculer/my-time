import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate, formatLocalizedDate, formatLocalizedTime } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Chip } from '../../components/ui/Chip';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  GraduationCap,
  CalendarDays,
} from 'lucide-react';

export const CalendarScreen: React.FC = () => {
  const { classes, tasks, exams, subjects, settings, openQuickAdd, toggleTaskStatus } = useStore();
  const lang = settings.language;

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Navigation
  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().slice(0, 10));
  };

  // Days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days headers based on weekStartDay
  const baseDayNames = [
    { id: 0, label: translate(lang, 'settings.days.sunday') },
    { id: 1, label: translate(lang, 'settings.days.monday') },
    { id: 2, label: lang === 'ar' ? 'الثلاثاء' : lang === 'fr' ? 'Mardi' : 'Tuesday' },
    { id: 3, label: lang === 'ar' ? 'الأربعاء' : lang === 'fr' ? 'Mercredi' : 'Wednesday' },
    { id: 4, label: lang === 'ar' ? 'الخميس' : lang === 'fr' ? 'Jeudi' : 'Thursday' },
    { id: 5, label: lang === 'ar' ? 'الجمعة' : lang === 'fr' ? 'Vendredi' : 'Friday' },
    { id: 6, label: translate(lang, 'settings.days.saturday') },
  ];

  const orderedDayNames = React.useMemo(() => {
    const start = settings.weekStartDay;
    if (start === 1) return [...baseDayNames.slice(1), baseDayNames[0]];
    if (start === 6) return [baseDayNames[6], ...baseDayNames.slice(0, 6)];
    return baseDayNames;
  }, [settings.weekStartDay, lang]);

  // Calculate empty leading cells
  let leadingOffset = firstDayIndex - settings.weekStartDay;
  if (leadingOffset < 0) leadingOffset += 7;

  // Selected Day Items
  const selectedDateClasses = selectedDateStr
    ? classes.filter((c) => c.dayOfWeek === new Date(selectedDateStr).getDay())
    : [];
  const selectedDateTasks = selectedDateStr
    ? tasks.filter((t) => t.dueDate === selectedDateStr)
    : [];
  const selectedDateExams = selectedDateStr
    ? exams.filter((e) => e.date === selectedDateStr)
    : [];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate(lang, 'calendar.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {formatLocalizedDate(currentMonth, lang, { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            {translate(lang, 'calendar.today')}
          </Button>
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rtl-flip"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rtl-flip"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Month Calendar Card */}
      <Card className="p-3 sm:p-5">
        {/* Day name headers */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
          {orderedDayNames.map((d) => (
            <div key={d.id} className="py-1">
              {d.label.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-3">
          {/* Leading empty cells */}
          {Array.from({ length: leadingOffset }).map((_, idx) => (
            <div key={`lead-${idx}`} className="h-20 sm:h-24 opacity-0 pointer-events-none" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = dateObj.toISOString().slice(0, 10);
            const isToday =
              dateObj.getDate() === today.getDate() &&
              dateObj.getMonth() === today.getMonth() &&
              dateObj.getFullYear() === today.getFullYear();
            const isSelected = selectedDateStr === dateStr;

            // Items for this day
            const dayOfWeek = dateObj.getDay();
            const dayClasses = classes.filter((c) => c.dayOfWeek === dayOfWeek);
            const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
            const dayExams = exams.filter((e) => e.date === dateStr);

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#6C5CE7] bg-[#6C5CE7]/5 shadow-xs ring-2 ring-[#6C5CE7]/20'
                    : isToday
                    ? 'border-[#00B894] bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-[#00B894] text-white'
                        : isSelected
                        ? 'bg-[#6C5CE7] text-white'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayExams.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Exam scheduled" />
                  )}
                </div>

                {/* Dots indicator for items */}
                <div className="flex flex-wrap gap-1 mt-auto overflow-hidden max-h-6">
                  {dayClasses.slice(0, 3).map((cls) => {
                    const sub = subjects.find((s) => s.id === cls.subjectId);
                    return (
                      <span
                        key={cls.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: sub?.color || '#6C5CE7' }}
                      />
                    );
                  })}
                  {dayTasks.slice(0, 2).map((t) => (
                    <span
                      key={t.id}
                      className={`w-1.5 h-1.5 rounded-full ${t.status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 3. Selected Day Details BottomSheet / Modal */}
      {selectedDateStr && (
        <Modal
          isOpen={Boolean(selectedDateStr)}
          onClose={() => setSelectedDateStr(null)}
          title={translate(lang, 'calendar.itemsOnDay', {
            date: formatLocalizedDate(selectedDateStr, lang, { weekday: 'long', month: 'long', day: 'numeric' }),
          })}
        >
          <div className="space-y-4">
            {/* Quick add shortcut */}
            <div className="flex justify-end">
              <Button size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => openQuickAdd('task')}>
                {translate(lang, 'tasks.addTask')}
              </Button>
            </div>

            {/* Exams */}
            {selectedDateExams.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>{translate(lang, 'nav.exams')}</span>
                </h4>
                {selectedDateExams.map((exam) => {
                  const sub = subjects.find((s) => s.id === exam.subjectId);
                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{sub?.name}</p>
                        <p className="text-slate-500">{exam.time} • {exam.location}</p>
                      </div>
                      <span className="font-bold text-rose-600 uppercase">EXAM</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Classes */}
            {selectedDateClasses.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#6C5CE7] uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  <span>{translate(lang, 'nav.timetable')}</span>
                </h4>
                {selectedDateClasses.map((cls) => {
                  const sub = subjects.find((s) => s.id === cls.subjectId);
                  return (
                    <div
                      key={cls.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub?.color || '#6C5CE7' }} />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{sub?.name}</p>
                          <p className="text-slate-400">{cls.room || 'No Room'}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {cls.startTime} - {cls.endTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tasks */}
            {selectedDateTasks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{translate(lang, 'nav.tasks')}</span>
                </h4>
                {selectedDateTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleTaskStatus(t.id)}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${t.status === 'done' ? 'bg-[#00B894] border-[#00B894] text-white' : ''}`}>
                        {t.status === 'done' && '✓'}
                      </span>
                      <span className={t.status === 'done' ? 'line-through text-slate-400' : 'font-semibold'}>
                        {t.title}
                      </span>
                    </div>
                    <Chip label={t.priority} size="sm" color={t.priority === 'high' ? '#E17055' : '#6C5CE7'} />
                  </div>
                ))}
              </div>
            )}

            {selectedDateExams.length === 0 && selectedDateClasses.length === 0 && selectedDateTasks.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-6">
                {translate(lang, 'calendar.noItems')}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
