import { Achievement, ClassSession, Exam, Language, StudySession, Subject, Task, UserSettings } from '../types';

export const SUBJECT_PALETTE = [
  '#6C5CE7', // Indigo Violet
  '#00B894', // Soft Teal
  '#E17055', // Coral Amber
  '#FDCB6E', // Warm Gold
  '#0984E3', // Sky Azure
  '#E84393', // Rose Magenta
  '#8E44AD', // Deep Violet
  '#2ECC71', // Fresh Mint
  '#00CEC9', // Cyan Turquoise
  '#D63031', // Crimson
  '#A29BFE', // Soft Lavender
  '#636E72', // Slate Grey
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    titleKey: 'First Focus Session',
    descKey: 'Complete your very first Pomodoro focus session',
    icon: '🎯',
    unlocked: true,
    unlockedAt: '2026-11-05',
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'streak_3',
    titleKey: '3-Day Study Streak',
    descKey: 'Study consistently for 3 consecutive days',
    icon: '🔥',
    unlocked: true,
    unlockedAt: '2026-11-06',
    progress: 3,
    maxProgress: 3,
  },
  {
    id: 'streak_7',
    titleKey: 'Weekly Warrior (7-Day Streak)',
    descKey: 'Keep your streak alive for a full week',
    icon: '⚡',
    unlocked: false,
    progress: 4,
    maxProgress: 7,
  },
  {
    id: 'tasks_10',
    titleKey: 'Task Finisher',
    descKey: 'Complete 10 homework assignments or study tasks',
    icon: '✅',
    unlocked: true,
    unlockedAt: '2026-11-06',
    progress: 10,
    maxProgress: 10,
  },
  {
    id: 'hours_25',
    titleKey: 'Deep Worker (25 Hours)',
    descKey: 'Log 25 total hours of deep focused study',
    icon: '🏆',
    unlocked: false,
    progress: 18,
    maxProgress: 25,
  },
  {
    id: 'exam_ready',
    titleKey: 'Exam Preparedness',
    descKey: 'Generate a revision plan for an upcoming exam',
    icon: '📚',
    unlocked: true,
    unlockedAt: '2026-11-04',
    progress: 1,
    maxProgress: 1,
  },
];

export function getLocalizedSeedSubjects(lang: Language): Subject[] {
  if (lang === 'ar') {
    return [
      { id: 'sub-1', name: 'الرياضيات التطبيقية', code: 'MATH201', color: '#6C5CE7', teacher: 'د. سامي الأحمد', room: 'قاعة 302' },
      { id: 'sub-2', name: 'هياكل البيانات والخوارزميات', code: 'CS210', color: '#00B894', teacher: 'أ. د. نورة القحطاني', room: 'معمل الحاسوب B' },
      { id: 'sub-3', name: 'الفيزياء الحديثة', code: 'PHYS102', color: '#0984E3', teacher: 'د. يوسف العلي', room: 'مدرج الفيزياء 1' },
      { id: 'sub-4', name: 'اللغة الإنجليزية الأكاديمية', code: 'ENG105', color: '#E17055', teacher: 'أ. سارة المنصور', room: 'قاعة 114' },
      { id: 'sub-5', name: 'الكيمياء العضوية', code: 'CHEM205', color: '#E84393', teacher: 'د. خالد العمري', room: 'مختبر الكيمياء 4' },
    ];
  }
  if (lang === 'fr') {
    return [
      { id: 'sub-1', name: 'Mathématiques Appliquées', code: 'MATH201', color: '#6C5CE7', teacher: 'Pr. Laurent Dupont', room: 'Amphi A' },
      { id: 'sub-2', name: 'Algorithmes & Structures', code: 'CS210', color: '#00B894', teacher: 'Dr. Sophie Bernard', room: 'Labo Info 3' },
      { id: 'sub-3', name: 'Physique Moderne', code: 'PHYS102', color: '#0984E3', teacher: 'Pr. Michel Moreau', room: 'Salle 204' },
      { id: 'sub-4', name: 'Anglais Universitaire', code: 'ENG105', color: '#E17055', teacher: 'Mme. Claire Leroy', room: 'Salle 112' },
      { id: 'sub-5', name: 'Chimie Organique', code: 'CHEM205', color: '#E84393', teacher: 'Dr. Thomas Roux', room: 'Laboratoire 2' },
    ];
  }
  return [
    { id: 'sub-1', name: 'Applied Mathematics', code: 'MATH201', color: '#6C5CE7', teacher: 'Dr. Arthur Campbell', room: 'Hall 302' },
    { id: 'sub-2', name: 'Data Structures & Algorithms', code: 'CS210', color: '#00B894', teacher: 'Prof. Elena Rostova', room: 'Comp Lab B' },
    { id: 'sub-3', name: 'Modern Physics', code: 'PHYS102', color: '#0984E3', teacher: 'Dr. Joseph Clark', room: 'Physics Amphitheater' },
    { id: 'sub-4', name: 'Academic English & Writing', code: 'ENG105', color: '#E17055', teacher: 'Sarah Jenkins, MA', room: 'Room 114' },
    { id: 'sub-5', name: 'Organic Chemistry', code: 'CHEM205', color: '#E84393', teacher: 'Dr. Kenneth Vance', room: 'Chem Lab 4' },
  ];
}

