'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Sparkles, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface InputPanelProps {
  onConvert: (text: string) => Promise<void> | void
  onClear: () => void
  isConverting: boolean
  hasResults: boolean
  initialText?: string
  autoConvert?: boolean
}

const PLACEHOLDER = [
  'Paste anything — one per line:',
  '',
  '10.1056/NEJMoa2034577',
  '33301246',
  'https://pubmed.ncbi.nlm.nih.gov/32182409/',
  'Smith JA, Jones BC. Sample article title. N Engl J Med. 2023;389(12):1101-8.',
].join('\n')

const EXAMPLES =
  '10.1056/NEJMoa2034577\n33301246\nhttps://pubmed.ncbi.nlm.nih.gov/32182409/'

export function InputPanel({
  onConvert,
  onClear,
  isConverting,
  hasResults,
  initialText,
  autoConvert,
}: InputPanelProps) {
  const [text, setText] = useState(initialText ?? '')
  const autoFiredRef = useRef(false)

  useEffect(() => {
    if (!autoConvert || autoFiredRef.current) return
    const seed = (initialText ?? '').trim()
    if (!seed) return
    autoFiredRef.current = true
    void onConvert(seed)
  }, [autoConvert, initialText, onConvert])

  const handleSubmit = async () => {
    if (!text.trim() || isConverting) return
    await onConvert(text)
  }

  const handleClear = () => {
    setText('')
    onClear()
  }

  const handleLoadExamples = () => setText(EXAMPLES)

  const count = text.split(/\r?\n/).filter((l) => l.trim().length > 0).length

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-sm font-semibold">Input</h2>
          <button
            type="button"
            onClick={handleLoadExamples}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            Load examples
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER}
          spellCheck={false}
          className={cn(
            'h-56 w-full resize-y rounded-xl border border-input bg-card p-3 font-mono text-xs leading-relaxed text-foreground',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
          )}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            {count === 0
              ? 'One reference per line'
              : `${count} reference${count === 1 ? '' : 's'} detected`}
          </p>
          <div className="flex items-center gap-2">
            {hasResults && (
              <button
                type="button"
                onClick={handleClear}
                disabled={isConverting}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || isConverting}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConverting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Converting…
                </>
              ) : (
                'Convert to Vancouver'
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
