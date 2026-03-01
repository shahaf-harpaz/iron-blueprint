import { cn } from '@/lib/utils/cn'

interface PillProps {
  children: React.ReactNode
  color?: 'accent' | 'blue' | 'purple' | 'dim'
  className?: string
}

const colorMap = {
  accent: 'bg-[rgba(200,255,0,0.12)] text-[#C8FF00] border-[rgba(200,255,0,0.28)]',
  blue:   'bg-[rgba(68,136,255,0.14)] text-[#4488FF] border-[rgba(68,136,255,0.25)]',
  purple: 'bg-[rgba(167,139,250,0.14)] text-[#A78BFA] border-[rgba(167,139,250,0.25)]',
  dim:    'bg-white/[0.04] text-white/55 border-white/[0.08]',
}

export function Pill({ children, color = 'accent', className }: PillProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full border',
      'text-[9px] font-extrabold tracking-[0.1em] uppercase',
      colorMap[color],
      className,
    )}>
      {children}
    </span>
  )
}