export function getSeedClasses(): ClassSession[] {
  return [
    // Monday (1)
    { id: 'cls-1', subjectId: 'sub-1', dayOfWeek: 1, startTime: '09:00', endTime: '10:30', room: 'Hall 302', recurrence: 'weekly' },
    { id: 'cls-2', subjectId: 'sub-2', dayOfWeek: 1, startTime: '11:00', endTime: '12:30', room: 'Comp Lab B', recurrence: 'weekly' },
    { id: 'cls-3', subjectId: 'sub-3', dayOfWeek: 1, startTime: '14:00', endTime: '15:30', room: 'Physics Amphitheater', recurrence: 'weekly' },

    // Tuesday (2)
    { id: 'cls-4', subjectId: 'sub-4', dayOfWeek: 2, startTime: '10:00', endTime: '11:30', room: 'Room 114', recurrence: 'weekly' },
    { id: 'cls-5', subjectId: 'sub-5', dayOfWeek: 2, startTime: '13:00', endTime: '15:00', room: 'Chem Lab 4', recurrence: 'weekly' },

    // Wednesday (3)
    { id: 'cls-6', subjectId: 'sub-1', dayOfWeek: 3, startTime: '09:00', endTime: '10:30', room: 'Hall 302', recurrence: 'weekly' },
    { id: 'cls-7', subjectId: 'sub-2', dayOfWeek: 3, startTime: '11:00', endTime: '13:00', room: 'Comp Lab B', recurrence: 'weekly' },

    // Thursday (4)
    { id: 'cls-8', subjectId: 'sub-3', dayOfWeek: 4, startTime: '10:00', endTime: '11:30', room: 'Physics Amphitheater', recurrence: 'weekly' },
    { id: 'cls-9', subjectId: 'sub-4', dayOfWeek: 4, startTime: '13:30', endTime: '15:00', room: 'Room 114', recurrence: 'weekly' },

    // Friday (5) or Sunday (0) based on locale preference
    { id: 'cls-10', subjectId: 'sub-5', dayOfWeek: 5, startTime: '09:30', endTime: '11:00', room: 'Chem Lab 4', recurrence: 'weekly' },
    { id: 'cls-11', subjectId: 'sub-1', dayOfWeek: 0, startTime: '10:00', endTime: '11:30', room: 'Hall 302', recurrence: 'weekly' },
  ];
}

