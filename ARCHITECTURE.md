# Iron Blueprint — Architecture

> **Keep this file updated.** Every time a file is added, removed, or its
> purpose changes, update the relevant section. This is the single source of
> truth for the codebase.

---

## High-Level Overview

Iron Blueprint is a **Next.js 15 App Router** web app connected to a
**Supabase** (PostgreSQL) backend. It is a personal fitness tracking OS —
users log workout sets, track progressive overload, and monitor daily macros.

```
Browser → Next.js App Router → Supabase (PostgreSQL + Auth + Storage)
```

**Key architectural decisions:**
- Server Components fetch initial data (templates, exercises) — no loading flash
- Client Components handle interactivity (set logging, rest timer, accordion state)
- Supabase client is a singleton in the browser (`src/lib/supabase/client.ts`)
- No global state library — local `useState` + React Query for server data
- Inline expansion pattern: session exercises expand on the home page, no route change

---

## Database Schema

### `workout_templates`
Defines a training day (e.g. "Day 1 – Chest & Shoulders").
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| day_number | integer | Display order |
| name | text | e.g. "Day 1 – Chest & Shoulders" |
| description | text | May contain [cite:xx] artifacts — always run through `clean()` |

### `exercises`
Global library of movements.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| name | text | |
| muscle_group | text | e.g. "Upper Chest" |
| target_muscle | text | More specific target |
| tempo_instruction | text | e.g. "3-0-1-0" |
| technical_notes | text | Coaching cues |
| default_sets | integer | Default number of sets for this movement. Overridden by template_exercises.target_sets |

### `template_exercises`
Junction table — maps exercises to templates with ordering.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| template_id | uuid | FK → workout_templates |
| exercise_id | uuid | FK → exercises |
| position | integer | Display order (use this, NOT order_index) |
| target_sets | integer | |
| target_reps | text | e.g. "8-10" |

### `workout_logs`
One row per training session.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| template_id | uuid | FK → workout_templates |
| user_id | uuid | FK → auth.users |
| performed_at | timestamptz | Session date |
| duration_seconds | integer | Optional |
| body_weight | float | Optional |
| notes | text | Optional |

### `set_entries`
One row per logged set.
| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| log_id | uuid | FK → workout_logs |
| exercise_id | uuid | FK → exercises |
| user_id | uuid | FK → auth.users — set via RLS default |
| set_number | integer | 1-based set index |
| weight | float | kg |
| reps | integer | |
| rpe | integer | 1–10 |
| created_at | timestamptz | Used for ordering (newest first) |

---

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              Root layout — sidebar, providers, global styles
│   ├── page.tsx                Home/Dashboard — weekly program + inline session expansion
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts        OAuth callback — exchanges code for session cookie, redirects to /
│   ├── login/
│   │   └── page.tsx            Login page — Google OAuth button, full-screen (no sidebar)
│   ├── analytics/
│   │   └── page.tsx            Analytics dashboard server component — fetches sets/logs/exercises, auth guard
│   ├── architect/
│   │   └── page.tsx            Client component — Architect: edit days, exercise library, assign exercises
│   ├── test-backend/
│   │   └── page.tsx            Dev-only: raw Supabase query tester
│   └── workout/[id]/
│       └── page.tsx            Legacy route (kept for reference, not linked)
│
├── components/
│   ├── providers/
│   │   ├── QueryProvider.tsx   TanStack React Query client provider
│   │   └── ThemeProvider.tsx   next-themes dark/light toggle
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx  Client component — summary stats, SVG overload chart, heatmap, volume bars, recent sessions
│   ├── session/
│   │   ├── SessionPanel.tsx    Client component — renders exercises from props, no fetch
│   │   ├── WeeklyProgram.tsx   Client component — accordion state + day cards + SessionPanel
│   │   └── WorkoutSession.tsx  (legacy — superseded by SessionPanel)
│   └── ui/
│       ├── GlassCard.tsx       Reusable glassmorphism card wrapper
│       ├── Pill.tsx            Small label chip
│       └── StepperInput.tsx    ± stepper for weight/reps input
│
├── hooks/
│   ├── useNutrition.ts         Fetch today's macro data
│   ├── usePerformance.ts       Fetch last set_entries per exercise
│   ├── useRestTimer.ts         Zustand store — countdown timer state
│   ├── useSession.ts           Zustand store — active workout log state
│   └── useTheme.ts             Read/toggle current theme
│
├── lib/
│   ├── supabase.ts             Legacy singleton (used by server pages directly)
│   ├── supabase/
│   │   ├── client.ts           Browser singleton via @supabase/ssr
│   │   └── server.ts           Server Component client via @supabase/ssr + cookies
│   └── utils/
│       ├── clean.ts            Strip [cite:xx] artifacts from description strings
│       ├── cn.ts               clsx + tailwind-merge helper
│       ├── one-rm.ts           Epley 1RM formula: weight * (1 + reps/30)
│       └── volume.ts           Total volume calculation: sets × reps × weight
│
├── middleware.ts               Session refresh on every request (Supabase SSR)
└── types/                      (add database.ts here after: supabase gen types)
```

---

## Authentication Flow

```
User visits any page
  → middleware.ts checks for valid Supabase session cookie
  → No session → redirect to /login
  → User clicks "Continue with Google"
  → supabase.auth.signInWithOAuth() → browser goes to Google
  → Google redirects to /auth/callback?code=xxx
  → Callback exchanges code for session → session stored in cookie
  → Redirect to / (home page)
  → All subsequent requests carry the session cookie
  → auth.uid() returns real user ID → RLS works correctly
