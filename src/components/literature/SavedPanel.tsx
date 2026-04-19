'use client'

import Link from 'next/link'
import { Bookmark, ExternalLink, Quote, Trash2, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Article } from '@/lib/literature/types'

interface SavedPanelProps {
  saved: Article[]
  onRemove: (id: string) => void
  onClearAll: () => void
}

function batchCitationHref(saved: Article[]): string {
  const ids = saved
    .map((a) => a.pmid ?? a.doi)
    .filter(Boolean)
    .slice(0, 20)
    .join('\n')
  return `/tools/citation-converter?paste=${encodeURIComponent(ids)}`
}

export function SavedPanel({ saved, onRemove, onClearAll }: SavedPanelProps) {
  if (saved.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 pb-3">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Saved articles
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Bookmark articles to save them here. Data stays in your browser.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Bookmark className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Saved ({saved.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        </div>
        <ul className="flex flex-col gap-1.5">
          {saved.slice(0, 8).map((a) => (
            <li
              key={a.id}
              className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold text-foreground">
                  {a.title}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {a.authors[0] ?? '—'}
                  {a.authors.length > 1 ? ', et al.' : ''}
                  {a.year && ` · ${a.year}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                aria-label="Remove"
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
        {saved.length > 8 && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            + {saved.length - 8} more
          </p>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <Link
            href={batchCitationHref(saved)}
            className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-full bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <Quote className="h-3 w-3" />
            Cite all
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