export function getSeedTasks(todayStr: string, lang: Language): Task[] {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);
  const dayAfterStr = dayAfter.toISOString().slice(0, 10);

  if (lang === 'ar') {
    return [
      {
        id: 'tsk-1',
        title: 'حل مسائل التفاضل والتحليل الرياضي (الفصل الرابع)',
        subjectId: 'sub-1',
        dueDate: todayStr,
        dueTime: '18:00',
        priority: 'high',
        status: 'in_progress',
        estimatedMinutes: 60,
        subtasks: [
          { id: 'st-1', title: 'مراجعة نظريات النهايات', completed: true },
          { id: 'st-2', title: 'حل التمارين من 15 إلى 24', completed: false },
          { id: 'st-3', title: 'التحقق من صحة الحلول مع الزملاء', completed: false },
        ],
        notes: 'التركيز على قاعدة السلسلة ومشتقات الدوال المثلثية',
        links: ['https://mathworld.wolfram.com'],
      },
      {
        id: 'tsk-2',
        title: 'برمجة خوارزمية البحث الثنائي والأشجار المتوازنة',
        subjectId: 'sub-2',
        dueDate: todayStr,
        dueTime: '21:00',
        priority: 'high',
        status: 'done',
        estimatedMinutes: 90,
        completedAt: todayStr,
        subtasks: [
          { id: 'st-4', title: 'كتابة كود الشجرة الثنائية', completed: true },
          { id: 'st-5', title: 'اختبار حالات الحافة والتوازن', completed: true },
        ],
      },
      {
        id: 'tsk-3',
        title: 'كتابة المقال التحليلي باللغة الإنجليزية',
        subjectId: 'sub-4',
        dueDate: tomorrowStr,
        dueTime: '14:00',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 45,
        subtasks: [
          { id: 'st-6', title: 'تحديد الفكرة الرئيسة والمراجع', completed: false },
          { id: 'st-7', title: 'صياغة المسودة الأولى', completed: false },
        ],
      },
      {
        id: 'tsk-4',
        title: 'تقرير تجربة المعايرة الكيميائية',
        subjectId: 'sub-5',
        dueDate: dayAfterStr,
        dueTime: '16:30',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 75,
        subtasks: [],
      },
    ];
  }

  if (lang === 'fr') {
    return [
      {
        id: 'tsk-1',
        title: 'Exercices de calcul différentiel (Chapitre 4)',
        subjectId: 'sub-1',
        dueDate: todayStr,
        dueTime: '18:00',
        priority: 'high',
        status: 'in_progress',
        estimatedMinutes: 60,
        subtasks: [
          { id: 'st-1', title: 'Revoir le théorème des accroissements finis', completed: true },
          { id: 'st-2', title: 'Résoudre les problèmes 15 à 24', completed: false },
          { id: 'st-3', title: 'Vérifier les solutions', completed: false },
        ],
        notes: 'Bien soigner la rédaction des démonstrations',
      },
      {
        id: 'tsk-2',
        title: 'Implémentation des arbres AVL en C++',
        subjectId: 'sub-2',
        dueDate: todayStr,
        dueTime: '21:00',
        priority: 'high',
        status: 'done',
        estimatedMinutes: 90,
        completedAt: todayStr,
        subtasks: [
          { id: 'st-4', title: 'Coder les rotations droite et gauche', completed: true },
          { id: 'st-5', title: 'Tester les cas limites', completed: true },
        ],
      },
      {
        id: 'tsk-3',
        title: 'Essai analytique en Anglais académique',
        subjectId: 'sub-4',
        dueDate: tomorrowStr,
        dueTime: '14:00',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 45,
        subtasks: [],
      },
      {
        id: 'tsk-4',
        title: 'Rapport de TP de chimie organique',
        subjectId: 'sub-5',
        dueDate: dayAfterStr,
        dueTime: '16:30',
        priority: 'medium',
        status: 'todo',
        estimatedMinutes: 75,
        subtasks: [],
      },
    ];
  }

  return [
    {
      id: 'tsk-1',
      title: 'Calculus Problem Set 4: Differential Equations',
      subjectId: 'sub-1',
      dueDate: todayStr,
      dueTime: '18:00',
      priority: 'high',
      status: 'in_progress',
      estimatedMinutes: 60,
      subtasks: [
        { id: 'st-1', title: 'Review separation of variables', completed: true },
        { id: 'st-2', title: 'Solve problems 12 to 24', completed: false },
        { id: 'st-3', title: 'Check boundary conditions', completed: false },
      ],
      notes: 'Focus on second-order linear differential equations',
      links: ['https://mathworld.wolfram.com'],
    },
    {
      id: 'tsk-2',
      title: 'Implement AVL Tree Balance & Deletion',
      subjectId: 'sub-2',
      dueDate: todayStr,
      dueTime: '21:00',
      priority: 'high',
      status: 'done',
      estimatedMinutes: 90,
      completedAt: todayStr,
      subtasks: [
        { id: 'st-4', title: 'Write left and right rotation logic', completed: true },
        { id: 'st-5', title: 'Run unit test suite with 10k nodes', completed: true },
      ],
    },
    {
      id: 'tsk-3',
      title: 'Literature Review Essay Draft',
      subjectId: 'sub-4',
      dueDate: tomorrowStr,
      dueTime: '14:00',
      priority: 'medium',
      status: 'todo',
      estimatedMinutes: 45,
      subtasks: [
        { id: 'st-6', title: 'Draft introduction and thesis statement', completed: false },
        { id: 'st-7', title: 'Format citations in APA 7th style', completed: false },
      ],
    },
    {
      id: 'tsk-4',
      title: 'Lab Report: Organic Synthesis & Spectroscopy',
      subjectId: 'sub-5',
      dueDate: dayAfterStr,
      dueTime: '16:30',
      priority: 'medium',
      status: 'todo',
      estimatedMinutes: 75,
      subtasks: [],
    },
  ];
}

