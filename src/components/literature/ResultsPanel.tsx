'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Article } from '@/lib/literature/types'
import { ArticleCard } from './ArticleCard'

function ArticleSkeleton() {
  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-3 w-[60%]" />
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

interface ResultsPanelProps {
  articles: Article[]
  total: number
  isSearching: boolean
  hasSearched: boolean
  errors: string[]
  isSaved: (id: string) => boolean
  onToggleSave: (article: Article) => void
}

export function ResultsPanel({
  articles,
  total,
  isSearching,
  hasSearched,
  errors,
  isSaved,
  onToggleSave,
}: ResultsPanelProps) {
  if (!hasSearched) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-1 py-16 text-center text-sm text-muted-foreground">
          <p>Your search results will appear here.</p>
          <p className="text-xs">
            Paste your protocol or research question above to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isSearching && articles.length === 0) {
    return (
      <ul className="flex flex-col gap-3" aria-live="polite" aria-busy="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
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
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{articles.length}</strong>{' '}
          article{articles.length === 1 ? '' : 's'}
          {total > articles.length && (
            <span> of {total.toLocaleString()} matches</span>
          )}
        </p>
        {errors.length > 0 && (
          <span className="text-[10px] text-[var(--warning-foreground)]">
            Some sources returned errors
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            saved={isSaved(article.id)}
            onToggleSave={() => onToggleSave(article)}
          />
        ))}
      </ul>
    </div>
  )
}
