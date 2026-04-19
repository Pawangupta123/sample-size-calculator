'use client'

import { BookOpen, ListTree, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { ReviewStyle } from '@/lib/rol/types'
import { cn } from '@/lib/utils'

interface StyleSelectorProps {
  value: ReviewStyle
  onChange: (value: ReviewStyle) => void
}

const STYLES: ReadonlyArray<{
  id: ReviewStyle
  label: string
  description: string
  Icon: typeof BookOpen
}> = [
  {
    id: 'narrative',
    label: 'Narrative',
    description: 'Article-by-article, chronological flow',
    Icon: BookOpen,
  },
  {
    id: 'thematic',
    label: 'Thematic',
    description: 'Articles grouped by themes / topics',
    Icon: ListTree,
  },
  {
    id: 'systematic',
    label: 'Systematic (lite)',
    description: 'Background · search · findings · synthesis',
    Icon: FileText,
  },
]

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="pb-3 text-xs font-semibold">Review style</p>
        <div className="grid grid-cols-3 gap-1.5">
          {STYLES.map(({ id, label, description, Icon }) => {
            const active = value === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChange(id)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-lg border p-2.5 text-left transition-all',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  active
                    ? 'border-primary bg-[var(--primary-muted)]'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span
                  className={cn(
                    'text-[11px] font-semibold leading-tight',
                    active && 'text-primary'
                  )}
                >
                  {label}
                </span>
                <span className="text-[10px] leading-snug text-muted-foreground">
                  {description}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
