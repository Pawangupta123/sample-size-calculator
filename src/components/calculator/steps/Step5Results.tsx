'use client'

import { useState } from 'react'
import { Check, Copy, Download, FileText, RotateCcw, Share2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import { generateMethodsParagraph } from '@/lib/calculator/utils/citations'
import { exportToPdf } from '@/lib/calculator/utils/pdfExport'
import { buildShareUrl } from '@/lib/calculator/utils/shareLink'
import { ScenarioExplorer } from '../ScenarioExplorer'

export function Step5Results() {
  const { state, result, reset } = useCalculator()
  const [copied, setCopied] = useState<'share' | 'methods' | null>(null)
  const [showMethods, setShowMethods] = useState(false)

  if (!result || !result.ok) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No calculation yet — complete the previous steps.
        </CardContent>
      </Card>
    )
  }

  const r = result.result

  const copy = async (text: string, label: 'share' | 'methods') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      /* ignore */
    }
  }

  const methodsText = generateMethodsParagraph({ state, result: r })

  return (
    <div className="space-y-4 animate-fade-in-up">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary via-primary to-[var(--primary-hover)] p-8 text-white">
        <div
          aria-hidden
          className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-2xl"
        />
        <p className="relative text-[11px] font-semibold uppercase tracking-widest text-white/70">
          {r.label}
        </p>
        <p className="relative mt-3 font-mono text-6xl font-bold leading-none text-white">
          {r.finalN.toLocaleString()}
        </p>
        <p className="relative mt-2 text-sm text-white/80">{r.sublabel}</p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {r.metrics.map((m) => (
          <Card key={m.label}>
            <CardContent className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {m.label}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-foreground">
                {m.value}
                {m.unit && (
                  <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                    {m.unit}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ScenarioExplorer />

      <Card className="overflow-hidden bg-zinc-950 text-zinc-50 dark:bg-black">
        <CardContent className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Formula & calculation steps
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-emerald-300">
            {r.formula}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Assumptions summary</h3>
            <button
              type="button"
              onClick={() => setShowMethods((v) => !v)}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              {showMethods ? 'Hide' : 'Show'} methods paragraph
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {r.assumptions.map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2 text-xs"
              >
                <span className="text-muted-foreground">{k}</span>
                <span className="text-right font-semibold">{v}</span>
              </div>
            ))}
          </div>

          {showMethods && (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-border bg-muted/40 p-4">
                <p className="text-xs leading-relaxed text-foreground">
                  {methodsText}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(methodsText, 'methods')}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
              >
                {copied === 'methods' ? (
                  <>
                    <Check className="h-3 w-3 text-accent" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy for protocol
                  </>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-wrap items-center justify-end gap-2 p-4">
          <button
            type="button"
            onClick={() => copy(buildShareUrl(state), 'share')}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            {copied === 'share' ? (
              <>
                <Check className="h-3.5 w-3.5 text-accent" /> Link copied
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" /> Share link
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => exportToPdf({ state, result: r })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New calculation
          </button>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-xl border border-[var(--warning-muted)] bg-[var(--warning-muted)]/50 p-3.5 text-xs text-[var(--warning-foreground)]">
        <span aria-hidden>⚠️</span>
        <span>
          Results should be reviewed by a qualified biostatistician before
          submission to ethics committees or journals.
        </span>
      </div>
    </div>
  )
}
