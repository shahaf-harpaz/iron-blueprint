'use server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function deleteAccount() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.rpc('delete_user_account', {
    p_user_id: user.id,
    p_email: user.email,
    p_reason: 'user_requested',
  })

  if (error) throw new Error(error.message)
}
