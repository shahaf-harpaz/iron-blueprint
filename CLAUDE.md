# CLAUDE.md — Iron Blueprint

## Project Overview

Iron Blueprint is a personal fitness tracking OS. Users build workout programs (templates + exercises), log sets with weight/reps, track progressive overload, and view analytics.

**Tech stack:**
- Next.js 16.1.6, React 19 — App Router, Server + Client Components
- Supabase — PostgreSQL database, Auth (email + Google OAuth), Row Level Security
- `@supabase/ssr` ^0.8.0 — cookie-based auth for SSR
- TanStack React Query ^5 — for hooks-based data fetching
- Zustand ^5 — lightweight state (useSession, useRestTimer)
- Tailwind CSS v4, clsx, tailwind-merge
- Recharts, Framer Motion, dnd-kit, lucide-react
- TypeScript 5, ESLint 9, Node 20.x (pinned in `engines`)

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              'use client' root layout — sidebar + mobile dock + PageTransition
│   ├── page.tsx                Home dashboard (Server Component, force-dynamic) — weekly program
│   ├── login/page.tsx          Login/signup — email+password tabs + Google OAuth, no sidebar
│   ├── analytics/page.tsx      Analytics (Server Component) — fetches sets/logs, renders AnalyticsDashboard
│   ├── architect/page.tsx      'use client' — manage days, exercise library, assign exercises to days
│   ├── auth/callback/route.ts  OAuth code exchange → session cookie → redirect to /
│   ├── test-backend/page.tsx   Dev diagnostic — schema checks, raw table views (uses legacy client)
│   └── workout/[id]/page.tsx   Legacy route — not linked, uses old column names, do not extend
│
├── components/
│   ├── analytics/
│   │   └── AnalyticsDashboard.tsx  Client — summary cards, overload SVG chart, heatmap, volume bars
│   ├── session/
│   │   ├── SessionPanel.tsx    Client — renders Exercise accordions + SetRows from props (no fetch)
│   │   ├── WeeklyProgram.tsx   Client — day cards accordion + activeDay state → mounts SessionPanel
│   │   └── WorkoutSession.tsx  Legacy — used by workout/[id]/page.tsx only
│   ├── providers/
│   │   ├── QueryProvider.tsx   TanStack Query client wrapper
│   │   └── ThemeProvider.tsx   Dark/light theme
│   └── ui/
│       ├── GlassCard.tsx       Reusable glassmorphism card
│       ├── PageTransition.tsx  fadeIn animation wrapper
│       ├── Pill.tsx            Small label chip
│       ├── ResetLogsModal.tsx  Two-step delete modal (workout_logs + set_entries)
│       └── StepperInput.tsx    ± stepper for weight/reps
│
├── hooks/
│   ├── useNutrition.ts         React Query — today's nutrition_logs row
│   ├── usePerformance.ts       React Query — last set_entries per exercise
│   ├── useRestTimer.ts         useState countdown timer with interval
│   ├── useSession.ts           Zustand — active workout log state + logSet()
│   └── useTheme.ts             localStorage dark/light toggle
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           Browser singleton — getSupabaseBrowserClient()
│   │   └── server.ts           Server client — getSupabaseServerClient()
│   ├── supabase.ts             LEGACY SINGLETON — do not use in new code
│   └── utils/
│       ├── clean.ts            Strip [cite:xx] artifacts from description strings
│       ├── cn.ts               clsx + twMerge helper
│       ├── one-rm.ts           Epley 1RM formula
│       └── volume.ts           Total volume calculation
│
└── middleware.ts               Supabase session refresh + route protection
```

---

## Database Schema

### `workout_templates`
One row per training day (e.g. "Day 1 – Chest & Shoulders"). Created by the `seed_new_user` Supabase trigger on signup.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users — filter all queries by this |
| day_number | integer | Display order |
| name | text | |
| description | text | May contain `[cite:xx]` artifacts — always run through `clean()` |

### `exercises`
Exercise library. Each user owns their own exercises.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users |
| name | text | |
| muscle_group | text | e.g. "Upper Chest" |
| target_muscle | text | More specific |
| tempo_instruction | text | e.g. "3-0-1-0" |
| technical_notes | text | Coaching cues |
| default_sets | integer | Fallback if template_exercises.target_sets is null/0 |

### `template_exercises`
Junction table — assigns exercises to templates with ordering and set targets.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users — must be set on insert |
| template_id | uuid | FK → workout_templates |
| exercise_id | uuid | FK → exercises |
| position | integer | Display order — use `position`, NOT `order_index` |
| target_sets | integer | Overrides exercises.default_sets |
| target_reps | text | e.g. "8-10" |
| target_reps_min | integer | |
| target_reps_max | integer | |

### `workout_logs`
One row per training session.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users — required for RLS |
| template_id | uuid | FK → workout_templates |
| performed_at | timestamptz | Session date |
| duration_seconds | integer | Optional |
| body_weight | float | Optional |
| notes | text | Optional |

### `set_entries`
One row per logged set.

| Column | Type | Notes |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK → auth.users — required for RLS |
| log_id | uuid | FK → workout_logs |
| exercise_id | uuid | FK → exercises |
| set_number | integer | 1-based index |
| weight | float | kg |
| reps | integer | |
| rpe | integer | 1–10, nullable |
| created_at | timestamptz | Newest-first ordering |

### `nutrition_logs`
One row per user per day. Managed by `useNutrition` hook.

| Column | Type | Notes |
|---|---|---|
| user_id | uuid | PK composite with date |
| date | date | |
| kcal_target / kcal_consumed | integer | |
| protein_g / protein_consumed_g | integer | |
| fat_g / fat_consumed_g | integer | |

**RLS enabled on all tables.** Every insert into `workout_templates`, `exercises`, `template_exercises`, `workout_logs`, and `set_entries` must include `user_id: user.id`. Every select must include `.eq('user_id', user.id)`.

---

## Supabase Client Rules

| Context | Import | Usage |
|---|---|---|
| `'use client'` components | `getSupabaseBrowserClient()` from `@/lib/supabase/client` | Browser singleton, prevents duplicate GoTrue instances |
| Server Components, Route Handlers | `getSupabaseServerClient()` from `@/lib/supabase/server` | Async, reads cookies for session |
| Middleware | Inline `createServerClient` | Already set up correctly in middleware.ts |

**Never use** `import { supabase } from '@/lib/supabase'` (the legacy singleton) in new code. It bypasses auth and RLS. It still exists in `test-backend/page.tsx` and `workout/[id]/page.tsx` (legacy) but should not be extended.

Always call `supabase.auth.getUser()` at the **top** of any handler that writes to the database — before any conditional logic — so `user.id` is available for both `workout_logs` and `set_entries` inserts.

---

## Common Commands

```bash
npm run dev        # Start local dev server (Next.js on localhost:3000)
npm run build      # TypeScript compile + production build (run before pushing)
npm run lint       # ESLint check

