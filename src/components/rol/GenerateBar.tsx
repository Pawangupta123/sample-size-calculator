'use client'

import { Loader2, Wand2 } from 'lucide-react'
import { WORD_TARGETS } from '@/lib/rol/types'
import type { WordTarget } from '@/lib/rol/types'
import { cn } from '@/lib/utils'

interface GenerateBarProps {
  wordTarget: WordTarget
  onWordTargetChange: (target: WordTarget) => void
  onGenerate: () => void
  isGenerating: boolean
  articleCount: number
  canGenerate: boolean
}

export function GenerateBar({
  wordTarget,
  onWordTargetChange,
  onGenerate,
  isGenerating,
  articleCount,
  canGenerate,
}: GenerateBarProps) {
  return (
    <div className="rounded-2xl bg-muted/50 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Target length
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {WORD_TARGETS.map((t) => {
              const active = t.id === wordTarget
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onWordTargetChange(t.id)}
                  className={cn(
                    'flex flex-col items-start rounded-lg border bg-background px-3 py-2 text-left transition-all',
                    active
                      ? 'border-primary bg-[var(--primary-muted)] text-primary shadow-sm'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  <span className="text-xs font-semibold">{t.label}</span>
                  <span className="text-[10px] opacity-70">{t.range}</span>
                </button>
              )
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !canGenerate}
          className="inline-flex h-12 flex-shrink-0 items-center justify-center gap-2 self-stretch rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              Generate review
            </>
          )}
        </button>
      </div>
      {!canGenerate && articleCount === 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Add at least one article on the left to generate.
        </p>
      )}
      {!canGenerate && articleCount > 0 && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Enter a topic on the left to generate the review.
        </p>
      )}
    </div>
  )
}
