'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TypeCardProps {
  icon: string
  label: string
  description: string
  selected: boolean
  onClick: () => void
}

export function TypeCard({
  icon,
  label,
  description,
  selected,
  onClick,
}: TypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        selected
          ? 'border-primary bg-[var(--primary-muted)] shadow-sm shadow-primary/10'
          : 'border-border bg-card hover:border-primary/50 hover:bg-[var(--primary-muted)]/50'
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
      )}
      <span className="text-2xl leading-none" aria-hidden>
        {icon}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs leading-snug text-muted-foreground">
        {description}
      </span>
    </button>
  )
}
