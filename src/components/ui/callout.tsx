import type { ReactNode } from 'react'
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'info' | 'warning' | 'error' | 'success'

interface CalloutProps {
  tone?: Tone
  children: ReactNode
  className?: string
}

const TONE_STYLES: Record<Tone, { bg: string; text: string; Icon: typeof Info }> = {
  info: {
    bg: 'bg-[var(--primary-muted)] border-primary/20',
    text: 'text-primary',
    Icon: Info,
  },
  warning: {
    bg: 'bg-[var(--warning-muted)] border-warning/30',
    text: 'text-[var(--warning-foreground)]',
    Icon: AlertTriangle,
  },
  error: {
    bg: 'bg-destructive/10 border-destructive/30',
    text: 'text-destructive',
    Icon: AlertCircle,
  },
  success: {
    bg: 'bg-[var(--accent-muted)] border-accent/30',
    text: 'text-accent',
    Icon: CheckCircle2,
  },
}

export function Callout({ tone = 'info', children, className }: CalloutProps) {
  const { bg, text, Icon } = TONE_STYLES[tone]
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed',
        bg,
        text,
        className
      )}
      role="note"
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  )
}
