import { cn } from '@/lib/utils/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={cn('glass-card', className)}>
      {children}
    </div>
  )
}
