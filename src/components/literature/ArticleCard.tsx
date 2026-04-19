'use client'

import { useState } from 'react'
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Quote,
} from 'lucide-react'
import Link from 'next/link'
import type { Article } from '@/lib/literature/types'
import { formatVancouver } from '@/lib/citations/utils/formatVancouver'
import { copyWithToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  saved: boolean
  onToggleSave: () => void
}

function vancouverFromArticle(article: Article): string {
  return formatVancouver({
    authors: article.authors.map((name) => {
      const parts = name.trim().split(/\s+/)
      return { family: parts[0] ?? name, given: parts.slice(1).join(' ') || undefined }
    }),
    title: article.title,
    journal: article.journal,
    journalAbbr: article.journal,
    year: article.year,
    doi: article.doi,
    pmid: article.pmid,
  })
}

export function ArticleCard({ article, saved, onToggleSave }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const vancouver = vancouverFromArticle(article)
  const authorDisplay =
    article.authors.length > 0
      ? article.authors.slice(0, 3).join(', ') +
        (article.authors.length > 3 ? ', et al.' : '')
      : 'Unknown authors'
  const primaryUrl = article.pubmedUrl ?? article.doiUrl ?? article.europePmcUrl

  const copyCitation = async () => {
    const ok = await copyWithToast(vancouver, 'Vancouver citation copied')
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    }
  }

  const sources = article.sources
  const stripClass = sources.includes('pubmed') && sources.includes('europepmc')
    ? 'bg-gradient-to-b from-primary via-violet-500 to-emerald-500'
    : sources.includes('europepmc')
      ? 'bg-violet-500'
      : 'bg-primary'

  return (
    <li className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          stripClass
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {primaryUrl ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-start gap-1 text-sm font-semibold leading-snug text-foreground hover:text-primary"
            >
              <span>{article.title}</span>
              <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
          ) : (
            <h3 className="text-sm font-semibold leading-snug">{article.title}</h3>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {authorDisplay}
            {article.year && <span> · {article.year}</span>}
            {article.journal && (
              <span className="italic"> · {article.journal}</span>
            )}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {article.sources.includes('pubmed') && article.sources.includes('europepmc') && (
              <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Both sources
              </span>
            )}
            {article.openAccess && (
              <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                Open access
              </span>
            )}
            {article.pmid && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-border"
              >
                PMID {article.pmid}
              </a>
            )}
            {article.doi && (
              <a
                href={`https://doi.org/${article.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[200px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-border"
              >
                DOI {article.doi}
              </a>
            )}
            {typeof article.citedBy === 'number' && article.citedBy > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Cited {article.citedBy}×
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleSave}
          aria-label={saved ? 'Remove bookmark' : 'Save article'}
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors',
            saved
              ? 'bg-[var(--primary-muted)] text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      {article.abstract && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Hide abstract
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show abstract
              </>
            )}
          </button>
          {expanded && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {article.abstract}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <button
          type="button"
          onClick={copyCitation}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-accent" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy Vancouver
            </>
          )}
        </button>
        <Link
          href={cTarget(article)}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Quote className="h-3 w-3" /> Cite this
        </Link>
        {primaryUrl && (
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" /> Verify on{' '}
            {article.pubmedUrl ? 'PubMed' : article.europePmcUrl ? 'Europe PMC' : 'DOI'}
          </a>
        )}
      </div>
    </li>
  )
}

function cTarget(article: Article): string {
  if (article.pmid) return `/tools/citation-converter?paste=${encodeURIComponent(article.pmid)}`
  if (article.doi) return `/tools/citation-converter?paste=${encodeURIComponent(article.doi)}`
  return '/tools/citation-converter'
}
