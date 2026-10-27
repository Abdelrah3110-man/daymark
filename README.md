# DAYMARK — Weekly-First Personal Productivity Application

Daymark is a polished, production-quality, offline-first personal productivity mobile application for Android and iOS built with React Native, Expo (SDK 58), Expo Router, Zustand, and AsyncStorage.

Designed around a **weekly-first planning workflow**:
> **Plan the week. Prepare each day. Execute with intention. Review and improve.**

---

## Visual Identity & Design System

Daymark features a warm, editorial aesthetic inspired by physical planners:
- **Background:** `#F7F5F0` (warm off-white)
- **Primary Text:** `#18181B`
- **Floating Pill Bottom Navigation:** `#12131C`
- **Signature Pastels:** Lavender (`#D0C9FF`), Peach (`#FFC887`), Light Blue (`#BEE1FF`), Soft Pink (`#FFC0EA`), Mint (`#A7F3D0`)
- **Typography & Scale:** Refined hierarchy, tactile feedback, restrained subtle animations.

---

## Core Planning Architecture: Weekly First

1. **Weekly Planner (Primary Workspace):**
   - Organize the week across all 7 days with drag/reordering and time scheduling.
   - Workload analysis per day with automated conflict and overload warnings against your daily availability limit.
   - Designate up to 3 core daily priorities per day.
2. **Daily Previews Generation:**
   - Prominent **"Generate Daily Previews"** action idempotently creates 7 actionable daily execution previews.
   - Preserves task identity without duplicate records.
3. **Daily Customization & Safe Synchronization:**
   - Individual days can be customized with `DailyTaskOverride` without mutating weekly commitments.
   - Built-in conflict detection flags discrepancies and offers explicit choices: **"Apply Weekly Changes"** or **"Keep Daily Customization"**.
4. **Execution & Accountability:**
   - Complete tasks from Home, Daily Preview, or Weekly Planner.
   - Daily Challenge card for 1 meaningful daily intention.
   - Postponement tracker preserving historical reasons without punitive shaming.
   - Return-after-inactivity flow welcoming users back gently.
5. **Deep Focus Mode:**
   - Focus timer with reliable background timestamp tracking (15m, 25m, 45m, 60m).
   - Post-session reflection and optional task check-off.
6. **Goals & Recurring Habits:**
   - Long-term goals with measurable targets and milestone checklists.
   - Recurring habits with independent daily occurrence check-ins across the week.
7. **Notes & Quick Capture:**
   - Fast notes manager with tag search, pinning, and bi-directional linking to tasks or goals.
8. **Deterministic XP & Honest Analytics:**
   - Explainable XP ledger: Light (5 XP), Medium (10 XP), Hard (20 XP), Daily Priorities Bonus (10 XP), Weekly Review Bonus (15 XP).
   - Real level progression and unlockable achievements based solely on actual records.
   - Weekly Performance Review with goal setting for the upcoming week.
9. **Strict Offline & Zero Mock Data:**
   - No servers, no accounts, no SQLite/Firebase/cloud sync.
   - Starts genuinely empty on first launch; all stats derived from real user activity.
   - JSON export and double-confirmed full data clear.

---

## Project Structure

```text
├── app/
│   ├── _layout.tsx               # Root layout, Safe Area, store hydration
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Floating dark pill tab bar
│   │   ├── index.tsx             # Home dashboard & execution overview
│   │   ├── planner.tsx           # Weekly Planner (primary workspace)
│   │   ├── goals.tsx             # Goals & Habits manager
│   │   ├── progress.tsx          # Progress, XP, analytics, and weekly review
│   │   └── notes.tsx             # Quick capture notes manager
│   ├── daily/
│   │   └── [date].tsx            # Daily preview, customization, & conflict resolution
│   ├── focus/
│   │   └── [id].tsx              # Dedicated deep focus mode & timer
│   └── settings.tsx              # Settings, availability, export, and clear data
├── components/
│   ├── common/                   # ScreenHeader, EmptyState, ConfirmDialog
│   ├── navigation/               # FloatingBottomTabBar
│   ├── home/                     # DailyChallengeCard, TodayOverviewCard, WeeklySummaryCard, QuickActionsRow
│   ├── planner/                  # WeekNavigationHeader, WeekDaySummaryCard, PlanConflictDialog
│   ├── tasks/                    # TaskCard, TaskEditor
│   ├── goals/                    # GoalCard, HabitCard, GoalEditor, HabitEditor
│   ├── focus/                    # FocusTimer, FocusReflectionModal
│   ├── progress/                 # XPProgressCard, MetricsGrid, AchievementsSection
│   └── notes/                    # NoteCard, NoteEditor
├── store/
│   ├── app-store.ts              # Settings, active week, hydration orchestrator
│   ├── task-store.ts             # Tasks CRUD, completions, postponements, priorities
│   ├── planning-store.ts         # Weekly plans, daily previews, overrides, conflicts
│   ├── goal-store.ts             # Goals, habits, and independent occurrence check-ins
│   ├── focus-store.ts            # Focus sessions, timer state, recovery
│   ├── notes-store.ts            # Notes CRUD, tagging, linking, pinning
│   ├── reviews-store.ts          # Weekly performance reviews
│   └── xp-store.ts               # XP transactions ledger and deduplication
├── services/
│   ├── persistence.ts            # AsyncStorage versioned storage, export, and reset
│   └── notifications.ts          # Local notifications wrapper with graceful fallback
├── types/
│   └── app.ts                    # Strictly-typed domain models
├── constants/
│   ├── theme.ts                  # Editorial palette, typography scale, spacing, shadows
│   └── xp-rules.ts               # XP formulas, level progression, and achievements
├── utils/
│   ├── dates.ts                  # Local calendar math, week boundaries, formatters
│   ├── planning.ts               # Effective task resolution and conflict detection
│   ├── workload.ts               # Daily & weekly workload calculation and time conflicts
│   └── statistics.ts             # Honest metrics calculation
└── tests/
    ├── dates.test.ts             # Calendar and week arithmetic tests
    ├── workload.test.ts          # Workload and time conflict tests
    ├── planning.test.ts          # Sync, overrides, and conflict tests
    ├── xp.test.ts                # Deterministic XP and level progression tests
    └── statistics.test.ts        # Honest stats and streak tests
```

---

## Commands

```bash
# Start development server
npx expo start

# Run unit tests
npm test

# Typecheck with TypeScript
npm run typecheck
```
