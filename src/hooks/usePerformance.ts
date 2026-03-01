'use client'
import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface LastPerformance {
  weight_kg: number
  reps: number
  rpe: number | null
  logged_at: string
}

export function useLastPerformance(exerciseId: string) {
  const supabase = getSupabaseBrowserClient()

  return useQuery({
    queryKey: ['performance', 'last', exerciseId],
    queryFn: async (): Promise<LastPerformance[]> => {
      const { data, error } = await supabase
        .from('exercise_performance')
        .select('weight_kg, reps, rpe, logged_at')
        .eq('exercise_id', exerciseId)
        .order('logged_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data
    },
    enabled: !!exerciseId,
    staleTime: 1000 * 60 * 5,
  })
}
