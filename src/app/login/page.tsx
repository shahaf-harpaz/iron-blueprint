'use client'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

type Tab = 'signin' | 'signup'

const C = {
  accent:    '#C8FF00',
  accentDim: 'rgba(200,255,0,0.10)',
  accentBd:  'rgba(200,255,0,0.28)',
  border:    'rgba(255,255,255,0.10)',
  dim:       'rgba(255,255,255,0.28)',
  mid:       'rgba(255,255,255,0.50)',
  red:       '#F87171',
  redDim:    'rgba(248,113,113,0.10)',
  redBd:     'rgba(248,113,113,0.25)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 11,
  background: 'rgba(255,255,255,0.06)',
  border: `1px solid ${C.border}`,
  color: '#fff',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: C.dim,
  display: 'block',
  marginBottom: 6,
}

export default function LoginPage() {
  const [tab,      setTab]      = useState<Tab>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState('')

  const supabase = getSupabaseBrowserClient()

  const handleEmailAuth = async () => {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Email and password are required.'); return }
    if (tab === 'signup' && password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    if (tab === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/'
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
      })
      if (error) setError(error.message)
      else setSuccess('Account created! Check your email to confirm your address, then sign in.')
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      padding: 20,
    }}>
      <div style={{
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${C.border}`,
        borderRadius: 24,
        padding: '40px 40px 36px',
        width: '100%',
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Logo */}
        <div style={{
          width: 50, height: 50, borderRadius: 14,
          background: C.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 900, color: '#000',
          marginBottom: 20,
          boxShadow: '0 0 32px rgba(200,255,0,0.20)',
        }}>I</div>

        <h1 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em',
          color: '#fff', margin: '0 0 4px' }}>Iron Blueprint</h1>
        <p style={{ fontSize: 12, color: C.dim, margin: '0 0 28px' }}>
          Your personal fitness operating system
        </p>

        {/* Tab toggle */}
        <div style={{
          display: 'flex', width: '100%', marginBottom: 24,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${C.border}`, borderRadius: 12, padding: 3,
        }}>
          {(['signin', 'signup'] as Tab[]).map(t => (
            <button key={t} type="button" onClick={() => { setTab(t); setError(''); setSuccess('') }} style={{
              flex: 1, padding: '8px', borderRadius: 9, border: 'none',
              background: tab === t ? 'rgba(200,255,0,0.12)' : 'transparent',
              color: tab === t ? C.accent : C.mid,
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
              outline: tab === t ? `1px solid ${C.accentBd}` : 'none',
              transition: 'all 0.2s',
            }}>
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Email field */}
        <div style={{ width: '100%', marginBottom: 12 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = C.accentBd)}
            onBlur={e => (e.target.style.borderColor = C.border)}
          />
        </div>

        {/* Password field */}
        <div style={{ width: '100%', marginBottom: 12 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = C.accentBd)}
            onBlur={e => (e.target.style.borderColor = C.border)}
            onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
          />
        </div>

        {/* Confirm password — signup only */}
        {tab === 'signup' && (
          <div style={{ width: '100%', marginBottom: 12 }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = C.accentBd)}
              onBlur={e => (e.target.style.borderColor = C.border)}
              onKeyDown={e => e.key === 'Enter' && handleEmailAuth()}
            />
          </div>
        )}

        {/* Forgot password link — signin only */}
        {tab === 'signin' && (
          <div style={{ width: '100%', textAlign: 'right', marginBottom: 16, marginTop: -4 }}>
            <span style={{
              fontSize: 11, color: C.dim, cursor: 'pointer',
              textDecoration: 'underline', textUnderlineOffset: 2,
            }}>
              Forgot password?
            </span>
          </div>
        )}
        {tab === 'signup' && <div style={{ height: 16 }} />}

        {/* Error / success messages */}
        {error && (
          <div style={{
            width: '100%', marginBottom: 14,
            padding: '10px 13px', borderRadius: 10,
            background: C.redDim, border: `1px solid ${C.redBd}`,
            fontSize: 12, color: C.red, fontWeight: 600,
          }}>⚠ {error}</div>
        )}
        {success && (
          <div style={{
            width: '100%', marginBottom: 14,
            padding: '10px 13px', borderRadius: 10,
            background: 'rgba(200,255,0,0.08)', border: `1px solid ${C.accentBd}`,
            fontSize: 12, color: C.accent, fontWeight: 600, lineHeight: 1.5,
          }}>✓ {success}</div>
        )}

        {/* Primary CTA button */}
        <button type="button" onClick={handleEmailAuth} disabled={loading} style={{
          width: '100%', padding: '13px',
          borderRadius: 13, border: `1px solid ${C.accentBd}`,
          background: C.accentDim, color: C.accent,
          fontSize: 14, fontWeight: 800, letterSpacing: '0.02em',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          marginBottom: 18,
        }}>
          {loading ? '…' : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
        </button>

        {/* Divider */}
        <div style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18,
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: 11, color: C.dim, fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Google button */}
        <button type="button" onClick={handleGoogle} disabled={loading} style={{
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 13,
          background: 'rgba(255,255,255,0.06)',
          border: `1px solid ${C.border}`,
          color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <p style={{
          marginTop: 24, fontSize: 10, color: 'rgba(255,255,255,0.18)',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          Your data is private and only visible to you.
        </p>
      </div>
    </div>
  )
}
