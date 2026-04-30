'use client'

import { FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { ArticlesInput } from '@/components/rol/ArticlesInput'
import { GenerateBar } from '@/components/rol/GenerateBar'
import { ReviewPreview } from '@/components/rol/ReviewPreview'
import { StyleSelector } from '@/components/rol/StyleSelector'
import { ThemeEditor } from '@/components/rol/ThemeEditor'
import { TopicInput } from '@/components/rol/TopicInput'
import { useLiteratureReview } from '@/lib/rol/hooks/useLiteratureReview'
import { useSavedArticles } from '@/lib/literature/hooks/useSavedArticles'
import { cn } from '@/lib/utils'

const ROL_IMPORT_KEY = 'samplecalc_rol_import'

const CITATION_STYLE_OPTIONS = [
  { value: 'vancouver', label: 'Vancouver' },
  { value: 'apa',       label: 'APA' },
  { value: 'numbered',  label: 'Numbered [1]' },
] as const

export function LiteratureReviewClient() {
  const review = useLiteratureReview()
  const { saved: savedArticles } = useSavedArticles()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Auto-import articles queued from Literature Search bulk-select
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ROL_IMPORT_KEY)
      if (raw) {
        const queued = JSON.parse(raw)
        if (Array.isArray(queued) && queued.length > 0) {
          review.importArticles(queued)
          localStorage.removeItem(ROL_IMPORT_KEY)
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleImport = () => review.importArticles(savedArticles)
  const canGenerate = review.articles.length > 0 && review.topic.trim().length > 0

  const inputs = (
    <>
      <TopicInput value={review.topic} onChange={review.setTopic} />
      <StyleSelector value={review.style} onChange={review.setStyle} />
      {/* Citation style selector */}
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-xs font-semibold">Citation style</p>
        <div className="flex rounded-lg border border-border bg-muted p-0.5">
          {CITATION_STYLE_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => review.setCitationStyle(value)}
              className={cn(
                'flex-1 rounded-md py-1.5 text-[11px] font-medium transition-colors',
                review.citationStyle === value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <ArticlesInput
        articles={review.articles}
        isFetching={review.isFetching}
        onAdd={review.addArticles}
        onAddManual={review.addManualArticle}
        onAddPdfs={review.addPdfArticles}
        onImport={handleImport}
        onRemove={review.removeArticle}
        onClear={review.clearArticles}
        savedCount={savedArticles.length}
      />
      {review.style === 'thematic' && (
        <ThemeEditor
          themes={review.themes}
          onChange={review.setThemes}
          onAutoSuggest={review.autoSuggestThemes}
        />
      )}
    </>
  )

  return (
    <>
      <SiteHeader />
      <div className="flex min-h-[calc(100vh-3.5rem)] bg-background">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'sticky top-14 hidden h-[calc(100vh-3.5rem)] flex-col border-r border-border bg-muted/40 transition-[width] duration-300 lg:flex',
            sidebarOpen ? 'w-[360px]' : 'w-0'
          )}
        >
          {sidebarOpen && (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="flex items-start gap-3 pb-1">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500 dark:text-violet-300">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-sm font-bold tracking-tight">
                      Review of Literature
                    </h1>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Configure your review
                    </p>
                  </div>
                </div>
                {inputs}
              </div>
              <div className="flex flex-shrink-0 items-center justify-between border-t border-border bg-muted/60 px-5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  N
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  v1.2.4
                </span>
              </div>
            </>
          )}
        </aside>

        {/* Mobile inputs drawer */}
        <aside className="w-full space-y-4 border-b border-border bg-muted/40 p-4 lg:hidden">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500 dark:text-violet-300">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight">
                Review of Literature
              </h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Configure your review
              </p>
            </div>
          </div>
          {inputs}
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-6">
            <div className="mb-5 hidden items-center justify-between lg:flex">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label={sidebarOpen ? 'Hide inputs' : 'Show inputs'}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {sidebarOpen ? (
                  <>
                    <PanelLeftClose className="h-3.5 w-3.5" />
                    Hide inputs
                  </>
                ) : (
                  <>
                    <PanelLeftOpen className="h-3.5 w-3.5" />
                    Show inputs
                  </>
                )}
              </button>
              <span className="text-[11px] italic text-muted-foreground">
                Draft stays in your browser
              </span>
            </div>
            <div className="space-y-5">
            <GenerateBar
              wordTarget={review.wordTarget}
              onWordTargetChange={review.setWordTarget}
              onGenerate={review.generate}
              isGenerating={review.isGenerating}
              articleCount={review.articles.length}
              canGenerate={canGenerate}
            />

            <ReviewPreview
              review={review.review}
              isGenerating={review.isGenerating}
              isExporting={review.isExporting}
              onExport={review.exportDocx}
            />

            {!review.review && !review.isGenerating && (
              <section className="rounded-2xl border border-dashed border-border bg-card p-6">
                <h2 className="text-sm font-semibold">How it works</h2>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <li>
                    <strong className="text-foreground">1. Configure</strong> —
                    topic, style, and articles in the left panel.
                  </li>
                  <li>
                    <strong className="text-foreground">2. Articles</strong> —
                    paste DOIs/PMIDs, import from Article Search, or enter an
                    article manually (title + authors minimum).
                  </li>
                  <li>
                    <strong className="text-foreground">3. Target length</strong>
                    {' '}— pick Short / Standard / Long / Extended above.
                  </li>
                  <li>
                    <strong className="text-foreground">4. Generate</strong> —
                    review appears below with inline Vancouver citations.
                  </li>
                  <li>
                    <strong className="text-foreground">5. Download .docx</strong>
                    {' '}— open in Word, light edit, submit.
                  </li>
                </ul>
              </section>
            )}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
