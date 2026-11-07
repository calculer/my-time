import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate, formatLocalizedDate } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import { Priority, Task, TaskStatus } from '../../types';
import {
  Plus,
  CheckCircle2,
  List,
  Columns,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Clock,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  CheckSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const TasksScreen: React.FC = () => {
  const {
    tasks,
    subjects,
    settings,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    toggleSubtask,
    openQuickAdd,
    addToast,
  } = useStore();

  const lang = settings.language;
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');

  // Filters & Search
  const [searchFilter, setSearchFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Expanded subtasks state for items
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  // Editing Task modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New subtask input per task
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<Record<string, string>>({});

  const toggleExpand = (id: string) => {
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleTask = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskStatus(task.id);
    if (task.status !== 'done') {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#6C5CE7', '#00B894', '#FDCB6E'],
        });
      } catch {
        // Fallback
      }
    }
  };

  const handleAddInlineSubtask = (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = (newSubtaskTitle[taskId] || '').trim();
    if (!title) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newSub = {
      id: `st-${Date.now()}`,
      title,
      completed: false,
    };
    updateTask(taskId, {
      subtasks: [...task.subtasks, newSub],
    });
    setNewSubtaskTitle((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, {
      title: editingTask.title,
      subjectId: editingTask.subjectId,
      dueDate: editingTask.dueDate,
      dueTime: editingTask.dueTime,
      priority: editingTask.priority,
      status: editingTask.status,
      estimatedMinutes: Number(editingTask.estimatedMinutes),
      notes: editingTask.notes,
    });
    addToast(lang === 'ar' ? 'تم تحديث المهمة' : 'Task updated', 'success');
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
    setDeleteConfirmId(null);
    setEditingTask(null);
    addToast(lang === 'ar' ? 'تم حذف المهمة' : 'Task deleted', 'info');
  };

  // Filter and sort tasks
  const filteredTasks = tasks.filter((t) => {
    if (subjectFilter !== 'all' && t.subjectId !== subjectFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = subjects.find((s) => s.id === t.subjectId)?.name.toLowerCase().includes(q);
      return matchTitle || matchSubject;
    }
    return true;
  });

  // Smart sort: todo/in_progress first, then earlier deadlines, then high priority
  const priorityScore = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    return priorityScore[b.priority] - priorityScore[a.priority];
  });

  // Kanban buckets
  const todoTasks = sortedTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = sortedTasks.filter((t) => t.status === 'in_progress');
  const doneTasks = sortedTasks.filter((t) => t.status === 'done');

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate(lang, 'tasks.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {translate(lang, 'dashboard.tasksCompleted', {
              completed: tasks.filter((t) => t.status === 'done').length,
              total: tasks.length,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Segment */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
              <span>{translate(lang, 'tasks.listView')}</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Columns className="w-4 h-4" />
              <span>{translate(lang, 'tasks.kanbanView')}</span>
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-700 text-[#6C5CE7] dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{translate(lang, 'tasks.calendarView')}</span>
            </button>
          </div>

          <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => openQuickAdd('task')}>
            {translate(lang, 'tasks.addTask')}
          </Button>
        </div>
      </div>

      {/* 2. Filters & Search Strip */}
      <Card className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={translate(lang, 'common.search')}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
          >
            <option value="all">{translate(lang, 'tasks.filterSubject')}</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
          >
            <option value="all">{translate(lang, 'tasks.filterPriority')}</option>
            <option value="high">{translate(lang, 'tasks.priority.high')}</option>
            <option value="medium">{translate(lang, 'tasks.priority.medium')}</option>
            <option value="low">{translate(lang, 'tasks.priority.low')}</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
          >
            <option value="all">{translate(lang, 'tasks.filterStatus')}</option>
            <option value="todo">{translate(lang, 'tasks.todo')}</option>
            <option value="in_progress">{translate(lang, 'tasks.inProgress')}</option>
            <option value="done">{translate(lang, 'tasks.done')}</option>
          </select>
        </div>
      </Card>

      {/* 3. VIEW MODES */}
      {viewMode === 'list' && (
        <div className="space-y-2.5">
          {sortedTasks.length === 0 ? (
            <Card className="text-center py-12 text-slate-400 space-y-3">
              <CheckSquare className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
              <p className="text-sm">{translate(lang, 'tasks.noTasks')}</p>
              <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => openQuickAdd('task')}>
                {translate(lang, 'tasks.addTask')}
              </Button>
            </Card>
          ) : (
            sortedTasks.map((task) => {
              const sub = subjects.find((s) => s.id === task.subjectId);
              const isDone = task.status === 'done';
              const isExpanded = Boolean(expandedTasks[task.id]);
              const completedSubCount = task.subtasks.filter((st) => st.completed).length;

              return (
                <Card
                  key={task.id}
                  className={`transition-all ${
                    isDone
                      ? 'bg-slate-50/50 dark:bg-slate-900/40 opacity-70 border-slate-200/60 dark:border-slate-800'
                      : 'hover:border-[#6C5CE7]/40 shadow-xs'
                  }`}
                  highlightColor={sub?.color || '#6C5CE7'}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 overflow-hidden">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleTask(task, e)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isDone
                            ? 'bg-[#00B894] border-[#00B894] text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-[#6C5CE7]'
                        }`}
                        aria-label="Toggle task status"
                      >
                        {isDone && <CheckCircle2 className="w-4 h-4 fill-white text-white" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 overflow-hidden">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-bold text-sm sm:text-base text-slate-900 dark:text-white ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {task.title}
                          </span>
                          {sub && (
                            <Chip
                              label={sub.name}
                              color={sub.color}
                              size="sm"
                              variant="subtle"
                            />
                          )}
                        </div>

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {task.dueDate} {task.dueTime && `(${task.dueTime})`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {task.estimatedMinutes} {translate(lang, 'tasks.minutes')}
                          </span>
                          {task.subtasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(task.id)}
                              className="text-xs font-semibold text-[#6C5CE7] hover:underline flex items-center gap-1"
                            >
                              <span>
                                {completedSubCount}/{task.subtasks.length} {translate(lang, 'tasks.subtasks')}
                              </span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                          {task.notes && (
                            <span className="italic truncate max-w-xs text-slate-400">
                              "{task.notes}"
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Chip
                        label={translate(lang, `tasks.priority.${task.priority}`)}
                        color={task.priority === 'high' ? '#E17055' : task.priority === 'medium' ? '#6C5CE7' : '#00B894'}
                        size="sm"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5"
                        onClick={() => setEditingTask(task)}
                        aria-label="Edit task"
                      >
                        <Edit2 className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 text-rose-500"
                        onClick={() => setDeleteConfirmId(task.id)}
                        aria-label="Delete task"
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-rose-500" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Subtasks Checklist */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 ps-8">
                      {task.subtasks.map((st) => (
                        <div key={st.id} className="flex items-center gap-2.5 text-xs">
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            className="w-4 h-4 rounded text-[#6C5CE7] focus:ring-[#6C5CE7] cursor-pointer"
                          />
                          <span className={st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}>
                            {st.title}
                          </span>
                        </div>
                      ))}

                      {/* Add subtask inline input */}
                      <form onSubmit={(e) => handleAddInlineSubtask(task.id, e)} className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder={translate(lang, 'tasks.addSubtask')}
                          value={newSubtaskTitle[task.id] || ''}
                          onChange={(e) =>
                            setNewSubtaskTitle((prev) => ({ ...prev, [task.id]: e.target.value }))
                          }
                          className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-[#6C5CE7]"
                        />
                        <Button type="submit" size="sm" variant="outline" className="min-h-[30px] py-1 text-xs">
                          {translate(lang, 'common.add')}
                        </Button>
                      </form>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* 4. KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TO DO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                {translate(lang, 'tasks.todo')} ({todoTasks.length})
              </span>
            </div>
            <div className="space-y-2">
              {todoTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                return (
                  <Card key={task.id} className="p-3.5 space-y-2 hover:border-[#6C5CE7]/40 shadow-xs" highlightColor={sub?.color}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{task.title}</h4>
                      <Chip label={task.priority} color={task.priority === 'high' ? '#E17055' : '#6C5CE7'} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400">{sub?.name} • {task.dueDate}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => updateTask(task.id, { status: 'in_progress' })}
                        className="text-xs text-[#6C5CE7] hover:underline font-semibold"
                      >
                        → {translate(lang, 'tasks.inProgress')}
                      </button>
                      <button
                        onClick={() => handleToggleTask(task, {} as React.MouseEvent)}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        ✓ {translate(lang, 'tasks.done')}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* IN PROGRESS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6C5CE7]" />
                {translate(lang, 'tasks.inProgress')} ({inProgressTasks.length})
              </span>
            </div>
            <div className="space-y-2">
              {inProgressTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                return (
                  <Card key={task.id} className="p-3.5 space-y-2 border-indigo-200 dark:border-indigo-900/40 shadow-xs" highlightColor={sub?.color}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{task.title}</h4>
                      <Chip label={task.priority} color={task.priority === 'high' ? '#E17055' : '#6C5CE7'} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400">{sub?.name} • {task.dueDate}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => updateTask(task.id, { status: 'todo' })}
                        className="text-xs text-slate-400 hover:underline"
                      >
                        ← {translate(lang, 'tasks.todo')}
                      </button>
                      <button
                        onClick={() => handleToggleTask(task, {} as React.MouseEvent)}
                        className="text-xs text-emerald-600 hover:underline font-semibold"
                      >
                        ✓ {translate(lang, 'tasks.done')}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* DONE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-500 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894]" />
                {translate(lang, 'tasks.done')} ({doneTasks.length})
              </span>
            </div>
            <div className="space-y-2">
              {doneTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                return (
                  <Card key={task.id} className="p-3.5 space-y-2 opacity-75 bg-slate-50 dark:bg-slate-900/40" highlightColor={sub?.color}>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm line-through text-slate-500 dark:text-slate-400">{task.title}</h4>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <p className="text-xs text-slate-400">{sub?.name}</p>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => updateTask(task.id, { status: 'todo' })}
                        className="text-[11px] text-slate-400 hover:underline"
                      >
                        ↺ {lang === 'ar' ? 'إعادة فتح' : 'Reopen'}
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. CALENDAR VIEW (Grouped by date) */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          {Array.from(new Set(sortedTasks.map((t) => t.dueDate))).sort().map((dateStr) => {
            const dateTasks = sortedTasks.filter((t) => t.dueDate === dateStr);
            const isToday = dateStr === new Date().toISOString().slice(0, 10);

            return (
              <div key={dateStr} className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {formatLocalizedDate(dateStr, lang, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </h3>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#6C5CE7]/10 text-[#6C5CE7]">
                      {translate(lang, 'dashboard.today')}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {dateTasks.map((task) => {
                    const sub = subjects.find((s) => s.id === task.subjectId);
                    return (
                      <Card
                        key={task.id}
                        className="flex items-center justify-between p-3.5"
                        highlightColor={sub?.color}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleToggleTask(task, e)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                              task.status === 'done' ? 'bg-[#00B894] border-[#00B894] text-white' : 'border-slate-300'
                            }`}
                          >
                            {task.status === 'done' && <CheckCircle2 className="w-4 h-4 fill-white" />}
                          </button>
                          <div>
                            <p className={`text-sm font-semibold ${task.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-400">{sub?.name} • {task.dueTime || 'Anytime'}</p>
                          </div>
                        </div>
                        <Chip label={task.priority} color={task.priority === 'high' ? '#E17055' : '#6C5CE7'} size="sm" />
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. EDIT TASK MODAL */}
      {editingTask && (
        <Modal
          isOpen={Boolean(editingTask)}
          onClose={() => setEditingTask(null)}
          title={translate(lang, 'tasks.editTask')}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'common.name')}
              </label>
              <input
                type="text"
                required
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'common.subject')}
                </label>
                <select
                  value={editingTask.subjectId}
                  onChange={(e) => setEditingTask({ ...editingTask, subjectId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'tasks.filterPriority')}
                </label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="low">{translate(lang, 'tasks.priority.low')}</option>
                  <option value="medium">{translate(lang, 'tasks.priority.medium')}</option>
                  <option value="high">{translate(lang, 'tasks.priority.high')}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'common.date')}
                </label>
                <input
                  type="date"
                  required
                  value={editingTask.dueDate}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {translate(lang, 'common.time')}
                </label>
                <input
                  type="time"
                  value={editingTask.dueTime || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueTime: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {translate(lang, 'tasks.notes')}
              </label>
              <textarea
                rows={2}
                value={editingTask.notes || ''}
                onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="danger"
                size="sm"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => handleDelete(editingTask.id)}
              >
                {translate(lang, 'common.delete')}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingTask(null)}>
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

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <Modal
          isOpen={Boolean(deleteConfirmId)}
          onClose={() => setDeleteConfirmId(null)}
          title={translate(lang, 'common.confirmDelete')}
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lang === 'ar' ? 'هل أنت متأكد من حذف هذه المهمة نهائياً؟' : 'Are you sure you want to permanently delete this task?'}
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
