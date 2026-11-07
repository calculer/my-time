import { ClassSession, Exam, FreeSlot, RevisionSlot, StudySession, StudyTimePreference, Task } from '../types';

/**
 * Converts "HH:mm" to minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight to "HH:mm"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Checks if two class sessions overlap in time on the same weekday
 */
export function hasTimeConflict(
  a: { dayOfWeek: number; startTime: string; endTime: string; id?: string },
  b: { dayOfWeek: number; startTime: string; endTime: string; id?: string }
): boolean {
  if (a.id && b.id && a.id === b.id) return false;
  if (a.dayOfWeek !== b.dayOfWeek) return false;

  const startA = timeToMinutes(a.startTime);
  const endA = timeToMinutes(a.endTime);
  const startB = timeToMinutes(b.startTime);
  const endB = timeToMinutes(b.endTime);

  // Overlap occurs if start of one is before end of other and vice versa
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Finds all conflicting pairs of classes in a timetable
 */
export function findTimetableConflicts(sessions: ClassSession[]): { sessionAId: string; sessionBId: string }[] {
  const conflicts: { sessionAId: string; sessionBId: string }[] = [];
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      if (hasTimeConflict(sessions[i], sessions[j])) {
        conflicts.push({ sessionAId: sessions[i].id, sessionBId: sessions[j].id });
      }
    }
  }
  return conflicts;
}

/**
 * Finds free time slots on a given day that are at least minDurationMins long
 */
export function findFreeStudySlots(
  sessions: ClassSession[],
  dayOfWeek: number,
  dayStart = '08:00',
  dayEnd = '18:00',
  minDurationMins = 45
): FreeSlot[] {
  const daySessions = sessions
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  const startLimit = timeToMinutes(dayStart);
  const endLimit = timeToMinutes(dayEnd);

  const freeSlots: FreeSlot[] = [];
  let currentPtr = startLimit;

  for (const session of daySessions) {
    const sStart = timeToMinutes(session.startTime);
    const sEnd = timeToMinutes(session.endTime);

    if (sStart > currentPtr) {
      const duration = sStart - currentPtr;
      if (duration >= minDurationMins) {
        freeSlots.push({
          dayOfWeek,
          startTime: minutesToTime(currentPtr),
          endTime: minutesToTime(sStart),
          durationMinutes: duration,
        });
      }
    }
    currentPtr = Math.max(currentPtr, sEnd);
  }

  if (endLimit > currentPtr) {
    const duration = endLimit - currentPtr;
    if (duration >= minDurationMins) {
      freeSlots.push({
        dayOfWeek,
        startTime: minutesToTime(currentPtr),
        endTime: minutesToTime(endLimit),
        durationMinutes: duration,
      });
    }
  }

  return freeSlots;
}

/**
 * Generates an automatic revision schedule before an exam
 * Spreads study sessions across remaining days based on daily study goal
 */
export function generateExamRevisionPlan(
  exam: Exam,
  dailyHours: number,
  _preferredTime: StudyTimePreference,
  todayStr = new Date().toISOString().slice(0, 10)
): RevisionSlot[] {
  const examDate = new Date(exam.date);
  const today = new Date(todayStr);

  const diffTime = examDate.getTime() - today.getTime();
  const daysRemaining = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const topics = exam.topics && exam.topics.length > 0
    ? exam.topics
    : ['Comprehensive Revision', 'Practice Exercises & Past Papers'];

  const slots: RevisionSlot[] = [];
  const daysToSchedule = Math.min(daysRemaining, 14); // up to 2 weeks ahead

  // Distribute topics across the days
  const sessionDuration = Math.min(Math.round((dailyHours * 60) / 2), 90); // 45-90 min chunks

  for (let i = 0; i < daysToSchedule; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);
    const dateStr = targetDate.toISOString().slice(0, 10);
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'short' });

    // Pick topic cyclically
    const topic = topics[i % topics.length];

    slots.push({
      date: dateStr,
      dayName,
      durationMinutes: sessionDuration,
      topic,
      subjectId: exam.subjectId,
    });
  }

  return slots;
}

/**
 * Calculates current study streak in consecutive active days
 */
export function calculateStudyStreak(sessions: StudySession[]): number {
  if (!sessions || sessions.length === 0) return 0;

  // Unique sorted dates
  const uniqueDates = Array.from(
    new Set(sessions.filter((s) => s.completed && s.durationMinutes > 0).map((s) => s.date))
  ).sort().reverse();

  if (uniqueDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().slice(0, 10);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const mostRecent = uniqueDates[0];
  // Streak is alive if most recent session is today or yesterday
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let expectedDate = new Date(mostRecent);

  for (const dateStr of uniqueDates) {
    const curDate = new Date(dateStr);
    const diffDays = Math.round((expectedDate.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Calculates daily task completion and progress ring percentage
 */
export function calculateDailyProgress(tasks: Task[], dateStr: string): { completed: number; total: number; percentage: number } {
  const dailyTasks = tasks.filter((t) => t.dueDate === dateStr);
  if (dailyTasks.length === 0) {
    return { completed: 0, total: 0, percentage: 100 };
  }
  const completed = dailyTasks.filter((t) => t.status === 'done').length;
  const percentage = Math.round((completed / dailyTasks.length) * 100);
  return { completed, total: dailyTasks.length, percentage };
}
