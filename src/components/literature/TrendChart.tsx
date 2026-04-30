'use client'

import { useMemo } from 'react'
import type { Article } from '@/lib/literature/types'
import { cn } from '@/lib/utils'

interface TrendChartProps {
  articles: Article[]
  yearFilter: number | null
  onYearClick: (year: number | null) => void
}

export function TrendChart({ articles, yearFilter, onYearClick }: TrendChartProps) {
  const data = useMemo(() => {
    const counts: Record<number, number> = {}
    for (const a of articles) {
      if (a.year && a.year >= 1990 && a.year <= new Date().getFullYear()) {
        counts[a.year] = (counts[a.year] ?? 0) + 1
      }
    }
    const years = Object.keys(counts).map(Number).sort()
    if (years.length === 0) return null
    const maxCount = Math.max(...Object.values(counts))
    return { counts, years, maxCount }
  }, [articles])

  if (!data || data.years.length < 2) return null

  return (
    <div className="rounded-xl border border-border bg-card px-4 pb-3 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Publication trend
        </p>
        {yearFilter !== null && (
          <button
            type="button"
            onClick={() => onYearClick(null)}
            className="text-[10px] font-medium text-primary hover:underline"
          >
            Clear year filter ({yearFilter})
          </button>
        )}
      </div>

      <div className="flex items-end gap-[3px]" style={{ height: 64 }}>
        {data.years.map((year) => {
          const count = data.counts[year] ?? 0
          const heightPct = data.maxCount > 0 ? (count / data.maxCount) * 100 : 0
          const isSelected = yearFilter === year
          return (
            <div
              key={year}
              className="group flex flex-1 flex-col items-center justify-end gap-0.5"
              style={{ height: '100%' }}
            >
              <span className="invisible text-[8px] leading-none text-muted-foreground group-hover:visible">
                {count}
              </span>
              <button
                type="button"
                title={`${year}: ${count} article${count === 1 ? '' : 's'}`}
                onClick={() => onYearClick(isSelected ? null : year)}
                className={cn(
                  'w-full min-h-[3px] rounded-sm transition-colors',
                  isSelected
                    ? 'bg-primary'
                    : 'bg-primary/30 hover:bg-primary/70'
                )}
                style={{ height: `${Math.max(heightPct, 4)}%` }}
              />
            </div>
          )
        })}
      </div>

      {/* Year axis */}
      <div className="mt-1.5 flex items-center gap-[3px]">
        {data.years.map((year, i) => {
          const showLabel = data.years.length <= 12 || i === 0 || i === data.years.length - 1 || year % 5 === 0
          return (
            <div key={year} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[8px] leading-none text-muted-foreground">{year}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