git add . && git commit -m "message" && git push
```

---

## Important Conventions

### user_id scoping
Every table row is owned by a user. Always:
1. Call `supabase.auth.getUser()` to get `user.id`
2. Include `user_id: user.id` in every INSERT
3. Add `.eq('user_id', user.id)` to every SELECT

### Template → Exercise relationship
```
workout_templates (1)
  └── template_exercises (many) — position column orders them
        └── exercises (1) — joined via exercise_id
```
When building the home page data: fetch templates by user_id, then fetch template_exercises `.in('template_id', templateIds).eq('user_id', user.id)`, then build `exercisesByTemplate` map.

### seed_new_user trigger
A Supabase database trigger runs on `auth.users` insert (new signup) and seeds `workout_templates` rows for the user. This is why templates exist immediately after signup without any UI action.

### Styling conventions
- All session components use **inline styles only** with a `C` token object defined at the top of each file (no Tailwind classes)
- Glassmorphism: `backdropFilter: 'blur(20px) saturate(160%)'` + `background: rgba(255,255,255,0.04)` + `border: 1px solid rgba(255,255,255,0.08)`
- Accent color: `#C8FF00` (lime green)
- Tailwind utilities are acceptable in non-session pages

### Dates / timezones
Use `toLocaleDateString('en-CA')` for `YYYY-MM-DD` local dates — NOT `toISOString().split('T')[0]` which returns UTC and can be off by one day in UTC+ timezones.

---

## Known Gotchas

- **`position` not `order_index`** — `template_exercises` uses `position` for ordering. The legacy `workout/[id]/page.tsx` incorrectly references `order_index`; that file is not maintained.
- **Always filter by `user_id`** — RLS is enabled. A missing `.eq('user_id', user.id)` on a select returns 0 rows silently; a missing `user_id` on an insert causes a policy violation error.
- **`description` cleanup** — Template descriptions seeded by the trigger may contain `[cite:xx]` artifacts. Always wrap with `clean(description)` from `@/lib/utils/clean.ts` before rendering.
- **Mobile layout** — sidebar is hidden on `< 767px` via `@media (max-width: 767px) { .sidebar { display: none !important } }`. A floating pill bottom nav (`.mobile-dock`) is shown instead. Main content gets `padding-bottom: 100px` on mobile to avoid overlap.
- **Null exercise IDs** — before passing exercise IDs to `.in()`, filter: `.filter((id): id is string => !!id && id !== 'null')`. DB joins can produce null `exercise_id` if an exercise was deleted.
- **`force-dynamic` on home page** — `export const dynamic = 'force-dynamic'` is set in `page.tsx` to prevent stale cached data from Next.js static prerender.
- **`// @ts-nocheck` in analytics** — `analytics/page.tsx` uses `// @ts-nocheck` at the top to suppress type mismatches between server and client prop shapes. Don't add more; fix types instead.
- **`layout.tsx` is `'use client'`** — Required because it uses `usePathname` and `useRouter` for the sidebar active state. This means it cannot be an async Server Component.
- **`exercises` query in `architect/page.tsx` must filter by `user_id`** — both `ExercisesTab.fetchExercises()` and `ProgramTab` useEffect fetch from the `exercises` table. Missing `.eq('user_id', user.id)` causes all users' exercises to leak across accounts. RLS alone is not sufficient when using the browser client before auth resolves, so always call `supabase.auth.getUser()` first and filter explicitly.
- **Legacy files** — `workout/[id]/page.tsx` and `test-backend/page.tsx` use the legacy `supabase` singleton. Do not model new code after them.
