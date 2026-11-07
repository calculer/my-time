import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate, formatLocalizedTime } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  hasTimeConflict,
  findTimetableConflicts,
  timeToMinutes,
} from '../../utils/plannerLogic';
import { ClassSession } from '../../types';
import {
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Calendar,
  Grid,
  List,
  Clock,
  MapPin,
  User,
} from 'lucide-react';

export const TimetableScreen: React.FC = () => {
  const { classes, subjects, addClass, updateClass, deleteClass, settings, openQuickAdd, addToast } = useStore();
  const lang = settings.language;
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay());

  // Edit class modal state
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Time grid configuration: 08:00 to 19:00
  const startHour = 8;
  const endHour = 19;
  const totalHours = endHour - startHour;
  const hourHeight = 64; // pixels per hour in the week grid

  // Days order according to settings.weekStartDay (0 = Sun, 1 = Mon, 6 = Sat)
  const baseDays = [
    { id: 0, label: translate(lang, 'settings.days.sunday') },
    { id: 1, label: translate(lang, 'settings.days.monday') },
    { id: 2, label: lang === 'ar' ? 'الثلاثاء' : lang === 'fr' ? 'Mardi' : 'Tuesday' },
    { id: 3, label: lang === 'ar' ? 'الأربعاء' : lang === 'fr' ? 'Mercredi' : 'Wednesday' },
    { id: 4, label: lang === 'ar' ? 'الخميس' : lang === 'fr' ? 'Jeudi' : 'Thursday' },
    { id: 5, label: lang === 'ar' ? 'الجمعة' : lang === 'fr' ? 'Vendredi' : 'Friday' },
    { id: 6, label: translate(lang, 'settings.days.saturday') },
  ];

  // Re-order days based on weekStartDay
  const orderedDays = React.useMemo(() => {
    const start = settings.weekStartDay;
    if (start === 1) {
      return [...baseDays.slice(1), baseDays[0]];
    }
    if (start === 6) {
      return [baseDays[6], ...baseDays.slice(0, 6)];
    }
    return baseDays;
  }, [settings.weekStartDay, lang]);

  // Conflicts across the timetable
  const conflicts = findTimetableConflicts(classes);
  const conflictingIds = new Set(
    conflicts.flatMap((c) => [c.sessionAId, c.sessionBId])
  );

  // Current time position for "NOW" line
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nowOffsetPx = ((currentMinutes - startHour * 60) / 60) * hourHeight;
  const isNowInGrid = currentMinutes >= startHour * 60 && currentMinutes <= endHour * 60;

  // Handle Edit Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    updateClass(editingClass.id, {
      subjectId: editingClass.subjectId,
      dayOfWeek: Number(editingClass.dayOfWeek),
      startTime: editingClass.startTime,
      endTime: editingClass.endTime,
      room: editingClass.room,
      teacher: editingClass.teacher,
    });

    addToast(lang === 'ar' ? 'تم تحديث المحاضرة' : 'Class updated', 'success');
    setEditingClass(null);
  };

  const handleDelete = (id: string) => {
    deleteClass(id);
    setDeleteConfirmId(null);
    setEditingClass(null);
    addToast(lang === 'ar' ? 'تم حذف المحاضرة' : 'Class deleted', 'info');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate(lang, 'timetable.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {translate(lang, 'timetable.dragHint')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle Segment */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>{translate(lang, 'timetable.weekView')}</span>
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
              <span>{translate(lang, 'timetable.dayView')}</span>
            </button>
          </div>

          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openQuickAdd('class')}
          >
            {translate(lang, 'timetable.addClass')}
          </Button>
        </div>
      </div>

      {/* Conflict Alert Banner if any conflicts exist */}
      {conflicts.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">{translate(lang, 'timetable.conflictWarning')}</span>
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-0.5">
              {lang === 'ar'
                ? `يوجد ${conflicts.length} تداخل في جدولك الدراسي. انقر على المحاضرات المحددة بالأحمر لتعديل توقيتها.`
                : `${conflicts.length} overlapping classes found. Click red-bordered blocks to adjust their time.`}
            </p>
          </div>
        </div>
      )}

      {/* 2. WEEKLY TIMETABLE GRID VIEW */}
      {viewMode === 'week' ? (
        <Card className="p-0 sm:p-2 overflow-x-auto shadow-sm">
          <div className="min-w-[800px] select-none">
            {/* Weekday Column Headers */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 text-center text-xs font-bold py-3 bg-slate-50 dark:bg-slate-900/60 rounded-t-xl">
              <div className="text-slate-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              {orderedDays.map((d) => {
                const isToday = d.id === now.getDay();
                return (
                  <div
                    key={d.id}
                    className={`px-2 py-1 rounded-lg ${
                      isToday
                        ? 'bg-[#6C5CE7]/10 text-[#6C5CE7] dark:bg-[#6C5CE7]/20 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{d.label}</span>
                    {isToday && (
                      <span className="block text-[10px] uppercase font-bold text-[#6C5CE7]">
                        {translate(lang, 'dashboard.today')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Grid with Background Grid Lines */}
            <div
              className="relative grid grid-cols-8"
              style={{ height: totalHours * hourHeight }}
            >
              {/* NOW Indicator Line across the current time */}
              {isNowInGrid && (
                <div
                  className="absolute inset-x-0 z-20 pointer-events-none flex items-center"
                  style={{ top: `${nowOffsetPx}px` }}
                >
                  <div className="w-12 text-center text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded-sm">
                    {translate(lang, 'timetable.now')}
                  </div>
                  <div className="flex-1 h-0.5 bg-rose-500/80 dashed shadow-xs" />
                </div>
              )}

              {/* Time Scale Column (Y-Axis) */}
              <div className="border-e border-slate-200/80 dark:border-slate-800 relative">
                {Array.from({ length: totalHours }).map((_, idx) => {
                  const hour = startHour + idx;
                  const timeLabel = formatLocalizedTime(
                    `${hour.toString().padStart(2, '0')}:00`,
                    lang,
                    settings.timeFormat === '12h'
                  );
                  return (
                    <div
                      key={hour}
                      className="absolute inset-x-0 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 -top-2.5"
                      style={{ top: `${idx * hourHeight}px` }}
                    >
                      {timeLabel}
                    </div>
                  );
                })}
              </div>

              {/* 7 Days Columns */}
              {orderedDays.map((day) => {
                const dayClasses = classes.filter((c) => c.dayOfWeek === day.id);

                return (
                  <div
                    key={day.id}
                    className="relative border-e border-slate-200/80 dark:border-slate-800 last:border-e-0"
                  >
                    {/* Horizontal hour grid guidelines */}
                    {Array.from({ length: totalHours }).map((_, idx) => (
                      <div
                        key={idx}
                        className="absolute inset-x-0 border-t border-slate-100 dark:border-slate-800/60 pointer-events-none"
                        style={{ top: `${idx * hourHeight}px` }}
                      />
                    ))}

                    {/* Class Blocks */}
                    {dayClasses.map((cls) => {
                      const sub = subjects.find((s) => s.id === cls.subjectId);
                      const startMins = timeToMinutes(cls.startTime);
                      const endMins = timeToMinutes(cls.endTime);
                      const topPx = ((startMins - startHour * 60) / 60) * hourHeight;
                      const durationMins = endMins - startMins;
                      const heightPx = Math.max((durationMins / 60) * hourHeight, 36);
                      const hasConflict = conflictingIds.has(cls.id);

                      return (
                        <div
                          key={cls.id}
                          onClick={() => setEditingClass(cls)}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            backgroundColor: `${sub?.color || '#6C5CE7'}18`,
                            borderColor: hasConflict ? '#E84118' : sub?.color || '#6C5CE7',
                          }}
                          className={`absolute inset-x-1 z-10 rounded-xl border-l-4 p-2 transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.02] flex flex-col justify-between overflow-hidden group ${
                            hasConflict ? 'ring-2 ring-rose-500 ring-offset-1' : ''
                          }`}
                        >
                          <div>
                            <p
                              className="text-xs font-bold leading-tight truncate"
                              style={{ color: sub?.color || '#6C5CE7' }}
                            >
                              {sub?.name || 'Class'}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {cls.room || sub?.code}
                            </p>
                          </div>
                          <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 mt-auto">
                            {cls.startTime} - {cls.endTime}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        /* 3. DAY LIST VIEW */
        <div className="space-y-4">
          {/* Day Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {orderedDays.map((d) => {
              const isSelected = selectedDay === d.id;
              const count = classes.filter((c) => c.dayOfWeek === d.id).length;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDay(d.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#6C5CE7] text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{d.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Classes for selected day */}
          <div className="space-y-3">
            {classes
              .filter((c) => c.dayOfWeek === selectedDay)
              .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)).length === 0 ? (
              <Card className="text-center py-12 text-slate-400 space-y-3">
                <Calendar className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">{translate(lang, 'timetable.noClassesOnDay')}</p>
                <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => openQuickAdd('class')}>
                  {translate(lang, 'timetable.addClass')}
                </Button>
              </Card>
            ) : (
              classes
                .filter((c) => c.dayOfWeek === selectedDay)
                .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
                .map((cls) => {
                  const sub = subjects.find((s) => s.id === cls.subjectId);
                  const hasConflict = conflictingIds.has(cls.id);

                  return (
                    <Card
                      key={cls.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      highlightColor={sub?.color || '#6C5CE7'}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {sub?.name}
                          </h4>
                          <span
                            className="text-xs px-2 py-0.5 rounded-md font-semibold"
                            style={{ backgroundColor: `${sub?.color || '#6C5CE7'}20`, color: sub?.color || '#6C5CE7' }}
                          >
                            {sub?.code}
                          </span>
                          {hasConflict && (
                            <span className="text-xs px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 font-bold">
                              {translate(lang, 'timetable.conflictWarning')}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5" />
                            {formatLocalizedTime(cls.startTime, lang, settings.timeFormat === '12h')} -{' '}
                            {formatLocalizedTime(cls.endTime, lang, settings.timeFormat === '12h')}
                          </span>
                          {cls.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {cls.room}
                            </span>
                          )}
                          {cls.teacher && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {cls.teacher}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit2 className="w-4 h-4" />}
                          onClick={() => setEditingClass(cls)}
                        >
                          {translate(lang, 'common.edit')}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-rose-500 hover:text-rose-600"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => setDeleteConfirmId(cls.id)}
                        >
                          {translate(lang, 'common.delete')}
                        </Button>
                      </div>
                    </Card>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* 4. EDIT CLASS MODAL */}
      {editingClass && (
        <Modal
          isOpen={Boolean(editingClass)}
          onClose={() => setEditingClass(null)}
          title={translate(lang, 'timetable.editClass')}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.subject')}
              </label>
              <select
                value={editingClass.subjectId}
                onChange={(e) => setEditingClass({ ...editingClass, subjectId: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'اليوم' : 'Day'}
                </label>
                <select
                  value={editingClass.dayOfWeek}
                  onChange={(e) => setEditingClass({ ...editingClass, dayOfWeek: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {baseDays.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'البدء' : 'Start'}
                </label>
                <input
                  type="time"
                  required
                  value={editingClass.startTime}
                  onChange={(e) => setEditingClass({ ...editingClass, startTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'ar' ? 'الانتهاء' : 'End'}
                </label>
                <input
                  type="time"
                  required
                  value={editingClass.endTime}
                  onChange={(e) => setEditingClass({ ...editingClass, endTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'timetable.room')}
                </label>
                <input
                  type="text"
                  value={editingClass.room || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, room: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'timetable.teacher')}
                </label>
                <input
                  type="text"
                  value={editingClass.teacher || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, teacher: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDelete(editingClass.id)}
              >
                {translate(lang, 'common.delete')}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingClass(null)}>
                  {translate(lang, 'common.cancel')}
                </Button>
                <Button type="submit" size="sm">
                  {translate(lang, 'common.save')}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title={translate(lang, 'common.confirmDelete')}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lang === 'ar'
              ? 'هل أنت متأكد من حذف هذه المحاضرة من جدولك الدراسي؟'
              : 'Are you sure you want to remove this class from your timetable?'}
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button variant="danger" onClick={() => handleDelete(deleteConfirmId)}>
              {translate(lang, 'common.delete')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
