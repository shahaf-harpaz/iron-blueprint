'use client'
import { usePathname } from 'next/navigation'

export function PageTransition({
  children,
  style,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const pathname = usePathname()
  return (
    <main
      key={pathname}
      className="page-enter"
      style={{ minHeight: '100vh', ...style }}
    >
      {children}
    </main>
  )
}
