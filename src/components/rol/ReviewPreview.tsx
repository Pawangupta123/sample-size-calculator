'use client'

import { Download, FileText, Loader2 } from 'lucide-react'
import type { GeneratedReview } from '@/lib/rol/types'

interface ReviewPreviewProps {
  review: GeneratedReview | null
  isGenerating: boolean
  isExporting: boolean
  onExport: () => Promise<void> | void
}

export function ReviewPreview({
  review,
  isGenerating,
  isExporting,
  onExport,
}: ReviewPreviewProps) {
  if (!review && !isGenerating) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-5 rounded-3xl border-2 border-dashed border-border bg-card px-8 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <FileText className="h-6 w-6" />
        </span>
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold tracking-tight">
            Your draft will appear here
          </p>
          <p className="text-sm text-muted-foreground">
            Fill in the topic, add some articles, pick a style, and hit{' '}
            <span className="font-semibold text-foreground">Generate review</span>{' '}
            above.
          </p>
        </div>
      </div>
    )
  }

  if (isGenerating || !review) {
    return (
      <div className="flex min-h-[520px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-card py-20 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">Drafting your review…</p>
          <p className="text-xs text-muted-foreground">
            Fetching abstracts from Europe PMC and formatting citations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-border bg-card">
      {/* Meta + download bar */}
      <header className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          <span className="rounded-full bg-[var(--primary-muted)] px-2.5 py-1 text-primary">
            {review.style} style
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1">
            {review.wordCount} words
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1">
            {review.references.length} references
          </span>
        </div>
        <button
          type="button"
          onClick={onExport}
          disabled={isExporting}
          className="inline-flex h-10 flex-shrink-0 items-center justify-center gap-1.5 self-start rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-colors hover:opacity-90 disabled:opacity-50 sm:self-auto"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting…
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Download .docx
            </>
          )}
        </button>
      </header>

      {/* Document body */}
      <div className="px-6 py-8 sm:px-10 sm:py-12">
        <h1 className="break-words text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
          {review.title}
        </h1>

        <div className="mt-8 space-y-6 text-base leading-[1.75] text-foreground">
          <p className="break-words">{review.introduction}</p>

          {review.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h2 className="mt-8 break-words text-lg font-bold tracking-tight text-foreground">
                {section.heading}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="break-words">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section className="space-y-3">
            <h2 className="mt-8 text-lg font-bold tracking-tight text-foreground">
              Conclusion
            </h2>
            <p className="break-words">{review.conclusion}</p>
          </section>

          {review.references.length > 0 && (
            <section className="mt-10 space-y-3 border-t border-border pt-8">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                References
              </h2>
              <ol className="list-decimal space-y-2.5 pl-6 text-sm leading-relaxed text-muted-foreground">
                {review.references.map((ref, i) => (
                  <li key={i} className="break-words">{ref}</li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>
    </article>
  )
}
