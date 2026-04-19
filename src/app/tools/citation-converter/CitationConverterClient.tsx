'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookOpenCheck } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { InputPanel } from '@/components/citations/InputPanel'
import { OutputPanel } from '@/components/citations/OutputPanel'
import { useBulkConvert } from '@/lib/citations/hooks/useBulkConvert'

function ConverterContent() {
  const { results, isConverting, convert, clear } = useBulkConvert()
  const searchParams = useSearchParams()
  const pasted = searchParams.get('paste') ?? undefined

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-muted)] text-primary">
          <BookOpenCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Citation Converter
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Convert DOIs, PMIDs, PubMed URLs, or raw citations into proper{' '}
            <strong className="font-semibold text-foreground">Vancouver style</strong>
            {' '}— single or batch. Metadata fetched from CrossRef and PubMed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <InputPanel
          onConvert={convert}
          onClear={clear}
          isConverting={isConverting}
          hasResults={results.length > 0}
          initialText={pasted}
          autoConvert={Boolean(pasted)}
        />
        <OutputPanel results={results} isConverting={isConverting} />
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">How it works</h2>
        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
          <li>
            <strong className="text-foreground">DOI</strong> (like{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">
              10.1056/NEJMoa2034577
            </code>
            ) → fetched from CrossRef for canonical metadata.
          </li>
          <li>
            <strong className="text-foreground">PMID</strong> (like{' '}
            <code className="rounded bg-muted px-1 py-0.5 font-mono">33301246</code>
            ) → fetched from PubMed E-utilities.
          </li>
          <li>
            <strong className="text-foreground">PubMed URL</strong> → the
            PMID is extracted and looked up automatically.
          </li>
          <li>
            <strong className="text-foreground">Raw citation text</strong> →
            best-effort regex parse. Results marked as{' '}
            <span className="text-[var(--warning-foreground)]">warning</span>
            {' '}— verify before use.
          </li>
          <li>
            All lookups happen in your browser. No server sees your list.
          </li>
        </ul>
      </section>
    </main>
  )
}

export function CitationConverterClient() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-10" />}>
        <ConverterContent />
      </Suspense>
    </>
  )
}
