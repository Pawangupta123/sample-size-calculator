import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'default' | 'primary' | 'accent' | 'violet' | 'warning' | 'muted'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

const TONE_CLASSES: Record<Tone, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-[var(--primary-muted)] text-primary',
  accent: 'bg-[var(--accent-muted)] text-accent',
  violet: 'bg-violet-500/10 text-violet-500 dark:text-violet-300',
  warning: 'bg-[var(--warning-muted)] text-[var(--warning-foreground)]',
  muted: 'bg-muted/60 text-muted-foreground',
}

export function Badge({
  className,
  tone = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
        TONE_CLASSES[tone],
        className
      )}
      {...props}
    />
  )
}
