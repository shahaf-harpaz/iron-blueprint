'use client'
import { create } from 'zustand'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface SetLog {
  exerciseId: string
  setNumber: number
  weight: number
  reps: number
  rpe?: number
  done: boolean
}

interface SessionStore {
  templateId: string | null
  startedAt: Date | null
  sets: SetLog[]
  startSession: (templateId: string) => void
  logSet: (set: Omit<SetLog, 'done'>) => Promise<void>
  clearSession: () => void
}

export const useSession = create<SessionStore>((set, get) => ({
  templateId: null,
  startedAt: null,
  sets: [],

  startSession: (templateId) =>
    set({ templateId, startedAt: new Date(), sets: [] }),

  logSet: async (newSet) => {
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Optimistically update UI
    set(state => ({
      sets: [...state.sets, { ...newSet, done: true }]
    }))

    // Persist to Supabase
    await supabase.from('exercise_performance').insert({
      user_id: user.id,
      exercise_id: newSet.exerciseId,
      weight_kg: newSet.weight,
      reps: newSet.reps,
      rpe: newSet.rpe,
      set_number: newSet.setNumber,
    })
  },

  clearSession: () => set({ templateId: null, startedAt: null, sets: [] }),
}))
