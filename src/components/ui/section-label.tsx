import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground',
        className
      )}
    >
      <span>{children}</span>
      <span aria-hidden className="h-px flex-1 bg-border" />
    </div>
  )
}
