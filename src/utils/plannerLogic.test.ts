import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  hasTimeConflict,
  findTimetableConflicts,
  findFreeStudySlots,
  generateExamRevisionPlan,
  calculateStudyStreak,
  calculateDailyProgress
} from './plannerLogic';
import { ClassSession, Exam, StudySession, Task } from '../types';

test('timeToMinutes converts HH:mm to minutes correctly', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('08:30'), 510);
  assert.equal(timeToMinutes('14:45'), 885);
  assert.equal(timeToMinutes('23:59'), 1439);
});

test('minutesToTime formats minutes to HH:mm string', () => {
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(510), '08:30');
  assert.equal(minutesToTime(885), '14:45');
});

test('hasTimeConflict detects overlapping time ranges on the same day', () => {
  const session1 = { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30' };
  const session2 = { id: '2', dayOfWeek: 1, startTime: '10:00', endTime: '11:30' };
  const session3 = { id: '3', dayOfWeek: 1, startTime: '10:30', endTime: '12:00' }; // adjacent, no overlap
  const session4 = { id: '4', dayOfWeek: 2, startTime: '09:00', endTime: '10:30' }; // different day

  assert.equal(hasTimeConflict(session1, session2), true);
  assert.equal(hasTimeConflict(session1, session3), false);
  assert.equal(hasTimeConflict(session1, session4), false);
  assert.equal(hasTimeConflict(session1, { ...session1 }), false); // same id ignores
});

test('findTimetableConflicts returns conflict pairs', () => {
  const sessions: ClassSession[] = [
    { id: 'c1', subjectId: 's1', dayOfWeek: 1, startTime: '09:00', endTime: '11:00' },
    { id: 'c2', subjectId: 's2', dayOfWeek: 1, startTime: '10:30', endTime: '12:00' },
    { id: 'c3', subjectId: 's3', dayOfWeek: 1, startTime: '14:00', endTime: '15:30' }
  ];

  const conflicts = findTimetableConflicts(sessions);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].sessionAId, 'c1');
  assert.equal(conflicts[0].sessionBId, 'c2');
});

test('findFreeStudySlots identifies available study windows', () => {
  const sessions: ClassSession[] = [
    { id: 'c1', subjectId: 's1', dayOfWeek: 1, startTime: '09:00', endTime: '11:00' },
    { id: 'c2', subjectId: 's2', dayOfWeek: 1, startTime: '13:00', endTime: '15:00' }
  ];

  // Day window from 08:00 to 18:00
  const free = findFreeStudySlots(sessions, 1, '08:00', '18:00', 60);
  // Free slots should be:
  // 08:00 to 09:00 (60 mins)
  // 11:00 to 13:00 (120 mins)
  // 15:00 to 18:00 (180 mins)
  assert.equal(free.length, 3);
  assert.equal(free[0].startTime, '08:00');
  assert.equal(free[0].endTime, '09:00');
  assert.equal(free[1].startTime, '11:00');
  assert.equal(free[1].endTime, '13:00');
  assert.equal(free[2].startTime, '15:00');
  assert.equal(free[2].endTime, '18:00');
});

test('generateExamRevisionPlan builds distributed revision slots', () => {
  const exam: Exam = {
    id: 'e1',
    subjectId: 'sub-math',
    date: '2026-11-20',
    time: '09:00',
    location: 'Hall B',
    topics: ['Limits & Derivatives', 'Integrals', 'Matrices', 'Series'],
    priority: 'high'
  };

  const plan = generateExamRevisionPlan(exam, 3, 'morning', '2026-11-15');
  assert.equal(plan.length > 0, true);
  assert.equal(plan[0].subjectId, 'sub-math');
  assert.equal(plan[0].topic, 'Limits & Derivatives');
});

test('calculateStudyStreak handles active and broken streaks', () => {
  const today = new Date().toISOString().slice(0, 10);
  const d1 = new Date(); d1.setDate(d1.getDate() - 1); const day1 = d1.toISOString().slice(0, 10);
  const d2 = new Date(); d2.setDate(d2.getDate() - 2); const day2 = d2.toISOString().slice(0, 10);

  const activeSessions: StudySession[] = [
    { id: '1', subjectId: 's1', date: today, durationMinutes: 45, type: 'pomodoro', completed: true, timestamp: 1 },
    { id: '2', subjectId: 's1', date: day1, durationMinutes: 50, type: 'pomodoro', completed: true, timestamp: 2 },
    { id: '3', subjectId: 's1', date: day2, durationMinutes: 30, type: 'pomodoro', completed: true, timestamp: 3 }
  ];

  assert.equal(calculateStudyStreak(activeSessions), 3);
});

test('calculateDailyProgress computes task completion percentage', () => {
  const today = '2026-11-07';
  const tasks: Task[] = [
    { id: '1', title: 'Task 1', subjectId: 's1', dueDate: today, priority: 'high', status: 'done', estimatedMinutes: 30, subtasks: [] },
    { id: '2', title: 'Task 2', subjectId: 's1', dueDate: today, priority: 'medium', status: 'todo', estimatedMinutes: 45, subtasks: [] },
    { id: '3', title: 'Task 3', subjectId: 's2', dueDate: '2026-11-08', priority: 'low', status: 'done', estimatedMinutes: 20, subtasks: [] }
  ];

  const progress = calculateDailyProgress(tasks, today);
  assert.equal(progress.total, 2);
  assert.equal(progress.completed, 1);
  assert.equal(progress.percentage, 50);
});
