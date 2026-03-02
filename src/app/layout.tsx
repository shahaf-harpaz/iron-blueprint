'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { PageTransition } from '@/components/ui/PageTransition'

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
  const [user, setUser]         = useState<any>(null)
  const [lightMode, setLightMode] = useState(false)

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

  return (
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
        <div style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            color: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, transition: 'color 0.15s',
          }}
        >
          ↪
        </button>
      </div>
    </aside>
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
