'use client'

import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { Article } from '@/lib/literature/types'

interface StatsPanelProps {
  articles: Article[]
}

export function StatsPanel({ articles }: StatsPanelProps) {
  const stats = useMemo(() => {
    if (articles.length === 0) return null

    const oaCount = articles.filter((a) => a.openAccess).length
    const oaPct = Math.round((oaCount / articles.length) * 100)

    const years = articles.map((a) => a.year).filter((y): y is number => !!y)
    const yearRange = years.length > 0
      ? `${Math.min(...years)} – ${Math.max(...years)}`
      : null

    const journalCounts: Record<string, number> = {}
    for (const a of articles) {
      if (a.journal && !a.sources.includes('clinicaltrials')) {
        journalCounts[a.journal] = (journalCounts[a.journal] ?? 0) + 1
      }
    }
    const topJournals = Object.entries(journalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const pubmedCount    = articles.filter((a) => a.sources.includes('pubmed')).length
    const europeCount    = articles.filter((a) => a.sources.includes('europepmc')).length
    const openAlexCount  = articles.filter((a) => a.sources.includes('openalex')).length
    const ctCount        = articles.filter((a) => a.sources.includes('clinicaltrials')).length
    const multiCount     = articles.filter((a) => {
      const db = a.sources.filter((s) => ['pubmed', 'europepmc', 'openalex'].includes(s))
      return db.length >= 2
    }).length

    return { oaPct, yearRange, topJournals, pubmedCount, europeCount, openAlexCount, ctCount, multiCount }
  }, [articles])

  if (!stats || articles.length === 0) return null

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Search stats
        </p>

        {/* Quick numbers */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-muted px-3 py-2 text-center">
            <p className="text-lg font-bold text-foreground">{stats.oaPct}%</p>
            <p className="text-[10px] text-muted-foreground">Open access</p>
          </div>
          {stats.yearRange && (
            <div className="rounded-lg bg-muted px-3 py-2 text-center">
              <p className="text-xs font-bold text-foreground">{stats.yearRange}</p>
              <p className="text-[10px] text-muted-foreground">Year range</p>
            </div>
          )}
          {stats.multiCount > 0 && (
            <div className="rounded-lg bg-muted px-3 py-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.multiCount}</p>
              <p className="text-[10px] text-muted-foreground">Multi-source</p>
            </div>
          )}
          {stats.ctCount > 0 && (
            <div className="rounded-lg bg-muted px-3 py-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats.ctCount}</p>
              <p className="text-[10px] text-muted-foreground">Trials</p>
            </div>
          )}
        </div>

        {/* Source breakdown */}
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sources
          </p>
          <div className="space-y-1">
            {[
              { label: 'PubMed',      count: stats.pubmedCount,   color: 'bg-blue-500' },
              { label: 'Europe PMC',  count: stats.europeCount,   color: 'bg-violet-500' },
              { label: 'OpenAlex',    count: stats.openAlexCount, color: 'bg-emerald-500' },
              { label: 'ClinicalTrials', count: stats.ctCount,    color: 'bg-orange-500' },
            ].filter((s) => s.count > 0).map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${color}`} />
                <span className="flex-1 text-[11px] text-muted-foreground">{label}</span>
                <span className="text-[11px] font-semibold text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top journals */}
        {stats.topJournals.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Top journals
            </p>
            <ul className="space-y-1">
              {stats.topJournals.map(([journal, count]) => {
                const pct = Math.round((count / articles.length) * 100)
                return (
                  <li key={journal}>
                    <div className="mb-0.5 flex items-center justify-between">
                      <span className="line-clamp-1 text-[10px] text-foreground">{journal}</span>
                      <span className="ml-1 shrink-0 text-[10px] text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-muted">
                      <div
                        className="h-1 rounded-full bg-primary/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
