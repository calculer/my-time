import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Modal } from '../ui/Modal';
import { Search, CalendarDays, CheckSquare, GraduationCap, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { classes, tasks, exams, subjects, settings, setActiveTab } = useStore();
  const lang = settings.language;
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const cleanQuery = query.toLowerCase().trim();

  // Filter items
  const matchedTasks = cleanQuery
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(cleanQuery) ||
          subjects.find((s) => s.id === t.subjectId)?.name.toLowerCase().includes(cleanQuery)
      )
    : [];

  const matchedClasses = cleanQuery
    ? classes.filter((c) => {
        const sub = subjects.find((s) => s.id === c.subjectId);
        return (
          sub?.name.toLowerCase().includes(cleanQuery) ||
          sub?.code.toLowerCase().includes(cleanQuery) ||
          c.room?.toLowerCase().includes(cleanQuery) ||
          c.teacher?.toLowerCase().includes(cleanQuery)
        );
      })
    : [];

  const matchedExams = cleanQuery
    ? exams.filter((e) => {
        const sub = subjects.find((s) => s.id === e.subjectId);
        return (
          sub?.name.toLowerCase().includes(cleanQuery) ||
          e.location?.toLowerCase().includes(cleanQuery) ||
          e.topics.some((topic) => topic.toLowerCase().includes(cleanQuery))
        );
      })
    : [];

  const handleNavigate = (tab: 'dashboard' | 'timetable' | 'tasks' | 'exams') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input Box */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={translate(lang, 'app.search')}
            className="w-full ps-11 pe-4 py-3 text-base rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]"
          />
        </div>

        {/* Search Results */}
        {cleanQuery ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pt-1">
            {matchedTasks.length === 0 && matchedClasses.length === 0 && matchedExams.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">
                {lang === 'ar' ? 'لم يتم العثور على نتائج تطابق بحثك' : 'No matches found'}
              </p>
            ) : null}

            {/* Tasks Section */}
            {matchedTasks.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#6C5CE7]" />
                  <span>{translate(lang, 'nav.tasks')}</span>
                </h4>
                <div className="space-y-1.5">
                  {matchedTasks.map((task) => {
                    const sub = subjects.find((s) => s.id === task.subjectId);
                    return (
                      <button
                        key={task.id}
                        onClick={() => handleNavigate('tasks')}
                        className="w-full text-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group"
                      >
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400">{sub?.name} • {task.dueDate}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 rtl-flip shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Classes Section */}
            {matchedClasses.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-[#00B894]" />
                  <span>{translate(lang, 'nav.timetable')}</span>
                </h4>
                <div className="space-y-1.5">
                  {matchedClasses.map((cls) => {
                    const sub = subjects.find((s) => s.id === cls.subjectId);
                    return (
                      <button
                        key={cls.id}
                        onClick={() => handleNavigate('timetable')}
                        className="w-full text-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {sub?.name} ({sub?.code})
                          </p>
                          <p className="text-xs text-slate-400">
                            {cls.startTime} - {cls.endTime} • {cls.room || 'No Room'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 rtl-flip shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Exams Section */}
            {matchedExams.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                  <span>{translate(lang, 'nav.exams')}</span>
                </h4>
                <div className="space-y-1.5">
                  {matchedExams.map((exam) => {
                    const sub = subjects.find((s) => s.id === exam.subjectId);
                    return (
                      <button
                        key={exam.id}
                        onClick={() => handleNavigate('exams')}
                        className="w-full text-start p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {sub?.name} - {exam.date} ({exam.time})
                          </p>
                          <p className="text-xs text-slate-400">{exam.location}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 rtl-flip shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            {lang === 'ar' ? 'اكتب للبحث في كافة المواد والواجبات والمواعيد' : 'Type to search across all courses, tasks, and exams'}
          </div>
        )}
      </div>
    </Modal>
  );
};
