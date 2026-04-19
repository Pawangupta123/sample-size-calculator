'use client'

import { cn } from '@/lib/utils'
import { Tooltip } from './tooltip'

interface NumberFieldProps {
  label: string
  value: number | undefined
  onChange: (value: number | undefined) => void
  placeholder?: string
  step?: number
  min?: number
  max?: number
  hint?: string
  tooltip?: string
  suffix?: string
  className?: string
}

export function NumberField({
  label,
  value,
  onChange,
  placeholder,
  step = 1,
  min,
  max,
  hint,
  tooltip,
  suffix,
  className,
}: NumberFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <span>{label}</span>
        {tooltip && <Tooltip content={tooltip} />}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const v = e.target.value
            onChange(v === '' ? undefined : parseFloat(v))
          }}
          placeholder={placeholder}
          step={step}
          min={min}
          max={max}
          className={cn(
            'h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground',
            'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            suffix && 'pr-9'
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
