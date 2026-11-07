import { create } from 'zustand';
import {
  DEFAULT_USER_SETTINGS,
  getLocalizedSeedSubjects,
  getSeedClasses,
  getSeedExams,
  getSeedStudySessions,
  getSeedTasks,
  INITIAL_ACHIEVEMENTS,
} from '../data/seedData';
import {
  Achievement,
  ClassSession,
  Exam,
  Language,
  StudySession,
  Subject,
  Task,
  UserSettings,
} from '../types';
import { applyLanguageToDOM, getInitialLanguage } from '../utils/i18n';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface AppState {
  // Navigation & UI state
  activeTab: 'dashboard' | 'timetable' | 'tasks' | 'exams' | 'timer' | 'calendar' | 'stats' | 'settings';
  setActiveTab: (tab: AppState['activeTab']) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  quickAddOpen: boolean;
  quickAddDefaultType?: 'class' | 'task' | 'exam' | 'session';
  openQuickAdd: (defaultType?: 'class' | 'task' | 'exam' | 'session') => void;
  closeQuickAdd: () => void;

  // Notification Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Domain state
  settings: UserSettings;
  subjects: Subject[];
  classes: ClassSession[];
  tasks: Task[];
  exams: Exam[];
  studySessions: StudySession[];
  achievements: Achievement[];

  // Actions
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  setLanguage: (lang: Language) => void;

  // Subjects
  addSubject: (sub: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Classes
  addClass: (cls: Omit<ClassSession, 'id'>) => ClassSession;
  updateClass: (id: string, updates: Partial<ClassSession>) => void;
  deleteClass: (id: string) => void;

  // Tasks
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTaskStatus: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteTask: (id: string) => void;

  // Exams
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Study Sessions
  addStudySession: (session: Omit<StudySession, 'id'>) => void;

  // Data persistence & reset
  resetToDemoData: () => void;
  wipeData: () => void;
  exportJSON: () => string;
  importJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'waqti_app_storage_v1';

function loadPersistedState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveStateToStorage(state: {
  settings: UserSettings;
  subjects: Subject[];
  classes: ClassSession[];
  tasks: Task[];
  exams: Exam[];
  studySessions: StudySession[];
  achievements: Achievement[];
}) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private mode
  }
}

// Initial defaults
const initialLang = getInitialLanguage();
const todayStr = new Date().toISOString().slice(0, 10);
const initialSubjects = getLocalizedSeedSubjects(initialLang);
const initialClasses = getSeedClasses();
const initialTasks = getSeedTasks(todayStr, initialLang);
const initialExams = getSeedExams();
const initialStudySessions = getSeedStudySessions(todayStr);

const persisted = loadPersistedState();

const mergedSettings: UserSettings = {
  ...DEFAULT_USER_SETTINGS,
  language: initialLang,
  ...(persisted.settings || {}),
};

