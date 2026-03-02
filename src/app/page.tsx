export const dynamic = 'force-dynamic'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { clean } from '@/lib/utils/clean'
import { WeeklyProgram } from '@/components/session/WeeklyProgram'
import type { Exercise } from '@/components/session/SessionPanel'

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const C = {
  surface:  'rgba(255,255,255,0.04)',
  border:   'rgba(255,255,255,0.08)',
  accent:   '#C8FF00',
  blue:     '#4488FF',
  purple:   '#A78BFA',
  text:     '#FFF',
  mid:      'rgba(255,255,255,0.55)',
  dim:      'rgba(255,255,255,0.28)',
}

const glass = {
  backdropFilter: 'blur(20px) saturate(160%)',
  WebkitBackdropFilter: 'blur(20px) saturate(160%)',
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderRadius: 18,
  boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.07), 0 20px 40px rgba(0,0,0,0.4)',
}

function MacroRing({ label, value, max, unit, color }: {
  label: string; value: number; max: number; unit: string; color: string
}) {
  const r = 20
  const circ = 2 * Math.PI * r
  const progress = Math.min(value / max, 1)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="24" cy="24" r={r} fill="none"
            stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${progress * circ} ${circ}`}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 800, color,
        }}>{Math.round(progress * 100)}%</div>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}<span style={{ fontSize: 10, fontWeight: 600, color: C.dim, marginLeft: 2 }}>{unit}</span>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.10em', textTransform: 'uppercase', color: C.dim, marginTop: 3 }}>{label}</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.18)', marginTop: 1 }}>/ {max}{unit}</div>
      </div>
    </div>
  )
}

export default async function Dashboard() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ── 1. Templates ──────────────────────────────────────────────────────────
  const { data: rawTemplates, error: templatesError } = await supabase
    .from('workout_templates')
    .select('id, name, description, day_number')
    .order('day_number', { ascending: true })

  const templateLoadError = !!templatesError
  const templateIds = (rawTemplates ?? []).map((t: any) => t.id)

  let exercisesByTemplate: Record<string, Exercise[]> = {}
  let lastPerfByExercise: Record<string, { weight: number; reps: number }> = {}
  let lastPerfBySet: Record<string, Record<number, { weight: number; reps: number }>> = {}

  if (templateIds.length > 0) {
    // ── 2. All template_exercises in one query ──────────────────────────────
    const { data: teRows } = await supabase
      .from('template_exercises')
      .select('template_id, position, exercise_id, target_sets, target_reps, exercises(id, name, muscle_group, tempo_instruction, technical_notes, default_sets)')
      .in('template_id', templateIds)
      .order('position')

    for (const row of (teRows ?? []) as any[]) {
      const ex: Exercise = {
        id:           row.exercises?.id               ?? row.exercise_id,
        name:         row.exercises?.name             ?? 'Unknown',
        muscle_group: row.exercises?.muscle_group     ?? null,
        tempo:        row.exercises?.tempo_instruction ?? null,
        notes:        row.exercises?.technical_notes   ?? null,
        target_sets:  (row.target_sets && row.target_sets > 0) ? row.target_sets : (row.exercises?.default_sets ?? 3),
        target_reps:  row.target_reps ?? '8',
        position:     row.position    ?? 0,
      }
      if (!exercisesByTemplate[row.template_id]) exercisesByTemplate[row.template_id] = []
      exercisesByTemplate[row.template_id].push(ex)
    }

    // ── 3. Last performance for all exercises in one query ──────────────────
    const allExerciseIds = Object.values(exercisesByTemplate).flat().map((e) => e.id)
    if (allExerciseIds.length > 0) {
      const { data: perfRows } = await supabase
        .from('set_entries')
        .select('exercise_id, set_number, weight, reps, created_at')
        .in('exercise_id', allExerciseIds)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(500)

      console.log('perfRows count:', perfRows?.length)
      console.log('perfRows sample:', JSON.stringify(perfRows?.slice(0, 3)))
      console.log('lastPerfBySet keys:', Object.keys(lastPerfBySet))

      for (const row of (perfRows ?? []) as any[]) {
        const exId   = row.exercise_id
        const setNum = row.set_number ?? 1
        if (!exId) continue
        if (!lastPerfByExercise[exId])
          lastPerfByExercise[exId] = { weight: row.weight ?? 60, reps: row.reps ?? 8 }
        if (!lastPerfBySet[exId]) lastPerfBySet[exId] = {}
        if (!lastPerfBySet[exId][setNum])
          lastPerfBySet[exId][setNum] = { weight: row.weight ?? 60, reps: row.reps ?? 8 }
      }
    }
  }

  const templates = (rawTemplates ?? []).map((t: any) => ({
    id:          t.id,
    name:        t.name,
    description: clean(t.description),
    day_number:  t.day_number,
  }))

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const macros  = { kcal: { v: 1840, max: 2850 }, protein: { v: 142, max: 210 }, steps: { v: 9200, max: 14000 } }

  return (
    <div>
      {/* ── DATE HEADER ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim, marginBottom: 8 }}>
          {dateStr}
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: C.text, lineHeight: 1.1 }}>
          Your Blueprint
        </div>
        <div style={{ fontSize: 13, color: C.mid, marginTop: 6, fontWeight: 500 }}>
          Ready for your next session?
        </div>
      </div>

      {/* ── NUTRITION STRIP ── */}
      <div style={{ ...glass, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, overflowX: 'auto' }}>
        <MacroRing label="Calories" value={macros.kcal.v}     max={macros.kcal.max}     unit="kcal" color={C.accent} />
        <div style={{ width: 1, height: 40, background: C.border, flexShrink: 0 }} />
        <MacroRing label="Protein"  value={macros.protein.v}  max={macros.protein.max}  unit="g"    color={C.blue} />
        <div style={{ width: 1, height: 40, background: C.border, flexShrink: 0 }} />
        <MacroRing label="Steps"    value={macros.steps.v}    max={macros.steps.max}    unit="k"    color={C.purple} />
        <div style={{ marginLeft: 'auto', flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.dim }}>Remaining</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.accent, letterSpacing: '-0.03em', marginTop: 2 }}>
            {macros.kcal.max - macros.kcal.v}
          </div>
          <div style={{ fontSize: 9, color: C.dim, fontWeight: 600 }}>kcal left</div>
        </div>
      </div>

      {/* ── WEEKLY PROGRAM (client component) ── */}
      <WeeklyProgram
        templates={templates}
        exercisesByTemplate={exercisesByTemplate}
        lastPerfByExercise={lastPerfByExercise}
        lastPerfBySet={lastPerfBySet}
        templateLoadError={templateLoadError}
      />
    </div>
  )
}