```

Public routes (no auth required): `/login`, `/auth/callback`
All other routes are protected by middleware — unauthenticated requests redirect to `/login`.
The login page renders full-screen (root layout detects `/login` and skips the sidebar wrapper).

---

## Data Flow

### Home page load
```
page.tsx (Server Component)
  → supabase.from('workout_templates').select(...)             — 1 query
  → supabase.from('template_exercises').in('template_id', …)  — 1 query, all templates
  → supabase.from('set_entries').in('exercise_id', …)         — 1 query, all exercises
  → builds exercisesByTemplate and lastPerfByExercise maps
  → renders MacroRing strip + <WeeklyProgram> with all data as props
  → user clicks card → activeDay state set in WeeklyProgram (client)
  → <SessionPanel> renders instantly with pre-fetched props — zero fetch delay
  → shimmer skeleton shown for 350ms during expandIn animation, then real data
```

### Logging a set
```
User hits ✓ button in SetRow
  → handleLog() in ExerciseAccordion
  → if no workout_log yet:
      supabase.auth.getUser() → get user.id
      INSERT into workout_logs { template_id, performed_at, user_id } → get id
  → INSERT into set_entries { log_id, exercise_id, set_number, weight, reps, rpe }
  → optimistic UI: set.done = true
  → onSetLogged() fires → rest timer starts
```

### Progressive overload hint
```
lastPerfByExercise built server-side from set_entries newest-first
  → passed as prop through WeeklyProgram → SessionPanel → ExerciseAccordion
  → lastPerf[exercise.id] = { weight, reps }
  → shown as "↑ last 70kg" below the weight stepper