export const useStore = create<AppState>((set, get) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  quickAddOpen: false,
  quickAddDefaultType: undefined,
  openQuickAdd: (defaultType) => set({ quickAddOpen: true, quickAddDefaultType: defaultType }),
  closeQuickAdd: () => set({ quickAddOpen: false, quickAddDefaultType: undefined }),

  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  settings: mergedSettings,
  subjects: persisted.subjects || initialSubjects,
  classes: persisted.classes || initialClasses,
  tasks: persisted.tasks || initialTasks,
  exams: persisted.exams || initialExams,
  studySessions: persisted.studySessions || initialStudySessions,
  achievements: persisted.achievements || INITIAL_ACHIEVEMENTS,

  updateSettings: (newSettings) => {
    set((state) => {
      const updated = { ...state.settings, ...newSettings };
      if (newSettings.language && newSettings.language !== state.settings.language) {
        applyLanguageToDOM(newSettings.language);
      }
      saveStateToStorage({
        settings: updated,
        subjects: state.subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { settings: updated };
    });
  },

  setLanguage: (lang) => {
    applyLanguageToDOM(lang);
    get().updateSettings({ language: lang });
  },

  addSubject: (sub) => {
    const newSubject: Subject = {
      ...sub,
      id: 'sub-' + Date.now().toString(36),
    };
    set((state) => {
      const subjects = [...state.subjects, newSubject];
      saveStateToStorage({
        settings: state.settings,
        subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { subjects };
    });
    return newSubject;
  },

  updateSubject: (id, updates) => {
    set((state) => {
      const subjects = state.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
      saveStateToStorage({
        settings: state.settings,
        subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { subjects };
    });
  },

  deleteSubject: (id) => {
    set((state) => {
      const subjects = state.subjects.filter((s) => s.id !== id);
      const classes = state.classes.filter((c) => c.subjectId !== id);
      const tasks = state.tasks.filter((t) => t.subjectId !== id);
      const exams = state.exams.filter((e) => e.subjectId !== id);
      saveStateToStorage({
        settings: state.settings,
        subjects,
        classes,
        tasks,
        exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { subjects, classes, tasks, exams };
    });
  },

  addClass: (cls) => {
    const newClass: ClassSession = {
      ...cls,
      id: 'cls-' + Date.now().toString(36),
    };
    set((state) => {
      const classes = [...state.classes, newClass];
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { classes };
    });
    return newClass;
  },

  updateClass: (id, updates) => {
    set((state) => {
      const classes = state.classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { classes };
    });
  },

  deleteClass: (id) => {
    set((state) => {
      const classes = state.classes.filter((c) => c.id !== id);
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { classes };
    });
  },

  addTask: (task) => {
    const newTask: Task = {
      ...task,
      id: 'tsk-' + Date.now().toString(36),
    };
    set((state) => {
      const tasks = [newTask, ...state.tasks];
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { tasks };
    });
    return newTask;
  },

  updateTask: (id, updates) => {
    set((state) => {
      const tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { tasks };
    });
  },

  toggleTaskStatus: (id) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'done';
          const newStatus = isDone ? 'todo' : 'done';
          return {
            ...t,
            status: newStatus as Task['status'],
            completedAt: !isDone ? new Date().toISOString().slice(0, 10) : undefined,
          };
        }
        return t;
      });

      // Update achievements if tasks completed >= 10
      const totalDone = tasks.filter((t) => t.status === 'done').length;
      const achievements = state.achievements.map((a) => {
        if (a.id === 'tasks_10') {
          return {
            ...a,
            progress: Math.min(totalDone, 10),
            unlocked: totalDone >= 10,
            unlockedAt: totalDone >= 10 && !a.unlocked ? new Date().toISOString().slice(0, 10) : a.unlockedAt,
          };
        }
        return a;
      });

      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements,
      });

      return { tasks, achievements };
    });
  },

  toggleSubtask: (taskId, subtaskId) => {
    set((state) => {
      const tasks = state.tasks.map((t) => {
        if (t.id === taskId) {
          const subtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks };
        }
        return t;
      });
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { tasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks,
        exams: state.exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { tasks };
    });
  },

  addExam: (exam) => {
    const newExam: Exam = {
      ...exam,
      id: 'ex-' + Date.now().toString(36),
    };
    set((state) => {
      const exams = [...state.exams, newExam];
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { exams };
    });
    return newExam;
  },

  updateExam: (id, updates) => {
    set((state) => {
      const exams = state.exams.map((e) => (e.id === id ? { ...e, ...updates } : e));
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { exams };
    });
  },

  deleteExam: (id) => {
    set((state) => {
      const exams = state.exams.filter((e) => e.id !== id);
      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams,
        studySessions: state.studySessions,
        achievements: state.achievements,
      });
      return { exams };
    });
  },

  addStudySession: (session) => {
    const newSession: StudySession = {
      ...session,
      id: 'ss-' + Date.now().toString(36),
    };
    set((state) => {
      const studySessions = [newSession, ...state.studySessions];
      const totalHours = Math.round(
        studySessions.reduce((acc, s) => acc + s.durationMinutes, 0) / 60
      );

      // Check achievement unlocks
      const achievements = state.achievements.map((a) => {
        if (a.id === 'first_session' && !a.unlocked) {
          return { ...a, unlocked: true, unlockedAt: new Date().toISOString().slice(0, 10), progress: 1 };
        }
        if (a.id === 'hours_25') {
          return {
            ...a,
            progress: Math.min(totalHours, 25),
            unlocked: totalHours >= 25,
            unlockedAt: totalHours >= 25 && !a.unlocked ? new Date().toISOString().slice(0, 10) : a.unlockedAt,
          };
        }
        return a;
      });

      saveStateToStorage({
        settings: state.settings,
        subjects: state.subjects,
        classes: state.classes,
        tasks: state.tasks,
        exams: state.exams,
        studySessions,
        achievements,
      });
      return { studySessions, achievements };
    });
  },

  resetToDemoData: () => {
    const curLang = get().settings.language;
    const today = new Date().toISOString().slice(0, 10);
    const subjects = getLocalizedSeedSubjects(curLang);
    const classes = getSeedClasses();
    const tasks = getSeedTasks(today, curLang);
    const exams = getSeedExams();
    const studySessions = getSeedStudySessions(today);
    const achievements = INITIAL_ACHIEVEMENTS;

    set({
      subjects,
      classes,
      tasks,
      exams,
      studySessions,
      achievements,
    });

    saveStateToStorage({
      settings: get().settings,
      subjects,
      classes,
      tasks,
      exams,
      studySessions,
      achievements,
    });
  },

  wipeData: () => {
    const emptyState = {
      subjects: [],
      classes: [],
      tasks: [],
      exams: [],
      studySessions: [],
      achievements: INITIAL_ACHIEVEMENTS,
    };
    set(emptyState);
    saveStateToStorage({
      settings: get().settings,
      ...emptyState,
    });
  },

  exportJSON: () => {
    const s = get();
    const payload = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      settings: s.settings,
      subjects: s.subjects,
      classes: s.classes,
      tasks: s.tasks,
      exams: s.exams,
      studySessions: s.studySessions,
      achievements: s.achievements,
    };
    return JSON.stringify(payload, null, 2);
  },

  importJSON: (jsonStr) => {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || !Array.isArray(data.subjects)) {
        return false;
      }
      set({
        subjects: data.subjects || [],
        classes: data.classes || [],
        tasks: data.tasks || [],
        exams: data.exams || [],
        studySessions: data.studySessions || [],
        achievements: data.achievements || INITIAL_ACHIEVEMENTS,
        settings: { ...get().settings, ...(data.settings || {}) },
      });
      saveStateToStorage({
        settings: { ...get().settings, ...(data.settings || {}) },
        subjects: data.subjects || [],
        classes: data.classes || [],
        tasks: data.tasks || [],
        exams: data.exams || [],
        studySessions: data.studySessions || [],
        achievements: data.achievements || INITIAL_ACHIEVEMENTS,
      });
      return true;
    } catch {
      return false;
    }
  },
}));
