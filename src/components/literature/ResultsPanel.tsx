'use client'

import { useMemo, useState } from 'react'
import { Download, Loader2, Search, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article } from '@/lib/literature/types'
import { exportArticlesToBibTex } from '@/lib/literature/utils/exportBibTex'
import { exportArticlesToCsv } from '@/lib/literature/utils/exportCsv'
import { exportArticlesToRis } from '@/lib/literature/utils/exportRis'
import { cn } from '@/lib/utils'
import { ArticleCard } from './ArticleCard'
import { TrendChart } from './TrendChart'

// ─── constants ────────────────────────────────────────────────────────────────

const EXAMPLE_SEARCHES = [
  { icon: '💊', label: 'Metformin & HbA1c',           query: 'Metformin type 2 diabetes HbA1c randomized controlled trial' },
  { icon: '🫀', label: 'Heart failure treatment',       query: 'ACE inhibitors heart failure mortality elderly' },
  { icon: '⚖️', label: 'Bariatric surgery adolescents', query: 'Bariatric surgery weight loss outcomes adolescents' },
  { icon: '🧠', label: 'Cognitive decline prevention',  query: 'physical activity cognitive decline prevention older adults' },
  { icon: '🩺', label: 'Hypertension RCT',              query: 'antihypertensive therapy systolic blood pressure reduction RCT' },
]

type SortKey = 'relevance' | 'year-desc' | 'year-asc' | 'cited-desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance',  label: 'Relevance' },
  { value: 'year-desc',  label: 'Newest first' },
  { value: 'year-asc',   label: 'Oldest first' },
  { value: 'cited-desc', label: 'Most cited' },
]

// ─── helpers ──────────────────────────────────────────────────────────────────

function sortArticles(articles: Article[], key: SortKey): Article[] {
  if (key === 'relevance') return articles
  return [...articles].sort((a, b) => {
    if (key === 'year-desc')  return (b.year ?? 0) - (a.year ?? 0)
    if (key === 'year-asc')   return (a.year ?? 0) - (b.year ?? 0)
    if (key === 'cited-desc') return (b.citedBy ?? 0) - (a.citedBy ?? 0)
    return 0
  })
}

function filterArticles(articles: Article[], text: string, year: number | null): Article[] {
  let result = articles
  if (year !== null) result = result.filter((a) => a.year === year)
  if (!text.trim()) return result
  const q = text.toLowerCase()
  return result.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.authors.some((au) => au.toLowerCase().includes(q)) ||
      a.journal?.toLowerCase().includes(q) ||
      a.abstract?.toLowerCase().includes(q)
  )
}

function ArticleSkeleton() {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <div className="mt-3 flex gap-2 pt-3">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </li>
  )
}

// ─── props ────────────────────────────────────────────────────────────────────

interface ResultsPanelProps {
  articles: Article[]
  total: number
  isSearching: boolean
  isLoadingMore: boolean
  hasSearched: boolean
  canLoadMore: boolean
  fromCache: boolean
  errors: string[]
  isSaved: (id: string) => boolean
  onToggleSave: (article: Article) => void
  onLoadMore: () => void
  onExampleSearch: (query: string) => void
  onAuthorClick: (author: string) => void
  onBulkImportToRol: (articles: Article[]) => void
}

// ─── component ────────────────────────────────────────────────────────────────

