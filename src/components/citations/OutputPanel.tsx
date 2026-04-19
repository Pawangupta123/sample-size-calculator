'use client'

import { useMemo, useState } from 'react'
import { Check, Copy, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { copyWithToast, toastSuccess } from '@/lib/toast'
import type { ConvertedCitation } from '@/lib/citations/types'
import { ResultRow } from './ResultRow'

function ResultSkeleton() {
  return (
    <li className="rounded-xl border border-border p-3.5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-6 w-6 flex-shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-3 w-[90%]" />
          <Skeleton className="h-3 w-[70%]" />
        </div>
      </div>
    </li>
  )
}

interface OutputPanelProps {
  results: ConvertedCitation[]
  isConverting: boolean
}

export function OutputPanel({ results, isConverting }: OutputPanelProps) {
  const [copied, setCopied] = useState(false)

  const numberedText = useMemo(
    () =>
      results
        .filter((r) => r.vancouver)
        .map((r, i) => `${i + 1}. ${r.vancouver}`)
        .join('\n'),
    [results]
  )

  const stats = useMemo(() => {
    const success = results.filter((r) => r.status === 'success').length
    const warning = results.filter((r) => r.status === 'warning').length
    const error = results.filter((r) => r.status === 'error').length
    return { success, warning, error, total: results.length }
  }, [results])

  if (results.length === 0 && !isConverting) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground">
          <p>Converted references will appear here.</p>
          <p className="text-xs">
            Paste DOIs, PMIDs, PubMed URLs, or raw citations to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  const copyAll = async () => {
    if (!numberedText) return
    const ok = await copyWithToast(
      numberedText,
      `${results.length} references copied`
    )
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    }
  }

  const downloadTxt = () => {
    if (!numberedText) return
    try {
      const blob = new Blob([numberedText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `vancouver-references-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toastSuccess('Downloaded .txt file')
    } catch {
      /* noop — browser handles it */
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h2 className="text-sm font-semibold">Vancouver output</h2>
            {stats.total > 0 && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {stats.success} converted
                {stats.warning > 0 && ` · ${stats.warning} parsed (verify)`}
                {stats.error > 0 && ` · ${stats.error} failed`}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyAll}
              disabled={!numberedText}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-accent" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy all
                </>
              )}
            </button>
            <button
              type="button"
              onClick={downloadTxt}
              disabled={!numberedText}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <Download className="h-3 w-3" />
              Download .txt
            </button>
          </div>
        </div>
        {isConverting && results.length === 0 ? (
          <ul className="flex flex-col gap-2" aria-live="polite" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <ResultSkeleton key={i} />
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {results.map((r, i) => (
              <ResultRow key={r.id} index={i} item={r} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
