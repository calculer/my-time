import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ColorPicker } from '../ui/ColorPicker';
import { hasTimeConflict } from '../../utils/plannerLogic';
import { AlertCircle, Plus, CalendarDays, CheckSquare, GraduationCap, Timer } from 'lucide-react';
import { Priority, TaskStatus } from '../../types';

export const QuickAddModal: React.FC = () => {
  const {
    quickAddOpen,
    closeQuickAdd,
    quickAddDefaultType,
    subjects,
    addSubject,
    classes,
    addClass,
    addTask,
    addExam,
    addStudySession,
    settings,
    addToast,
    setActiveTab,
  } = useStore();

  const lang = settings.language;
  const [activeTab, setActiveTabType] = useState<'class' | 'task' | 'exam' | 'session'>('task');

  useEffect(() => {
    if (quickAddDefaultType) {
      setActiveTabType(quickAddDefaultType);
    }
  }, [quickAddDefaultType, quickAddOpen]);

  // Form states
  // 1. Class
  const [classSubjectId, setClassSubjectId] = useState(subjects[0]?.id || '');
  const [classDay, setClassDay] = useState(1); // Monday
  const [classStart, setClassStart] = useState('09:00');
  const [classEnd, setClassEnd] = useState('10:30');
  const [classRoom, setClassRoom] = useState('');
  const [classTeacher, setClassTeacher] = useState('');

  // 2. Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubjectId, setTaskSubjectId] = useState(subjects[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [taskDueTime, setTaskDueTime] = useState('18:00');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDuration, setTaskDuration] = useState(45);
  const [subtasksInput, setSubtasksInput] = useState('');

  // 3. Exam
  const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [examTime, setExamTime] = useState('09:00');
  const [examLocation, setExamLocation] = useState('');
  const [examTopicsInput, setExamTopicsInput] = useState('');
  const [examTargetGrade, setExamTargetGrade] = useState('A');

  // 4. New Subject Modal state
  const [isAddingNewSubject, setIsAddingNewSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubColor, setNewSubColor] = useState('#6C5CE7');

  // Conflict detection for class
  const classConflict = classes.some((c) =>
    hasTimeConflict(
      { dayOfWeek: classDay, startTime: classStart, endTime: classEnd },
      c
    )
  );

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    const created = addSubject({
      name: newSubName.trim(),
      code: newSubCode.trim() || newSubName.slice(0, 4).toUpperCase(),
      color: newSubColor,
    });
    setClassSubjectId(created.id);
    setTaskSubjectId(created.id);
    setExamSubjectId(created.id);
    setIsAddingNewSubject(false);
    setNewSubName('');
    setNewSubCode('');
    addToast(lang === 'ar' ? 'تمت إضافة المادة بنجاح' : 'Subject created successfully', 'success');
  };

  const handleSubmitClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classSubjectId) {
      addToast(lang === 'ar' ? 'يرجى اختيار مادة' : 'Please select a subject', 'warning');
      return;
    }
    addClass({
      subjectId: classSubjectId,
      dayOfWeek: Number(classDay),
      startTime: classStart,
      endTime: classEnd,
      room: classRoom,
      teacher: classTeacher,
      recurrence: 'weekly',
    });
    addToast(lang === 'ar' ? 'تمت إضافة المحاضرة للجدول' : 'Class added to timetable', 'success');
    closeQuickAdd();
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskSubjectId) {
      addToast(lang === 'ar' ? 'يرجى إدخال عنوان المهمة واختيار المادة' : 'Please enter title and select subject', 'warning');
      return;
    }

    const subtasks = subtasksInput
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, i) => ({ id: `st-${Date.now()}-${i}`, title, completed: false }));

    addTask({
      title: taskTitle.trim(),
      subjectId: taskSubjectId,
      dueDate: taskDueDate,
      dueTime: taskDueTime,
      priority: taskPriority,
      status: 'todo' as TaskStatus,
      estimatedMinutes: Number(taskDuration),
      subtasks,
      notes: '',
    });

    addToast(lang === 'ar' ? 'تمت إضافة المهمة الدراسية' : 'Study task added', 'success');
    closeQuickAdd();
  };

  const handleSubmitExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examSubjectId) return;

    const topics = examTopicsInput
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    addExam({
      subjectId: examSubjectId,
      date: examDate,
      time: examTime,
      location: examLocation,
      topics,
      targetGrade: examTargetGrade,
      priority: 'high',
    });

    addToast(lang === 'ar' ? 'تمت إضافة الاختبار بنجاح' : 'Exam added successfully', 'success');
    closeQuickAdd();
  };

  const handleStartQuickSession = () => {
    if (!taskSubjectId && subjects[0]) {
      setClassSubjectId(subjects[0].id);
    }
    closeQuickAdd();
    setActiveTab('timer');
  };

  const weekDays = [
    { id: 0, label: translate(lang, 'settings.days.sunday') },
    { id: 1, label: translate(lang, 'settings.days.monday') },
    { id: 2, label: lang === 'ar' ? 'الثلاثاء' : lang === 'fr' ? 'Mardi' : 'Tuesday' },
    { id: 3, label: lang === 'ar' ? 'الأربعاء' : lang === 'fr' ? 'Mercredi' : 'Wednesday' },
    { id: 4, label: lang === 'ar' ? 'الخميس' : lang === 'fr' ? 'Jeudi' : 'Thursday' },
    { id: 5, label: lang === 'ar' ? 'الجمعة' : lang === 'fr' ? 'Vendredi' : 'Friday' },
    { id: 6, label: translate(lang, 'settings.days.saturday') },
  ];

  return (
    <Modal
      isOpen={quickAddOpen}
      onClose={closeQuickAdd}
      title={translate(lang, 'app.quickAdd')}
      description={lang === 'ar' ? 'اختر نوع العنصر المراد إضافته' : 'Choose what you want to add'}
    >
      {/* Type Selector Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
        <button
          type="button"
          onClick={() => setActiveTabType('task')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'task'
              ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{translate(lang, 'nav.tasks')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabType('class')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'class'
              ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>{translate(lang, 'nav.timetable')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabType('exam')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'exam'
              ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{translate(lang, 'nav.exams')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTabType('session')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'session'
              ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{translate(lang, 'nav.timer')}</span>
        </button>
      </div>

      {/* Inline New Subject Creator Form */}
      {isAddingNewSubject ? (
        <form onSubmit={handleCreateSubject} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {lang === 'ar' ? 'إضافة مادة جديدة' : 'Add New Subject'}
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNewSubject(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {translate(lang, 'common.cancel')}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ar' ? 'اسم المادة' : 'Subject Name'}
              </label>
              <input
                type="text"
                required
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="e.g. Linear Algebra"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {lang === 'ar' ? 'رمز المادة' : 'Course Code'}
              </label>
              <input
                type="text"
                value={newSubCode}
                onChange={(e) => setNewSubCode(e.target.value)}
                placeholder="e.g. MATH204"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>
          <ColorPicker value={newSubColor} onChange={setNewSubColor} label={translate(lang, 'common.color')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingNewSubject(false)}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button type="submit" size="sm">
              {translate(lang, 'common.save')}
            </Button>
          </div>
        </form>
      ) : null}

      {/* 1. TASK FORM */}
      {activeTab === 'task' && (
        <form onSubmit={handleSubmitTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'common.name')}
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'ar' ? 'مثال: حل الواجب الثاني لمادة الرياضيات' : 'e.g. Chapter 4 problem set'}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {translate(lang, 'common.subject')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewSubject(true)}
                  className="text-xs text-[#6C5CE7] hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>{translate(lang, 'common.add')}</span>
                </button>
              </div>
              <select
                value={taskSubjectId}
                onChange={(e) => setTaskSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'tasks.filterPriority')}
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                <option value="low">{translate(lang, 'tasks.priority.low')}</option>
                <option value="medium">{translate(lang, 'tasks.priority.medium')}</option>
                <option value="high">{translate(lang, 'tasks.priority.high')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.date')}
              </label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.time')}
              </label>
              <input
                type="time"
                value={taskDueTime}
                onChange={(e) => setTaskDueTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'tasks.estimatedTime')} ({translate(lang, 'tasks.minutes')})
              </label>
              <input
                type="number"
                min="10"
                step="5"
                value={taskDuration}
                onChange={(e) => setTaskDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'tasks.subtasks')} ({lang === 'ar' ? 'سطر لكل خطوة' : 'one per line'})
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'ar' ? 'قراءة الفصل\nحل التمرين 1\nمراجعة الحل' : 'Read section 3\nSolve exercise 1\nProofread'}
              value={subtasksInput}
              onChange={(e) => setSubtasksInput(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeQuickAdd}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button type="submit">
              {translate(lang, 'tasks.addTask')}
            </Button>
          </div>
        </form>
      )}

      {/* 2. CLASS FORM */}
      {activeTab === 'class' && (
        <form onSubmit={handleSubmitClass} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {translate(lang, 'common.subject')}
              </label>
              <button
                type="button"
                onClick={() => setIsAddingNewSubject(true)}
                className="text-xs text-[#6C5CE7] hover:underline flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>{translate(lang, 'common.add')}</span>
              </button>
            </div>
            <select
              value={classSubjectId}
              onChange={(e) => setClassSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'ar' ? 'اليوم' : 'Day'}
              </label>
              <select
                value={classDay}
                onChange={(e) => setClassDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              >
                {weekDays.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'ar' ? 'وقت البدء' : 'Start Time'}
              </label>
              <input
                type="time"
                required
                value={classStart}
                onChange={(e) => setClassStart(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'ar' ? 'وقت الانتهاء' : 'End Time'}
              </label>
              <input
                type="time"
                required
                value={classEnd}
                onChange={(e) => setClassEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'timetable.room')}
              </label>
              <input
                type="text"
                placeholder="e.g. Hall 302"
                value={classRoom}
                onChange={(e) => setClassRoom(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'timetable.teacher')}
              </label>
              <input
                type="text"
                placeholder="e.g. Prof. Smith"
                value={classTeacher}
                onChange={(e) => setClassTeacher(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          {/* Conflict warning */}
          {classConflict && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{translate(lang, 'timetable.conflictWarning')}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeQuickAdd}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button type="submit">
              {translate(lang, 'timetable.addClass')}
            </Button>
          </div>
        </form>
      )}

      {/* 3. EXAM FORM */}
      {activeTab === 'exam' && (
        <form onSubmit={handleSubmitExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'common.subject')}
            </label>
            <select
              value={examSubjectId}
              onChange={(e) => setExamSubjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.date')}
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.time')}
              </label>
              <input
                type="time"
                required
                value={examTime}
                onChange={(e) => setExamTime(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'exams.location')}
              </label>
              <input
                type="text"
                placeholder="e.g. Science Complex, Auditorium C"
                value={examLocation}
                onChange={(e) => setExamLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'exams.targetGrade')}
              </label>
              <input
                type="text"
                placeholder="e.g. A+ or 18/20"
                value={examTargetGrade}
                onChange={(e) => setExamTargetGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {translate(lang, 'exams.topics')} ({lang === 'ar' ? 'سطر لكل موضوع' : 'one per line'})
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Dynamic Programming\nGraph Algorithms\nAsymptotics"
              value={examTopicsInput}
              onChange={(e) => setExamTopicsInput(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={closeQuickAdd}>
              {translate(lang, 'common.cancel')}
            </Button>
            <Button type="submit">
              {translate(lang, 'exams.addExam')}
            </Button>
          </div>
        </form>
      )}

      {/* 4. FOCUS POMODORO / STUDY SESSION SHORTCUT */}
      {activeTab === 'session' && (
        <div className="space-y-4 text-center py-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] flex items-center justify-center">
            <Timer className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {translate(lang, 'timer.title')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              {lang === 'ar'
                ? 'ابدأ جلسة تركيز مؤقتة مع أصوات بيئية هادئة وتسجيل الإحصائيات'
                : 'Start a timed deep work session with ambient audio and streak tracking'}
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Log quick manual 30 min session
                if (subjects[0]) {
                  addStudySession({
                    subjectId: subjects[0].id,
                    date: new Date().toISOString().slice(0, 10),
                    durationMinutes: 30,
                    type: 'manual',
                    completed: true,
                    timestamp: Date.now(),
                  });
                  addToast(lang === 'ar' ? 'تم تسجيل 30 دقيقة مذاكرة' : 'Logged 30m study session', 'success');
                  closeQuickAdd();
                }
              }}
            >
              {lang === 'ar' ? 'تسجيل 30 دقيقة يدوياً' : 'Log 30 min manual'}
            </Button>
            <Button type="button" onClick={handleStartQuickSession}>
              {translate(lang, 'timer.start')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
