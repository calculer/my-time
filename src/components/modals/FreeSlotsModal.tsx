import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { translate } from '../../utils/i18n';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { findFreeStudySlots } from '../../utils/plannerLogic';
import { Sparkles, Play, Calendar, CheckCircle } from 'lucide-react';

interface FreeSlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeSlotsModal: React.FC<FreeSlotsModalProps> = ({ isOpen, onClose }) => {
  const { classes, settings, setActiveTab, openQuickAdd } = useStore();
  const lang = settings.language;

  // Day selection (0 to 6)
  const todayDay = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(todayDay);

  const days = [
    { id: 0, label: translate(lang, 'settings.days.sunday') },
    { id: 1, label: translate(lang, 'settings.days.monday') },
    { id: 2, label: lang === 'ar' ? 'الثلاثاء' : lang === 'fr' ? 'Mardi' : 'Tuesday' },
    { id: 3, label: lang === 'ar' ? 'الأربعاء' : lang === 'fr' ? 'Mercredi' : 'Wednesday' },
    { id: 4, label: lang === 'ar' ? 'الخميس' : lang === 'fr' ? 'Jeudi' : 'Thursday' },
    { id: 5, label: lang === 'ar' ? 'الجمعة' : lang === 'fr' ? 'Vendredi' : 'Friday' },
    { id: 6, label: translate(lang, 'settings.days.saturday') },
  ];

  const freeSlots = findFreeStudySlots(classes, selectedDay, '08:00', '19:00', 45);

  const handleStartTimer = () => {
    onClose();
    setActiveTab('timer');
  };

  const handleScheduleTask = () => {
    onClose();
    openQuickAdd('task');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={translate(lang, 'app.freeSlots')}
      description={
        lang === 'ar'
          ? 'اقتراحات ذكية لأفضل فترات الفراغ بين المحاضرات لاستغلالها في المذاكرة المركزة'
          : 'Smart suggestions for available time slots between classes to study productively'
      }
      maxWidth="lg"
    >
      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {days.map((d) => {
          const isSelected = selectedDay === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#6C5CE7] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {d.label} {d.id === todayDay && `(${translate(lang, 'dashboard.today')})`}
            </button>
          );
        })}
      </div>

      {/* Free Slots List */}
      <div className="space-y-3 pt-2">
        {freeSlots.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto stroke-1 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm">
              {lang === 'ar'
                ? 'لا توجد فترات فراغ كافية في هذا اليوم (أقل من 45 دقيقة)'
                : 'No major free study windows found for this day (under 45 min)'}
            </p>
          </div>
        ) : (
          freeSlots.map((slot, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#6C5CE7]/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      {slot.startTime} – {slot.endTime}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {slot.durationMinutes} {translate(lang, 'tasks.minutes')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {lang === 'ar'
                      ? `مثالي لإنجاز ${Math.floor(slot.durationMinutes / 30)} جلسات بومودورو مركزة`
                      : `Great for ${Math.floor(slot.durationMinutes / 30)} deep Pomodoro sessions`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" icon={<Calendar className="w-3.5 h-3.5" />} onClick={handleScheduleTask}>
                  {lang === 'ar' ? 'تخصيص واجب' : 'Assign Task'}
                </Button>
                <Button size="sm" icon={<Play className="w-3.5 h-3.5 fill-current" />} onClick={handleStartTimer}>
                  {translate(lang, 'timer.start')}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" onClick={onClose}>
          {translate(lang, 'common.close')}
        </Button>
      </div>
    </Modal>
  );
};