```

---

## Key Conventions

- **Column name to remember:** `template_exercises.position` (NOT `order_index`)
- **Description cleaning:** Always wrap description strings with `clean()` from `src/lib/utils/clean.ts` before rendering — they may contain `[cite:xx]` artifacts
- **Supabase client rule:** Use `getSupabaseBrowserClient()` in Client Components, `getSupabaseServerClient()` in Server Components, and the legacy `supabase` singleton only in existing server pages until refactored
- **Error handling:** Never show a blank/empty state silently — always render a red inline error message with the specific reason
- **Styling:** No Tailwind classes in session components — all inline styles using the `C` token object defined at the top of each file. Glass effect = `backdropFilter: 'blur(20px) saturate(160%)'` + `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(255,255,255,0.08)`
- **All table queries must filter by `user_id`** — every `select()` from any table must include `.eq('user_id', user.id)`. Omitting this causes data from other users to leak into the current user's view. RLS alone is not a reliable guard in the browser client because auth state may not have resolved at query time.

---

## Common Mistakes

- **Missing `user_id` on `workout_logs` / `set_entries` inserts** — causes RLS rejection with "new row violates row-level security policy". Always call `supabase.auth.getUser()` before inserting into either table and pass `user.id` explicitly. Never pass `null`. Call `getUser()` once per handler and reuse the result for both inserts.
- **Calling `getUser()` inside the `if (!logId)` branch** — means subsequent sets (when logId already exists) can't include `user_id` in `set_entries`. Always fetch user at the top of the handler, before any conditional logic.

---

## Environment Variables

| Variable | Used in | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Public anon key (safe to expose) |

Never use the `service_role` key in client-side code.

---

## Update Log

| Date | Change | Files affected |
|---|---|---|
| 2025-02-28 | Initial architecture | All |
| 2025-02-28 | Fixed column name: order_index → position | session/[templateId]/page.tsx |
| 2025-02-28 | Inline session expansion replaces separate route | page.tsx, SessionPanel.tsx |
| 2026-03-01 | Prefetch exercises on page load to eliminate click delay; added missing schema columns for analytics; fixed skeleton shimmer | page.tsx, SessionPanel.tsx, WeeklyProgram.tsx |
| 2026-03-01 | Added Architect page (Days/Exercises/Program tabs); visual hierarchy with indentation + connector lines; test-backend schema column verification | architect/page.tsx, SessionPanel.tsx, test-backend/page.tsx |
| 2026-03-01 | Fixed RLS error (missing user_id on workout_logs/set_entries inserts); editable exercise rows in Architect; dynamic set count from target_sets; added default_sets to exercises table | SessionPanel.tsx, architect/page.tsx, page.tsx |
| 2026-03-01 | Full auth implementation: Google OAuth login, callback route, middleware route protection, sign-out, real user avatar in sidebar | middleware.ts, login/page.tsx, auth/callback/route.ts, layout.tsx |
| 2026-03-01 | Fixed RLS missing user_id on workout_logs and set_entries inserts; rebuilt login page with email/password sign in + sign up tabs + Google OAuth | SessionPanel.tsx, login/page.tsx |
| 2026-03-01 | Added RLS diagnostic note + recent activity section (last 5 rows from workout_logs and set_entries, user_id highlighted red if null) to test-backend | test-backend/page.tsx |
| 2026-03-01 | Built analytics dashboard: summary stats, progressive overload SVG chart (Epley 1RM), 12-week training heatmap, volume by muscle group bars, recent sessions list | analytics/page.tsx, AnalyticsDashboard.tsx |
| 2026-03-01 | Analytics: weekly sessions bar chart, best/worst improvement trendlines, weekly goal ring card; fixed dynamic set count (already correct — confirmed exercise.target_sets used); added sets input in Architect | AnalyticsDashboard.tsx, architect/page.tsx |
| 2026-03-01 | Fixed ExerciseAccordion targetSets prop chain (explicit prop + call site); added Default Sets field to Add Exercise form; replaced weekly ring with Days This Week 7-dot display; added 1M/3M/6M/All time range to overload chart with external Y-axis and evenly spaced X-axis labels | SessionPanel.tsx, architect/page.tsx, AnalyticsDashboard.tsx |
| 2026-03-01 | App-level set count (inline editor + auto-populate from default_sets + priority chain); per-set last performance pre-fill with hints; page transition animation; active nav highlight; dark/light toggle; suppressHydrationWarning | architect/page.tsx, SessionPanel.tsx, WeeklyProgram.tsx, page.tsx, layout.tsx, globals.css, PageTransition.tsx |
| 2026-03-01 | Fixed Recent Sessions set count (match by log_id not date); fixed dark/light mode using CSS filter body class instead of CSS variables | AnalyticsDashboard.tsx, analytics/page.tsx, globals.css, layout.tsx |
| 2026-03-01 | CRITICAL: Fixed page.tsx using unauthenticated supabase client — switched to getSupabaseServerClient() with auth guard + user_id filter on set_entries; analytics Recent Sessions now shows per-exercise breakdown with sets + volume | src/app/page.tsx, analytics/page.tsx, AnalyticsDashboard.tsx |
| 2026-03-03 | Fixed data scoping bug: exercises queries in Architect (ExercisesTab + ProgramTab) were missing .eq('user_id', user.id), leaking all users' exercises across accounts | architect/page.tsx |
