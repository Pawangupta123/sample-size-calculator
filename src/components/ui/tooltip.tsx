'use client'

import { useId, useState, type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children?: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const id = useId()

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <button
        type="button"
        aria-describedby={id}
        aria-label="More info"
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
      >
        {children ?? <HelpCircle className="h-3.5 w-3.5" />}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-64 rounded-lg bg-foreground px-3 py-2 text-xs leading-relaxed text-background shadow-lg transition-opacity',
          side === 'top'
            ? 'bottom-full left-0 mb-2'
            : 'left-0 top-full mt-2',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  )
}
