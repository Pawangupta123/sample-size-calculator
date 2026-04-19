'use client'

import { cn } from '@/lib/utils'

export interface PillOption<T extends string> {
  value: T
  label: string
}

interface PillGroupProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<PillOption<T>>
  ariaLabel?: string
}

export function PillGroup<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: PillGroupProps<T>) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
