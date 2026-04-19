'use client'

import { History as HistoryIcon, Trash2, X } from 'lucide-react'
import { useCalculator } from '@/lib/calculator/context/CalculatorContext'
import { Card, CardContent } from '@/components/ui/card'
import { DESIGN_LABELS } from '@/lib/calculator/constants/designs'

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function HistoryPanel() {
  const { history, loadState, removeFromHistory, clearHistory } = useCalculator()

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 pb-3">
            <HistoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Recent calculations
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Your last 10 calculations will appear here. Data never leaves your
            browser.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Recent ({history.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={clearHistory}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>
        </div>
        <ul className="flex flex-col gap-1.5">
          {history.map((entry) => (
            <li key={entry.id}>
              <div className="group relative flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary">
                <button
                  type="button"
                  onClick={() => loadState(entry.state)}
                  className="flex min-w-0 flex-1 flex-col items-start text-left"
                >
                  <span className="truncate text-xs font-semibold">
                    {entry.designLabel && DESIGN_LABELS[entry.designLabel as keyof typeof DESIGN_LABELS]
                      ? DESIGN_LABELS[entry.designLabel as keyof typeof DESIGN_LABELS]
                      : 'Study'}{' '}
                    · N = {entry.finalN}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatTimeAgo(entry.timestamp)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => removeFromHistory(entry.id)}
                  aria-label="Remove from history"
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
