export type Language = 'ar' | 'fr' | 'en';
export type ThemeMode = 'system' | 'light' | 'dark';
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type StudyTimePreference = 'morning' | 'afternoon' | 'evening' | 'night';
export type AmbientSoundType = 'none' | 'rain' | 'cafe' | 'whitenoise';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Hex color from curated 12-color palette
  teacher?: string;
  room?: string;
  notes?: string;
}

export interface ClassSession {
  id: string;
  subjectId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  room?: string;
  teacher?: string;
  recurrence?: 'weekly' | 'biweekly';
  notes?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  estimatedMinutes: number;
  subtasks: Subtask[];
  notes?: string;
  links?: string[];
  completedAt?: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  topics: string[];
  targetGrade?: string;
  priority: 'normal' | 'high';
}

export interface StudySession {
  id: string;
  subjectId: string;
  taskId?: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  type: 'pomodoro' | 'manual';
  completed: boolean;
  notes?: string;
  timestamp: number;
}

export interface PomodoroConfig {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number; // 0.0 - 1.0
}

export interface UserSettings {
  language: Language;
  theme: ThemeMode;
  weekStartDay: 0 | 1 | 6; // 0: Sun, 1: Mon, 6: Sat
  timeFormat: '12h' | '24h';
  dailyStudyGoalHours: number;
  preferredStudyTime: StudyTimePreference;
  pomodoroSettings: PomodoroConfig;
  name: string;
  avatar: string;
  hasCompletedOnboarding: boolean;
  remindersEnabled: boolean;
  reminderLeadTimeMinutes: number;
}

export interface Achievement {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface RevisionSlot {
  date: string;
  dayName: string;
  durationMinutes: number;
  topic: string;
  subjectId: string;
}

export interface FreeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}
