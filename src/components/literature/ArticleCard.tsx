'use client'

import { useState } from 'react'
import {
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Network,
  Quote,
} from 'lucide-react'
import Link from 'next/link'
import type { Article } from '@/lib/literature/types'
import { formatVancouver } from '@/lib/citations/utils/formatVancouver'
import { fetchCitingPapers } from '@/lib/literature/utils/fetchCitingPapers'
import { fetchUnpaywallPdf } from '@/lib/literature/utils/fetchUnpaywall'
import { detectPreprint, detectStudyTags } from '@/lib/literature/utils/detectStudyType'
import { copyWithToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface ArticleCardProps {
  article: Article
  saved: boolean
  onToggleSave: () => void
  highlightTerms?: string[]
  onAuthorClick?: (author: string) => void
  selected?: boolean
  onSelect?: (id: string) => void
}

// ─── helpers ──────────────────────────────────────────────────────────────────

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

function HighlightText({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  const parts = text.split(pattern)
  return (
    <>
      {parts.map((part, i) =>
        pattern.test(part)
          ? <mark key={i} className="rounded bg-yellow-200/80 px-0.5 text-yellow-900 dark:bg-yellow-500/30 dark:text-yellow-200">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  )
}

// ─── Unpaywall PDF button ──────────────────────────────────────────────────────

type PdfState = 'idle' | 'loading' | 'found' | 'none'

function UnpaywallButton({ doi, initialUrl }: { doi: string; initialUrl?: string }) {
  const [state, setState] = useState<PdfState>(initialUrl ? 'found' : 'idle')
  const [url, setUrl] = useState<string | null>(initialUrl ?? null)

  const handleClick = async () => {
    if (state === 'found' && url) { window.open(url, '_blank', 'noopener'); return }
    if (state === 'loading' || state === 'none') return
    setState('loading')
    const pdfUrl = await fetchUnpaywallPdf(doi)
    if (pdfUrl) { setUrl(pdfUrl); setState('found'); window.open(pdfUrl, '_blank', 'noopener') }
    else setState('none')
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={state === 'loading' || state === 'none'}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[11px] font-medium transition-colors',
        state === 'found'
          ? 'border-emerald-400/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400'
          : state === 'none'
          ? 'cursor-default border-border text-muted-foreground/40'
          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50'
      )}
    >
      <FileText className="h-3 w-3" />
      {state === 'loading' ? 'Checking…' : state === 'found' ? 'Open free PDF' : state === 'none' ? 'No free PDF' : 'Free PDF'}
    </button>
  )
}

// ─── Related works panel ──────────────────────────────────────────────────────

function RelatedWorksPanel({ article }: { article: Article }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [papers, setPapers] = useState<Article[]>([])

  const canLoad = !!(article.openAlexId || article.doi)
  if (!canLoad) return null

  const load = async () => {
    setState('loading')
    const { fetchRelatedWorks } = await import('@/lib/literature/utils/fetchCitingPapers')
    const result = await fetchRelatedWorks(article)
    setPapers(result)
    setState('done')
  }

  return (
    <div className="mt-2">
      {state === 'idle' && (
        <button type="button" onClick={load}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
          <Network className="h-3 w-3" /> Related works
        </button>
      )}
      {state === 'loading' && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading related works…
        </span>
      )}
      {state === 'done' && papers.length > 0 && (
        <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Related works ({papers.length})
          </p>
          <ul className="space-y-1.5">
            {papers.map((p) => (
              <li key={p.id} className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <div className="min-w-0">
                  {p.pubmedUrl || p.doiUrl ? (
                    <a href={p.pubmedUrl ?? p.doiUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-medium text-foreground hover:text-primary line-clamp-1">
                      {p.title}
                    </a>
                  ) : (
                    <p className="line-clamp-1 text-[11px] font-medium">{p.title}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {p.authors[0]}{p.authors.length > 1 ? ' et al.' : ''}{p.year && ` · ${p.year}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state === 'done' && papers.length === 0 && (
        <p className="text-[11px] text-muted-foreground">No related works found.</p>
      )}
    </div>
  )
}

// ─── Citing papers mini-panel ─────────────────────────────────────────────────

function CitingPanel({ article }: { article: Article }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [papers, setPapers] = useState<Article[]>([])

  const load = async () => {
    setState('loading')
    const result = await fetchCitingPapers(article)
    setPapers(result)
    setState('done')
  }

  if (!article.citedBy || article.citedBy === 0) return null

  return (
    <div className="mt-2">
      {state === 'idle' && (
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Network className="h-3 w-3" />
          Show {article.citedBy} citing papers
        </button>
      )}
      {state === 'loading' && (
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Loading citing papers…
        </span>
      )}
      {state === 'done' && papers.length > 0 && (
        <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Cited by ({papers.length} shown)
          </p>
          <ul className="space-y-1.5">
            {papers.map((p) => (
              <li key={p.id} className="flex items-start gap-1.5">
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/40" />
                <div className="min-w-0">
                  {p.pubmedUrl || p.doiUrl ? (
                    <a href={p.pubmedUrl ?? p.doiUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] font-medium text-foreground hover:text-primary line-clamp-1">
                      {p.title}
                    </a>
                  ) : (
                    <p className="text-[11px] font-medium line-clamp-1">{p.title}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    {p.authors[0]}{p.authors.length > 1 ? ' et al.' : ''}{p.year && ` · ${p.year}`}
                    {typeof p.citedBy === 'number' && p.citedBy > 0 && ` · cited ${p.citedBy}×`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {state === 'done' && papers.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Could not fetch citing papers.</p>
      )}
    </div>
  )
}

// ─── Main ArticleCard ─────────────────────────────────────────────────────────

export function ArticleCard({ article, saved, onToggleSave, highlightTerms = [], onAuthorClick, selected, onSelect }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [abstractCopied, setAbstractCopied] = useState(false)

  const vancouver = vancouverFromArticle(article)
  const authorDisplay = article.authors.length > 0
    ? article.authors.slice(0, 3).join(', ') + (article.authors.length > 3 ? ', et al.' : '')
    : 'Unknown authors'
  const primaryUrl = article.pubmedUrl ?? article.doiUrl ?? article.europePmcUrl

  const studyTags = detectStudyTags(article.title, article.abstract)
  const isPreprint = detectPreprint(article.journal, article.europePmcUrl ?? article.pubmedUrl)

  const copyCitation = async () => {
    const ok = await copyWithToast(vancouver, 'Vancouver citation copied')
    if (ok) { setCopied(true); window.setTimeout(() => setCopied(false), 1500) }
  }

  const copyAbstract = async () => {
    if (!article.abstract) return
    const ok = await copyWithToast(article.abstract, 'Abstract copied')
    if (ok) { setAbstractCopied(true); window.setTimeout(() => setAbstractCopied(false), 1500) }
  }

  const sources = article.sources
  const multiSource =
    (sources.includes('pubmed') ? 1 : 0) +
    (sources.includes('europepmc') ? 1 : 0) +
    (sources.includes('openalex') ? 1 : 0)

  const stripClass =
    multiSource >= 2
      ? 'bg-gradient-to-b from-primary via-violet-500 to-emerald-500'
      : sources.includes('openalex')
      ? 'bg-emerald-500'
      : sources.includes('europepmc')
      ? 'bg-violet-500'
      : 'bg-primary'

  return (
    <li className={cn(
      'group relative overflow-hidden rounded-xl border bg-card p-4 pl-5 transition-all hover:-translate-y-0.5 hover:shadow-md',
      selected ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
    )}>
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', stripClass)} />
      {onSelect && (
        <input type="checkbox" checked={!!selected} onChange={() => onSelect(article.id)}
          aria-label="Select article"
          className="absolute right-3 top-3 h-4 w-4 accent-primary cursor-pointer" />
      )}

      {/* Preprint warning */}
      {isPreprint && (
        <div className="mb-2.5 flex items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-50 px-2.5 py-1.5 dark:bg-amber-900/20">
          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
            Preprint — not peer reviewed
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {primaryUrl ? (
            <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
              className="group/title inline-flex items-start gap-1 text-sm font-semibold leading-snug text-foreground hover:text-primary">
              <span><HighlightText text={article.title} terms={highlightTerms} /></span>
              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/title:opacity-100" />
            </a>
          ) : (
            <h3 className="text-sm font-semibold leading-snug">
              <HighlightText text={article.title} terms={highlightTerms} />
            </h3>
          )}

          <p className="mt-1.5 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
            {article.authors.slice(0, 3).map((author, i) => (
              <span key={i}>
                {i > 0 && <span>, </span>}
                {onAuthorClick ? (
                  <button type="button" onClick={() => onAuthorClick(author)}
                    className="hover:text-primary hover:underline">{author}</button>
                ) : (
                  <span>{author}</span>
                )}
              </span>
            ))}
            {article.authors.length > 3 && <span>, et al.</span>}
            {article.year && <span> · {article.year}</span>}
            {article.journal && <span className="italic"> · {article.journal}</span>}
            {article.trialStatus && (
              <span className="ml-1 rounded-full bg-orange-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {article.trialStatus.replace(/_/g, ' ')}
              </span>
            )}
          </p>

          {/* Badges row */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {multiSource >= 2 && (
              <span className="rounded-full bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                {multiSource === 3 ? '3 sources' : 'Both sources'}
              </span>
            )}
            {article.openAccess && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Open access
              </span>
            )}
            {studyTags.map((tag) => (
              <span key={tag}
                className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {tag}
              </span>
            ))}
            {article.pmid && (
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`} target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-border">
                PMID {article.pmid}
              </a>
            )}
            {article.doi && (
              <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer"
                className="max-w-[180px] truncate rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-border">
                {article.doi}
              </a>
            )}
            {typeof article.citedBy === 'number' && article.citedBy > 0 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Cited {article.citedBy.toLocaleString()}×
              </span>
            )}
          </div>

          {/* OpenAlex concepts */}
          {article.concepts && article.concepts.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {article.concepts.slice(0, 4).map((c) => (
                <span key={c.name}
                  className="rounded-full border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <button type="button" onClick={onToggleSave}
          aria-label={saved ? 'Remove bookmark' : 'Save article'}
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
            saved ? 'bg-[var(--primary-muted)] text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}>
          {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      {/* Abstract with keyword highlight */}
      {article.abstract && (
        <div className="mt-3">
          <button type="button" onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
            {expanded
              ? <><ChevronUp className="h-3 w-3" /> Hide abstract</>
              : <><ChevronDown className="h-3 w-3" /> Show abstract</>}
          </button>
          {expanded && (
            <div className="mt-2">
              <p className="text-xs leading-relaxed text-muted-foreground">
                <HighlightText text={article.abstract} terms={highlightTerms} />
              </p>
              <button type="button" onClick={copyAbstract}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground hover:text-foreground">
                {abstractCopied
                  ? <><Check className="h-3 w-3 text-accent" /> Copied</>
                  : <><Copy className="h-3 w-3" /> Copy abstract</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Citing papers + related works */}
      <CitingPanel article={article} />
      <RelatedWorksPanel article={article} />

      {/* Action buttons */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        <button type="button" onClick={copyCitation}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          {copied
            ? <><Check className="h-3 w-3 text-accent" /> Copied</>
            : <><Copy className="h-3 w-3" /> Copy Vancouver</>}
        </button>
        <Link href={cTarget(article)}
          className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Quote className="h-3 w-3" /> Cite this
        </Link>
        {article.doi && <UnpaywallButton doi={article.doi} initialUrl={article.pdfUrl} />}
        {primaryUrl && (
          <a href={primaryUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <ExternalLink className="h-3 w-3" />
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
