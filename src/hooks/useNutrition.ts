'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface NutritionLog {
  id: string
  date: string
  kcal_target: number
  protein_g: number
  fat_g: number
  kcal_consumed: number
  protein_consumed_g: number
  fat_consumed_g: number
}

export function useNutrition(date: string = new Date().toISOString().slice(0, 10)) {
  const supabase = getSupabaseBrowserClient()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['nutrition', date],
    queryFn: async (): Promise<NutritionLog | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single()

      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  const upsert = useMutation({
    mutationFn: async (values: Partial<Omit<NutritionLog, 'id'>>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      await supabase.from('nutrition_logs').upsert(
        { user_id: user.id, date, ...values },
        { onConflict: 'user_id,date' }
      )
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['nutrition', date] }),
  })

  return { ...query, upsert }
}
