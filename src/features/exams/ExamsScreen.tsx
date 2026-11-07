import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate, formatLocalizedDate } from '../../utils/i18n';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Chip } from '../../components/ui/Chip';
import { Modal } from '../../components/ui/Modal';
import { generateExamRevisionPlan } from '../../utils/plannerLogic';
import { Exam, RevisionSlot } from '../../types';
import {
  GraduationCap,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  BookOpen,
  Trash2,
  Edit2,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const ExamsScreen: React.FC = () => {
  const { exams, subjects, settings, deleteExam, updateExam, addTask, openQuickAdd, addToast, setActiveTab } = useStore();
  const lang = settings.language;

  // Active revision plan viewer
  const [selectedExamForPlan, setSelectedExamForPlan] = useState<Exam | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<RevisionSlot[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = new Date();

  const handleGeneratePlan = (exam: Exam) => {
    setSelectedExamForPlan(exam);
    const plan = generateExamRevisionPlan(
      exam,
      settings.dailyStudyGoalHours,
      settings.preferredStudyTime,
      today.toISOString().slice(0, 10)
    );
    setGeneratedPlan(plan);
  };

  const handleApplyPlanToTasks = () => {
    if (!selectedExamForPlan || generatedPlan.length === 0) return;

    // Convert revision slots to real tasks
    let count = 0;
    for (const slot of generatedPlan) {
      addTask({
        title: `${lang === 'ar' ? 'مراجعة اختبار: ' : 'Exam Revision: '} ${slot.topic}`,
        subjectId: slot.subjectId,
        dueDate: slot.date,
        dueTime: '17:00',
        priority: 'high',
        status: 'todo',
        estimatedMinutes: slot.durationMinutes,
        subtasks: [
          { id: `rst-1-${Date.now()}-${count}`, title: lang === 'ar' ? 'مراجعة الملاحظات والملخصات' : 'Review summary notes', completed: false },
          { id: `rst-2-${Date.now()}-${count}`, title: lang === 'ar' ? 'حل نماذج أسئلة سابقة' : 'Practice past exam problems', completed: false },
        ],
        notes: `Smart revision session auto-generated for ${selectedExamForPlan.location || 'exam'}.`,
      });
      count++;
    }

    addToast(
      lang === 'ar' ? `تم إنشاء ${count} مهام مراجعة في جدول المهام` : `Created ${count} revision tasks`,
      'success'
    );
    setSelectedExamForPlan(null);
    setActiveTab('tasks');
  };

  const handleDelete = (id: string) => {
    deleteExam(id);
    setDeleteConfirmId(null);
    addToast(lang === 'ar' ? 'تم حذف الاختبار' : 'Exam deleted', 'info');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {translate(lang, 'exams.title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {lang === 'ar'
              ? 'تتبع مواعيد الاختبارات النهائية والنصفيّة وجداول المراجعة الذكية'
              : 'Track upcoming midterms, finals, and auto-generate structured revision schedules'}
          </p>
        </div>

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openQuickAdd('exam')}
        >
          {translate(lang, 'exams.addExam')}
        </Button>
      </div>

      {/* 2. Exams List */}
      <div className="space-y-4">
        {exams.length === 0 ? (
          <Card className="text-center py-12 text-slate-400 space-y-3">
            <GraduationCap className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="text-sm">{translate(lang, 'exams.noExams')}</p>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => openQuickAdd('exam')}>
              {translate(lang, 'exams.addExam')}
            </Button>
          </Card>
        ) : (
          exams.map((exam) => {
            const sub = subjects.find((s) => s.id === exam.subjectId);
            const examDate = new Date(exam.date);
            const diffDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isUrgent = diffDays <= 4 && diffDays >= 0;

            return (
              <Card
                key={exam.id}
                className="hover:shadow-md transition-all space-y-4"
                highlightColor={sub?.color || '#6C5CE7'}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Subject and exam info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {sub?.name || 'Exam'}
                      </h3>
                      {sub?.code && <Chip label={sub.code} color={sub.color} size="sm" />}
                      {exam.targetGrade && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                          {translate(lang, 'exams.targetGrade')}: {exam.targetGrade}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatLocalizedDate(exam.date, lang, { weekday: 'long', month: 'long', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {exam.time}
                      </span>
                      {exam.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {exam.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Countdown Badge & Actions */}
                  <div className="flex items-center gap-2 sm:self-start shrink-0">
                    <div
                      className={`px-3.5 py-1.5 rounded-xl text-center font-extrabold text-sm ${
                        isUrgent
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-[#6C5CE7]/10 text-[#6C5CE7] dark:text-indigo-300'
                      }`}
                    >
                      {diffDays === 0
                        ? translate(lang, 'dashboard.today')
                        : diffDays === 1
                        ? translate(lang, 'dashboard.tomorrow')
                        : diffDays > 1
                        ? `${diffDays} ${translate(lang, 'exams.days')}`
                        : `${Math.abs(diffDays)} ${lang === 'ar' ? 'أيام مضت' : 'days ago'}`}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500"
                      onClick={() => setDeleteConfirmId(exam.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Topics to cover tags */}
                {exam.topics.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{translate(lang, 'exams.topics')}</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.topics.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Smart Revision Plan trigger */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>
                      {lang === 'ar'
                        ? 'توليد خطة مراجعة متوازنة موزعة على الأيام المتبقية'
                        : 'Generate balanced review sessions spread across remaining days'}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                    onClick={() => handleGeneratePlan(exam)}
                  >
                    {translate(lang, 'exams.revisionPlan')}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* 3. REVISION PLAN GENERATOR MODAL */}
      {selectedExamForPlan && (
        <Modal
          isOpen={Boolean(selectedExamForPlan)}
          onClose={() => setSelectedExamForPlan(null)}
          title={translate(lang, 'exams.revisionPlan')}
          description={translate(lang, 'exams.planGenerated')}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs text-[#6C5CE7] dark:text-indigo-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                {lang === 'ar'
                  ? `بناءً على هدفك اليومي (${settings.dailyStudyGoalHours} ساعات)، وزعنا فترات المراجعة على ${generatedPlan.length} أيام قبل الاختبار.`
                  : `Based on your goal (${settings.dailyStudyGoalHours}h/day), we distributed ${generatedPlan.length} review sessions before the exam.`}
              </span>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pe-1">
              {generatedPlan.map((slot, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                        {slot.topic}
                      </p>
                      <p className="text-slate-400">
                        {slot.date} ({slot.dayName})
                      </p>
                    </div>
                  </div>

                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {slot.durationMinutes} {translate(lang, 'tasks.minutes')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="ghost" onClick={() => setSelectedExamForPlan(null)}>
                {translate(lang, 'common.close')}
              </Button>
              <Button icon={<CheckCircle2 className="w-4 h-4" />} onClick={handleApplyPlanToTasks}>
                {lang === 'ar' ? 'إضافة الخطة إلى قائمة المهام' : 'Apply to Task List'}
              </Button>
            </div>
          </div>
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
            {lang === 'ar' ? 'هل أنت متأكد من حذف هذا الاختبار؟' : 'Are you sure you want to delete this exam?'}
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
