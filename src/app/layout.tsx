'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { useState, useEffect, useRef } from 'react'
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

// ─── Nav definitions ─────────────────────────────────────────────────────────

// Full nav — used by the desktop sidebar
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

// Mobile dock — 3 items (Analytics + Architect live in avatar dropdown)
const NAV_DOCK = [
  {
    href: '/', label: 'Dashboard',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/architect', label: 'Blueprint',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
  },
  {
    href: '/nutrition', label: 'Nutrition',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ─── Shared nav prop type ─────────────────────────────────────────────────────

interface NavProps {
  user: any
  lightMode: boolean
  toggleTheme: () => void
  onSignOut: () => void
  onDeleteRequest: () => void
}

// ─── Sidebar (desktop only) ───────────────────────────────────────────────────

function Sidebar({ user, lightMode, toggleTheme, onSignOut, onDeleteRequest, isMobile }: NavProps & { isMobile: boolean }) {
  const pathname = usePathname()
  const [showAvatarTip, setShowAvatarTip] = useState(false)

  const isActive    = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))
  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'U'
  const initials    = displayName.charAt(0).toUpperCase()

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 64,
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column', alignItems: 'center',
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

      {/* Bottom — theme, avatar, sign-out, delete */}
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
          onClick={onSignOut}
          title="Sign out"
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, transition: 'color 0.15s',
          }}
        >↪</button>

        {/* Delete account */}
        <button
          type="button"
          onClick={onDeleteRequest}
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
  )
}

// ─── Mobile avatar dropdown ───────────────────────────────────────────────────

function DropDivider() {
  return <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
}

function DropItem({
  onClick, children, color,
}: {
  onClick: () => void
  children: React.ReactNode
  color?: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 14px', borderRadius: 8,
        fontSize: 13, fontWeight: 500,
        background: hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        border: 'none', cursor: 'pointer',
        color: color ?? 'rgba(255,255,255,0.75)',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
    >
      {children}
    </button>
  )
}

function MobileAvatarButton({ user, lightMode, toggleTheme, onSignOut, onDeleteRequest }: NavProps) {
  const [open, setOpen]   = useState(false)
  const pathname          = usePathname()
  const router            = useRouter()
  const menuRef           = useRef<HTMLDivElement>(null)
  const btnRef            = useRef<HTMLButtonElement>(null)

  const avatarUrl   = user?.user_metadata?.avatar_url
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'U'
  const initials    = displayName.charAt(0).toUpperCase()

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const go = (href: string) => { setOpen(false); router.push(href) }

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
      {/* Avatar button */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          border: 'none', cursor: 'pointer', padding: 0,
          overflow: 'hidden',
          boxShadow: open
            ? `0 0 0 2px ${C.accent}`
            : '0 0 0 1.5px rgba(255,255,255,0.15)',
          transition: 'box-shadow 0.15s',
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, #C8FF00, #60A5FA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 900, color: '#000',
          }}>
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={menuRef}
          style={{
            position: 'absolute', top: 46, right: 0,
            background: 'rgba(20,20,20,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 14,
            padding: 8,
            minWidth: 200,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Email header */}
          <div style={{
            padding: '8px 14px 10px',
            fontSize: 11,
            color: C.dim,
            borderRadius: 6,
          }}>
            {user?.email ?? '—'}
          </div>

          <DropDivider />

          <DropItem onClick={() => { toggleTheme(); }}>
            <span>{lightMode ? '☀️' : '🌙'}</span>
            <span>{lightMode ? 'Light Mode' : 'Dark Mode'}</span>
          </DropItem>

          <DropDivider />

          <DropItem onClick={() => go('/')}>
            <span>🏠</span><span>Home</span>
          </DropItem>
          <DropItem onClick={() => go('/analytics')}>
            <span>📊</span><span>Analytics</span>
          </DropItem>
          <DropItem onClick={() => go('/nutrition')}>
            <span>🥗</span><span>Nutrition</span>
          </DropItem>
          <DropItem onClick={() => go('/architect')}>
            <span>⚙️</span><span>Architect</span>
          </DropItem>

          <DropDivider />

          <DropItem onClick={() => { setOpen(false); onSignOut() }} color="rgba(255,255,255,0.5)">
            <span>🚪</span><span>Sign Out</span>
          </DropItem>
          <DropItem onClick={() => { setOpen(false); onDeleteRequest() }} color="#F87171">
            <span>🗑️</span><span>Delete Account</span>
          </DropItem>
        </div>
      )}
    </div>
  )
}

// ─── Mobile dock (3 items) ────────────────────────────────────────────────────

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
      padding: '10px 28px',
      gap: 36,
      zIndex: 100,
      alignItems: 'center',
    }} className="mobile-dock">
      {NAV_DOCK.map(({ href, label, icon }) => {
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

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const isMobile = useIsMobile()

  const [user,        setUser]        = useState<any>(null)
  const [lightMode,   setLightMode]   = useState(false)
  const [deleteStep,  setDeleteStep]  = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => setUser(data.user))
  }, [])

  const toggleTheme = () => {
    const next = !lightMode
    setLightMode(next)
    if (next) document.body.classList.add('light-mode')
    else      document.body.classList.remove('light-mode')
  }

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

  const isAuthPage = pathname === '/login'

  const navProps: NavProps = {
    user,
    lightMode,
    toggleTheme,
    onSignOut:       signOut,
    onDeleteRequest: () => setDeleteStep('confirm'),
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {isAuthPage ? children : (
          <>
            <Sidebar {...navProps} isMobile={isMobile} />

            {isMobile && <MobileAvatarButton {...navProps} />}

            <MobileDock />

            <PageTransition style={{ marginLeft: isMobile ? 0 : 64, padding: '32px 28px' }}>
              <div style={{ maxWidth: 840, margin: '0 auto' }}>
                {children}
              </div>
            </PageTransition>

            {/* Delete account confirmation modal — shared by sidebar + mobile dropdown */}
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
                      Are you sure? This cannot be undone. The account{' '}
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{user?.email}</span>{' '}
                      and all your workouts, exercises, and training history will be permanently deleted.
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
        )}
      </body>
    </html>
  )
}
