'use client'

import { useState } from 'react'
import { Loader2, Search, Sliders, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { SearchFilters, StudyTypeFilter } from '@/lib/literature/types'
import { cn } from '@/lib/utils'

interface SearchPanelProps {
  onSearch: (filters: SearchFilters) => void
  onReset: () => void
  isSearching: boolean
  hasResults: boolean
}

const STUDY_TYPE_LABELS: ReadonlyArray<{ value: StudyTypeFilter; label: string }> = [
  { value: 'any', label: 'Any study type' },
  { value: 'rct', label: 'Randomised trials' },
  { value: 'meta', label: 'Meta-analyses' },
  { value: 'review', label: 'Reviews' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'casecontrol', label: 'Case-control' },
]

const PLACEHOLDER =
  'Paste your study protocol, research question, or keywords...\n\nExample: Randomised controlled trial comparing new antihypertensive vs. standard care in elderly patients for reduction of systolic blood pressure over 12 months.'

const CURRENT_YEAR = new Date().getFullYear()

export function SearchPanel({
  onSearch,
  onReset,
  isSearching,
  hasResults,
}: SearchPanelProps) {
  const [query, setQuery] = useState('')
  const [studyType, setStudyType] = useState<StudyTypeFilter>('any')
  const [yearFrom, setYearFrom] = useState<number | ''>(CURRENT_YEAR - 10)
  const [yearTo, setYearTo] = useState<number | ''>(CURRENT_YEAR)
  const [openAccessOnly, setOpenAccessOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isSearching) return
    onSearch({
      query,
      studyType,
      yearFrom: yearFrom === '' ? undefined : yearFrom,
      yearTo: yearTo === '' ? undefined : yearTo,
      openAccessOnly,
    })
  }

  const handleReset = () => {
    setQuery('')
    onReset()
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between pb-3">
            <h2 className="text-sm font-semibold">Search your literature</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Sliders className="h-3 w-3" />
              {filtersOpen ? 'Hide filters' : 'Filters'}
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={PLACEHOLDER}
            spellCheck={false}
            className={cn(
              'h-40 w-full resize-y rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground',
              'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
          />

          {filtersOpen && (
            <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Study type
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STUDY_TYPE_LABELS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setStudyType(value)}
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                        studyType === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Year from
                  </label>
                  <input
                    type="number"
                    value={yearFrom}
                    min={1900}
                    max={CURRENT_YEAR}
                    onChange={(e) =>
                      setYearFrom(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Year to
                  </label>
                  <input
                    type="number"
                    value={yearTo}
                    min={1900}
                    max={CURRENT_YEAR}
                    onChange={(e) =>
                      setYearTo(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="h-9 w-full rounded-lg border border-input bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={openAccessOnly}
                  onChange={(e) => setOpenAccessOnly(e.target.checked)}
                  className="h-3.5 w-3.5 accent-primary"
                />
                Open access only
              </label>
            </div>
          )}

          <div className="mt-3 flex items-center justify-end gap-2">
            {hasResults && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isSearching}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Searching PubMed + Europe PMC…
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  Search articles
                </>
              )}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