export function getSeedExams(): Exam[] {
  const d1 = new Date();
  d1.setDate(d1.getDate() + 8);
  const exam1Date = d1.toISOString().slice(0, 10);

  const d2 = new Date();
  d2.setDate(d2.getDate() + 15);
  const exam2Date = d2.toISOString().slice(0, 10);

  return [
    {
      id: 'ex-1',
      subjectId: 'sub-2',
      date: exam1Date,
      time: '09:00',
      location: 'Science Complex, Auditorium C',
      topics: [
        'Asymptotic Analysis & Big-O',
        'Balanced Binary Search Trees (AVL, Red-Black)',
        'Graph Traversal (BFS, DFS, Dijkstra)',
        'Dynamic Programming & Memoization',
      ],
      targetGrade: 'A+',
      priority: 'high',
    },
    {
      id: 'ex-2',
      subjectId: 'sub-1',
      date: exam2Date,
      time: '14:00',
      location: 'Mathematics Hall 101',
      topics: [
        'Multivariable Calculus',
        'Partial Derivatives & Gradients',
        'Double and Triple Integrals',
        'Green’s & Stokes’ Theorems',
      ],
      targetGrade: 'A',
      priority: 'normal',
    },
  ];
}

export function getSeedStudySessions(todayStr: string): StudySession[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  return [
    { id: 'ss-1', subjectId: 'sub-1', date: dates[0], durationMinutes: 50, type: 'pomodoro', completed: true, timestamp: Date.now() - 6 * 86400000 },
    { id: 'ss-2', subjectId: 'sub-2', date: dates[1], durationMinutes: 75, type: 'pomodoro', completed: true, timestamp: Date.now() - 5 * 86400000 },
    { id: 'ss-3', subjectId: 'sub-3', date: dates[2], durationMinutes: 60, type: 'pomodoro', completed: true, timestamp: Date.now() - 4 * 86400000 },
    { id: 'ss-4', subjectId: 'sub-1', date: dates[3], durationMinutes: 90, type: 'pomodoro', completed: true, timestamp: Date.now() - 3 * 86400000 },
    { id: 'ss-5', subjectId: 'sub-2', date: dates[4], durationMinutes: 110, type: 'pomodoro', completed: true, timestamp: Date.now() - 2 * 86400000 },
    { id: 'ss-6', subjectId: 'sub-5', date: dates[5], durationMinutes: 45, type: 'pomodoro', completed: true, timestamp: Date.now() - 1 * 86400000 },
    { id: 'ss-7', subjectId: 'sub-2', date: todayStr, durationMinutes: 50, type: 'pomodoro', completed: true, timestamp: Date.now() },
  ];
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  language: 'en',
  theme: 'system',
  weekStartDay: 1, // Monday
  timeFormat: '24h',
  dailyStudyGoalHours: 3.5,
  preferredStudyTime: 'afternoon',
  pomodoroSettings: {
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    soundEnabled: true,
    ambientSound: 'none',
    ambientVolume: 0.5,
  },
  name: 'Alex Rivera',
  avatar: '🎓',
  hasCompletedOnboarding: true,
  remindersEnabled: true,
  reminderLeadTimeMinutes: 15,
};
