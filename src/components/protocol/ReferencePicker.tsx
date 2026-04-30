'use client'

import { useCallback, useRef, useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2, Search, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Article } from '@/lib/literature/types'
import { searchLiterature } from '@/lib/literature/utils/search'
import { cn } from '@/lib/utils'

interface ReferencePickerProps {
  selected: Article[]
  onAdd: (article: Article) => void
  onRemove: (id: string) => void
  suggestedQuery?: string
}

export function ReferencePicker({ selected, onAdd, onRemove, suggestedQuery = '' }: ReferencePickerProps) {
  const [query, setQuery] = useState(suggestedQuery)
  const [results, setResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const selectedIds = new Set(selected.map((a) => a.id))

  const search = useCallback(async () => {
    if (!query.trim()) return
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setIsSearching(true)
    setHasSearched(true)
    try {
      const result = await searchLiterature({ filters: { query }, signal: ctrl.signal, pageSize: 20 })
      setResults(result.articles)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [query])

  const isSelected = (id: string) => selectedIds.has(id)

  const toggle = (article: Article) => {
    if (isSelected(article.id)) onRemove(article.id)
    else onAdd(article)
  }

  return (
    <div className="space-y-4">
      {/* Selected references summary */}
      {selected.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-3 text-xs font-semibold text-foreground">
              Selected references ({selected.length})
              {selected.length < 10 && (
                <span className="ml-2 text-[10px] text-amber-600">
                  (Recommend at least 10 for Review of Literature)
                </span>
              )}
            </p>
            <ul className="space-y-1.5">
              {selected.map((a, i) => (
                <li key={a.id} className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[11px] font-medium text-foreground">{a.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {a.authors[0]}{a.authors.length > 1 ? ' et al.' : ''}
                      {a.year && ` · ${a.year}`}
                      {a.journal && ` · ${a.journal}`}
                    </p>
                  </div>
                  <button type="button" onClick={() => onRemove(a.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-semibold text-foreground">
            Search PubMed + Europe PMC + OpenAlex
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="e.g., community-acquired pneumonia children treatment"
                className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button type="button" onClick={search} disabled={!query.trim() || isSearching}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] disabled:opacity-50">
              {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              {isSearching ? 'Searching…' : 'Search'}
            </button>
          </div>

          {/* Results */}
          {isSearching && (
            <div className="mt-4 flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">No results. Try different keywords.</p>
          )}

          {!isSearching && results.length > 0 && (
            <ul className="mt-4 space-y-2">
              {results.map((article) => {
                const selected = isSelected(article.id)
                return (
                  <li key={article.id}
                    className={cn(
                      'group flex items-start gap-3 rounded-xl border p-3 transition-colors',
                      selected ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/30'
                    )}>
                    <button type="button" onClick={() => toggle(article)}
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors',
                        selected ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary hover:text-primary'
                      )}>
                      {selected ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{article.title}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {article.authors.slice(0, 3).join(', ')}{article.authors.length > 3 ? ', et al.' : ''}
                        {article.year && <span> · {article.year}</span>}
                        {article.journal && <span className="italic"> · {article.journal}</span>}
                      </p>
                      {article.abstract && (
                        <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{article.abstract}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {article.pmid && (
                          <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank" rel="noopener noreferrer"
                            className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground hover:bg-border"
                            onClick={(e) => e.stopPropagation()}>
                            PMID {article.pmid}
                          </a>
                        )}
                        {article.openAccess && (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">
                            Open access
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
