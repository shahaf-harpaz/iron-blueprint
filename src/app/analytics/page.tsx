// @ts-nocheck
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: allSets }, { data: allLogs }, { data: exercises }] = await Promise.all([
    supabase
      .from('set_entries')
      .select('id, log_id, exercise_id, set_number, weight, reps, created_at, exercises(name, muscle_group)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('workout_logs')
      .select('id, template_id, performed_at, workout_templates(name)')
      .eq('user_id', user.id)
      .order('performed_at', { ascending: false })
      .limit(100),
    supabase
      .from('exercises')
      .select('id, name, muscle_group')
      .eq('user_id', user.id)
      .order('name'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <AnalyticsDashboard
      allSets={allSets as any}
      allLogs={allLogs as any}
      exercises={exercises as any}
    />
  )
}