export function ResultsPanel({
  articles,
  total,
  isSearching,
  isLoadingMore,
  hasSearched,
  canLoadMore,
  fromCache,
  errors,
  isSaved,
  onToggleSave,
  onLoadMore,
  onExampleSearch,
  onAuthorClick,
  onBulkImportToRol,
}: ResultsPanelProps) {
  const [sortKey,    setSortKey]    = useState<SortKey>('relevance')
  const [filterText, setFilterText] = useState('')
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const clearSelection = () => setSelectedIds(new Set())
  const selectedArticles = articles.filter((a) => selectedIds.has(a.id))

  const sorted   = useMemo(() => sortArticles(articles, sortKey), [articles, sortKey])
  const filtered = useMemo(() => filterArticles(sorted, filterText, yearFilter), [sorted, filterText, yearFilter])

  // Top 3 most-cited as landmark papers
  const landmarks = useMemo(
    () => [...articles].filter((a) => a.citedBy && a.citedBy > 0).sort((a, b) => (b.citedBy ?? 0) - (a.citedBy ?? 0)).slice(0, 3),
    [articles]
  )

  // highlight terms = words in filterText
  const highlightTerms = useMemo(
    () => filterText.trim().split(/\s+/).filter((w) => w.length > 2),
    [filterText]
  )

  // ── empty / loading states ──────────────────────────────────────────────────

  if (!hasSearched) {
    return (
      <Card>
        <CardContent className="px-6 py-10">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold text-foreground">Try an example search</p>
            <p className="mt-1 text-xs text-muted-foreground">Click any topic below to run it instantly</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_SEARCHES.map((ex) => (
              <button key={ex.query} type="button" onClick={() => onExampleSearch(ex.query)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted hover:text-foreground">
                <span className="text-base leading-none">{ex.icon}</span>
                {ex.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { name: 'PubMed',      desc: '36M+ articles',  color: 'text-blue-600' },
              { name: 'Europe PMC',  desc: 'Full text + abstracts', color: 'text-violet-600' },
              { name: 'OpenAlex',    desc: '250M+ works',    color: 'text-emerald-600' },
            ].map((src) => (
              <div key={src.name} className="rounded-xl border border-border bg-card p-3 text-center">
                <p className={cn('text-xs font-semibold', src.color)}>{src.name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{src.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isSearching && articles.length === 0) {
    return (
      <ul className="flex flex-col gap-3" aria-live="polite" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => <ArticleSkeleton key={i} />)}
      </ul>
    )
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-sm text-muted-foreground">
          <p>No articles found. Try broader terms or adjusting filters.</p>
          {errors.length > 0 && (
            <ul className="mt-3 text-[11px] text-destructive">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </CardContent>
      </Card>
    )
  }

  // ── results view ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* Trend chart */}
      <TrendChart articles={articles} yearFilter={yearFilter} onYearClick={setYearFilter} />

      {/* Landmark papers */}
      {landmarks.length > 0 && !filterText && yearFilter === null && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-800/40 dark:bg-amber-900/10">
          <div className="mb-2 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Landmark papers
            </p>
          </div>
          <ul className="space-y-1.5">
            {landmarks.map((a) => (
              <li key={a.id} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <div className="min-w-0">
                  {(a.pubmedUrl ?? a.doiUrl) ? (
                    <a href={a.pubmedUrl ?? a.doiUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-medium text-foreground hover:text-primary line-clamp-1">
                      {a.title}
                    </a>
                  ) : (
                    <p className="text-[11px] font-medium line-clamp-1">{a.title}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {a.authors[0]}{a.authors.length > 1 ? ' et al.' : ''}{a.year && ` · ${a.year}`}
                    {typeof a.citedBy === 'number' && ` · cited ${a.citedBy.toLocaleString()}×`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{filtered.length}</strong>
          {filtered.length !== articles.length && (
            <span className="text-muted-foreground"> of {articles.length}</span>
          )}{' '}
          article{filtered.length === 1 ? '' : 's'}
          {total > articles.length && <span> · ~{total.toLocaleString()} total</span>}
          {fromCache && (
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">cached</span>
          )}
        </p>
        <div className="flex items-center gap-1.5">
          {errors.length > 0 && (
            <span className="text-[10px] text-amber-600">Some sources errored</span>
          )}
          <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-7 rounded-lg border border-input bg-card px-2 text-[11px] text-foreground focus:border-primary focus:outline-none">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Export dropdown */}
          <div className="relative group/export">
            <button type="button"
              className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Download className="h-3 w-3" /> Export
            </button>
            <div className="absolute right-0 top-full z-50 mt-1 hidden min-w-30 rounded-xl border border-border bg-card shadow-lg group-hover/export:block">
              {[
                { label: 'CSV',     action: () => exportArticlesToCsv(filtered) },
                { label: 'BibTeX',  action: () => exportArticlesToBibTex(filtered) },
                { label: 'RIS',     action: () => exportArticlesToRis(filtered) },
              ].map(({ label, action }) => (
                <button key={label} type="button" onClick={action}
                  className="block w-full px-3 py-2 text-left text-xs text-foreground hover:bg-muted first:rounded-t-xl last:rounded-b-xl">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inline filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter results by keyword, author, journal…"
          className="h-9 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {filterText && (
          <button type="button" onClick={() => setFilterText('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground hover:text-foreground">
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">
          No articles match &ldquo;{filterText}&rdquo;
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              saved={isSaved(article.id)}
              onToggleSave={() => onToggleSave(article)}
              highlightTerms={highlightTerms}
              onAuthorClick={onAuthorClick}
              selected={selectedIds.has(article.id)}
              onSelect={toggleSelect}
            />
          ))}
        </ul>
      )}

      {/* Bulk action floating bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-40 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-xl">
          <p className="text-xs font-semibold text-foreground">
            {selectedIds.size} selected
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { exportArticlesToCsv(selectedArticles) }}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <Download className="h-3 w-3" /> CSV
            </button>
            <button type="button" onClick={() => { exportArticlesToBibTex(selectedArticles) }}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-border px-3 text-[11px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              BibTeX
            </button>
            <button type="button"
              onClick={() => { onBulkImportToRol(selectedArticles); clearSelection() }}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
              Import to ROL
            </button>
            <button type="button" onClick={clearSelection}
              className="text-[11px] text-muted-foreground hover:text-foreground">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Load more */}
      {canLoadMore && !filterText && yearFilter === null && (
        <div className="flex justify-center pt-2">
          <button type="button" onClick={onLoadMore} disabled={isLoadingMore}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-medium text-muted-foreground',
              'transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50'
            )}>
            {isLoadingMore
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…</>
              : `Load more (${(total - articles.length).toLocaleString()} remaining)`}
          </button>
        </div>
      )}
    </div>
  )
}
