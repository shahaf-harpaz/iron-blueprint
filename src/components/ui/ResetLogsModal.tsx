'use client'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

interface ResetLogsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ResetLogsModal({ isOpen, onClose, onSuccess }: ResetLogsModalProps) {
  const [scope, setScope] = useState<'7days' | 'all'>('7days')
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    const supabase = getSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      if (scope === '7days') {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const iso = sevenDaysAgo.toISOString()

        await supabase.from('set_entries')
          .delete()
          .eq('user_id', user.id)
          .gte('created_at', iso)

        await supabase.from('workout_logs')
          .delete()
          .eq('user_id', user.id)
          .gte('performed_at', iso)
      } else {
        await supabase.from('set_entries')
          .delete()
          .eq('user_id', user.id)

        await supabase.from('workout_logs')
          .delete()
          .eq('user_id', user.id)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
      setConfirming(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: '#111', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: 28, width: '100%', maxWidth: 380,
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Reset Training Logs
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
          This will permanently delete your workout logs and set entries. This cannot be undone.
        </p>

        {/* Scope selector */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {(['7days', 'all'] as const).map(s => (
            <button key={s} onClick={() => setScope(s)} style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: `1px solid ${scope === s ? '#C8FF00' : 'rgba(255,255,255,0.1)'}`,
              background: scope === s ? 'rgba(200,255,0,0.1)' : 'transparent',
              color: scope === s ? '#C8FF00' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              {s === '7days' ? 'Last 7 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ fontSize: 12, color: '#F87171', marginBottom: 16 }}>{error}</p>
        )}

        {!confirming ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Cancel</button>
            <button onClick={() => setConfirming(true)} style={{
              flex: 1, padding: '12px 0', borderRadius: 10,
              border: '1px solid rgba(248,113,113,0.4)',
              background: 'rgba(248,113,113,0.1)',
              color: '#F87171', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>Delete</button>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: '#F87171', marginBottom: 16, textAlign: 'center' }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirming(false)} style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>Go Back</button>
              <button onClick={handleDelete} disabled={loading} style={{
                flex: 1, padding: '12px 0', borderRadius: 10,
                border: 'none', background: '#F87171',
                color: '#000', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                opacity: loading ? 0.6 : 1,
              }}>{loading ? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
