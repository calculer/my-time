# Waqti (وقتي) — Academic Time Management & Study Planner

Waqti ("My Time" in Arabic) is a production-quality, multilingual time management and study companion engineered for school and university students.

## 🌟 Key Features
- **Multilingual & Bidirectional**: Native Arabic (`ar` with full RTL layout and typography), French (`fr`), and English (`en`). Instant language switching with dynamic `dir` and `lang` DOM synchronization.
- **Academic Timetable**: Weekly time grid with live "NOW" indicator, day list view, and automatic conflict detection with warning alerts.
- **Smart Homework & Tasks**: List, Kanban (To do, In progress, Done), and Calendar views. Subtasks checklist, priority tagging, and confetti celebrations.
- **Exams Tracker & Smart Revision Plan**: Exam countdowns, locations, topics, and an algorithmic revision plan generator that spaces study sessions according to daily hours.
- **Focus Pomodoro Timer**: Animated progress ring, customizable intervals, crystal harmonic chimes, and synthesized ambient noise (Rainfall, Cafe Murmur, White Noise) powered by the browser Web Audio API (no external MP3 dependencies).
- **Academic Calendar**: Monthly calendar with color indicators and day bottom-sheet inspection.
- **Rich Analytics**: Visualizations powered by Recharts (Daily/Weekly study hours, Subject distribution donut, Consistency streak heatmap, and unlockable achievement badges).
- **Offline & PWA Ready**: Web App Manifest, Service Worker caching, and install prompts.
- **Design System**: Calm indigo-violet (`#6C5CE7`), soft teal (`#00B894`), warm amber (`#FDCB6E`), curated 12-color subject palette, responsive mobile navigation, and deep navy dark mode.

---

## 🚀 Getting Started

### Installation
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 📁 Architecture & Folder Structure

```
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service Worker for offline caching
│   ├── icon-192.svg        # Waqti app icon
│   └── icon-512.svg
├── src/
│   ├── components/
│   │   ├── layout/         # Header, Sidebar, BottomNav
│   │   ├── modals/         # QuickAddModal, FreeSlotsModal, SearchModal
│   │   └── ui/             # Reusable accessible Button, Card, Chip, Modal, ProgressRing, ColorPicker
│   ├── data/
│   │   └── seedData.ts     # Realistic demo data & curated 12-color palette
│   ├── features/
│   │   ├── dashboard/      # Daily overview, live countdown, timeline
│   │   ├── timetable/      # Weekly grid & Day list scheduler
│   │   ├── tasks/          # Homework manager (List, Kanban, Calendar)
│   │   ├── exams/          # Exam countdowns & smart revision scheduler
│   │   ├── timer/          # Pomodoro timer & Web Audio sound engine
│   │   ├── calendar/       # Month calendar with day sheets
│   │   ├── stats/          # Recharts visualizations & achievements
│   │   ├── settings/       # Profile, language, theme, JSON backup
│   │   └── onboarding/     # 3-step introductory flow (?autostart=1 skips)
│   ├── locales/
│   │   ├── ar.json         # Arabic strings & pluralization
│   │   ├── fr.json         # French translations
│   │   └── en.json         # English translations
│   ├── store/
│   │   └── useStore.ts     # Zustand store with persistent repository layer
│   ├── types/
│   │   └── index.ts        # Core TypeScript domain models
│   ├── utils/
│   │   ├── audio.ts        # Synthesized ambient audio & chime engine
│   │   ├── i18n.ts         # Translation helper with pluralization & RTL support
│   │   ├── plannerLogic.ts # Decoupled pure scheduling & conflict calculations
│   │   └── plannerLogic.test.ts # Fast deterministic unit tests (node:test)
│   ├── App.tsx             # Main shell & keyboard shortcuts
│   ├── index.css           # Tailwind CSS & Cairo/Inter typography rules
│   └── main.tsx            # React root & SW registration
```

---

## 🌐 How to Add a New Language (e.g., Spanish `es` or German `de`)

1. **Create the translation file**:
   Add `src/locales/es.json` by copying `en.json` and translating the string values.
2. **Update the Language Type**:
   In `src/types/index.ts`, update `export type Language = 'ar' | 'fr' | 'en' | 'es';`.
3. **Register in `i18n.ts`**:
   Import `es.json` in `src/utils/i18n.ts` and add `es` to the `translations` map.
4. **Add Language Selector Item**:
   In `Header.tsx`, `SettingsScreen.tsx`, and `OnboardingWizard.tsx`, add `{ code: 'es', label: 'Español' }`.
5. Notice that Waqti automatically applies `dir="ltr"` for Spanish or `dir="rtl"` if adding Urdu/Hebrew/Persian without any changes to your CSS!

---

## 🔌 Connecting a Backend (Cloud Firestore, PostgreSQL, or REST API)

All data access is encapsulated inside `src/store/useStore.ts` behind repository methods (`addSubject`, `addClass`, `addTask`, `updateTask`, `addStudySession`, etc.):
1. **Cloud Firestore**:
   Replace `saveStateToStorage` in `useStore.ts` with Firestore `collection('users').doc(userId)` sync handlers using `onSnapshot` for real-time multiplayer updates.
2. **PostgreSQL / REST API**:
   Implement an API client in `src/services/api.ts` pointing to `/api/timetable`, `/api/tasks`, `/api/sessions`. Replace the local mutations in `useStore.ts` with asynchronous dispatchers (`fetch` / `axios`).

---

## 🔮 Suggested Next Steps

1. **Cloud Sync & Cross-Device Authentication**: Firebase Auth or OAuth (Google Sign-In) to sync schedule between mobile and laptop.
2. **AI Study Assistant**: Use `@google/genai` to analyze lecture syllabi or PDFs and automatically populate exam topics, timetable sessions, and flashcard summaries.
3. **Study Groups & Collaborative Timetables**: Share timetables with classmates, see shared free slots for group study sessions.
4. **LMS Integration**: Sync assignments and deadlines directly from Canvas, Moodle, or Google Classroom via webhook/OAuth.
