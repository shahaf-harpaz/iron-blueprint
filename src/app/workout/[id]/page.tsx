import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { WorkoutSession } from '@/components/session/WorkoutSession'

export default async function WorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // ── 1. Template ─────────────────────────────────────────────
  const { data: template } = await supabase
    .from('workout_templates')
    .select('id, name, day_number, description')
    .eq('id', id)
    .single()

  if (!template) notFound()

  // ── 2. Exercises for this template (ordered) ─────────────────
  const { data: items } = await supabase
    .from('template_exercises')
    .select(`
      order_index,
      exercise_id,
      exercises ( id, name, target_muscle_group )
    `)
    .eq('template_id', id)
    .order('order_index')

  const exercises = (items ?? []).map((item: any) => ({
    id: item.exercises?.id ?? item.exercise_id,
    name: item.exercises?.name ?? 'Unknown',
    target_muscle_group: item.exercises?.target_muscle_group ?? null,
    order_index: item.order_index,
  }))

  // ── 3. Last workout log for this template ────────────────────
  const { data: lastLog } = await supabase
    .from('workout_logs')
    .select('id, performed_at')
    .eq('template_id', id)
    .order('performed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // ── 4. Last performance per exercise (from last log) ─────────
  // set_entries: log_id, exercise_id, weight, reps
  const lastPerformance: Record<string, { weight: number; reps: number }> = {}

  if (lastLog) {
    const { data: entries } = await supabase
      .from('set_entries')
      .select('exercise_id, weight, reps')
      .eq('log_id', lastLog.id)

    // Keep first entry per exercise (they're already ordered by row insert)
    entries?.forEach((entry: any) => {
      if (entry.exercise_id && !lastPerformance[entry.exercise_id]) {
        lastPerformance[entry.exercise_id] = {
          weight: entry.weight ?? 0,
          reps: entry.reps ?? 0,
        }
      }
    })
  }

  return (
    <WorkoutSession
      template={template}
      exercises={exercises}
      lastPerformance={lastPerformance}
      lastLogDate={lastLog?.performed_at ?? null}
    />
  )
}
