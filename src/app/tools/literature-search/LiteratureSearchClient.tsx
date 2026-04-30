'use client'

import { useEffect } from 'react'
import { Library } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { ResultsPanel } from '@/components/literature/ResultsPanel'
import { SavedPanel } from '@/components/literature/SavedPanel'
import { SearchPanel } from '@/components/literature/SearchPanel'
import { StatsPanel } from '@/components/literature/StatsPanel'
import { useLiteratureSearch } from '@/lib/literature/hooks/useLiteratureSearch'
import { useSavedArticles } from '@/lib/literature/hooks/useSavedArticles'
import type { Article, SearchFilters } from '@/lib/literature/types'

const ROL_IMPORT_KEY = 'samplecalc_rol_import'

export function LiteratureSearchClient() {
  const router = useRouter()
  const {
    articles, total, errors, isSearching, isLoadingMore,
    hasSearched, canLoadMore, fromCache, search, loadMore, reset,
  } = useLiteratureSearch()
  const { saved, isSaved, toggle, remove, clearAll } = useSavedArticles()

  // Read URL params on mount and auto-search if query present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q')
    if (q) {
      search({
        query: q,
        studyType: (params.get('study') as SearchFilters['studyType']) ?? 'any',
        yearFrom: params.get('from') ? parseInt(params.get('from')!, 10) : undefined,
        yearTo: params.get('to') ? parseInt(params.get('to')!, 10) : undefined,
        openAccessOnly: params.get('oa') === '1',
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (filters: SearchFilters) => {
    // Update URL so search is shareable
    const params = new URLSearchParams()
    params.set('q', filters.query)
    if (filters.studyType && filters.studyType !== 'any') params.set('study', filters.studyType)
    if (filters.yearFrom) params.set('from', String(filters.yearFrom))
    if (filters.yearTo) params.set('to', String(filters.yearTo))
    if (filters.openAccessOnly) params.set('oa', '1')
    window.history.replaceState(null, '', `?${params.toString()}`)
    search(filters)
  }

  const handleAuthorClick = (author: string) => {
    handleSearch({ query: `"${author}"[Author]` })
  }

  const handleBulkImportToRol = (articles: Article[]) => {
    try {
      localStorage.setItem(ROL_IMPORT_KEY, JSON.stringify(articles))
    } catch {}
    router.push('/tools/literature-review')
  }

  const handleReset = () => {
    window.history.replaceState(null, '', window.location.pathname)
    reset()
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 flex items-start gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-muted)] text-primary">
            <Library className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Literature Search</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              Search <strong className="text-foreground">PubMed</strong>,{' '}
              <strong className="text-foreground">Europe PMC</strong>,{' '}
              <strong className="text-foreground">OpenAlex</strong>{' '}
              and optionally <strong className="text-foreground">ClinicalTrials.gov</strong>{' '}
              — merged, deduplicated. Press <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">/</kbd> to focus search.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <SearchPanel
              onSearch={handleSearch}
              onReset={handleReset}
              isSearching={isSearching}
              hasResults={articles.length > 0}
            />
            <ResultsPanel
              articles={articles}
              total={total}
              isSearching={isSearching}
              isLoadingMore={isLoadingMore}
              hasSearched={hasSearched}
              canLoadMore={canLoadMore}
              fromCache={fromCache}
              errors={errors}
              isSaved={isSaved}
              onToggleSave={toggle}
              onLoadMore={loadMore}
              onExampleSearch={(q) => handleSearch({ query: q })}
              onAuthorClick={handleAuthorClick}
              onBulkImportToRol={handleBulkImportToRol}
            />
          </div>
          <aside className="space-y-4">
            <SavedPanel saved={saved} onRemove={remove} onClearAll={clearAll} />
            {articles.length > 0 && <StatsPanel articles={articles} />}
          </aside>
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">How it works</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li><strong className="text-foreground">3–4 databases, one search</strong> — PubMed, Europe PMC, OpenAlex in parallel. Enable ClinicalTrials.gov in Filters.</li>
            <li><strong className="text-foreground">PICO builder</strong> — structure your clinical question (P · I · C · O) for precise boolean queries.</li>
            <li><strong className="text-foreground">MeSH + journal filter</strong> — precision-target PubMed/Europe PMC indexing. Filter by specific journal.</li>
            <li><strong className="text-foreground">Bulk select</strong> — tick articles → export CSV/BibTeX or import directly to Review of Literature.</li>
            <li><strong className="text-foreground">Free PDF, citing papers, related works</strong> — all on each article card, lazy-loaded.</li>
            <li><strong className="text-foreground">Shareable URL</strong> — search URL updates automatically. Copy and share any search.</li>
          </ul>
        </section>
      </main>
    </>
  )
}
