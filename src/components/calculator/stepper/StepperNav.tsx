'use client'

import { cn } from '@/lib/utils'
import { STEP_LABELS } from '@/lib/calculator/constants/defaults'
import type { StepIndex } from '@/lib/calculator/types/calculator.types'

interface StepperNavProps {
  current: StepIndex
  onStepClick?: (step: StepIndex) => void
}

export function StepperNav({ current, onStepClick }: StepperNavProps) {
  return (
    <nav
      aria-label="Wizard steps"
      className="grid grid-cols-5 overflow-hidden rounded-xl border border-border bg-card"
    >
      {STEP_LABELS.map((s, i) => {
        const done = i < current
        const active = i === current
        const clickable = done && typeof onStepClick === 'function'
        return (
          <button
            key={s.num}
            type="button"
            aria-current={active ? 'step' : undefined}
            disabled={!clickable}
            onClick={() => clickable && onStepClick?.(i as StepIndex)}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 border-r border-border px-2 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors last:border-r-0',
              active && 'bg-primary text-primary-foreground',
              done && 'bg-[var(--primary-muted)] text-primary hover:bg-[var(--primary-muted)]/80',
              !active && !done && 'text-muted-foreground',
              !clickable && 'cursor-default'
            )}
          >
            <span
              className={cn(
                'text-sm font-semibold leading-none',
                active && 'text-primary-foreground',
                done && 'text-primary'
              )}
            >
              {s.num}
            </span>
            <span className="leading-tight">{s.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
