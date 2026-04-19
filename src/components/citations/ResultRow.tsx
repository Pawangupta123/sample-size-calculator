'use client'

import { useState } from 'react'
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Copy } from 'lucide-react'
import type { ConvertedCitation } from '@/lib/citations/types'
import { cn } from '@/lib/utils'

interface ResultRowProps {
  index: number
  item: ConvertedCitation
}

const SOURCE_LABELS: Record<string, string> = {
  doi: 'DOI',
  pmid: 'PMID',
  url: 'URL',
  raw: 'Raw text',
  unknown: 'Unknown',
}

const STATUS_ICONS = {
  success: { Icon: CheckCircle2, color: 'text-accent' },
  warning: { Icon: AlertTriangle, color: 'text-[var(--warning-foreground)]' },
  error: { Icon: AlertCircle, color: 'text-destructive' },
  pending: { Icon: AlertCircle, color: 'text-muted-foreground' },
} as const

export function ResultRow({ index, item }: ResultRowProps) {
  const [copied, setCopied] = useState(false)

  const copyLine = async () => {
    if (!item.vancouver) return
    await navigator.clipboard.writeText(item.vancouver)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const { Icon, color } = STATUS_ICONS[item.status]

  return (
    <li
      className={cn(
        'rounded-xl border p-3.5',
        item.status === 'success' && 'border-border bg-card',
        item.status === 'warning' && 'border-[var(--warning-muted)] bg-[var(--warning-muted)]/30',
        item.status === 'error' && 'border-destructive/30 bg-destructive/5'
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {SOURCE_LABELS[item.sourceType] ?? item.sourceType}
            </span>
            <Icon className={cn('h-3.5 w-3.5', color)} />
          </div>
          {item.status === 'error' ? (
            <>
              <p className="truncate font-mono text-[11px] text-muted-foreground">
                {item.input}
              </p>
              {item.message && (
                <p className="text-xs text-destructive">{item.message}</p>
              )}
            </>
          ) : (
            <>
              <p className="break-words font-mono text-[12.5px] leading-relaxed text-foreground">
                {item.vancouver}
              </p>
              {item.message && item.status === 'warning' && (
                <p className="text-[11px] text-[var(--warning-foreground)]">
                  {item.message}
                </p>
              )}
            </>
          )}
        </div>
        {item.vancouver && (
          <button
            type="button"
            onClick={copyLine}
            aria-label="Copy citation"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-accent" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
    </li>
  )
}
