'use client'

import { Library } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { ResultsPanel } from '@/components/literature/ResultsPanel'
import { SavedPanel } from '@/components/literature/SavedPanel'
import { SearchPanel } from '@/components/literature/SearchPanel'
import { useLiteratureSearch } from '@/lib/literature/hooks/useLiteratureSearch'
import { useSavedArticles } from '@/lib/literature/hooks/useSavedArticles'

export function LiteratureSearchClient() {
  const {
    articles,
    total,
    errors,
    isSearching,
    hasSearched,
    search,
    reset,
  } = useLiteratureSearch()
  const { saved, isSaved, toggle, remove, clearAll } = useSavedArticles()

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
              Paste your protocol, research question, or keywords. We search{' '}
              <strong className="font-semibold text-foreground">PubMed</strong> and{' '}
              <strong className="font-semibold text-foreground">Europe PMC</strong>{' '}
              together — you get a merged, deduplicated list with direct verification links.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px]">
          <div className="space-y-5">
            <SearchPanel
              onSearch={search}
              onReset={reset}
              isSearching={isSearching}
              hasResults={articles.length > 0}
            />
            <ResultsPanel
              articles={articles}
              total={total}
              isSearching={isSearching}
              hasSearched={hasSearched}
              errors={errors}
              isSaved={isSaved}
              onToggleSave={toggle}
            />
          </div>
          <aside>
            <SavedPanel saved={saved} onRemove={remove} onClearAll={clearAll} />
          </aside>
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">How it works</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>
              <strong className="text-foreground">Paste anything</strong> — a full
              protocol paragraph, research question, or just keywords. PubMed&apos;s
              automatic term mapping handles the heavy lifting.
            </li>
            <li>
              <strong className="text-foreground">Two databases, one search</strong>{' '}
              — results from PubMed and Europe PMC are merged. Articles found in both are
              marked with a &ldquo;Both sources&rdquo; badge.
            </li>
            <li>
              <strong className="text-foreground">Direct verification</strong> — every
              article title links to its PubMed or publisher page so you can verify
              before citing.
            </li>
            <li>
              <strong className="text-foreground">Browser-only</strong> — your
              protocol text goes straight to PubMed and Europe PMC from your browser.
              No intermediate server.
            </li>
          </ul>
        </section>
      </main>
    </>
  )
}
