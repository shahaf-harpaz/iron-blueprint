'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { PageTransition } from '@/components/ui/PageTransition'
import { deleteAccount } from '@/app/actions/deleteAccount'

const inter = Inter({ subsets: ['latin'] })

const C = {
  border:       'rgba(255,255,255,0.08)',
  accent:       '#C8FF00',
  accentDim:    'rgba(200,255,0,0.12)',
  accentBorder: 'rgba(200,255,0,0.28)',
  mid:          'rgba(255,255,255,0.55)',
  dim:          'rgba(255,255,255,0.28)',
}

const NAV = [
  {
    href: '/', label: 'Today',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/analytics', label: 'Analytics',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    href: '/architect', label: 'Architect',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  {
    href: '/nutrition', label: 'Nutrition',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  },
]

function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const [user, setUser]               = useState<any>(null)
  const [lightMode, setLightMode]     = useState(false)
  const [deleteStep, setDeleteStep]   = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showAvatarTip, setShowAvatarTip] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => setUser(data.user))
  }, [])

  const toggleTheme = () => {
    const next = !lightMode
    setLightMode(next)
    if (next) {
      document.body.classList.add('light-mode')
    } else {
      document.body.classList.remove('light-mode')
    }
  }

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'U'
  const initials    = displayName.charAt(0).toUpperCase()

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    setDeleteStep('deleting')
    setDeleteError(null)
    try {
      await deleteAccount()
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err: any) {
      setDeleteError(err.message ?? 'Failed to delete account')
      setDeleteStep('confirm')
    }
  }

  return (
    <>
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 64,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 0', gap: 4,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      background: 'rgba(8,8,8,0.93)',
      borderRight: `1px solid ${C.border}`,
      boxShadow: 'inset -0.5px 0 0 rgba(255,255,255,0.04), 4px 0 24px rgba(0,0,0,0.4)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: C.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: '#000', letterSpacing: '-0.05em',
        marginBottom: 16, flexShrink: 0,
      }}>IB</div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%', paddingInline: 11 }}>
        {NAV.map(({ href, label, icon }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href} title={label} style={{ textDecoration: 'none', width: '100%' }}>
              <div style={{
                position: 'relative',
                width: 42, height: 42, borderRadius: 12, margin: '0 auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: active ? C.accent : C.dim,
                background: active ? C.accentDim : 'transparent',
                border: `1px solid ${active ? C.accentBorder : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                {active && (
                  <div style={{
                    position: 'absolute', left: -12, top: '25%', bottom: '25%',
                    width: 2, borderRadius: '0 2px 2px 0',
                    background: C.accent,
                    boxShadow: '0 0 8px rgba(200,255,0,0.6)',
                  }} />
                )}
                {icon}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom — settings, avatar, sign-out */}
      <div style={{ marginTop: 'auto', width: '100%', paddingInline: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          title={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {lightMode ? '☀️' : '🌙'}
        </button>

        {/* User avatar */}
        <div
          style={{ position: 'relative', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onMouseEnter={() => setShowAvatarTip(true)}
          onMouseLeave={() => setShowAvatarTip(false)}
        >
          {showAvatarTip && user?.email && (
            <div style={{
              position: 'absolute', left: 48, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(0,0,0,0.88)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '5px 10px',
              fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)',
              whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 200,
            }}>
              {user.email}
            </div>
          )}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              title={displayName}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #C8FF00, #60A5FA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: '#000',
            }}>
              {initials}
            </div>
          )}
        </div>

        {/* Sign-out */}
        <button
          type="button"
          onClick={signOut}
          title="Sign out"
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, transition: 'color 0.15s',
          }}
        >
          ↪
        </button>

        {/* Delete account */}
        <button
          type="button"
          onClick={() => setDeleteStep('confirm')}
          title="Delete account"
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: '#F87171',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </aside>

    {/* Delete account confirmation modal */}
    {deleteStep !== 'idle' && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}>
        <div style={{
          background: 'rgba(10,10,10,0.98)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 20,
          padding: 24,
          width: 'calc(100vw - 40px)',
          maxWidth: 360,
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        }}>
          <div style={{
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#F87171', marginBottom: 6 }}>
              Delete Account
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
              Are you sure? This cannot be undone. The account <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{user?.email}</span> and all your workouts, exercises, and training history will be permanently deleted.
            </div>
          </div>

          {deleteError && (
            <div style={{
              fontSize: 11, color: '#F87171', fontWeight: 600,
              marginBottom: 12, padding: '8px 12px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.20)',
              borderRadius: 8,
            }}>
              ⚠ {deleteError}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => { setDeleteStep('idle'); setDeleteError(null) }}
              disabled={deleteStep === 'deleting'}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                fontSize: 12, fontWeight: 700,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.55)',
                cursor: deleteStep === 'deleting' ? 'wait' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteStep === 'deleting'}
              style={{
                flex: 1, padding: '10px', borderRadius: 10,
                fontSize: 12, fontWeight: 700,
                background: 'rgba(248,113,113,0.12)',
                border: '1px solid rgba(248,113,113,0.35)',
                color: '#F87171',
                cursor: deleteStep === 'deleting' ? 'wait' : 'pointer',
              }}
            >
              {deleteStep === 'deleting' ? 'Deleting…' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

function MobileDock() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href))

  return (
    <nav style={{
      display: 'none',
      position: 'fixed', bottom: 24,
      left: '50%', transform: 'translateX(-50%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      background: 'rgba(20,20,20,0.95)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 999,
      padding: '10px 24px',
      gap: 32,
      zIndex: 100,
      alignItems: 'center',
    }} className="mobile-dock">
      {NAV.map(({ href, label, icon }) => {
        const active = isActive(href)
        return (
          <Link key={href} href={href} title={label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: active ? C.accent : 'rgba(255,255,255,0.35)',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}>
            {icon}
          </Link>
        )
      })}
    </nav>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login'

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {isAuthPage ? children : (
          <>
            <Sidebar />
            <MobileDock />
            <PageTransition style={{ marginLeft: 64, padding: '32px 28px' }}>
              <div style={{ maxWidth: 840, margin: '0 auto' }}>
                {children}
              </div>
            </PageTransition>
          </>
        )}
      </body>
    </html>
  )
}
