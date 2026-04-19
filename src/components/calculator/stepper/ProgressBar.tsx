'use client'

import type { StepIndex } from '@/lib/calculator/types/calculator.types'

interface ProgressBarProps {
  current: StepIndex
  total?: number
}

export function ProgressBar({ current, total = 5 }: ProgressBarProps) {
  const pct = ((current + 1) / total) * 100
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 overflow-hidden rounded-full bg-muted"
    >
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
